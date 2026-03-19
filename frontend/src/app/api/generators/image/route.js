/**
 * Image Generator — Self-Contained Next.js API Route
 * 
 * Ported from: Text_to_Image_2/app.py (Flask/PosterForge)
 * Uses Bytez SDK to call Google Imagen 4.0 for poster generation.
 * NO separate Python server needed — runs entirely within Next.js.
 */
import { NextResponse } from "next/server";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const BYTEZ_API_KEY = process.env.BYTEZ_API_KEY;
const MODEL_ID = "google/imagen-4.0-ultra-generate-001";
const BYTEZ_API_URL = `https://api.bytez.com/models/v2/${MODEL_ID}`;
const MAX_RETRIES = 3;

// ---------------------------------------------------------------------------
// In-memory cache (persists across requests in dev mode)
// ---------------------------------------------------------------------------
const imageCache = new Map(); // promptHash -> { imageUrl, prompt, createdAt }

// ---------------------------------------------------------------------------
// Templates & Styles (ported from Flask)
// ---------------------------------------------------------------------------
const TEMPLATES = {
    "Hackathon": [
        "A futuristic hackathon poster with glowing circuit board patterns, floating code snippets, and neon blue & purple colors",
        "Cyberpunk-themed coding competition poster with holographic displays and developer silhouettes",
        "Minimal tech hackathon poster with geometric shapes, dark background, and electric green accents",
    ],
    "Cultural Fest": [
        "Vibrant cultural festival poster with colorful rangoli patterns, dancers, and warm golden lighting",
        "A grand college cultural fest poster with stage lights, musical instruments, and confetti",
        "Traditional meets modern cultural event poster with mandala art and neon overlays",
    ],
    "Workshop": [
        "Clean professional workshop poster with abstract knowledge symbols, books, and lightbulbs",
        "Hands-on technical workshop poster with tools, gears, and blueprint style background",
        "Creative workshop poster with paint splashes, pencils, and artistic brushstrokes",
    ],
    "Tech Talk": [
        "Sleek tech talk poster with microphone, digital waves, and gradient mesh background",
        "Professional speaker event poster with stage lighting and tech-inspired patterns",
        "Modern tech seminar poster with abstract neural network visuals and clean typography space",
    ],
    "Sports Meet": [
        "Dynamic sports event poster with athletes in motion, stadium lights, and energy trails",
        "Bold college sports meet poster with medals, torch flames, and action silhouettes",
        "Retro-style sports championship poster with vintage halftone effects and bold colors",
    ],
    "Freshers Party": [
        "Glamorous freshers party poster with disco lights, confetti, and celebration vibes",
        "Neon-lit welcome party poster with party props, balloons, and starry night sky",
        "Tropical themed freshers bash poster with palm leaves, sunsets, and beach party vibes",
    ],
    "Farewell": [
        "Elegant farewell poster with golden bokeh lights, graduation caps, and emotional warmth",
        "Cinematic farewell event poster with film reel motifs and starry night backdrop",
        "Classy goodbye party poster with champagne glasses, fairy lights, and vintage tones",
    ],
    "Annual Day": [
        "Grand annual day celebration poster with trophy, stage curtains, and golden laurels",
        "Prestigious college annual day poster with spotlight beams and award ceremony vibes",
        "Festive annual day poster with fireworks, ribbon banners, and celebration motifs",
    ],
};

const STYLES = [
    "Minimalist", "Vibrant", "Retro", "Neon Glow",
    "Elegant", "Futuristic", "Watercolor", "3D Render",
];

// ---------------------------------------------------------------------------
// Prompt builder (ported from Flask)
// ---------------------------------------------------------------------------
function buildEnhancedPrompt(userPrompt, category, style) {
    const parts = [userPrompt.trim()];

    const categoryHints = {
        "Hackathon": "tech hackathon theme",
        "Cultural Fest": "cultural celebration theme",
        "Workshop": "educational workshop theme",
        "Tech Talk": "tech speaker event theme",
        "Sports Meet": "sports competition theme",
        "Freshers Party": "college welcome party theme",
        "Farewell": "farewell celebration theme",
        "Annual Day": "annual day celebration theme",
    };
    if (categoryHints[category]) parts.push(categoryHints[category]);

    const styleHints = {
        "Minimalist": "minimal clean design",
        "Vibrant": "bold vibrant colors",
        "Retro": "vintage retro aesthetic",
        "Neon Glow": "neon glow dark background",
        "Elegant": "elegant luxury feel",
        "Futuristic": "futuristic sci-fi style",
        "Watercolor": "watercolor painting style",
        "3D Render": "photorealistic 3D render",
    };
    if (styleHints[style]) parts.push(styleHints[style]);

    parts.push("event poster, high quality");
    return parts.join(", ");
}

