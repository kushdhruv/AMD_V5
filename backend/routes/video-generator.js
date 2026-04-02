import { Router } from "express";
import Bytez from "bytez.js";

const router = Router();

const BYTEZ_API_KEY = process.env.BYTEZ_API_KEY;

// In-memory job store for async video generation
const videoJobs = new Map();

// POST /api/generators/video — Start a video generation job
router.post("/", async (req, res) => {
  try {
    const { prompt, duration } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ error: "Prompt is required" });
    const dur = parseInt(duration) || 5;

    if (!BYTEZ_API_KEY) {
      return res.status(500).json({ error: "BYTEZ_API_KEY is not configured on the server." });
    }

    const finalPrompt = prompt.trim();
    const jobId = `vid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Create job entry
    videoJobs.set(jobId, {
      id: jobId,
      prompt: finalPrompt,
      duration: dur,
      status: "processing",
      video_url: null,
      error: null,
      created_at: new Date().toISOString(),
    });

    // Return immediately with the job ID
    res.json({
      id: jobId,
      prompt: finalPrompt,
      duration: dur,
      status: "processing",
      video_url: null,
      created_at: videoJobs.get(jobId).created_at,
    });

    // Run generation in background
    (async () => {
      const job = videoJobs.get(jobId);
      try {
        console.log(`[VideoGen] Starting Bytez generation for job ${jobId}...`);
        console.log(`[VideoGen] Prompt: "${finalPrompt}"`);
        console.log(`[VideoGen] Model: wan/v2.6/text-to-video`);
        
        const sdk = new Bytez(BYTEZ_API_KEY);
        const model = sdk.model("fal-ai/wan-25-preview/text-to-video");
        
        console.log(`[VideoGen] Calling Bytez API... (this may take 1-3 minutes)`);
        const startTime = Date.now();
        const result = await model.run(finalPrompt);
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        console.log(`[VideoGen] Bytez API returned after ${elapsed}s`);
        console.log(`[VideoGen] Result keys: ${Object.keys(result || {}).join(", ")}`);
        console.log(`[VideoGen] Error: ${result?.error || "none"}`);
        console.log(`[VideoGen] Output type: ${typeof result?.output}`);
        
        if (result?.output && Buffer.isBuffer(result.output)) {
          console.log(`[VideoGen] Output is Buffer, size: ${result.output.length} bytes`);
        } else if (result?.output && typeof result.output === "string") {
          console.log(`[VideoGen] Output is string, length: ${result.output.length}, starts with: ${result.output.slice(0, 50)}`);
        } else if (result?.output && typeof result.output === "object") {
          console.log(`[VideoGen] Output is object, keys: ${Object.keys(result.output).join(", ")}`);
        }

        if (result?.error) {
          console.error(`[VideoGen] Bytez error for job ${jobId}:`, result.error);
          job.status = "failed";
          job.error = typeof result.error === "string" ? result.error : JSON.stringify(result.error);
          return;
        }

        const output = result?.output;
        if (!output) {
          job.status = "failed";
          job.error = "No output received from Bytez API";
          console.error(`[VideoGen] No output for job ${jobId}`);
          return;
        }

        // Handle different output formats
        if (Buffer.isBuffer(output)) {
          const base64 = output.toString("base64");
          job.video_url = `data:video/mp4;base64,${base64}`;
          console.log(`[VideoGen] Stored video as base64 data URL (${base64.length} chars)`);
        } else if (typeof output === "string" && output.startsWith("http")) {
          job.video_url = output;
          console.log(`[VideoGen] Stored video as URL: ${output}`);
        } else if (typeof output === "string" && output.length > 100) {
          // Likely base64 encoded
          job.video_url = `data:video/mp4;base64,${output}`;
          console.log(`[VideoGen] Stored video as base64 string`);
        } else if (output?.url) {
          job.video_url = output.url;
          console.log(`[VideoGen] Stored video from output.url: ${output.url}`);
        } else if (output?.data) {
          const base64 = Buffer.isBuffer(output.data) ? output.data.toString("base64") : output.data;
          job.video_url = `data:video/mp4;base64,${base64}`;
          console.log(`[VideoGen] Stored video from output.data`);
        } else if (ArrayBuffer.isView(output) || output instanceof ArrayBuffer) {
          const base64 = Buffer.from(output).toString("base64");
          job.video_url = `data:video/mp4;base64,${base64}`;
          console.log(`[VideoGen] Stored video from ArrayBuffer`);
        } else {
          // Last resort: try to convert whatever it is
          try {
            const base64 = Buffer.from(output).toString("base64");
            job.video_url = `data:video/mp4;base64,${base64}`;
            console.log(`[VideoGen] Stored video via Buffer.from() conversion`);
          } catch (e) {
            job.status = "failed";
            job.error = `Unexpected output format: ${typeof output}`;
            console.error(`[VideoGen] Cannot handle output type: ${typeof output}`);
            return;
          }
        }

        job.status = "completed";
        console.log(`[VideoGen] ✅ Job ${jobId} completed successfully in ${elapsed}s`);
      } catch (err) {
        console.error(`[VideoGen] Job ${jobId} failed:`, err.message);
        console.error(`[VideoGen] Full error:`, err);
        job.status = "failed";
        job.error = err.message;
      }
    })();

  } catch (err) {
    console.error("[VideoGen] Failed to create job:", err.message);
    res.status(500).json({ error: `Failed to create task: ${err.message}` });
  }
});

// GET /api/generators/video — Poll job status or list all jobs
router.get("/", async (req, res) => {
  const { taskId } = req.query;

  try {
    // List all jobs
    if (!taskId) {
      const tasks = Array.from(videoJobs.values())
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 20);
      return res.json({ tasks });
    }

    // Get specific job
    const job = videoJobs.get(taskId);
    if (!job) return res.status(404).json({ error: "Task not found" });

    res.json({
      id: job.id,
      prompt: job.prompt,
      duration: job.duration,
      status: job.status,
      video_url: job.video_url,
      error: job.error,
      created_at: job.created_at,
    });

    // Cleanup completed jobs after 30 min
    if (job.status === "completed" || job.status === "failed") {
      setTimeout(() => videoJobs.delete(taskId), 30 * 60 * 1000);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
