/**
 * AMD V5 — Backend API Server
 *
 * Express.js server that handles all backend logic:
 * - Website Builder (multi-agent pipeline)
 * - App Builder (GitHub Actions + Expo EAS)
 * - Image Generator (Bytez/Imagen)
 * - Video Generator (FastAPI proxy)
 * - Catchy Phrase Generator
 * - Marketplace
 * - What's New (AI News)
 * - Auth, Payments, Webhooks
 *
 * Deploy: Render.com (free tier) or Railway
 * Frontend: Vercel (free tier) proxies /api/* here
 */

import "dotenv/config";
import express from "express";
import { corsMiddleware } from "./middleware/cors.js";

// Route imports
import healthRouter from "./routes/health.js";
import websiteMakerRouter from "./routes/website-maker.js";
import imageGeneratorRouter from "./routes/image-generator.js";
import videoGeneratorRouter from "./routes/video-generator.js";
import phraseGeneratorRouter from "./routes/phrase-generator.js";
import whatsNewRouter from "./routes/whats-new.js";
import generalRouter from "./routes/general.js";
import appBuilderRouter from "./routes/app-builder.js";

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ──
app.use(corsMiddleware);

// Raw body for Stripe webhooks (must be before json parser for webhook routes)
app.use("/api/webhook/stripe", express.raw({ type: "application/json" }), (req, _res, next) => {
  req.rawBody = req.body;
  req.body = JSON.parse(req.body);
  next();
});

// JSON body parser for all other routes
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

// ── API Routes ──
app.use("/api/health", healthRouter);
app.use("/api/website-maker", websiteMakerRouter);
app.use("/api/generators/image", imageGeneratorRouter);
app.use("/api/generators/video", videoGeneratorRouter);
app.use("/api/enhance-prompt", phraseGeneratorRouter);
app.use("/api/generate-phrases", phraseGeneratorRouter);
app.use("/api/ai-news", whatsNewRouter);
app.use("/api", generalRouter);        // /api/register, /api/checkout, /api/webhook/*, /api/chat-edit
app.use("/api", appBuilderRouter);      // /api/research, /api/generate-blueprint, /api/app-builder/*, /api/build-*, /api/builds/*, /api/download-artifact

// ── 404 Handler ──
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ── Global Error Handler ──
app.use((err, _req, res, _next) => {
  console.error("[Server Error]", err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Start ──
app.listen(PORT, () => {
  console.log(`\n🚀 AMD V5 Backend running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Frontend proxy target: http://localhost:${PORT}/api/*\n`);
});

export default app;
