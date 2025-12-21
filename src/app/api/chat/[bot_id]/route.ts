import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ChatOllama } from "@langchain/ollama";

import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StructuredOutputParser } from "@langchain/core/output_parsers";

import { getBotProfile, lookupApiKey } from "@/lib/db/bot-queries";
import { buildSystemPrompt } from "@/lib/llm/system-prompt-builder";
import { logChat } from "@/lib/db/chat-logs";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isObviousGibberish } from "@/lib/validation/gibberish-detector";

export const runtime = "nodejs";

/* ---------------------------------------------
   Schemas
--------------------------------------------- */

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
    .default([]),
  model_override: z.string().optional(),
});

/* LLM RESPONSE CONTRACT */
const LLMResponseSchema = z.object({
  answer: z.string(),
  suggestedQuestions: z.array(z.string().endsWith("?")).min(2).max(3),
});

/* ---------------------------------------------
   CORS
--------------------------------------------- */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Session-Id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/* ---------------------------------------------
   POST Handler
--------------------------------------------- */

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bot_id: string }> }
) {
  const startTs = Date.now();
  const supabase = getSupabaseAdmin();

  try {
    /* 1. Params + headers */
    const { bot_id } = ParamsSchema.parse(await params);

    const sessionId = req.headers.get("x-session-id");
    if (!sessionId) {
      return NextResponse.json(
        { error: "x-session-id header required" },
        { status: 400, headers: corsHeaders }
      );
    }

    /* 2. Body */
    const body = RequestSchema.parse(await req.json());

    /* 3. Optional API key */
    const auth = req.headers.get("authorization");
    if (auth?.toLowerCase().startsWith("bearer ")) {
      const token = auth.replace(/^bearer\s+/i, "").trim();
      const apiKey = await lookupApiKey(token);

      if (!apiKey || apiKey.bot_id !== bot_id) {
        return NextResponse.json(
          { error: "Invalid API key" },
          { status: 401, headers: corsHeaders }
        );
      }
    }

    /* 4. Gibberish guard */
    if (isObviousGibberish(body.message)) {
      await logChat({
        supabase,
        botId: bot_id,
        sessionId,
        role: "user",
        message: body.message,
        history: body.chat_history.map((m) => ({
          role: m.role,
          content: m.content,
          timestamp: new Date().toISOString(),
        })),
      }).catch(() => {});

      return NextResponse.json(
        { error: "Message not understandable. Please rephrase." },
        { status: 400, headers: corsHeaders }
      );
    }

    /* 5. Bot + system prompt */
    const bot = await getBotProfile(bot_id);
    if (!bot) {
      return NextResponse.json(
        { error: "Bot not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    const systemPrompt = buildSystemPrompt(bot);

    /* 6. Structured output parser */
    const parser = StructuredOutputParser.fromZodSchema(LLMResponseSchema);

    /* 7. Prompt template using fromMessages */
    const formatInstructions = parser.getFormatInstructions();

    // Escape curly braces in system prompt and format instructions
    const escapeBraces = (text: string) =>
      text.replace(/\{/g, "{{").replace(/\}/g, "}}");
    const escapedSystemPrompt = escapeBraces(systemPrompt);
    const escapedFormatInstructions = escapeBraces(formatInstructions);

    // Very explicit JSON format instruction
    const jsonFormatInstruction = `You MUST respond with ONLY a valid JSON object. No other text before or after.

    ${escapedFormatInstructions}

    Example of correct format:
    {{"answer": "Your response text here", "suggestedQuestions": ["Question 1?", "Question 2?", "Question 3?"]}}

    CRITICAL RULES:
    - Start your response with {{ (opening brace)
    - End your response with }} (closing brace)
    - Do NOT include markdown code blocks like \`\`\`json
    - Do NOT include any explanatory text
    - Do NOT include the word "json" or "JSON" in your response
    - The entire response must be valid JSON that can be parsed
    - Include exactly 2-3 questions in suggestedQuestions array`;

    const prompt = ChatPromptTemplate.fromMessages([
      ["system", escapedSystemPrompt],
      ["system", jsonFormatInstruction],
      ...body.chat_history.map(
        (m) => [m.role, escapeBraces(m.content)] as [string, string]
      ),
      ["user", "{input}"],
    ]);

    /* 8. Model selection */
    const ALLOWED_MODELS = [
      "llama3.1:8b",
      "llama3:8b",
      "mistral",
      "mixtral",
      "codellama",
    ];

    const modelName =
      body.model_override && ALLOWED_MODELS.includes(body.model_override)
        ? body.model_override
        : "llama3.1:8b";

    const model = new ChatOllama({
      baseUrl: process.env.API_MODEL_URL,
      model: modelName,
      temperature: 0.7,
    });

    /* 9. Invoke with error handling */
    const chain = prompt.pipe(model).pipe(parser);

    let result: { answer: string; suggestedQuestions: string[] };

    try {
      result = await chain.invoke({
        input: body.message,
      });
    } catch (parseError: any) {
      // If parsing fails, try to extract JSON from the response
      const rawOutput = parseError?.llmOutput || "";

      // Try to find JSON in the response
      const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.answer && Array.isArray(parsed.suggestedQuestions)) {
            result = {
              answer: parsed.answer,
              suggestedQuestions: parsed.suggestedQuestions
                .filter(
                  (q: unknown) => typeof q === "string" && q.endsWith("?")
                )
                .slice(0, 3),
            };
          } else {
            throw new Error("Invalid structure");
          }
        } catch {
          // Fallback: use raw output as answer, generate empty questions
          result = {
            answer: rawOutput.trim(),
            suggestedQuestions: [],
          };
        }
      } else {
        // No JSON found, use raw output as answer
        result = {
          answer: rawOutput.trim(),
          suggestedQuestions: [],
        };
      }
    }

    /* 10. Logging */
    const responseTimeMs = Date.now() - startTs;
    const tokensUsed = Math.ceil(result.answer.length / 4);

    await logChat({
      supabase,
      botId: bot_id,
      sessionId,
      role: "user",
      message: body.message,
      history: body.chat_history.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: new Date().toISOString(),
      })),
      model: modelName,
    }).catch(() => {});

    await logChat({
      supabase,
      botId: bot_id,
      sessionId,
      role: "assistant",
      message: result.answer,
      history: [],
      tokensUsed,
      responseTimeMs,
      model: modelName,
    }).catch(() => {});

    /* 11. Response */
    return NextResponse.json(
      {
        answer: result.answer,
        suggestedQuestions: result.suggestedQuestions,
      },
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("CHAT ROUTE ERROR:", err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
