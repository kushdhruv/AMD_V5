import { callGroqJSON } from "../utils/groqClient.js";

const PLANNER_SYSTEM_PROMPT = `You are a dynamic event architect. Your task is to process a user's prompt (e.g., 'Robo Wars', 'Music Fest', 'Hackathon') and generate a completely bespoke, highly contextual website plan.

Return EXACTLY this JSON structure:
{
  "projectName": "Short Event Name",
  "description": "One paragraph about the core theme",
  "type": "hackathon|cultural_fest|seminar|music_event|robotics_competition|conference",
  "colorScheme": {
    "primary": "#hexcode" // IMPORTANT: Choose a striking, highly thematic hex color. (e.g., Neon Green for Hackers, High-Voltage Yellow for Robots, Deep Sky Blue for Seminars)
  },
  "sections": [
    {
      "id": "unique-id",
      "type": "navbar|event-hero|about-event|speakers|schedule|gallery|registration|footer",
      "title": "Section heading text",
      "description": "DETAILED layout logic. What vibe? What image keyword? (e.g., 'robot', 'concert', 'crowd')"
    }
  ],
  "features": ["Feature 1", "Feature 2"],
  "backendRoutes": [
    { "method": "POST", "path": "/api/register", "description": "Registration", "name": "register" }
  ]
}

CRITICAL RULES:
1. THEME RESPONSIVENESS: If the prompt is "Robo Race", generate a bright orange/yellow colorScheme and sections that make sense (e.g., NO speakers, but definitely a Gallery of robots and a Registration form).
2. Generate ONLY the sections that make logical sense for the prompt (usually 4 to 6).
3. Always include 'navbar', 'event-hero', 'registration', and 'footer'.
4. Do NOT include 'speakers' or 'schedule' unless it is relevant to the event type.
`;

export async function planWebsite(prompt, urlContext = "", imageContext = "") {
  let userMessage = `Create a dynamic, custom Event website plan for: ${prompt}`;
  
  if (urlContext) {
    userMessage += `\n\n--- CONTENT FROM LINKS ---\n${urlContext.substring(0, 2000)}`;
  }

  let plan;
  try {
    plan = await callGroqJSON(PLANNER_SYSTEM_PROMPT, userMessage, {
      model: "llama-3.1-8b-instant",
      temperature: 0.4,
      maxTokens: 4096,
    });
    console.log(`[Planner] ✅ Plan via Groq`);
  } catch (err) {
    console.warn(`[Planner] Groq failed:`, err.message);
    plan = { sections: [] }; 
  }

  // Ensure minimum sections only if entirely failed
  if (!plan.sections || plan.sections.length < 3) {
    plan.sections = ensureMinimumSections(plan);
  }

  // Fallback defaults
  if (!plan.colorScheme?.primary) {
    plan.colorScheme = { primary: "#6366f1" };
  }

  if (!plan.backendRoutes || plan.backendRoutes.length === 0) {
    plan.backendRoutes = [
      { method: "POST", path: "/api/register", description: "Registration", name: "register" }
    ];
  }

  return plan;
}

function ensureMinimumSections(plan) {
  return [
    { id: "navbar", type: "navbar", title: "Nav", description: "nav" },
    { id: "hero", type: "event-hero", title: plan.projectName || "Welcome", description: "Hero" },
    { id: "about", type: "about-event", title: "About", description: "About text" },
    { id: "registration", type: "registration", title: "Register", description: "Form" },
    { id: "footer", type: "footer", title: "Footer", description: "Footer" }
  ];
}
