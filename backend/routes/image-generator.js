import { Router } from "express";
import crypto from "crypto";

const router = Router();

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const BYTEZ_API_KEY = process.env.BYTEZ_IMAGE_API_KEY || process.env.BYTEZ_API_KEY;
const MODEL_ID = "google/imagen-4.0-ultra-generate-001";
const BYTEZ_API_URL = `https://api.bytez.com/models/v2/${MODEL_ID}`;
const MAX_RETRIES = 3;

const imageCache = new Map();

const TEMPLATES = {
  Hackathon: [
    "A futuristic hackathon poster with glowing circuit board patterns, floating code snippets, and neon blue & purple colors",
    "Cyberpunk-themed coding competition poster with holographic displays and developer silhouettes",
    "Minimal tech hackathon poster with geometric shapes, dark background, and electric green accents",
  ],
  "Cultural Fest": [
    "Vibrant cultural festival poster with colorful rangoli patterns, dancers, and warm golden lighting",
    "A grand college cultural fest poster with stage lights, musical instruments, and confetti",
    "Traditional meets modern cultural event poster with mandala art and neon overlays",
  ],
  Workshop: [
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
  Farewell: [
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

const STYLES = ["Minimalist", "Vibrant", "Retro", "Neon Glow", "Elegant", "Futuristic", "Watercolor", "3D Render"];

function buildEnhancedPrompt(userPrompt, category, style) {
  const parts = [userPrompt.trim()];
  const categoryHints = {
    Hackathon: "tech hackathon theme", "Cultural Fest": "cultural celebration theme",
    Workshop: "educational workshop theme", "Tech Talk": "tech speaker event theme",
    "Sports Meet": "sports competition theme", "Freshers Party": "college welcome party theme",
    Farewell: "farewell celebration theme", "Annual Day": "annual day celebration theme",
  };
  if (categoryHints[category]) parts.push(categoryHints[category]);

  const styleHints = {
    Minimalist: "minimal clean design", Vibrant: "bold vibrant colors",
    Retro: "vintage retro aesthetic", "Neon Glow": "neon glow dark background",
    Elegant: "elegant luxury feel", Futuristic: "futuristic sci-fi style",
    Watercolor: "watercolor painting style", "3D Render": "photorealistic 3D render",
  };
  if (styleHints[style]) parts.push(styleHints[style]);
  parts.push("event poster, high quality");
  return parts.join(", ");
}

async function callBytezApi(prompt) {
  let lastError = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const resp = await fetch(BYTEZ_API_URL, {
        method: "POST",
        headers: { Authorization: BYTEZ_API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ text: prompt }),
        signal: AbortSignal.timeout(120000),
      });
      if (!resp.ok) {
        const rawText = await resp.text();
        lastError = `API returned HTTP ${resp.status}: ${rawText.slice(0, 200)}`;
        await new Promise((r) => setTimeout(r, attempt * 3000));
        continue;
      }
      const data = await resp.json();
      if (data.error) { lastError = String(data.error); await new Promise((r) => setTimeout(r, attempt * 2000)); continue; }

      const output = data.output;
      let imageUrl = null;
      if (!output && !data.image && !data.url && !data.data) {
        for (const [, val] of Object.entries(data)) {
          if (typeof val === "string" && (val.startsWith("http") || val.startsWith("data:image"))) { imageUrl = val; break; }
        }
        if (!imageUrl) { lastError = `No image output in response`; await new Promise((r) => setTimeout(r, attempt * 2000)); continue; }
      }
      if (!imageUrl) {
        if (typeof output === "string") imageUrl = output;
        else if (output && typeof output === "object" && !Array.isArray(output)) {
          imageUrl = output.image || output.url || output.data || output.images?.[0];
          if (!imageUrl) { for (const v of Object.values(output)) { if (typeof v === "string" && (v.includes("http") || v.startsWith("data:image"))) { imageUrl = v; break; } } }
        } else if (Array.isArray(output) && output.length > 0) {
          const first = output[0];
          imageUrl = typeof first === "string" ? first : first?.image || first?.url;
        }
        if (!imageUrl) imageUrl = data.image || data.url || data.data || data.images?.[0];
      }
      if (imageUrl) return { imageUrl, error: null };
      lastError = `No image URL in response`;
    } catch (e) {
      lastError = e.message;
      await new Promise((r) => setTimeout(r, attempt * 2000));
    }
  }
  return { imageUrl: null, error: lastError };
}

function promptHash(prompt) {
  return crypto.createHash("sha256").update(prompt).digest("hex").slice(0, 16);
}

// POST /api/generators/image
router.post("/", async (req, res) => {
  try {
    const { prompt, category, style } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ error: "Please enter a prompt describing your poster." });

    const enhanced = buildEnhancedPrompt(prompt, category || "", style || "");
    const hash = promptHash(enhanced);

    if (imageCache.has(hash)) {
      return res.json({ image_url: imageCache.get(hash).imageUrl, prompt_used: enhanced, cached: true });
    }

    const { imageUrl, error } = await callBytezApi(enhanced);
    if (error) return res.status(502).json({ error });

    imageCache.set(hash, { imageUrl, prompt: enhanced, createdAt: Date.now() });
    res.json({ image_url: imageUrl, prompt_used: enhanced, cached: false });
  } catch (err) {
    console.error("[ImageGen] Error:", err);
    res.status(500).json({ error: `Generation failed: ${err.message}` });
  }
});

// GET /api/generators/image
router.get("/", (req, res) => {
  const action = req.query.action || "gallery";
  if (action === "templates") return res.json({ templates: TEMPLATES, styles: STYLES });

  const images = [];
  for (const [, entry] of imageCache) {
    images.push({ url: entry.imageUrl, prompt: entry.prompt, created: entry.createdAt });
  }
  images.sort((a, b) => b.created - a.created);
  res.json({ images });
});

export default router;
