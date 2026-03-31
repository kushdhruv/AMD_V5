
/**
 * Website Maker — Main Orchestrator
 *
 * Coordinates the multi-agent pipeline:
 * 1. URL Context (optional) → fetch external info
 * 2. Planner Agent → decompose prompt into plan
 * 3. Frontend Generator → create HTML/CSS/JS
 * 4. Backend Generator → create Express API
 * 5. Integration Agent → validate & fix compatibility
 * 6. Preview Bundler → create preview HTML
 *
 * Also handles:
 * - Stateful editing via Modifier Agent
 * - Session management
 * - ZIP export
 */

import { planWebsite } from "./agents/planner.js";
import { generateFrontend } from "./agents/frontendGenerator.js";
import { generateBackend } from "./agents/backendGenerator.js";
import { validateIntegration, applyFixes } from "./agents/integrationAgent.js";
import { modifyProject } from "./agents/modifier.js";
import { fetchURLContext } from "./agents/urlContext.js";
import { bundleForPreview } from "./utils/previewBundler.js";
import { buildZip } from "./utils/zipBuilder.js";
import sessionStore from "./sessionStore.js";
import { callGroqVision } from "./utils/groqClient.js";

/**
 * BUILD: Full project generation from prompt.
 *
 * @param {Object} params
 * @param {string} params.prompt - User's website description
 * @param {string[]} params.links - Explicit URLs
 * @param {string} params.image - Optional base64 image data
 * @param {string} params.template - Optional template style
 * @param {Function} params.onProgress - Progress callback
 */
export async function buildWebsite({ prompt, links = [], image, userImages = [], template, onProgress }) {
  const progress = onProgress || (() => {});

  try {
    // Stage 1a: Auto-extract URLs from prompt if not provided
    const allLinks = [...links];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = prompt.match(urlRegex);
    if (matches) {
        matches.forEach(link => {
            if (!allLinks.includes(link)) allLinks.push(link);
        });
    }

    // Stage 1b: Fetch URL context
    let urlContext = "";
    if (allLinks.length > 0) {
      progress("context", "🔍 Extracting knowledge from links...");
      urlContext = await fetchURLContext(allLinks);
    }

    // Stage 1c: Vision analysis for images
    let imageContext = "";
    if (image) {
        progress("context", "👁️ AI is analyzing your image for design inspiration...");
        const visionPrompt = "Describe the visual style, layout, color palette, and 'vibe' of this image. Focus on details that would help a web designer replicate its aesthetic.";
        // Remove base64 prefix if present
        const base64Data = image.includes(",") ? image.split(",")[1] : image;
        imageContext = await callGroqVision(visionPrompt, base64Data);
        progress("context", "✅ Visual context analyzed");
    }

    // Stage 2: Plan the website
    progress("planning", "🧠 Decomposing your vision into a structured plan...");
    const plan = await planWebsite(prompt, urlContext, imageContext);
    
    // Bind Custom User Images dynamically to the plan so the frontend generator can inject them
    if (userImages && userImages.length > 0) {
       plan.userImages = userImages;
       progress("planning", `📸 Embedded ${userImages.length} custom image asset(s)`);
    }

    progress("planning", `✅ Plan created: ${plan.sections?.length || 0} sections, ${plan.backendRoutes?.length || 0} API routes`);

    // Stage 3: Generate frontend
    progress("frontend", "🎨 Generating HTML, CSS, and interactive JS...");
    const frontendFiles = await generateFrontend(plan, urlContext, imageContext);
    progress("frontend", `✅ Frontend: ${Object.keys(frontendFiles).length} files generated`);

    // Stage 4: Generate backend
    progress("backend", "⚙️ Building Express.js API server...");
    const backendFiles = await generateBackend(plan);
    progress("backend", `✅ Backend: ${Object.keys(backendFiles).length} files generated`);

    // Stage 5: Merge all files
    let allFiles = { ...frontendFiles, ...backendFiles };

    // Stage 6: Integration validation
    progress("integration", "🔗 Validating frontend↔backend integration...");
    const { issues, fixes } = validateIntegration(allFiles, plan);
    if (Object.keys(fixes).length > 0) {
      allFiles = applyFixes(allFiles, fixes);
      progress("integration", `✅ Fixed ${Object.keys(fixes).length} integration issues`);
    } else {
      progress("integration", "✅ Integration validated — no issues found");
    }

    // Stage 7: Generate preview HTML
    progress("preview", "🖥️ Building live preview...");
    const previewHTML = bundleForPreview(allFiles);
    progress("preview", "✅ Preview ready!");

    // Stage 8: Create session
    const sessionId = sessionStore.create({
      plan,
      files: allFiles,
      prompt,
      links,
      template,
    });

    progress("complete", "🚀 Website generated successfully!");

    return {
      sessionId,
      project: {
        frontend: { files: filterByPrefix(allFiles, "frontend/") },
        backend: { files: filterByPrefix(allFiles, "backend/") },
      },
      preview: previewHTML,
      plan,
    };
  } catch (error) {
    progress("error", `❌ Error: ${error.message}`);
    throw error;
  }
}

