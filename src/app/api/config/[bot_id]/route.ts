// import { NextRequest, NextResponse } from "next/server";
// import { z } from "zod";
// import { getBotProfile, signECDSAPayload } from "@/lib/db/bot-queries";
// import { supabaseAdmin } from "@/lib/supabase/admin";
// import type { BotUiSettingsRow } from "@/types";

// export const runtime = "nodejs";

// /* ---------------------------------------------
//    Validation Schemas
// --------------------------------------------- */
// const BotIdSchema = z.object({
//   bot_id: z.string().min(1),
// });

// /* ---------------------------------------------
//    Route Handler
// --------------------------------------------- */
// export async function GET(
//   _req: NextRequest,
//   { params }: { params: Promise<{ bot_id: string }> }
// ) {
//   try {
//     // 1. Validate bot_id
//     const { bot_id } = await params;
//     const { bot_id: validatedBotId } = BotIdSchema.parse({ bot_id });

//     // 2. Ensure ECDSA private key exists
//     const PRIVATE_KEY_RAW = process.env.QUICKBOT_PRIVATE_KEY_RAW;
//     if (!PRIVATE_KEY_RAW) {
//       return NextResponse.json(
//         { error: "Server misconfigured (missing QUICKBOT_PRIVATE_KEY_RAW)" },
//         { status: 500 }
//       );
//     }

//     // 3. Load complete bot profile and UI settings in parallel
//     const [bot, uiSettingsRes] = await Promise.all([
//       getBotProfile(validatedBotId),
//       supabaseAdmin
//         .from("bot_ui_settings")
//         .select("*")
//         .eq("bot_id", validatedBotId)
//         .maybeSingle(),
//     ]);

//     if (!bot) {
//       return NextResponse.json({ error: "Bot not found" }, { status: 404 });
//     }

//     // 4. Prepare UI settings (use defaults if not found)
//     // Only include allowed fields in defaults
//     const greeting = bot.config.greetings || "Hello there 👋";
//     const rawUiSettings: BotUiSettingsRow =
//       uiSettingsRes.data ||
//       ({
//         bot_id: validatedBotId,
//         theme: "modern",
//         chatbot_name: "QuickBot Assistant",
//         welcome_message: greeting,
//         quick_questions: [],
//         support_info: null,
//         position: "bottom-right",
//         auto_open_delay_ms: 0,
//         auto_greet_on_open: false,
//         ask_email_before_chat: false,
//         persist_chat: true,
//         show_timestamps: true,
//         updated_at: new Date().toISOString(),
//       } as BotUiSettingsRow);

//     // Whitelist allowed fields only (exclude database metadata)
//     const allowed = [
//       "theme",
//       "chatbot_name",
//       "welcome_message",
//       "quick_questions",
//       "support_info",
//       "position",
//       "auto_open_delay_ms",
//       "auto_greet_on_open",
//       "ask_email_before_chat",
//       "persist_chat",
//       "show_timestamps",
//     ];

//     // Filter to only allowed fields before signing
//     const uiSettingsForSigning = Object.fromEntries(
//       Object.entries(rawUiSettings).filter(
//         ([k]) => allowed.includes(k) && k !== "id" && k !== "created_at"
//       )
//     );

//     // 8. Build payload to sign (ui_settings only, without metadata)
//     const payloadToSign = {
//       ui_settings: uiSettingsForSigning,
//     };

//     // Return only allowed fields to the client (matching what was signed)
//     // Filter to only allowed fields to match the client's expected schema
//     const uiSettings = Object.fromEntries(
//       Object.entries(rawUiSettings).filter(
//         ([k]) => allowed.includes(k) || k === "bot_id" || k === "updated_at"
//       )
//     ) as BotUiSettingsRow;

//     console.log("[CONFIG ROUTE] Payload to sign structure:", {
//       uiSettingsKeys: Object.keys(uiSettings).slice(0, 5), // First 5 keys
//       uiSettingsBotId: uiSettings.bot_id,
//     });

