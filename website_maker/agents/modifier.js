import { callGroqJSON } from "../utils/groqClient.js";

const MODIFIER_SYSTEM_PROMPT = `You are a powerful website editor AI. Given a user instruction about their website, return a JSON object with operations to apply.

Return ONLY valid JSON with this structure:
{
  "operations": [ { "action": "...", ... } ],
  "summary": "one-line summary in plain English"
}

═══ AVAILABLE ACTIONS ═══

1. UPDATE — change a single field on a section or the plan:
   { "action": "update", "target": "event-hero", "field": "data.title", "value": "NEW TITLE" }
   { "action": "update", "target": "plan", "field": "colorScheme.primary", "value": "#8B5CF6" }

2. ADD_SECTION — add a brand new section to the website:
   { "action": "add_section", "type": "TYPE", "id": "unique-id", "title": "Heading", "description": "Subtext", "position": "after_SECTIONID", "data": { ... } }
   Valid types: "about-event", "speakers", "schedule", "gallery", "registration"
   Position values: "start", "end", "before_ID", "after_ID"

3. REMOVE_SECTION — delete a section from the website:
   { "action": "remove_section", "target": "section-id" }

4. REPLACE_DATA — completely replace a section's content:
   { "action": "replace_data", "target": "section-id", "data": { "title": "...", "subtitle": "...", ... } }

═══ SECTION IDS (typical website) ═══
navbar, event-hero, about-event, speakers, schedule, gallery, register, footer

═══ EDITABLE FIELDS ═══
Plan-level: colorScheme.primary (hex), projectName (string)
Section fields (prefix with "data."): 
  title, subtitle, pretitle, primaryCta, secondaryCta, ctaText
  date, venue, brand, imageKeyword
  features (string array), links (string array)
  speakers (array of {name, title})
  schedule (array of {time, title, description})

═══ EXAMPLES ═══

User: "change hero title to MEGA FEST 2026"
{"operations": [{"action": "update", "target": "event-hero", "field": "data.title", "value": "MEGA FEST<br><span class=\\"text-brand\\">2026</span>"}], "summary": "Updated hero title to MEGA FEST 2026"}

User: "make the color red"
{"operations": [{"action": "update", "target": "plan", "field": "colorScheme.primary", "value": "#EF4444"}], "summary": "Changed theme color to red"}

User: "add a sponsors section between about and speakers"
{"operations": [{"action": "add_section", "type": "about-event", "id": "sponsors", "title": "Our Sponsors", "description": "Backed by industry titans", "position": "after_about-event", "data": {"pretitle": "Partners", "title": "Proudly Supported By", "subtitle": "Our event is made possible through the generous support of leading technology companies and educational institutions.", "features": ["Google", "Microsoft", "Meta", "AMD", "NVIDIA", "Intel"]}}], "summary": "Added sponsors section"}

User: "remove the gallery"
{"operations": [{"action": "remove_section", "target": "gallery"}], "summary": "Removed gallery section"}

User: "change the about section to talk about AI hackathon"
{"operations": [{"action": "replace_data", "target": "about-event", "data": {"pretitle": "About The Hackathon", "title": "BUILD THE FUTURE WITH AI", "subtitle": "Join 500+ developers for a 36-hour AI hackathon. Design, build, and ship real products powered by cutting-edge machine learning, large language models, and computer vision.", "features": ["36-Hour Non-Stop Coding", "₹10,00,000 Prize Pool", "Free API Credits from OpenAI", "Top VC Judges & Mentors"]}}], "summary": "Rewrote about section for AI hackathon"}

User: "update schedule to 5 events and change hero subtitle"
{"operations": [{"action": "update", "target": "schedule", "field": "data.schedule", "value": [{"time": "09:00 AM", "title": "Registration & Breakfast", "description": "Check in, collect swag kits."}, {"time": "10:30 AM", "title": "Opening Keynote", "description": "Welcome by the founder."}, {"time": "12:00 PM", "title": "Hacking Begins", "description": "Problem statements revealed."}, {"time": "06:00 PM", "title": "Mentor Sessions", "description": "1-on-1 with industry experts."}, {"time": "09:00 PM", "title": "Demo Night & Awards", "description": "Final pitches and prizes."}]}, {"action": "update", "target": "event-hero", "field": "data.subtitle", "value": "The ultimate developer experience — build, learn, win."}], "summary": "Updated schedule and hero subtitle"}

User: "add a FAQ section at the end before footer"
{"operations": [{"action": "add_section", "type": "about-event", "id": "faq", "title": "FAQ", "description": "Got questions?", "position": "before_footer", "data": {"pretitle": "Questions?", "title": "Frequently Asked Questions", "subtitle": "Everything you need to know about the event, registration, and participation.", "features": ["Registration is completely free for students", "Teams of 2-4 members allowed", "Meals and snacks provided throughout", "Bring your own laptop and charger", "WiFi and power outlets available", "Certificates for all participants"]}}], "summary": "Added FAQ section before footer"}

User: "change speakers to 6 people and make them AI experts"
{"operations": [{"action": "update", "target": "speakers", "field": "data.speakers", "value": [{"name": "Dr. Fei-Fei Li", "title": "Stanford AI Lab Director"}, {"name": "Andrej Karpathy", "title": "Former Tesla AI Head"}, {"name": "Demis Hassabis", "title": "DeepMind CEO"}, {"name": "Ilya Sutskever", "title": "SSI Co-Founder"}, {"name": "Yann LeCun", "title": "Meta Chief AI Scientist"}, {"name": "Dario Amodei", "title": "Anthropic CEO"}]}, {"action": "update", "target": "speakers", "field": "data.title", "value": "AI VISIONARIES"}], "summary": "Updated speakers to 6 AI experts"}

═══ RULES ═══
- You can combine MULTIPLE operations in one response.
- When writing text, make it energetic, professional, and event-appropriate.
- If the user says "hero", "main section", "top section", "banner" → target "event-hero"
- If the user says "about" → target "about-event"  
- If the user says "signup", "register", "CTA" → target "register"
- For colors, ALWAYS return hex codes (#RRGGBB).
- When adding sections, ALWAYS include a "data" object with title, subtitle, pretitle, and relevant content.
- Use "about-event" type for generic new sections (sponsors, FAQ, testimonials, etc.)`;

