import { getProject } from "../../../../../../website_maker/index.js";

export async function POST(request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return Response.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const project = getProject(sessionId);
    if (!project) {
      return Response.json(
        { error: "Session not found or expired" },
        { status: 404 }
      );
    }

    const vercelToken = process.env.VERCEL_TOKEN;

    if (!vercelToken) {
      return Response.json({
        status: "error",
        message: "⚠️ No VERCEL_TOKEN configured. Add it to .env.local.",
        provider: "none",
      }, { status: 400 });
    }

    // ── 1. Prepare files for Vercel ──────────────────────────────────────
    const vercelFiles = [];
    let indexHtml = project.files["frontend/index.html"];

    if (indexHtml) {
      let imgCounter = 1;
      // Extract embedded Base64 images into physical assets
      indexHtml = indexHtml.replace(
        /src="(data:image\/([^;]+);base64,([^"]+))"/g,
        (match, fullData, ext, base64Str) => {
          const assetName = `assets/custom_image_${imgCounter++}.${ext}`;
          vercelFiles.push({
            file: assetName,
            data: base64Str,
            encoding: "base64",
          });
          return `src="./${assetName}"`;
        }
      );
    }

    // Add all frontend files (index.html with base64 extracted, plus CSS/JS)
    for (const [filePath, content] of Object.entries(project.files)) {
      if (filePath.startsWith("frontend/")) {
        const deployPath = filePath.replace("frontend/", "");
        // Use the processed indexHtml if this is index.html
        const fileContent = deployPath === "index.html" ? indexHtml : content;
        vercelFiles.push({
          file: deployPath,
          data: fileContent,
          encoding: "utf-8",
        });
      }
    }

    const projectName = (project.plan?.projectName || "ai-website")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 50);

    // ── 2. Deploy to Vercel (production target for clean URL) ─────────
    const payload = {
      name: projectName,
      files: vercelFiles,
      target: "production",
      projectSettings: {
        framework: null,
      },
    };

    const deployRes = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const deployData = await deployRes.json();

    if (!deployRes.ok) {
      console.error("[Deploy] Vercel API error:", deployData);
      throw new Error(
        deployData.error?.message || deployData.error?.code || "Vercel deployment failed"
      );
    }

    // ── 3. Fetch the ACTUAL project domain from Vercel ─────────────────
    // Deployment aliases are team-scoped (e.g. "x-mitukhemanis-projects.vercel.app")
    // The clean domain shown on the dashboard (e.g. "robo-dog-mu.vercel.app") 
    // is a PROJECT DOMAIN, fetched from a different endpoint.
    let liveUrl = `https://${projectName}.vercel.app`; // fallback

    try {
      const domainsRes = await fetch(
        `https://api.vercel.com/v9/projects/${projectName}/domains`,
        {
          headers: { Authorization: `Bearer ${vercelToken}` },
        }
      );

      if (domainsRes.ok) {
        const domainsData = await domainsRes.json();
        const domains = domainsData.domains || [];
        // Find the auto-generated .vercel.app domain (not custom domains)
        const vercelDomain = domains.find(d => d.name?.endsWith('.vercel.app'));
        if (vercelDomain) {
          liveUrl = `https://${vercelDomain.name}`;
        }
      }
    } catch (e) {
      console.warn("[Deploy] Could not fetch project domains, using fallback");
    }

    console.log(`[Deploy] ✅ Domain: ${liveUrl} (id: ${deployData.id})`);

    return Response.json({
      status: "deployed",
      deploymentId: deployData.id,
      liveUrl,
      message: "Website published successfully!",
      provider: "vercel",
    });
  } catch (error) {
    console.error("Deploy error:", error);
    return Response.json(
      { error: "Deployment failed: " + error.message },
      { status: 500 }
    );
  }
}
