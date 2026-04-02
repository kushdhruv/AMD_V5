import { Router } from "express";
import { buildWebsite, updateWebsite, downloadProject, getProject } from "../services/website-maker/index.js";
import { supabaseAdmin } from "../services/supabase.js";

const router = Router();

// POST /api/website-maker/build
router.post("/build", async (req, res) => {
  try {
    const { prompt, links, image, userImages, template, userId } = req.body;

    if (!prompt || prompt.trim().length < 5) {
      return res.status(400).json({ error: "Prompt must be at least 5 characters" });
    }

    const progressLog = [];
    const onProgress = (stage, message) => {
      progressLog.push({ stage, message, timestamp: Date.now() });
    };

    const result = await buildWebsite({
      prompt: prompt.trim(),
      links: links || [],
      image: image || null,
      userImages: userImages || [],
      template: template || "modern",
      onProgress,
    });

    const planData = {
      projectName: result.plan.projectName,
      type: result.plan.type,
      description: result.plan.description,
      sectionCount: result.plan.sections?.length || 0,
      colorScheme: result.plan.colorScheme,
    };

    let savedProject = null;
    if (userId) {
      // Save permanently to Supabase Database here on the backend to avoid Vercel timeouts silently dropping it
      const { data: dbData, error: dbError } = await supabaseAdmin.from('projects').insert([{
         user_id: userId,
         name: planData.projectName || "My Website",
         status: "ready",
         template_type: planData.type || "website",
         prompt: prompt,
         blueprint_json: { ...result.plan, _preview: result.preview },
         theme_json: result.project?.theme || {},
         created_at: new Date().toISOString()
      }]).select().single();
      
      if (dbError) {
         console.error("Failed to commit website to database history:", dbError);
      } else {
         savedProject = dbData;
      }
    }

    res.json({
      sessionId: result.sessionId,
      project: result.project,
      preview: result.preview,
      plan: planData,
      dbProject: savedProject,
      progressLog,
    });
  } catch (error) {
    console.error("Website build error:", error);
    res.status(500).json({ error: "Build failed: " + error.message });
  }
});

// POST /api/website-maker/update
router.post("/update", async (req, res) => {
  try {
    const { sessionId, prompt, userImages } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }
    if (!prompt || prompt.trim().length < 3) {
      return res.status(400).json({ error: "Edit prompt must be at least 3 characters" });
    }

    const progressLog = [];
    const result = await updateWebsite({
      sessionId,
      prompt: prompt.trim(),
      userImages: userImages || [],
      onProgress: (stage, message) => {
        progressLog.push({ stage, message, timestamp: Date.now() });
      },
    });

    res.json({
      updatedFiles: result.updatedFiles,
      preview: result.preview,
      summary: result.summary,
      changedFileCount: Object.keys(result.updatedFiles).length,
      progressLog,
    });
  } catch (error) {
    console.error("Website update error:", error);
    res.status(500).json({ error: "Update failed: " + error.message });
  }
});

// POST /api/website-maker/download
router.post("/download", async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const zipBuffer = await downloadProject(sessionId);

    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="website-project.zip"`,
      "Content-Length": zipBuffer.length.toString(),
    });
    res.send(zipBuffer);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Download failed: " + error.message });
  }
});

// POST /api/website-maker/deploy
router.post("/deploy", async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    const project = getProject(sessionId);
    if (!project) {
      return res.status(404).json({ error: "Session not found or expired" });
    }

    const vercelToken = process.env.VERCEL_TOKEN;
    if (!vercelToken) {
      return res.status(400).json({
        status: "error",
        message: "⚠️ No VERCEL_TOKEN configured.",
        provider: "none",
      });
    }

    // Prepare files for Vercel
    const vercelFiles = [];
    let indexHtml = project.files["frontend/index.html"];

    if (indexHtml) {
      let imgCounter = 1;
      indexHtml = indexHtml.replace(
        /src="(data:image\/([^;]+);base64,([^"]+))"/g,
        (match, fullData, ext, base64Str) => {
          const assetName = `assets/custom_image_${imgCounter++}.${ext}`;
          vercelFiles.push({ file: assetName, data: base64Str, encoding: "base64" });
          return `src="./${assetName}"`;
        }
      );
    }

    for (const [filePath, content] of Object.entries(project.files)) {
      if (filePath.startsWith("frontend/")) {
        const deployPath = filePath.replace("frontend/", "");
        const fileContent = deployPath === "index.html" ? indexHtml : content;
        vercelFiles.push({ file: deployPath, data: fileContent, encoding: "utf-8" });
      }
    }

    const projectName = (project.plan?.projectName || "ai-website")
      .toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").slice(0, 50);

    const payload = {
      name: projectName,
      files: vercelFiles,
      target: "production",
      projectSettings: { framework: null },
    };

    const deployRes = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: { Authorization: `Bearer ${vercelToken}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const deployData = await deployRes.json();
    if (!deployRes.ok) {
      throw new Error(deployData.error?.message || "Vercel deployment failed");
    }

    let liveUrl = `https://${projectName}.vercel.app`;
    try {
      const domainsRes = await fetch(
        `https://api.vercel.com/v9/projects/${projectName}/domains`,
        { headers: { Authorization: `Bearer ${vercelToken}` } }
      );
      if (domainsRes.ok) {
        const domainsData = await domainsRes.json();
        const vercelDomain = (domainsData.domains || []).find((d) => d.name?.endsWith(".vercel.app"));
        if (vercelDomain) liveUrl = `https://${vercelDomain.name}`;
      }
    } catch (e) {
      console.warn("[Deploy] Could not fetch project domains, using fallback");
    }

    res.json({
      status: "deployed",
      deploymentId: deployData.id,
      liveUrl,
      message: "Website published successfully!",
      provider: "vercel",
    });
  } catch (error) {
    console.error("Deploy error:", error);
    res.status(500).json({ error: "Deployment failed: " + error.message });
  }
});

export default router;
