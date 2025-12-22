import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ChatOllama } from "@langchain/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import {
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

import { getBotProfile, lookupApiKey } from "@/lib/db/bot-queries";
import { buildSystemPrompt } from "@/lib/llm/system-prompt-builder";
import { logChat } from "@/lib/db/chat-logs";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isObviousGibberish } from "@/lib/validation/gibberish-detector";

export const runtime = "nodejs";

/* -----------------------------
   CORS
----------------------------- */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  // process.env.PUBLIC_ORIGIN ?? "https://yourfrontend.example.com",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Session-Id, X-Requested-With",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/* -----------------------------
   Validation Schemas
----------------------------- */

const ParamsSchema = z.object({
  bot_id: z.string().min(1),
});

const RequestSchema = z.object({
  message: z.string().min(1),
  chat_history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .max(20)
    .default([]),
  model_override: z.string().optional(),
});

const LLMResponseSchema = z.object({
  answer: z.string(),
  suggestedQuestions: z
    .array(z.string().refine((q) => q.endsWith("?")))
    .min(2)
    .max(3),
});

/* -----------------------------
   POST Handler
----------------------------- */

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bot_id: string }> }
) {
  const supabase = getSupabaseAdmin();
  const startTs = Date.now();

  try {
    const { bot_id } = ParamsSchema.parse(await params);

    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing x-session-id header" },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = RequestSchema.parse(await req.json());

    /* Optional API key */
    const auth = req.headers.get("authorization") ?? "";
    if (auth.toLowerCase().startsWith("bearer ")) {
      const token = auth.replace(/^bearer\s+/i, "").trim();
      const apiKey = await lookupApiKey(token);

      if (!apiKey || apiKey.bot_id !== bot_id) {
        return NextResponse.json(
          { error: "Invalid API key" },
          { status: 401, headers: corsHeaders }
        );
      }
    }

    /* Gibberish guard */
    if (isObviousGibberish(body.message)) {
      return NextResponse.json(
        { error: "Message not understandable. Please rephrase." },
        { status: 400, headers: corsHeaders }
      );
    }

    const bot = await getBotProfile(bot_id);
    if (!bot) {
      return NextResponse.json(
        { error: "Bot not found" },
        { status: 404, headers: corsHeaders }
      );
    }
    ``;

    const systemPrompt = buildSystemPrompt(bot);

    const parser = StructuredOutputParser.fromZodSchema(LLMResponseSchema);
    const formatInstructions = parser.getFormatInstructions();

    /* Build messages (ROLE SAFE) */
    const messages = [
      new SystemMessage(systemPrompt),
      new SystemMessage(formatInstructions),
      ...body.chat_history.map((m) =>
        m.role === "user"
          ? new HumanMessage(m.content)
          : new AIMessage(m.content)
      ),
      new HumanMessage(body.message),
    ];

    const prompt = ChatPromptTemplate.fromMessages(messages);

    /* Model selection */
    const ALLOWED_MODELS = [
      "llama3.1:8b",
      "llama3:8b",
      "mistral",
      "mixtral",
      "codellama",
    ] as const;

    type AllowedModel = (typeof ALLOWED_MODELS)[number];

    const modelName: AllowedModel =
      body.model_override &&
      ALLOWED_MODELS.includes(body.model_override as AllowedModel)
        ? (body.model_override as AllowedModel)
        : "llama3.1:8b";

    const model = new ChatOllama({
      baseUrl: process.env.API_MODEL_URL,
      model: modelName,
      temperature: 0.7,
    });

    /* Invoke */
    let rawResponse;
    try {
      rawResponse = await prompt.pipe(model).invoke({});
    } catch (err) {
      console.error("LLM invocation failed:", err);
      return NextResponse.json(
        { error: "Model invocation failed" },
        { status: 500, headers: corsHeaders }
      );
    }

    /* Parse */
    let result: z.infer<typeof LLMResponseSchema>;
    try {
      result = await parser.parse(String(rawResponse.content ?? ""));
    } catch {
      // If parsing fails, try to extract JSON from the response
      const rawContent = String(rawResponse.content ?? "").trim();
      try {
        // Try to parse as JSON if it looks like JSON
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.answer && typeof parsed.answer === "string") {
            result = {
              answer: parsed.answer.trim(),
              suggestedQuestions: Array.isArray(parsed.suggestedQuestions)
                ? parsed.suggestedQuestions
                : [],
            };
          } else {
            result = {
              answer: rawContent,
              suggestedQuestions: [],
            };
          }
        } else {
          result = {
            answer: rawContent,
            suggestedQuestions: [],
          };
        }
      } catch {
        // If JSON parsing also fails, use raw content
        result = {
          answer: rawContent,
          suggestedQuestions: [],
        };
      }
    }

    /* Final cleanup: ensure answer is never raw JSON */
    if (
      result.answer.trim().startsWith("{") &&
      result.answer.trim().endsWith("}")
    ) {
      try {
        const parsed = JSON.parse(result.answer.trim());
        if (parsed.answer && typeof parsed.answer === "string") {
          result.answer = parsed.answer.trim();
        }
        if (
          parsed.suggestedQuestions &&
          Array.isArray(parsed.suggestedQuestions)
        ) {
          result.suggestedQuestions = parsed.suggestedQuestions;
        }
      } catch {
        // If it's not valid JSON, leave it as is
      }
    }

    /* Logging */
    const responseTimeMs = Date.now() - startTs;
    const estimatedTokensUsed = Math.ceil(
      (result.answer.length + body.message.length) / 4
    );

    await logChat({
      supabase,
      botId: bot_id,
      sessionId,
      role: "assistant",
      message: result.answer,
      tokensUsed: estimatedTokensUsed,
      responseTimeMs,
      model: modelName,
      history: [],
    }).catch(() => {});

    return NextResponse.json(
      {
        answer: result.answer,
        suggestedQuestions: result.suggestedQuestions,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    console.error("CHAT ROUTE ERROR:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
