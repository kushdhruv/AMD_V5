import { Router } from "express";
import Groq from "groq-sdk";
import { Octokit } from "@octokit/rest";
import { supabase, supabaseAdmin } from "../services/supabase.js";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";

const router = Router();

// ── Blueprint Schema ──
const BlueprintSchema = z.object({
  event_name: z.string(), tagline: z.string(), date: z.string().optional(), location: z.string().optional(),
  hero: z.object({ headline: z.string(), subheadline: z.string(), cta_text: z.string(), background_style: z.string().optional() }).passthrough(),
  about: z.object({ title: z.string(), description: z.string(), highlights: z.array(z.string()).optional() }).passthrough(),
  events: z.array(z.object({ title: z.string(), description: z.string(), icon: z.string().optional() }).passthrough()).optional(),
  schedule: z.array(z.object({ time: z.string(), title: z.string(), description: z.string().optional(), speaker: z.string().optional() }).passthrough()).optional(),
  speakers: z.array(z.object({ name: z.string(), role: z.string(), company: z.string().optional(), bio: z.string().optional() }).passthrough()).optional(),
  sponsors: z.array(z.object({ name: z.string(), tier: z.string().optional() }).passthrough()).optional(),
  registration: z.object({ title: z.string().optional(), description: z.string().optional(), fields: z.array(z.object({ label: z.string(), type: z.string(), required: z.boolean().optional() }).passthrough()).optional() }).passthrough().optional(),
  contact: z.object({ email: z.string().optional(), phone: z.string().optional(), address: z.string().optional() }).passthrough().optional(),
  theme_style: z.string().optional(), mood: z.string().optional(),
}).passthrough();

