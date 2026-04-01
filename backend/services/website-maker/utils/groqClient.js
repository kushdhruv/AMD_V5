
import Groq from "groq-sdk";

// Shared Groq client — reads GROQ_API_KEY from process.env
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Rate limit protection: track last call time
let lastCallTime = 0;
const MIN_DELAY_MS = 1500; // 1.5s between calls to stay safe on free tier

async function rateLimitDelay() {
  const now = Date.now();
  const elapsed = now - lastCallTime;
  if (elapsed < MIN_DELAY_MS) {
    const waitMs = MIN_DELAY_MS - elapsed;
    console.log(`[Groq] Rate limit delay: ${waitMs}ms`);
    await new Promise((r) => setTimeout(r, waitMs));
  }
  lastCallTime = Date.now();
}

/**
 * Call Groq chat completion with structured JSON output.
 * Uses llama-3.1-8b-instant (free tier friendly, high rate limits).
 */
export async function callGroqJSON(systemPrompt, userPrompt, options = {}) {
  const {
    model = "llama-3.1-8b-instant",
    temperature = 0.2,
    maxTokens = 4096,
    retries = 2,
  } = options;

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await rateLimitDelay();

      const completion = await groq.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt + (attempt > 0 ? `\n\n[RETRY ${attempt}: Previous attempt had invalid JSON. Output ONLY valid JSON.]` : "") },
        ],
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      });

      const raw = completion.choices[0]?.message?.content?.trim();
      if (!raw) throw new Error("Empty response from Groq");

      return JSON.parse(raw);
    } catch (err) {
      lastError = err;
      console.warn(`Groq JSON attempt ${attempt + 1} failed:`, err.message);
      // If rate limited, wait longer before retry
      if (err.message?.includes("rate_limit") || err.status === 429) {
        console.log(`[Groq] Rate limited — waiting 10s before retry...`);
        await new Promise((r) => setTimeout(r, 10000));
      }
    }
  }

  throw new Error(`Groq call failed after ${retries + 1} attempts: ${lastError?.message}`);
}

/**
 * Call Groq for free-form text (non-JSON) responses.
 * Uses llama-3.1-8b-instant for best free tier compatibility.
 */
export async function callGroqText(systemPrompt, userPrompt, options = {}) {
  const {
    model = "llama-3.1-8b-instant",
    temperature = 0.3,
    maxTokens = 4096,
    retries = 1,
  } = options;

  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      await rateLimitDelay();

      const completion = await groq.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
      });

      return completion.choices[0]?.message?.content?.trim() || "";
    } catch (err) {
      lastError = err;
      console.warn(`Groq text attempt ${attempt + 1} failed:`, err.message);
      if (err.message?.includes("rate_limit") || err.status === 429) {
        console.log(`[Groq] Rate limited — waiting 10s before retry...`);
        await new Promise((r) => setTimeout(r, 10000));
      }
    }
  }

  throw new Error(`Groq text call failed: ${lastError?.message}`);
}

/**
 * Call Groq with full message history (for modifier/chat agents).
 */
export async function callGroqChat(messages, options = {}) {
  const {
    model = "llama-3.1-8b-instant",
    temperature = 0.15,
    maxTokens = 4096,
    jsonMode = true,
  } = options;

  await rateLimitDelay();

  const config = {
    model,
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  if (jsonMode) {
    config.response_format = { type: "json_object" };
  }

  const completion = await groq.chat.completions.create(config);
  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) throw new Error("Empty response from Groq");

  return jsonMode ? JSON.parse(raw) : raw;
}

/**
 * Call Groq for image analysis (Vision).
 * Uses llama-3.2-11b-vision-preview.
 */
export async function callGroqVision(prompt, base64Image, mimeType = "image/png") {
  try {
    await rateLimitDelay();

    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.2-11b-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: dataUrl } }
          ]
        }
      ],
      temperature: 0.4,
      max_tokens: 1024,
    });

    return completion.choices[0]?.message?.content?.trim() || "";
  } catch (err) {
    console.warn("Groq Vision call failed:", err.message);
    // Return empty string instead of throwing — vision is optional context
    return "";
  }
}

export default groq;
