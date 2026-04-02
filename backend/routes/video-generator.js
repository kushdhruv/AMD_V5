import { Router } from "express";
import Bytez from "bytez.js";
import { createClient } from "@supabase/supabase-js";

const router = Router();

const BYTEZ_API_KEY = process.env.BYTEZ_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// In-memory job store for async video generation
const videoJobs = new Map();

// Helper: Upload video buffer to Supabase Storage and get public URL
async function uploadToSupabase(videoBuffer, jobId) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log("[VideoGen] Supabase not configured, skipping upload");
    return null;
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const filePath = `videos/${jobId}.mp4`;

    const { data, error } = await supabase.storage
      .from("generated-media")
      .upload(filePath, videoBuffer, {
        contentType: "video/mp4",
        upsert: true,
      });

    if (error) {
      console.error("[VideoGen] Supabase upload error:", error.message);
      // Try creating bucket if it doesn't exist
      await supabase.storage.createBucket("generated-media", { public: true });
      const retry = await supabase.storage
        .from("generated-media")
        .upload(filePath, videoBuffer, { contentType: "video/mp4", upsert: true });
      if (retry.error) {
        console.error("[VideoGen] Supabase retry upload error:", retry.error.message);
        return null;
      }
    }

    const { data: urlData } = supabase.storage
      .from("generated-media")
      .getPublicUrl(filePath);

    console.log(`[VideoGen] ✅ Uploaded to Supabase: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (err) {
    console.error("[VideoGen] Upload exception:", err.message);
    return null;
  }
}

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
        console.log(`[VideoGen] Duration: ${dur}s`);
        
        const sdk = new Bytez(BYTEZ_API_KEY);
        const model = sdk.model("ali-vilab/text-to-video-ms-1.7b");
        
        console.log(`[VideoGen] Calling Bytez API...`);
        const startTime = Date.now();
        const result = await model.run(finalPrompt);
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        console.log(`[VideoGen] Bytez API returned after ${elapsed}s`);
        console.log(`[VideoGen] Result keys: ${Object.keys(result || {}).join(", ")}`);
        console.log(`[VideoGen] Error: ${result?.error || "none"}`);
        console.log(`[VideoGen] Output type: ${typeof result?.output}`);

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
          return;
        }

        // Convert output to a Buffer for upload
        let videoBuffer = null;

        if (Buffer.isBuffer(output)) {
          videoBuffer = output;
        } else if (typeof output === "string" && output.startsWith("http")) {
          // Download the video from the URL
          const dlRes = await fetch(output);
          videoBuffer = Buffer.from(await dlRes.arrayBuffer());
        } else if (typeof output === "string" && output.length > 100) {
          videoBuffer = Buffer.from(output, "base64");
        } else if (output?.url) {
          const dlRes = await fetch(output.url);
          videoBuffer = Buffer.from(await dlRes.arrayBuffer());
        } else if (output?.data) {
          videoBuffer = Buffer.isBuffer(output.data) ? output.data : Buffer.from(output.data, "base64");
        } else if (ArrayBuffer.isView(output) || output instanceof ArrayBuffer) {
          videoBuffer = Buffer.from(output);
        } else {
          try {
            videoBuffer = Buffer.from(output);
          } catch (e) {
            job.status = "failed";
            job.error = `Unexpected output format: ${typeof output}`;
            return;
          }
        }

        // Upload to Supabase Storage for permanent URL
        const publicUrl = await uploadToSupabase(videoBuffer, jobId);

        if (publicUrl) {
          job.video_url = publicUrl;
          console.log(`[VideoGen] ✅ Using Supabase public URL`);
        } else {
          // Fallback to base64 data URL if upload fails
          const base64 = videoBuffer.toString("base64");
          job.video_url = `data:video/mp4;base64,${base64}`;
          console.log(`[VideoGen] ⚠️ Falling back to base64 data URL`);
        }

        job.status = "completed";
        console.log(`[VideoGen] ✅ Job ${jobId} completed successfully in ${elapsed}s`);
      } catch (err) {
        console.error(`[VideoGen] Job ${jobId} failed:`, err.message);
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
    if (!taskId) {
      const tasks = Array.from(videoJobs.values())
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 20);
      return res.json({ tasks });
    }

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

    if (job.status === "completed" || job.status === "failed") {
      setTimeout(() => videoJobs.delete(taskId), 30 * 60 * 1000);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
