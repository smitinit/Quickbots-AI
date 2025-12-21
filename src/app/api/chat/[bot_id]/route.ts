import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getBotProfile, lookupApiKey } from "@/lib/db/bot-queries";
import { buildSystemPrompt } from "@/lib/llm/system-prompt-builder";
import { logChat } from "@/lib/db/chat-logs";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isObviousGibberish } from "@/lib/validation/gibberish-detector";

export const runtime = "nodejs";

/* ---------------------------------------------
   Validation Schemas
--------------------------------------------- */
const BotIdSchema = z.object({
  bot_id: z.string().min(1),
});

const ChatHistoryEntrySchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  timestamp: z.string(),
});

const ChatPayloadSchema = z.object({
  message: z.string().min(1),
  chat_history: z.array(ChatHistoryEntrySchema).default([]),
  model_override: z.string().optional(),
});

/* ---------------------------------------------
   CORS (PUBLIC API – widget safe)
--------------------------------------------- */
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Session-Id",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

/* ---------------------------------------------
   OPTIONS Preflight
--------------------------------------------- */
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

/* ---------------------------------------------
   Route Handler
--------------------------------------------- */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bot_id: string }> }
) {
  const startTs = Date.now();
  let finalText = "";
  const supabaseAdmin = getSupabaseAdmin();

  try {
    /* ---------------------------------------------
       1. Validate bot id + session
    --------------------------------------------- */
    const { bot_id } = BotIdSchema.parse(await params);

    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required (x-session-id header)" },
        { status: 400, headers: corsHeaders() }
      );
    }

    /* ---------------------------------------------
       2. Parse request body
    --------------------------------------------- */
    const parsed = ChatPayloadSchema.parse(await req.json());

    /* ---------------------------------------------
       3. Optional API-key auth
    --------------------------------------------- */
    const auth = req.headers.get("authorization");
    if (auth?.toLowerCase().startsWith("bearer ")) {
      const token = auth.replace(/^bearer\s+/i, "").trim();
      const apiKeyRow = await lookupApiKey(token);

      if (!apiKeyRow || apiKeyRow.bot_id !== bot_id) {
        return new NextResponse("Invalid API key", {
          status: 401,
          headers: corsHeaders(),
        });
      }
    }

    /* ---------------------------------------------
       4. Gibberish guard
    --------------------------------------------- */
    if (isObviousGibberish(parsed.message)) {
      await logChat({
        supabase: supabaseAdmin,
        botId: bot_id,
        sessionId,
        role: "user",
        message: parsed.message,
        history: parsed.chat_history,
      }).catch(() => {});

      return NextResponse.json(
        {
          error:
            "I couldn't understand that. Please rephrase or add more context.",
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    /* ---------------------------------------------
       5. Load bot + system prompt
    --------------------------------------------- */
    const bot = await getBotProfile(bot_id);
    if (!bot) {
      return new NextResponse("Bot not found", {
        status: 404,
        headers: corsHeaders(),
      });
    }

    const systemPrompt = buildSystemPrompt(bot);

    /* ---------------------------------------------
       6. Prepare messages
    --------------------------------------------- */
    const historyMessages = parsed.chat_history
      .filter((h) => h.role !== "system")
      .map((h) => ({
        role: h.role === "user" ? "user" : "assistant",
        content: h.content,
      }));

    const messages = [
      { role: "system", content: systemPrompt },
      ...historyMessages,
      { role: "user", content: parsed.message },
    ];

    /* ---------------------------------------------
       7. Model selection
    --------------------------------------------- */
    const ALLOWED_MODELS = [
      "llama3.1:8b",
      "llama3:8b",
      "mistral",
      "mixtral",
      "codellama",
    ] as const;

    const model =
      parsed.model_override &&
      ALLOWED_MODELS.includes(
        parsed.model_override as (typeof ALLOWED_MODELS)[number]
      )
        ? parsed.model_override
        : "llama3.1:8b";

    /* ---------------------------------------------
       8. Streaming call to Ollama
    --------------------------------------------- */
    const abortController = new AbortController();
    req.signal.addEventListener("abort", () => abortController.abort());

    const apiModelUrl = process.env.API_MODEL_URL;
    const ollamaRes = await fetch(`${apiModelUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: abortController.signal,
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!ollamaRes.ok || !ollamaRes.body) {
      throw new Error("Failed to connect to Ollama");
    }

    const reader = ollamaRes.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim()) continue;

              let chunk;
              try {
                chunk = JSON.parse(line);
              } catch {
                continue;
              }

              const content = chunk.message?.content;
              if (content) {
                finalText += content;
                controller.enqueue(encoder.encode(content));
              }

              if (chunk.done === true) break;
            }
          }
        } catch {
          // swallow stream errors; logging happens below
        } finally {
          /* ---------------------------------------------
             9. Guaranteed logging
          --------------------------------------------- */
          const responseTimeMs = Date.now() - startTs;
          const tokensUsed = Math.ceil(finalText.length / 4);

          await logChat({
            supabase: supabaseAdmin,
            botId: bot_id,
            sessionId,
            role: "user",
            message: parsed.message,
            history: parsed.chat_history,
            model,
          }).catch(() => {});

          await logChat({
            supabase: supabaseAdmin,
            botId: bot_id,
            sessionId,
            role: "assistant",
            message: finalText,
            history: [],
            tokensUsed,
            responseTimeMs,
            model,
          }).catch(() => {});

          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        ...corsHeaders(),
      },
    });
  } catch (err) {
    console.error("CHAT ROUTE ERROR:", err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}
