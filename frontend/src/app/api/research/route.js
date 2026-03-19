
import { runResearchPipeline } from "@/lib/website-builder/researchPipeline";

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    const research = await runResearchPipeline(prompt);

    return Response.json({ research });
  } catch (error) {
    console.error("Research pipeline error:", error);
    return Response.json(
      { error: "Research pipeline failed: " + error.message },
      { status: 500 }
    );
  }
}
