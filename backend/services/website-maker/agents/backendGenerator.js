import { callGroqText } from "../utils/groqClient.js";

const BACKEND_SYSTEM_PROMPT = `You are a backend engineer. Generate a Node.js/Express backend as a JSON object.

Keys are file paths, values are complete file code:
{
  "backend/package.json": "{ ... }",
  "backend/server.js": "const express = require('express'); ..."
}

RULES:
1. backend/package.json: include express, cors, dotenv, body-parser
2. backend/server.js: require express, cors, body-parser. Use app.use(cors()). Port 5000.
3. Implement ALL routes with mock logic (in-memory arrays for data storage).
4. Add GET /api/health route.
5. Try-catch on every route. Return JSON with proper status codes.

Output ONLY the raw JSON object. No markdown. No backticks. No explanation.`;

/**
 * Backend Generator Agent: Creates Node.js/Express server from a plan.
 * Uses Groq strictly per user request.
 */
export async function generateBackend(plan) {
  const routesList = (plan.backendRoutes || [])
    .map(r => `${r.method} ${r.path} — ${r.description}`)
    .join("\n");

  const userPrompt = `Generate backend for "${plan.projectName}" (${plan.type}).

Routes:
${routesList || "POST /api/contact — Handle contact form\nPOST /api/newsletter — Newsletter signups"}

Output the JSON object now.`;

  let rawJson;
  try {
    rawJson = await callGroqText(BACKEND_SYSTEM_PROMPT, userPrompt, {
        model: "llama-3.1-8b-instant",
        temperature: 0.1,
        maxTokens: 3000,
    });
    console.log(`[Backend] ✅ Generated via Groq`);
  } catch (err) {
    console.warn(`[Backend] Groq failed, using fallback:`, err.message);
    return getBackendFallback(plan);
  }

  try {
    let cleaned = rawJson.trim();
    cleaned = cleaned.replace(/^```json\s*\n?/g, "").replace(/\n?```\s*$/g, "");
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      cleaned = cleaned.substring(start, end + 1);
    }
    const parsed = JSON.parse(cleaned);
    
    // Validate structure: must contain flat file paths with string content
    if (!parsed["backend/server.js"] || typeof parsed["backend/server.js"] !== "string") {
       throw new Error("AI returned invalid structure (missing or format mismatch for backend/server.js)");
    }
    
    return parsed;
  } catch (err) {
    console.error("Failed to parse backend JSON, using fallback:", err.message);
    return getBackendFallback(plan);
  }
}

function getBackendFallback(plan) {
  const projectName = (plan.projectName || "my-website").toLowerCase().replace(/\\s+/g, "-");
  const routes = plan.backendRoutes || [
    { method: "POST", path: "/api/contact", description: "Handle contact form", name: "contact" },
    { method: "POST", path: "/api/newsletter", description: "Handle newsletter", name: "newsletter" },
  ];

  const routeHandlers = routes.map(r => {
    if (r.method === "POST") {
      return `app.post('${r.path}', (req, res) => {
  try {
    console.log('${r.path}:', req.body);
    submissions.push({ route: '${r.path}', data: req.body, timestamp: new Date().toISOString() });
    res.json({ success: true, message: '${r.description} — received' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});`;
    }
    return `app.get('${r.path}', (req, res) => {
  res.json({ message: '${r.description}', data: [] });
});`;
  }).join("\n\n");

  return {
    "backend/package.json": JSON.stringify({
      name: `${projectName}-backend`,
      version: "1.0.0",
      scripts: { start: "node server.js" },
      dependencies: { express: "^4.18.2", cors: "^2.8.5", dotenv: "^16.3.1", "body-parser": "^1.20.2" }
    }, null, 2),
    "backend/server.js": `const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const submissions = [];

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), submissions: submissions.length });
});

${routeHandlers}

app.listen(PORT, () => {
  console.log(\`Backend running on http://localhost:\${PORT}\`);
});
`
  };
}
