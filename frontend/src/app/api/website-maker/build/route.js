
import { buildWebsite } from "../../../../../../website_maker/index.js";

export async function POST(request) {
  try {
    const { prompt, links, image, userImages, template } = await request.json();

    if (!prompt || prompt.trim().length < 5) {
      return Response.json(
        { error: "Prompt must be at least 5 characters" },
        { status: 400 }
      );
    }

    // Collect progress messages
    const progressLog = [];
    const onProgress = (stage, message) => {
      progressLog.push({ stage, message, timestamp: Date.now() });
    };

    // Run the full build pipeline
    const result = await buildWebsite({
      prompt: prompt.trim(),
      links: links || [],
      image: image || null,
      userImages: userImages || [], // Support for fully customized images
      template: template || "modern",
      onProgress,
    });

    return Response.json({
      sessionId: result.sessionId,
      project: result.project,
      preview: result.preview,
      plan: {
        projectName: result.plan.projectName,
        type: result.plan.type,
        description: result.plan.description,
        sectionCount: result.plan.sections?.length || 0,
        colorScheme: result.plan.colorScheme,
      },
      progressLog,
    });
  } catch (error) {
    console.error("Website build error:", error);
    return Response.json(
      { error: "Build failed: " + error.message },
      { status: 500 }
    );
  }
}
