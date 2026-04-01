
import { updateWebsite } from "../../../../../../website_maker/index.js";

export async function POST(request) {
  try {
    const { sessionId, prompt, userImages } = await request.json();

    if (!sessionId) {
      return Response.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    if (!prompt || prompt.trim().length < 3) {
      return Response.json(
        { error: "Edit prompt must be at least 3 characters" },
        { status: 400 }
      );
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

    return Response.json({
      updatedFiles: result.updatedFiles,
      preview: result.preview,
      summary: result.summary,
      changedFileCount: Object.keys(result.updatedFiles).length,
      progressLog,
    });
  } catch (error) {
    console.error("Website update error:", error);
    return Response.json(
      { error: "Update failed: " + error.message },
      { status: 500 }
    );
  }
}
