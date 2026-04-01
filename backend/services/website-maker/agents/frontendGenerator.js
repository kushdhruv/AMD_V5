import { callGroqJSON } from "../utils/groqClient.js";
import {
  getPackageJson, getIndexHTML, getBaseCSS, getBaseJS
} from "../templates/vanillaApp.js";
import {
  getNavbarHTML, getEventHeroHTML, getAboutEventHTML, getSpeakersHTML, getScheduleHTML, getGalleryGridHTML, getRegistrationHTML, getFooterHTML, resetImageCursor
} from "../templates/components.js";

const FRONTEND_SYSTEM_PROMPT = `You are an expert copywriter and UI content strategist for High-Energy School/College Events, Fests, and Hackathons.
Given a website section description, you must generate the exact textual content needed for its UI template.

Return ONLY a valid JSON object with the requested keys. No markdown. No wrap.

JSON SCHEMA:
{
  "brand": "Event Name",
  "links": ["About", "Schedule", "Speakers", "Gallery"], // For navbars
  "title": "Main bold headline", 
  "subtitle": "Long descriptive paragraph text",
  "pretitle": "Small overline text (e.g. TICKETS OUT NOW)", 
  "date": "OCTOBER 14-16, 2026",
  "venue": "Campus Name",
  "primaryCta": "Register",
  "secondaryCta": "Agenda",
  "ctaText": "Buy Ticket",
  "speakers": [ // For speaker grids
    { "name": "John Doe", "title": "Keynote Speaker" }
  ],
  "schedule": [ // For itineraries
    { "time": "09:00 AM", "title": "Check In", "description": "Arrival at Venue" }
  ],
  "features": [ // For about sections
    "50 Guest Speakers", "Hackathon Prize Pool"
  ],
  "imageKeyword": "highly descriptive single word for Unsplash API (e.g., robot, concert, library, crowd)",
  "imageKeywords": ["robot", "circuit", "team"] // Only needed for Gallery section
}

Fill out the JSON strictly with vibrant, hype-building, highly-energetic professional copy tailored for student events. Do not include null keys.`;

/**
 * Frontend Generator Agent: Creates Vanilla HTML/CSS/JS files from a plan.
 * Uses Template-Driven Architecture for absolutely perfectly aligned Nicepage-tier UI.
 */
export async function generateFrontend(plan, urlContext = "", imageContext = "") {
  const files = {};
  resetImageCursor(); // Reset cursor so each build starts fresh
  files["frontend/package.json"] = getPackageJson(plan.projectName);
  files["frontend/style.css"] = getBaseCSS();
  files["frontend/main.js"] = getBaseJS();

  const sectionsHTML = [];
  for (const section of plan.sections) {
    try {
      const htmlCode = await generateSectionHTML(plan, section, urlContext, imageContext);
      sectionsHTML.push(`<!-- Section: ${section.id} -->\n${htmlCode}`);
      console.log(`[Frontend] ✅ Generated Template: ${section.id} (${section.type})`);
    } catch (err) {
      console.error(`[Frontend] ❌ Failed ${section.id}:`, err.message);
      // Fallback
      sectionsHTML.push(getFallbackHTML(section.type));
    }
  }

  files["frontend/index.html"] = getIndexHTML(plan, sectionsHTML.join("\n\n"));
  return files;
}

async function generateSectionHTML(plan, section, urlContext = "", imageContext = "") {
  let data = section.data;

  if (!data) {
    const userPrompt = `Generate JSON content for the "${section.id}" section.

SECTION TYPE: ${section.type}
HEADING: ${section.title}
DESCRIPTION: ${section.description}

EVENT DOMAIN: "${plan.projectName}" — ${plan.type}
${urlContext ? `\nCONTENT SOURCE:\n${urlContext.substring(0, 1200)}` : ""}

Return ONLY valid JSON matching the schema needed for this section type. Keep copy energetic but professional.`;

    try {
      data = await callGroqJSON(FRONTEND_SYSTEM_PROMPT, userPrompt, {
        model: "llama-3.1-8b-instant",
        temperature: 0.3,
        maxTokens: 2000,
      });
      section.data = data; // Cache data to prevent redundant API calls on edit
    } catch (err) {
      console.warn(`[Frontend] Groq failed for ${section.id}, using default fallback data.`);
      data = {"title": section.title || "The Event", "subtitle": section.description || "Join us for an amazing experience."};
      section.data = data;
    }
  }

  // Fallback defaults if LLM misses them
  if (!data.title) data.title = section.title || "Don't Miss Out";
  if (!data.subtitle) data.subtitle = section.description || "The biggest technical event of the year.";

  // Route to the correct perfectly aligned Tailwind HTML Template
  // Priority: section-specific images > global plan images > LoremFlickr fallback
  if (data.sectionImages && data.sectionImages.length > 0) {
     data.userImages = data.sectionImages;  // Section-targeted images from edit
  } else if (plan.userImages && plan.userImages.length > 0) {
     data.userImages = plan.userImages;  // Global images from initial build
  }

  switch (section.type) {
    case "navbar": return getNavbarHTML(data);
    case "event-hero": 
    case "hero": return getEventHeroHTML(data, section.id);
    case "about-event": return getAboutEventHTML(data, section.id);
    case "speakers": return getSpeakersHTML(data, section.id);
    case "schedule": return getScheduleHTML(data, section.id);
    case "gallery": return getGalleryGridHTML(data, section.id);
    case "registration":
    case "cta": return getRegistrationHTML(data, section.id);
    case "footer": return getFooterHTML(data, section.id);
    default:
      // Generic fallback
      return getAboutEventHTML(data, section.id);
  }
}

function getFallbackHTML(type) {
  if (type === "navbar") return getNavbarHTML({ brand: "TechFest" });
  if (type === "event-hero" || type === "hero") return getEventHeroHTML({ title: "CYBER FEST" }, "hero");
  if (type === "footer") return getFooterHTML({ brand: "TechFest" }, "footer");
  return getAboutEventHTML({ title: "Welcome To The Event"}, type);
}