/**
 * Modifier Agent: Interprets ANY user instruction as operations on the plan.
 * Uses llama-3.3-70b-versatile for high-quality understanding.
 */
export async function modifyProject(currentFiles, instruction, plan = {}, editHistory = []) {
  const recentEdits = editHistory.slice(-8);
  const historyBlock = recentEdits.length > 0
    ? `\nPrevious edits already applied (preserve these):\n${recentEdits.map((h, i) => `  ${i + 1}. "${h.prompt}"`).join("\n")}\n`
    : "";

  const sectionSummary = (plan.sections || []).map(s => {
    const d = s.data || {};
    return `- ${s.id} (${s.type}): "${d.title || s.title || '?'}"`;
  }).join("\n");

  const userPrompt = `WEBSITE: "${plan.projectName || 'My Website'}"
Color: ${plan.colorScheme?.primary || '#FF6A00'}

CURRENT SECTIONS:
${sectionSummary}
${historyBlock}
USER INSTRUCTION: "${instruction}"

Return JSON operations.`;

  let result;
  try {
    result = await callGroqJSON(MODIFIER_SYSTEM_PROMPT, userPrompt, {
      model: "llama-3.3-70b-versatile",
      temperature: 0.15,
      maxTokens: 4000,
    });
    console.log(`[Modifier] ✅ Got ${result.operations?.length || 0} operations from 70B model`);
  } catch (err) {
    console.error(`[Modifier] 70B failed, falling back to 8B:`, err.message);
    // Fallback to 8B if 70B fails (rate limit, etc.)
    try {
      result = await callGroqJSON(MODIFIER_SYSTEM_PROMPT, userPrompt, {
        model: "llama-3.1-8b-instant",
        temperature: 0.15,
        maxTokens: 3000,
      });
      console.log(`[Modifier] ✅ Got ${result.operations?.length || 0} operations from 8B fallback`);
    } catch (fallbackErr) {
      console.error(`[Modifier] Both models failed:`, fallbackErr.message);
      return { updatedPlan: null, summary: "Edit failed — please try again." };
    }
  }

  if (!result?.operations || result.operations.length === 0) {
    return { updatedPlan: null, summary: "No changes identified from your instruction." };
  }

  // Deep clone the plan — never mutate the original
  const updatedPlan = JSON.parse(JSON.stringify(plan));

  for (const op of result.operations) {
    try {
      switch (op.action) {

        case "update": {
          if (op.target === "plan") {
            setNestedValue(updatedPlan, op.field, op.value);
            console.log(`[Modifier]   → plan.${op.field} updated`);
          } else {
            const sec = findSection(updatedPlan.sections, op.target);
            if (sec) {
              if (!sec.data) sec.data = {};
              const field = op.field.startsWith("data.") ? op.field : `data.${op.field}`;
              setNestedValue(sec, field, op.value);
              console.log(`[Modifier]   → ${sec.id}.${field} updated`);
            } else {
              console.warn(`[Modifier]   ⚠ Section "${op.target}" not found`);
            }
          }
          break;
        }

        case "add_section": {
          const newSection = {
            id: op.id || `${op.type}-${Date.now()}`,
            type: op.type || "about-event",
            title: op.title || "New Section",
            description: op.description || "",
            data: op.data || null,
          };

          const sections = updatedPlan.sections || [];
          let insertIdx = sections.length;

          if (op.position === "start") {
            insertIdx = 0;
          } else if (op.position?.startsWith("before_")) {
            const target = op.position.replace("before_", "");
            const idx = sections.findIndex(s => s.id === target || s.type === target || s.id.includes(target));
            if (idx >= 0) insertIdx = idx;
          } else if (op.position?.startsWith("after_")) {
            const target = op.position.replace("after_", "");
            const idx = sections.findIndex(s => s.id === target || s.type === target || s.id.includes(target));
            if (idx >= 0) insertIdx = idx + 1;
          }

          sections.splice(insertIdx, 0, newSection);
          updatedPlan.sections = sections;
          console.log(`[Modifier]   → Added "${newSection.id}" (${newSection.type}) at position ${insertIdx}`);
          break;
        }

        case "remove_section": {
          if (updatedPlan.sections) {
            const before = updatedPlan.sections.length;
            updatedPlan.sections = updatedPlan.sections.filter(
              s => s.id !== op.target && s.type !== op.target
            );
            console.log(`[Modifier]   → Removed "${op.target}" (${before} → ${updatedPlan.sections.length})`);
          }
          break;
        }

        case "replace_data": {
          const sec = findSection(updatedPlan.sections, op.target);
          if (sec) {
            sec.data = { ...(sec.data || {}), ...op.data };
            console.log(`[Modifier]   → Replaced data for "${sec.id}"`);
          }
          break;
        }

        default:
          console.warn(`[Modifier]   ⚠ Unknown action: ${op.action}`);
      }
    } catch (applyErr) {
      console.warn(`[Modifier]   ⚠ Failed to apply op:`, applyErr.message);
    }
  }

  return {
    updatedPlan,
    modifiedFiles: {},
    summary: result.summary || "Website updated successfully",
  };
}

function findSection(sections, target) {
  if (!sections) return null;
  return sections.find(s =>
    s.id === target ||
    s.type === target ||
    s.id.includes(target) ||
    target.includes(s.id)
  );
}

function setNestedValue(obj, path, value) {
  const keys = path.split(".");
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]] || typeof current[keys[i]] !== "object") {
      current[keys[i]] = {};
    }
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = value;
}
