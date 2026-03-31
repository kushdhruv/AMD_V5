
import { downloadProject } from "../../../../../../website_maker/index.js";

export async function POST(request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return Response.json(
        { error: "sessionId is required" },
        { status: 400 }
      );
    }

    const zipBuffer = await downloadProject(sessionId);

    return new Response(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="website-project.zip"`,
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return Response.json(
      { error: "Download failed: " + error.message },
      { status: 500 }
    );
  }
}