/**
 * UPDATE: Modify existing project with a prompt.
 *
 * @param {Object} params
 * @param {string} params.sessionId - Existing session ID
 * @param {string} params.prompt - Edit instruction
 * @param {Function} params.onProgress - Progress callback
 * @returns {Object} { updatedFiles, preview, summary }
 */
export async function updateWebsite({ sessionId, prompt, userImages = [], onProgress }) {
  const progress = onProgress || (() => {});

  const session = sessionStore.get(sessionId);
  if (!session) {
    throw new Error("Session not found or expired. Please regenerate the website.");
  }

  try {
    // Run semantic modifier agent (Plan JSON updater) WITH edit history for context
    progress("modifying", "✏️ AI is editing the architectural blueprint...");
    const editHistory = session.editHistory || [];
    const { updatedPlan, summary } = await modifyProject(
      session.files,
      prompt,
      session.plan,
      editHistory  // Pass full edit history for multi-turn awareness
    );

    if (!updatedPlan) {
      progress("complete", "ℹ️ Edit failed or no changes needed based on your instruction.");
      return {
        updatedFiles: {},
        preview: bundleForPreview(session.files),
        summary: summary || "No changes identified",
      };
    }

    progress("modifying", `✅ ${summary}`);

    // ──────────────────────────────────────────────────────────────────────
    // FIX 2: Section-specific image injection (not global)
    // Instead of dumping images into plan.userImages (which makes EVERY
    // section use the same picture), detect which section the user is
    // talking about and attach images ONLY to that section's data.
    // ──────────────────────────────────────────────────────────────────────
    if (userImages && userImages.length > 0) {
      const promptLower = prompt.toLowerCase();
      
      // Map of keywords → section types that hold images
      const sectionMatchers = [
        { keywords: ["hero", "banner", "header", "top", "main"], types: ["event-hero", "hero"] },
        { keywords: ["about", "info", "description"], types: ["about-event"] },
        { keywords: ["gallery", "photos", "pictures", "images"], types: ["gallery"] },
      ];
      
      let targetSectionIds = [];
      for (const matcher of sectionMatchers) {
        if (matcher.keywords.some(kw => promptLower.includes(kw))) {
          const found = updatedPlan.sections?.filter(s => matcher.types.includes(s.type));
          if (found) targetSectionIds.push(...found.map(s => s.id));
        }
      }
      
      // If no specific section detected, default to the first image-bearing section
      if (targetSectionIds.length === 0) {
        const imageTypes = ["event-hero", "hero", "about-event", "gallery"];
        const first = updatedPlan.sections?.find(s => imageTypes.includes(s.type));
        if (first) targetSectionIds = [first.id];
      }
      
      // Inject images ONLY into the targeted section(s)
      for (const sec of (updatedPlan.sections || [])) {
        if (targetSectionIds.includes(sec.id)) {
          if (!sec.data) sec.data = {};
          sec.data.sectionImages = userImages;  // Section-specific images
          progress("modifying", `📸 Attached ${userImages.length} image(s) → ${sec.id}`);
        }
      }
      
      // Do NOT set plan.userImages globally anymore
    }

    // Re-generate the perfectly-aligned HTML natively utilizing the newly updated JSON data rules
    progress("applying", `📝 Automatically synthesizing new perfectly-aligned templates...`);
    const newFrontend = await generateFrontend(updatedPlan);

    // Update Session Files & Plan (persist plan to disk!)
    sessionStore.update(sessionId, newFrontend, prompt, updatedPlan);

    // Generate new preview
    progress("preview", "🖥️ Rebuilding dynamic preview without hallucination errors...");
    const updatedSession = sessionStore.get(sessionId);
    const previewHTML = bundleForPreview(updatedSession.files);

    progress("complete", `✅ ${summary}`);

    return {
      updatedFiles: newFrontend,
      preview: previewHTML,
      summary,
    };
  } catch (error) {
    progress("error", `❌ Error: ${error.message}`);
    throw error;
  }
}

/**
 * DOWNLOAD: Generate ZIP for a session.
 */
export async function downloadProject(sessionId) {
  const session = sessionStore.get(sessionId);
  if (!session) {
    throw new Error("Session not found or expired.");
  }

  const projectName = session.plan?.projectName || "my-website";
  return buildZip(session.files, projectName);
}

/**
 * GET PROJECT: Get current project state.
 */
export function getProject(sessionId) {
  const session = sessionStore.get(sessionId);
  if (!session) return null;

  return {
    sessionId,
    plan: session.plan,
    files: session.files,
    editHistory: session.editHistory,
    preview: bundleForPreview(session.files),
  };
}

// Helpers
function filterByPrefix(files, prefix) {
  const result = {};
  for (const [path, content] of Object.entries(files)) {
    if (path.startsWith(prefix)) {
      result[path.replace(prefix, "")] = content;
    }
  }
  return result;
}
