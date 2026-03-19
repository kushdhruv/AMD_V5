import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { AppConfigSchema } from "@/lib/app-builder-v2/schema/configSchema";
import { validateAppConfig } from "@/lib/app-builder-v2/schema/validator";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    // 1. Input Sanitization & Parsing
    const { currentConfig, prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ success: false, error: "Invalid prompt format" }, { status: 400 });
    }

    // 2. Lifecycle Constraints
    if (currentConfig?.app_state === "LIVE" || currentConfig?.app_state === "GENERATED") {
       return NextResponse.json({ 
         success: false, 
         error: "Config Freeze Enforced: Cannot structurally patch a Live/Generated app. Only dynamic content updates are allowed via Admin Dashboard." 
       }, { status: 403 });
    }

    // 3. Prompt Construction for LLM
    const systemPrompt = `
      You are an expert app builder configuration engine. Your job is to take the user's natural language request and the current app configuration, and output a strict JSON payload representing the completely updated AppConfig.
      
      CRITICAL RULES:
      - Preserve ALL existing configuration that the user did not explicitly ask to change.
      - Ensure you follow the strict JSON schema provided.
      - Max active modules = 8.
      - DEPENDENCY RULE: If the user enables Leaderboard, YOU MUST ALSO ENABLE Live Scores.
      - DEPENDENCY RULE: If the user enables Coupons, YOU MUST ALSO ENABLE Commerce.
      - Intelligently populate empty fields with relevant engaging content (e.g., if they ask for a "Cyberpunk Event", proactively set the primary_color to Neon Green and dark_mode to true).
      - RETURN ONLY THE JSON OBJECT. NO MARKDOWN. NO EXPLANATIONS.
    `;

    // 4. Groq: Llama 3.3 70B for fast structured JSON reasoning
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `CURRENT CONFIG:\n${JSON.stringify(currentConfig || {}, null, 2)}\n\nUSER REQUEST:\n${prompt}` },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const responseContent = completion.choices[0]?.message?.content;
    if (!responseContent) throw new Error("No response from Groq");

    const newConfigRaw = JSON.parse(responseContent);

    // 5. Schema Validation & Business Logic Check
    const parsedResult = AppConfigSchema.safeParse(newConfigRaw);
    
    if (!parsedResult.success) {
      console.error("Groq schema violation:", parsedResult.error);
      return NextResponse.json({ 
        success: false, 
        error: "AI generated an invalid configuration structure.", 
        details: parsedResult.error.issues 
      }, { status: 422 });
    }

    const validation = validateAppConfig(parsedResult.data);
    
    if (!validation.isValid) {
      console.error("Business rule violation:", validation.errors);
      return NextResponse.json({ 
        success: false, 
        error: "Configuration violates strict dependency rules.", 
        details: validation.errors 
      }, { status: 422 });
    }

    return NextResponse.json({ success: true, config: validation.parsedConfig });

  } catch (error) {
    console.error("Chat Patch Error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate AI patch" }, { status: 500 });
  }
}