//     // 9. Sign the payload with ECDSA P-256
//     const signature = signECDSAPayload(payloadToSign, PRIVATE_KEY_RAW);

//     // 10. Return ui_settings and signature
//     return NextResponse.json({
//       ui_settings: uiSettings,
//       signature,
//     });
//   } catch (err) {
//     if (err instanceof z.ZodError) {
//       return NextResponse.json(
//         { error: "Invalid bot_id", details: err.errors },
//         { status: 400 }
//       );
//     }

//     console.error("CONFIG ROUTE ERROR:", err);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getBotProfile, signECDSAPayload } from "@/lib/db/bot-queries";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { BotUiSettingsRow } from "@/types";

export const runtime = "nodejs";

/* -----------------------------------------------------------
   CORS - Allow all origins (dev and prod)
----------------------------------------------------------- */
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
  };
}

/* -----------------------------------------------------------
   OPTIONS Preflight
----------------------------------------------------------- */
export function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

/* -----------------------------------------------------------
   Validation Schema
----------------------------------------------------------- */
const BotIdSchema = z.object({
  bot_id: z.string().min(1),
});

/* -----------------------------------------------------------
   GET Handler
----------------------------------------------------------- */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ bot_id: string }> }
) {
  try {
    const { bot_id } = await params;
    const { bot_id: validatedBotId } = BotIdSchema.parse({ bot_id });

    const PRIVATE_KEY_RAW = process.env.QUICKBOT_PRIVATE_KEY_RAW;
    if (!PRIVATE_KEY_RAW) {
      return new NextResponse(
        JSON.stringify({ error: "Missing QUICKBOT_PRIVATE_KEY_RAW" }),
        { status: 500, headers: corsHeaders() }
      );
    }

    // Fetch bot data
    const supabaseAdmin = getSupabaseAdmin();
    const [bot, uiSettingsRes] = await Promise.all([
      getBotProfile(validatedBotId),
      supabaseAdmin
        .from("bot_ui_settings")
        .select("*")
        .eq("bot_id", validatedBotId)
        .maybeSingle(),
    ]);

    if (!bot) {
      return new NextResponse(JSON.stringify({ error: "Bot not found" }), {
        status: 404,
        headers: corsHeaders(),
      });
    }

    const greeting = bot.config.greetings || "Hello there 👋";

    // Create default ui_settings if missing
    const rawUiSettings: BotUiSettingsRow =
      uiSettingsRes.data ||
      ({
        bot_id: validatedBotId,
        theme: "modern",
        chatbot_name: "QuickBot Assistant",
        welcome_message: greeting,
        quick_questions: [],
        support_info: null,
        position: "bottom-right",
        auto_open_delay_ms: 0,
        auto_greet_on_open: false,
        ask_email_before_chat: false,
        persist_chat: true,
        show_timestamps: true,
        updated_at: new Date().toISOString(),
      } as BotUiSettingsRow);

    // Only allow safe fields
    const allowed = [
      "theme",
      "chatbot_name",
      "welcome_message",
      "quick_questions",
      "support_info",
      "position",
      "auto_open_delay_ms",
      "auto_greet_on_open",
      "ask_email_before_chat",
      "persist_chat",
      "show_timestamps",
    ];

    const uiSettingsForSigning = Object.fromEntries(
      Object.entries(rawUiSettings).filter(([k]) => allowed.includes(k))
    );

    const payloadToSign = { ui_settings: uiSettingsForSigning };

    const signature = signECDSAPayload(payloadToSign, PRIVATE_KEY_RAW);

    const responseBody = {
      ui_settings: rawUiSettings,
      signature,
    };

    return new NextResponse(JSON.stringify(responseBody), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders(),
      },
    });
  } catch (err) {
    console.error("CONFIG ROUTE ERROR:", err);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: corsHeaders() }
    );
  }
}
