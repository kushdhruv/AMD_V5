
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

// Initialize clients with environment variables
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Delay helper for retries.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Groq fallback — used when Gemini is rate-limited.
 */
async function groqChat(prompt) {
  try {
    const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 2048,
    });
    return completion.choices[0]?.message?.content?.trim();
  } catch (e) {
      console.error("Groq fallback failed:", e);
      return "Research unavailable due to API limits.";
  }
}

/**
 * Calls Gemini with Google Search grounding.
 * Falls back to Groq if rate-limited.
 */
async function geminiWithSearch(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text;
  } catch (err) {
    if (err.status === 429) {
      console.warn("Gemini rate-limited, falling back to Groq (no search)");
      return groqChat(prompt);
    }
    // If search tool fails or other error, fallback to Groq
    console.warn("Gemini search failed, falling back to Groq", err.message);
    return groqChat(prompt);
  }
}

/**
 * Calls Gemini without search.
 * Falls back to Groq if rate-limited.
 */
async function geminiChat(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    return response.text;
  } catch (err) {
    if (err.status === 429) {
      console.warn("Gemini rate-limited, falling back to Groq");
      return groqChat(prompt);
    }
    throw err;
  }
}

/**
 * Stage 2a: Generate 5 research questions about the event.
 */
async function generateQuestions(enhancedPrompt) {
  const prompt = `You are an expert event research analyst. Given the following event description, generate exactly 5 targeted research questions that will help gather REAL, FACTUAL information to build a comprehensive event website.

Each question should focus on a different aspect:
1. Industry/topic trends and current state
2. Similar successful events and their formats
3. Key figures, speakers, or organizations in this space
4. Target audience interests and expectations
5. Practical logistics and best practices

Event Description:
${enhancedPrompt}

Output ONLY the 5 questions, numbered 1-5, one per line. No other text.`;

  const result = await geminiChat(prompt);
  return result
    .split("\n")
    .filter((line) => /^\d/.test(line.trim()))
    .map((line) => line.replace(/^\d+[\.\)]\s*/, "").trim())
    .slice(0, 5);
}

/**
 * Stage 2b: Research a single question using Google Search.
 */
async function researchQuestion(question, index) {
  const prompt = `You are a research specialist. Research the following question thoroughly using current information from the web. Provide a comprehensive, fact-based answer with specific names, numbers, dates, and organizations where possible.

Question: ${question}

Provide a detailed answer (200-300 words) with real, verifiable information. Focus on facts that would be useful for creating an event website. Include specific names, companies, statistics, and trends.`;

  const result = await geminiWithSearch(prompt);
  return {
    question,
    answer: result,
    index,
  };
}

/**
 * Stage 2c: Synthesize all research into event-website context.
 */
async function synthesizeResearch(enhancedPrompt, researchResults) {
  const researchText = researchResults
    .map((r) => `Question ${r.index}: ${r.question}\nAnswer: ${r.answer}`)
    .join("\n\n---\n\n");

  const prompt = `You are an event website content strategist. You have been given research findings about an event. Synthesize this research into a comprehensive event context document that will be used to generate an event website.

Original Event Description:
${enhancedPrompt}

Research Findings:
${researchText}

Create a synthesized document that includes:
1. Event overview with enriched, research-backed details
2. Suggested speakers/presenters with REAL names and credentials (from research)
3. Suggested sponsors/partners that are REAL companies relevant to this event
4. Suggested schedule suggestions based on similar successful events
5. Key topics and activities based on current trends
6. Target audience insights

Keep it factual — only include information supported by the research. Format as a structured document. Max 800 words.`;

  return geminiChat(prompt);
}

/**
 * Full research pipeline: questions → parallel search → synthesis
 */
export async function runResearchPipeline(enhancedPrompt) {
  // Stage 2a: Generate questions
  const questions = await generateQuestions(enhancedPrompt);

  // Stage 2b: Research all questions in parallel (with small stagger to avoid burst rate limits)
  const researchResults = [];
  for (let i = 0; i < questions.length; i++) {
    researchResults.push(researchQuestion(questions[i], i + 1));
    if (i < questions.length - 1) await sleep(500); // 500ms stagger between requests
  }
  const results = await Promise.all(researchResults);

  // Stage 2c: Synthesize
  const synthesis = await synthesizeResearch(enhancedPrompt, results);

  return {
    questions,
    researchResults: results,
    synthesis,
  };
}