function validateBlueprint(json) {
  try {
    const parsed = typeof json === "string" ? JSON.parse(json) : json;
    const result = BlueprintSchema.safeParse(parsed);
    if (result.success) return { valid: true, data: result.data };
    return { valid: false, errors: result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`) };
  } catch (e) { return { valid: false, errors: [`Invalid JSON: ${e.message}`] }; }
}

// ── AI Helpers ──
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function groqChat(prompt) {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0.5, max_tokens: 2048 });
    return completion.choices[0]?.message?.content?.trim();
  } catch (e) { return "Research unavailable due to API limits."; }
}

async function geminiWithSearch(prompt) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
    const response = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: prompt, config: { tools: [{ googleSearch: {} }] } });
    return response.text;
  } catch (err) { return groqChat(prompt); }
}

async function geminiChat(prompt) {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
    const response = await ai.models.generateContent({ model: "gemini-2.0-flash", contents: prompt });
    return response.text;
  } catch (err) { return groqChat(prompt); }
}

async function runResearchPipeline(enhancedPrompt) {
  const qPrompt = `You are an expert event research analyst. Given the event description, generate exactly 5 targeted research questions.\nEvent: ${enhancedPrompt}\nOutput ONLY the 5 questions, numbered 1-5.`;
  const qResult = await geminiChat(qPrompt);
  const questions = qResult.split("\n").filter((l) => /^\d/.test(l.trim())).map((l) => l.replace(/^\d+[.)]\s*/, "").trim()).slice(0, 5);
  const researchResults = [];
  for (let i = 0; i < questions.length; i++) {
    researchResults.push(
      geminiWithSearch(`Research thoroughly: ${questions[i]}\nProvide detailed answer (200-300 words) with real, verifiable information.`).then((answer) => ({ question: questions[i], answer, index: i + 1 }))
    );
    if (i < questions.length - 1) await sleep(500);
  }
  const results = await Promise.all(researchResults);
  const researchText = results.map((r) => `Question ${r.index}: ${r.question}\nAnswer: ${r.answer}`).join("\n\n---\n\n");
  const synthesis = await geminiChat(`Synthesize this event research into a content document:\n\nEvent: ${enhancedPrompt}\n\nResearch:\n${researchText}\n\nInclude: event overview, speakers, sponsors, schedule, topics, audience insights. Max 800 words.`);
  return { questions, researchResults: results, synthesis };
}

// POST /api/research
router.post("/research", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });
    const research = await runResearchPipeline(prompt);
    res.json({ research });
  } catch (error) {
    console.error("Research pipeline error:", error);
    res.status(500).json({ error: "Research pipeline failed: " + error.message });
  }
});

// POST /api/generate-blueprint
router.post("/generate-blueprint", async (req, res) => {
  try {
    const { prompt, research, template } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });
    const researchContext = typeof research === "object" && research.synthesis ? research.synthesis : typeof research === "string" ? research : "No research available.";
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    let lastErrors = [];
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const retryHint = attempt > 1 ? `\n\nPREVIOUS ATTEMPT FAILED. Errors: ${lastErrors.join(", ")}. Fix these.` : "";
        const completion = await groq.chat.completions.create({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: `You are a JSON blueprint generator for event websites. Output ONLY valid JSON. Generate a blueprint with: event_name, tagline, date, location, hero, about, events, schedule, speakers, sponsors, registration, contact, theme_style, mood.` },
            { role: "user", content: `Event: ${prompt}\nResearch: ${researchContext}\nTemplate: ${template || "tech"}${retryHint}\nGenerate the JSON blueprint:` },
          ],
          temperature: 0.4, max_tokens: 4096,
          response_format: { type: "json_object" },
        });
        const validation = validateBlueprint(completion.choices[0]?.message?.content?.trim());
        if (validation.valid) {
          const themes = {
            "tech-dark": { primary: "#3b82f6", accent: "#8b5cf6", background: "#030712", surface: "#0f172a", text: "#f8fafc", textSecondary: "#94a3b8" },
            "vibrant-fest": { primary: "#f43f5e", accent: "#ec4899", background: "#1a0a1e", surface: "#2d1b36", text: "#fdf2f8", textSecondary: "#d4a5c0" },
            "clean-corporate": { primary: "#0ea5e9", accent: "#06b6d4", background: "#ffffff", surface: "#f8fafc", text: "#0f172a", textSecondary: "#64748b" },
          };
          const mood = ((validation.data.mood || "") + " " + (validation.data.theme_style || "") + " " + (template || "")).toLowerCase();
          let theme;
          if (mood.includes("corporate") || mood.includes("professional")) theme = { preset: "clean-corporate", ...themes["clean-corporate"] };
          else if (mood.includes("vibrant") || mood.includes("festival")) theme = { preset: "vibrant-fest", ...themes["vibrant-fest"] };
          else theme = { preset: "tech-dark", ...themes["tech-dark"] };
          return res.json({ project: { blueprint: validation.data, theme } });
        }
        lastErrors = validation.errors;
      } catch (err) { lastErrors = [err.message]; }
    }
    res.status(500).json({ error: `Blueprint generation failed after 3 attempts. Errors: ${lastErrors.join(", ")}` });
  } catch (error) {
    res.status(500).json({ error: "Blueprint generation failed: " + error.message });
  }
});

// POST /api/app-builder/ai
router.post("/app-builder/ai", async (req, res) => {
  try {
    const { action, text, context } = req.body;
    if (!process.env.GROQ_API_KEY) return res.json({ result: `[MOCK AI] ${action === "enhance" ? "Enhanced:" : "Generated:"} ${text}` });
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    let systemPrompt, userPrompt;
    if (action === "generate") {
      systemPrompt = "You are an expert event announcement writer. Create a short, engaging announcement. Keep under 100 words.";
      userPrompt = `Generate an event announcement for: "${text}". app_name: ${context?.appName || "Event App"}`;
    } else if (action === "enhance") {
      systemPrompt = "You are an expert editor. Rewrite to be more professional and clear. Keep under 100 words.";
      userPrompt = `Rewrite: "${text}"`;
    } else return res.status(400).json({ error: "Invalid action" });
    const completion = await groq.chat.completions.create({ model: "llama-3.1-8b-instant", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], temperature: 0.7, max_tokens: 300 });
    res.json({ result: completion.choices[0]?.message?.content?.trim() });
  } catch (error) {
    res.status(500).json({ error: "Failed to process request" });
  }
});

// POST /api/app-builder/chat-edit
router.post("/app-builder/chat-edit", async (req, res) => {
  try {
    const { message, chatHistory, currentConfig } = req.body;
    if (!message || !currentConfig) return res.status(400).json({ error: "Missing message or current configuration" });
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: `You are an expert AI mobile app builder. Modify an App Configuration JSON based on user instructions. Output: { "config": <FULL_UPDATED_JSON>, "message": "<SHORT_CONFIRMATION>" }. Return ONLY JSON.` },
        ...(chatHistory || []).map((msg) => ({ role: msg.role === "user" ? "user" : "assistant", content: msg.role === "assistant" ? (msg.content || "Updated the app.") : msg.content })),
        { role: "user", content: `Current Config: ${JSON.stringify(currentConfig)}\n\nInstruction: ${message}` },
      ],
      temperature: 0.1, max_tokens: 4096, response_format: { type: "json_object" },
    });
    res.json(JSON.parse(completion.choices[0]?.message?.content?.trim()));
  } catch (error) {
    res.status(500).json({ error: "Failed to update app configuration: " + error.message });
  }
});

// ══════════════════════════════════════════════════════════════════════
// BUILD ROUTE — Generates Flutter files and pushes to build-artifacts
// branch via GitHub API, triggering the GitHub Actions workflow.
// This replicates the old Next.js API route that used local fs + git.
// ══════════════════════════════════════════════════════════════════════

// Import flutter-gen dynamically (it's in the frontend but we need it here too)
// We'll inline a lightweight version that generates the same file structure

const GITHUB_OWNER = process.env.GITHUB_OWNER || "mitulkhemani2005";
const GITHUB_REPO = process.env.GITHUB_REPO || "AMD_DEMO_V1";

async function pushFilesToGitHub(files, octokit, owner, repo, branch) {
  // 1. Get the latest commit SHA on main (or create branch from main)
  let baseSha;
  try {
    const { data: ref } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
    baseSha = ref.object.sha;
  } catch {
    // Branch doesn't exist, create from main
    const { data: mainRef } = await octokit.git.getRef({ owner, repo, ref: "heads/main" });
    baseSha = mainRef.object.sha;
    await octokit.git.createRef({ owner, repo, ref: `refs/heads/${branch}`, sha: baseSha });
  }

  // 2. Get the base tree
  const { data: baseCommit } = await octokit.git.getCommit({ owner, repo, commit_sha: baseSha });

  // 3. Create blobs for all files
  const tree = [];
  for (const [filePath, content] of Object.entries(files)) {
    const { data: blob } = await octokit.git.createBlob({
      owner, repo,
      content: Buffer.from(content).toString("base64"),
      encoding: "base64",
    });
    tree.push({
      path: `generated-app/${filePath}`,
      mode: "100644",
      type: "blob",
      sha: blob.sha,
    });
  }

  // 4. Create new tree
  const { data: newTree } = await octokit.git.createTree({
    owner, repo,
    tree,
    base_tree: baseCommit.tree.sha,
  });

  // 5. Create commit
  const { data: newCommit } = await octokit.git.createCommit({
    owner, repo,
    message: "Auto-generate Flutter App",
    tree: newTree.sha,
    parents: [baseSha],
  });

  // 6. Update branch reference
  await octokit.git.updateRef({
    owner, repo,
    ref: `heads/${branch}`,
    sha: newCommit.sha,
    force: true,
  });

  return newCommit.sha;
}

// POST /api/build — Generate Flutter project and push to build-artifacts branch
const handleBuild = async (req, res) => {
  try {
    console.log("[AppBuilder] Build request body keys:", Object.keys(req.body));
    const config = req.body.config || req.body;
    const supabaseUrl = req.body.supabaseUrl || process.env.SUPABASE_URL;
    const supabaseKey = req.body.supabaseKey || process.env.SUPABASE_ANON_KEY;

    console.log("[AppBuilder] Config keys:", Object.keys(config));
    const appName = config.name || config.appName || `app-${Date.now()}`;
    console.log("[AppBuilder] Building app:", appName);

    if (!process.env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN is not set");
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const owner = GITHUB_OWNER;
    const repo = GITHUB_REPO;

    // 1. Dynamically import flutter-gen from the frontend lib
    //    Since it's an ES module in the frontend, we load it via dynamic import
    let generateFlutterProject;
    try {
      const flutterGen = await import("../../frontend/src/lib/app-builder/flutter-gen/index.js");
      generateFlutterProject = flutterGen.generateFlutterProject;
    } catch (importErr) {
      console.error("[AppBuilder] Could not import flutter-gen:", importErr.message);
      // Fallback: use a minimal inline generator
      throw new Error("Flutter generator module not found. Ensure frontend/src/lib/app-builder/flutter-gen/index.js exists.");
    }

    // 2. Generate Flutter project files
    console.log("[AppBuilder] Generating Flutter project files...");
    const files = generateFlutterProject(config, supabaseUrl, supabaseKey);
    console.log("[AppBuilder] Generated", Object.keys(files).length, "files");

    // 3. Push to build-artifacts branch via GitHub API
    console.log("[AppBuilder] Pushing to build-artifacts branch...");
    const commitSha = await pushFilesToGitHub(files, octokit, owner, repo, "build-artifacts");
    console.log("[AppBuilder] Pushed commit:", commitSha);

    // 4. Wait for GitHub Actions to register the push
    await new Promise((r) => setTimeout(r, 5000));

    // 5. Get the latest workflow run
    let runId = null;
    try {
      const { data: runs } = await octokit.actions.listWorkflowRunsForRepo({
        owner, repo,
        branch: "build-artifacts",
        event: "push",
        per_page: 1,
      });
      if (runs.workflow_runs && runs.workflow_runs.length > 0) {
        runId = runs.workflow_runs[0].id;
        console.log("[AppBuilder] GitHub Actions run ID:", runId);
      }
    } catch (e) {
      console.error("[AppBuilder] Could not fetch run ID:", e.message);
    }

    res.json({
      success: true,
      message: "Build triggered! If tracking fails, check GitHub Actions manually.",
      runId,
      owner,
      repo,
    });
  } catch (error) {
    console.error("[AppBuilder] Build error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

router.post("/build-apk", handleBuild);
router.post("/build", handleBuild);

// GET /api/build/status — Poll GitHub Actions run status
router.get("/build/status", async (req, res) => {
  try {
    const { runId } = req.query;
    if (!runId) return res.status(400).json({ error: "Missing runId" });
    if (!process.env.GITHUB_TOKEN) return res.status(500).json({ error: "GITHUB_TOKEN not set" });

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const owner = GITHUB_OWNER;
    const repo = GITHUB_REPO;

    const { data: run } = await octokit.actions.getWorkflowRun({
      owner, repo,
      run_id: parseInt(runId),
    });

    res.json({
      status: run.status,
      conclusion: run.conclusion,
      html_url: run.html_url,
    });
  } catch (error) {
    console.error("[AppBuilder] Status check error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/build/download — Download APK artifact from GitHub Actions run
router.get("/build/download", async (req, res) => {
  try {
    const { runId } = req.query;
    if (!runId) return res.status(400).json({ error: "Missing runId" });
    if (!process.env.GITHUB_TOKEN) return res.status(500).json({ error: "GITHUB_TOKEN not set" });

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const owner = GITHUB_OWNER;
    const repo = GITHUB_REPO;

    // 1. List artifacts for this run
    const { data: artifactsData } = await octokit.actions.listWorkflowRunArtifacts({
      owner, repo,
      run_id: parseInt(runId),
    });

    // Find APK artifact
    const artifact = artifactsData.artifacts?.find(a => a.name.includes("apk") || a.name.includes("release"))
      || artifactsData.artifacts?.[0];

    if (!artifact) {
      return res.status(404).json({ error: "No artifacts found yet. Build may still be running." });
    }

    // 2. Get download URL (GitHub returns a redirect to blob storage)
    const downloadRes = await fetch(artifact.archive_download_url, {
      headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
      redirect: "manual",
    });

    if (downloadRes.status === 302 || downloadRes.status === 301) {
      const blobUrl = downloadRes.headers.get("location");
      if (blobUrl) return res.redirect(blobUrl);
    }

    // Fallback — direct Octokit download
    const { url } = await octokit.actions.downloadArtifact({
      owner, repo,
      artifact_id: artifact.id,
      archive_format: "zip",
    });
    res.redirect(url);
  } catch (error) {
    console.error("[AppBuilder] Download error:", error.message);
    res.status(500).json({ error: error.message });
  }
});
// POST /api/build-status
router.post("/build-status", async (req, res) => {
  try {
    const { appId, status, apkUrl, buildId } = req.body;
    if (!appId || !status) return res.status(400).json({ success: false, error: "Missing appId or status" });
    const { data: project, error: fetchError } = await supabaseAdmin.from("projects").select("blueprint_json").eq("id", appId).single();
    if (fetchError || !project) return res.status(404).json({ success: false, error: "Project not found" });
    const updatedBlueprint = { ...(project.blueprint_json || {}), apk_url: apkUrl, build_id: buildId, last_build_at: new Date().toISOString() };
    const { error } = await supabaseAdmin.from("projects").update({ status: status.toLowerCase(), blueprint_json: updatedBlueprint }).eq("id", appId);
    if (error) throw error;
    res.json({ success: true, message: "Project status updated" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/builds/latest
router.get("/builds/latest", async (req, res) => {
  try {
    const appFullName = req.query.appId;
    if (!appFullName) return res.status(400).json({ success: false, error: "Missing appId" });
    const EXPO_TOKEN = process.env.EXPO_TOKEN;
    if (!EXPO_TOKEN) return res.status(500).json({ success: false, error: "EXPO_TOKEN not configured" });
    const query = `query GetBuilds($appId: String!) { app { byFullName(fullName: $appId) { builds(platform: ANDROID, limit: 1, offset: 0) { id status artifacts { buildUrl } createdAt updatedAt } } } }`;
    const response = await fetch("https://api.expo.dev/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${EXPO_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { appId: appFullName } }),
    });
    if (!response.ok) return res.status(response.status).json({ success: false, error: "Failed to fetch from Expo API" });
    const data = await response.json();
    if (data.errors) return res.status(400).json({ success: false, error: data.errors[0].message });
    const build = data?.data?.app?.byFullName?.builds?.[0];
    if (!build) return res.status(404).json({ success: false, error: "No builds found" });
    res.json({ success: true, buildId: build.id, status: build.status, apkUrl: build.artifacts?.buildUrl || null, createdAt: build.createdAt, updatedAt: build.updatedAt });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/download-artifact
router.get("/download-artifact", async (req, res) => {
  const { owner: qOwner, repo: qRepo, artifactId } = req.query;
  const owner = qOwner || GITHUB_OWNER;
  const repo = qRepo || GITHUB_REPO;
  if (!artifactId) return res.status(400).json({ error: "Missing artifactId" });
  if (!process.env.GITHUB_TOKEN) return res.status(500).json({ error: "GITHUB_TOKEN missing" });
  try {
    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    const { url } = await octokit.actions.downloadArtifact({ owner, repo, artifact_id: artifactId, archive_format: "zip" });
    res.redirect(url);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/app-builder/projects/:id
router.delete("/app-builder/projects/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Missing project ID" });
    const { error } = await supabaseAdmin.from("app_builder_projects").delete().eq("id", id);
    if (error) throw error;
    res.json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
