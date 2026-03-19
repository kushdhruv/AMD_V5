/**
 * Video Generator — Proxy to FastAPI Backend + AnimateDiff Worker
 *
 * Architecture:
 *   Next.js :3000 → proxy → FastAPI :8000 → Worker (AnimateDiff GPU)
 *
 * The FastAPI backend manages a task queue (SQLite).
 * A separate Python worker polls for pending tasks and generates
 * video clips using AnimateDiff (guoyww/animatediff-motion-adapter-v1-5-2).
 *
 * This route handles:
 *   POST → Create task (with Groq prompt enhancement)
 *   GET  → Poll task status / list tasks
 */
import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const BACKEND_URL = process.env.VIDEO_BACKEND_URL || "http://localhost:8000";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// ---------------------------------------------------------------------------
// Groq API — Prompt Enhancement (same as before, runs in Next.js)
// ---------------------------------------------------------------------------
async function enhancePrompt(prompt) {
    if (!GROQ_API_KEY) {
        return `${prompt}, cinematic lighting, 8k resolution, photorealistic, highly detailed, professional cinematography`;
    }

    try {
        const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                temperature: 0.7,
                max_tokens: 200,
                messages: [
                    {
                        role: "system",
                        content:
                            "You are an expert AI Video Prompt Engineer. " +
                            "Your task is to take a simple user idea and rewrite it into a detailed, high-quality text-to-video prompt. " +
                            "Add details about lighting, camera angle, style (cinematic, photorealistic), and atmosphere. " +
                            "Keep the prompt under 4 sentences. " +
                            "Return ONLY the enhanced prompt, nothing else.",
                    },
                    {
                        role: "user",
                        content: `Enhance this video prompt: ${prompt}`,
                    },
                ],
            }),
            signal: AbortSignal.timeout(30000),
        });

        const data = await resp.json();
        if (data.choices?.[0]?.message?.content) {
            return data.choices[0].message.content.trim();
        }
    } catch (e) {
        console.error("[VideoGen] Groq enhancement failed:", e.message);
    }

    return `${prompt}, cinematic lighting, 8k resolution, photorealistic, highly detailed, professional cinematography`;
}

// ---------------------------------------------------------------------------
// Helper: Register a temporary user on the FastAPI backend
// (The original backend requires auth — we create a service account)
// ---------------------------------------------------------------------------
let serviceToken = null;

async function getServiceToken() {
    if (serviceToken) return serviceToken;

    try {
        // Try to register first (JSON body)
        const regResp = await fetch(`${BACKEND_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: "nextjs_service", password: "service_password_123" }),
            signal: AbortSignal.timeout(5000),
        });

        if (regResp.ok) {
            // Registration succeeded — returns token directly
            const data = await regResp.json();
            serviceToken = data.access_token;
            console.log("[VideoGen] Registered & got service token");
            return serviceToken;
        }

        // If already exists (400), try login
        const loginResp = await fetch(`${BACKEND_URL}/auth/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: "username=nextjs_service&password=service_password_123",
            signal: AbortSignal.timeout(5000),
        });

        if (loginResp.ok) {
            const data = await loginResp.json();
            serviceToken = data.access_token;
            console.log("[VideoGen] Logged in & got service token");
            return serviceToken;
        }

        console.error("[VideoGen] Auth failed:", loginResp.status, await loginResp.text());
    } catch (e) {
        console.error("[VideoGen] Auth failed:", e.message);
    }

    return null;
}

