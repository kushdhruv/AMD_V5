
import Groq from "groq-sdk";
import { validateBlueprint } from "@/lib/website-builder/blueprintSchema";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const BLUEPRINT_SYSTEM_PROMPT = `You are a JSON blueprint generator for event websites. You MUST output ONLY valid JSON — no markdown, no backticks, no explanation.

Generate a blueprint for an event website based on the provided prompt and research. The JSON must follow this exact structure:

{
  "event_name": "string",
  "tagline": "string",
  "date": "string",
  "location": "string",
  "hero": {
    "headline": "string",
    "subheadline": "string",
    "cta_text": "string",
    "background_style": "gradient|image|particles|geometric"
  },
  "about": {
    "title": "string",
    "description": "string (2-3 paragraphs)",
    "highlights": ["string", "string", "string"]
  },
  "events": [
    { "title": "string", "description": "string", "icon": "emoji" }
  ],
  "schedule": [
    { "time": "string", "title": "string", "description": "string", "speaker": "string" }
  ],
  "speakers": [
    { "name": "string", "role": "string", "company": "string", "bio": "short bio" }
  ],
  "sponsors": [
    { "name": "string", "tier": "platinum|gold|silver|bronze|partner" }
  ],
  "registration": {
    "title": "string",
    "description": "string",
    "fields": [
      { "label": "string", "type": "text|email|tel|select|textarea", "required": true/false }
    ]
  },
  "contact": {
    "email": "string",
    "phone": "string",
    "address": "string",
    "social_links": { "twitter": "url", "linkedin": "url" }
  },
  "theme_style": "string describing the visual style",
  "mood": "string describing the mood/feeling"
}

CRITICAL RULES:
- Use REAL information from the research when available (real names, real companies, real facts)
- Generate 4-6 events/activities, 6-10 schedule items, 3-5 speakers, 3-6 sponsors
- Registration fields should include: Full Name, Email, Phone, Organization (at minimum)
- Output ONLY the JSON object. No other text before or after.`;

const MAX_RETRIES = 3;

export async function POST(request) {
  try {
    const { prompt, research, template } = await request.json();

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    const researchContext =
      typeof research === "object" && research.synthesis
        ? research.synthesis
        : typeof research === "string"
          ? research
          : "No research available — generate plausible content.";

    let lastErrors = [];

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const retryHint =
          attempt > 1
            ? `\n\nPREVIOUS ATTEMPT FAILED VALIDATION. Errors: ${lastErrors.join(", ")}. Fix these issues.`
            : "";

        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: BLUEPRINT_SYSTEM_PROMPT },
            {
              role: "user",
              content: `Event Description:\n${prompt}\n\nResearch Findings:\n${researchContext}\n\nTemplate Style: ${template || "tech"}${retryHint}\n\nGenerate the JSON blueprint now:`,
            },
          ],
          temperature: 0.4,
          max_tokens: 4096,
          response_format: { type: "json_object" },
        });

        let response = completion.choices[0]?.message?.content?.trim();

        // Parse and validate
        const validation = validateBlueprint(response);

        if (validation.valid) {
          // Match theme based on blueprint mood/style
          const theme = matchTheme(validation.data, template);

          return Response.json({
            project: {
              blueprint: validation.data,
              theme,
            },
          });
        }

        lastErrors = validation.errors;
        console.warn(`Blueprint attempt ${attempt} failed:`, lastErrors);
      } catch (err) {
        lastErrors = [err.message];
        console.error(`Blueprint attempt ${attempt} error:`, err);
      }
    }

    return Response.json(
      { error: `Blueprint generation failed after ${MAX_RETRIES} attempts. Errors: ${lastErrors.join(", ")}` },
      { status: 500 }
    );
  } catch (error) {
    console.error("Blueprint generation error:", error);
    return Response.json(
      { error: "Blueprint generation failed: " + error.message },
      { status: 500 }
    );
  }
}

/**
 * Match blueprint mood/style to a theme preset.
 */
function matchTheme(blueprint, templateType) {
  const themes = {
    "tech-dark": {
      primary: "#3b82f6",
      accent: "#8b5cf6",
      background: "#030712",
      surface: "#0f172a",
      text: "#f8fafc",
      textSecondary: "#94a3b8",
    },
    "vibrant-fest": {
      primary: "#f43f5e",
      accent: "#ec4899",
      background: "#1a0a1e",
      surface: "#2d1b36",
      text: "#fdf2f8",
      textSecondary: "#d4a5c0",
    },
    "clean-corporate": {
      primary: "#0ea5e9",
      accent: "#06b6d4",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#0f172a",
      textSecondary: "#64748b",
    },
  };

  // Simple keyword matching
  const mood = (blueprint.mood || "").toLowerCase();
  const style = (blueprint.theme_style || "").toLowerCase();
  const combined = mood + " " + style + " " + (templateType || "");

  if (combined.includes("corporate") || combined.includes("professional") || combined.includes("clean")) {
    return { preset: "clean-corporate", ...themes["clean-corporate"] };
  }
  if (combined.includes("vibrant") || combined.includes("festival") || combined.includes("cultural") || combined.includes("celebration")) {
    return { preset: "vibrant-fest", ...themes["vibrant-fest"] };
  }
  return { preset: "tech-dark", ...themes["tech-dark"] };
}