// ---------------------------------------------------------------------------
// Bytez API caller with retries (ported from Flask)
// ---------------------------------------------------------------------------
async function callBytezApi(prompt) {
    let lastError = null;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
            console.log(`[ImageGen] Attempt ${attempt}/${MAX_RETRIES}…`);
            const resp = await fetch(BYTEZ_API_URL, {
                method: "POST",
                headers: {
                    "Authorization": BYTEZ_API_KEY,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: prompt }),
                signal: AbortSignal.timeout(120000), // 120s timeout
            });

            console.log(`[ImageGen] Response status=${resp.status}`);

            // Handle non-OK responses
            if (!resp.ok) {
                const rawText = await resp.text();
                console.log(`[ImageGen] ⚠️ HTTP ${resp.status} response: ${rawText.slice(0, 500)}`);
                lastError = `API returned HTTP ${resp.status}: ${rawText.slice(0, 200)}`;
                await new Promise((r) => setTimeout(r, attempt * 3000));
                continue;
            }

            const data = await resp.json();
            console.log(`[ImageGen] Response keys: ${Object.keys(data).join(", ")}`);

            if (data.error) {
                lastError = String(data.error);
                console.log(`[ImageGen] ⚠️ API error on attempt ${attempt}: ${lastError}`);
                await new Promise((r) => setTimeout(r, attempt * 2000));
                continue;
            }

            // Extract image URL from response
            const output = data.output;
            let imageUrl = null;

            if (!output && !data.image && !data.url && !data.data) {
                // Try to find image data anywhere in the response
                console.log(`[ImageGen] Raw response: ${JSON.stringify(data).slice(0, 500)}`);
                // Check if data itself contains base64 or URL
                for (const [key, val] of Object.entries(data)) {
                    if (typeof val === "string" && (val.startsWith("http") || val.startsWith("data:image"))) {
                        imageUrl = val;
                        break;
                    }
                }
                if (!imageUrl) {
                    lastError = `No image output in response: ${JSON.stringify(data).slice(0, 300)}`;
                    console.log(`[ImageGen] ⚠️ ${lastError}`);
                    await new Promise((r) => setTimeout(r, attempt * 2000));
                    continue;
                }
            }

            if (!imageUrl) {
                if (typeof output === "string") {
                    imageUrl = output;
                } else if (output && typeof output === "object" && !Array.isArray(output)) {
                    imageUrl = output.image || output.url || output.data || output.images?.[0];
                    if (!imageUrl) {
                        for (const v of Object.values(output)) {
                            if (typeof v === "string" && (v.includes("http") || v.startsWith("data:image"))) { imageUrl = v; break; }
                        }
                    }
                } else if (Array.isArray(output) && output.length > 0) {
                    const first = output[0];
                    imageUrl = typeof first === "string" ? first : (first?.image || first?.url);
                }
                // Also check top-level data fields
                if (!imageUrl) {
                    imageUrl = data.image || data.url || data.data || data.images?.[0];
                }
            }

            if (imageUrl) return { imageUrl, error: null };

            lastError = `No image URL in response: ${JSON.stringify(data).slice(0, 300)}`;
            console.log(`[ImageGen] ⚠️ ${lastError}`);
        } catch (e) {
            lastError = e.message;
            console.log(`[ImageGen] ⚠️ Exception on attempt ${attempt}: ${lastError}`);
            await new Promise((r) => setTimeout(r, attempt * 2000));
        }
    }

    return { imageUrl: null, error: lastError };
}

// ---------------------------------------------------------------------------
// Prompt hash for caching
// ---------------------------------------------------------------------------
function promptHash(prompt) {
    return crypto.createHash("sha256").update(prompt).digest("hex").slice(0, 16);
}

// ---------------------------------------------------------------------------
// POST /api/generators/image — Generate an image
// ---------------------------------------------------------------------------
export async function POST(request) {
    try {
        const body = await request.json();
        const { prompt, category, style } = body;

        if (!prompt?.trim()) {
            return NextResponse.json({ error: "Please enter a prompt describing your poster." }, { status: 400 });
        }

        const enhanced = buildEnhancedPrompt(prompt, category || "", style || "");
        const hash = promptHash(enhanced);

        // Check cache
        if (imageCache.has(hash)) {
            const cached = imageCache.get(hash);
            console.log("[ImageGen] ♻️ Cache hit!");
            return NextResponse.json({
                image_url: cached.imageUrl,
                prompt_used: enhanced,
                cached: true,
            });
        }

        // Call Bytez API
        console.log(`[ImageGen] 🚀 Generating image (prompt: ${enhanced.length} chars)…`);
        const { imageUrl, error } = await callBytezApi(enhanced);

        if (error) {
            return NextResponse.json({ error }, { status: 502 });
        }

        // Cache the result
        imageCache.set(hash, { imageUrl, prompt: enhanced, createdAt: Date.now() });

        console.log(`[ImageGen] ✅ Done! URL: ${imageUrl?.slice(0, 80)}…`);
        return NextResponse.json({
            image_url: imageUrl,
            prompt_used: enhanced,
            cached: false,
        });
    } catch (err) {
        console.error("[ImageGen] Error:", err);
        return NextResponse.json({ error: `Generation failed: ${err.message}` }, { status: 500 });
    }
}

// ---------------------------------------------------------------------------
// GET /api/generators/image — Templates, styles, or gallery
// ---------------------------------------------------------------------------
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "gallery";

    if (action === "templates") {
        return NextResponse.json({ templates: TEMPLATES, styles: STYLES });
    }

    // Gallery — return all cached images
    const images = [];
    for (const [, entry] of imageCache) {
        images.push({
            url: entry.imageUrl,
            prompt: entry.prompt,
            created: entry.createdAt,
        });
    }
    images.sort((a, b) => b.created - a.created);
    return NextResponse.json({ images });
}