// ---------------------------------------------------------------------------
// POST /api/generators/video — Create a video generation task
// ---------------------------------------------------------------------------
export async function POST(request) {
    try {
        const body = await request.json();
        const { prompt, duration } = body;

        if (!prompt?.trim()) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        const dur = parseInt(duration) || 5;
        if (![5, 10, 15, 30].includes(dur)) {
            return NextResponse.json({ error: "Duration must be 5, 10, 15, or 30" }, { status: 400 });
        }

        // Step 1: Enhance prompt with Groq
        console.log("[VideoGen] Enhancing prompt with Groq...");
        const enhancedPrompt = await enhancePrompt(prompt.trim());
        console.log(`[VideoGen] Enhanced: ${enhancedPrompt.slice(0, 100)}...`);

        // Step 2: Get auth token for FastAPI
        const token = await getServiceToken();
        if (!token) {
            return NextResponse.json(
                { error: "Cannot connect to Video backend. Please ensure FastAPI is running on port 8000." },
                { status: 503 }
            );
        }

        // Step 3: Create task on FastAPI backend
        const taskResp = await fetch(`${BACKEND_URL}/tasks/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                prompt: enhancedPrompt,
                duration: dur,
            }),
            signal: AbortSignal.timeout(10000),
        });

        if (!taskResp.ok) {
            const errData = await taskResp.json().catch(() => ({}));
            console.error("[VideoGen] FastAPI error:", taskResp.status, errData);
            // Reset token if auth error
            if (taskResp.status === 401) serviceToken = null;
            return NextResponse.json(
                { error: errData.detail || `Backend error: ${taskResp.status}` },
                { status: taskResp.status }
            );
        }

        const taskData = await taskResp.json();
        console.log(`[VideoGen] Task created: id=${taskData.id}, status=${taskData.status}`);

        return NextResponse.json({
            id: taskData.id,
            prompt: enhancedPrompt,
            duration: dur,
            status: taskData.status,
            video_url: null,
            created_at: taskData.created_at,
        });
    } catch (err) {
        console.error("[VideoGen] POST error:", err);

        if (err.name === "TimeoutError" || err.message?.includes("fetch")) {
            return NextResponse.json(
                { error: "Cannot connect to Video backend. Please run: uvicorn app.main:app --port 8000" },
                { status: 503 }
            );
        }

        return NextResponse.json({ error: `Failed to create task: ${err.message}` }, { status: 500 });
    }
}

// ---------------------------------------------------------------------------
// GET /api/generators/video?taskId=X — Poll task status
// ---------------------------------------------------------------------------
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");
    const assetUrl = searchParams.get("assetUrl");

    try {
        const token = await getServiceToken();
        if (!token) {
            return NextResponse.json(
                { error: "Cannot connect to Video backend" },
                { status: 503 }
            );
        }

        // --- Proxy Media Requests ---
        if (assetUrl) {
            // assetUrl is something like "/items/8_final_8.mp4"
            const mediaResponse = await fetch(`${BACKEND_URL}${assetUrl}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            
            if (!mediaResponse.ok) {
                 return NextResponse.json({ error: "Media not found" }, { status: 404 });
            }
            
            return new NextResponse(mediaResponse.body, {
                headers: {
                    "Content-Type": mediaResponse.headers.get("Content-Type") || "video/mp4",
                    "Cache-Control": "public, max-age=31536000",
                }
            });
        }
        // ----------------------------

        if (!taskId) {
            // Return all tasks
            const resp = await fetch(`${BACKEND_URL}/tasks/`, {
                headers: { "Authorization": `Bearer ${token}` },
                signal: AbortSignal.timeout(5000),
            });

            if (!resp.ok) {
                if (resp.status === 401) serviceToken = null;
                return NextResponse.json({ tasks: [] });
            }

            const tasks = await resp.json();
            return NextResponse.json({ tasks });
        }

        // Poll specific task
        const resp = await fetch(`${BACKEND_URL}/tasks/${taskId}`, {
            headers: { "Authorization": `Bearer ${token}` },
            signal: AbortSignal.timeout(5000),
        });

        if (!resp.ok) {
            if (resp.status === 401) serviceToken = null;
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        const task = await resp.json();

        // If completed, build a proxy video URL that goes through Next.js instead of localhost
        let videoUrl = task.video_url;
        if (videoUrl) {
            videoUrl = `/api/generators/video?assetUrl=${encodeURIComponent(videoUrl)}`;
        }

        return NextResponse.json({
            id: task.id,
            prompt: task.prompt,
            duration: task.duration,
            status: task.status,
            video_url: videoUrl,
            created_at: task.created_at,
        });
    } catch (err) {
        console.error("[VideoGen] GET error:", err);

        if (err.name === "TimeoutError" || err.message?.includes("fetch")) {
            // Backend not running — return empty gracefully
            if (!taskId) return NextResponse.json({ tasks: [] });
            return NextResponse.json({ error: "Video backend offline" }, { status: 503 });
        }

        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
