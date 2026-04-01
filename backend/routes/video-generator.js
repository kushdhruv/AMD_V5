import { Router } from "express";

const router = Router();

const BACKEND_URL = process.env.VIDEO_BACKEND_URL || "http://localhost:8000";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Auto-enhance removed, done in frontend now

let serviceToken = null;

async function getServiceToken() {
  if (serviceToken) return serviceToken;
  try {
    const regResp = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "nextjs_service", password: "service_password_123" }),
      signal: AbortSignal.timeout(5000),
    });
    if (regResp.ok) { const data = await regResp.json(); serviceToken = data.access_token; return serviceToken; }
    const loginResp = await fetch(`${BACKEND_URL}/auth/token`, {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: "username=nextjs_service&password=service_password_123",
      signal: AbortSignal.timeout(5000),
    });
    if (loginResp.ok) { const data = await loginResp.json(); serviceToken = data.access_token; return serviceToken; }
  } catch (e) { console.error("[VideoGen] Auth failed:", e.message); }
  return null;
}

// POST /api/generators/video
router.post("/", async (req, res) => {
  try {
    const { prompt, duration } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ error: "Prompt is required" });
    const dur = parseInt(duration) || 5;
    if (![5, 10, 15, 30].includes(dur)) return res.status(400).json({ error: "Duration must be 5, 10, 15, or 30" });

    // Use prompt exactly as provided from frontend (which may have been manually enhanced by user)
    const finalPrompt = prompt.trim();

    // Try to connect to the Python video backend
    let token;
    try {
      token = await getServiceToken();
    } catch (e) {
      // Python backend not running — return clear error
    }

    if (!token) {
      return res.status(503).json({ 
        error: "Video generation backend is not running. Please start the Python FastAPI server: cd video-backend && uvicorn app.main:app --port 8000" 
      });
    }

    const taskResp = await fetch(`${BACKEND_URL}/tasks/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: finalPrompt, duration: dur }),
      signal: AbortSignal.timeout(10000),
    });
    if (!taskResp.ok) {
      const errData = await taskResp.json().catch(() => ({}));
      if (taskResp.status === 401) serviceToken = null;
      return res.status(taskResp.status).json({ error: errData.detail || `Backend error: ${taskResp.status}` });
    }
    const taskData = await taskResp.json();
    res.json({ id: taskData.id, prompt: finalPrompt, duration: dur, status: taskData.status, video_url: null, created_at: taskData.created_at });
  } catch (err) {
    if (err.name === "TimeoutError" || err.message?.includes("fetch") || err.message?.includes("ECONNREFUSED")) {
      return res.status(503).json({ error: "Video generation backend is offline. Start it with: cd video-backend && uvicorn app.main:app --port 8000" });
    }
    res.status(500).json({ error: `Failed to create task: ${err.message}` });
  }
});

// GET /api/generators/video
router.get("/", async (req, res) => {
  const { taskId, assetUrl } = req.query;
  try {
    const token = await getServiceToken();
    if (!token) return res.status(503).json({ error: "Cannot connect to Video backend" });

    if (assetUrl) {
      const mediaResponse = await fetch(`${BACKEND_URL}${assetUrl}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!mediaResponse.ok) return res.status(404).json({ error: "Media not found" });
      res.set({ "Content-Type": mediaResponse.headers.get("Content-Type") || "video/mp4", "Cache-Control": "public, max-age=31536000" });
      const buffer = Buffer.from(await mediaResponse.arrayBuffer());
      return res.send(buffer);
    }

    if (!taskId) {
      const resp = await fetch(`${BACKEND_URL}/tasks/`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(5000) });
      if (!resp.ok) { if (resp.status === 401) serviceToken = null; return res.json({ tasks: [] }); }
      return res.json({ tasks: await resp.json() });
    }

    const resp = await fetch(`${BACKEND_URL}/tasks/${taskId}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(5000) });
    if (!resp.ok) { if (resp.status === 401) serviceToken = null; return res.status(404).json({ error: "Task not found" }); }
    const task = await resp.json();
    let videoUrl = task.video_url;
    if (videoUrl && videoUrl.startsWith('/')) {
      videoUrl = `/api/generators/video?assetUrl=${encodeURIComponent(videoUrl)}`;
    }
    res.json({ id: task.id, prompt: task.prompt, duration: task.duration, status: task.status, video_url: videoUrl, created_at: task.created_at });
  } catch (err) {
    if (err.name === "TimeoutError" || err.message?.includes("fetch")) {
      if (!taskId) return res.json({ tasks: [] });
      return res.status(503).json({ error: "Video backend offline" });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
