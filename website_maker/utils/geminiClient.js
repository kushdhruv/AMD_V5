
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client with key from process.env
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

/**
 * Call Gemini for structured JSON output.
 * Uses gemini-2.0-flash (free tier, fast, good quality).
 */
export async function callGeminiJSON(systemPrompt, userPrompt, options = {}) {
  const {
    model = "gemini-2.0-flash",
    temperature = 0.2,
    maxTokens = 8192,
  } = options;

  try {
    const modelInstance = genAI.getGenerativeModel({ 
      model,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        responseMimeType: "application/json",
      }
    });

    const result = await modelInstance.generateContent(userPrompt);
    const responseText = result.response.text();
    
    return JSON.parse(responseText);
  } catch (err) {
    console.error("Gemini JSON call failed:", err.message);
    throw new Error(`Gemini generation failed: ${err.message}`);
  }
}

/**
 * Call Gemini for standard text output.
 */
export async function callGeminiText(systemPrompt, userPrompt, options = {}) {
  const {
    model = "gemini-2.0-flash",
    temperature = 0.3,
    maxTokens = 8192,
  } = options;

  try {
    const modelInstance = genAI.getGenerativeModel({ 
      model,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      }
    });

    const result = await modelInstance.generateContent(userPrompt);
    return result.response.text();
  } catch (err) {
    console.error("Gemini text call failed:", err.message);
    throw new Error(`Gemini text generation failed: ${err.message}`);
  }
}

/**
 * Call Gemini for image analysis (Vision).
 * Uses gemini-2.0-flash which supports multimodal input.
 */
export async function callGeminiVision(prompt, base64Image, mimeType = "image/png") {
  try {
    const modelInstance = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await modelInstance.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType,
        },
      },
    ]);

    return result.response.text();
  } catch (err) {
    console.error("Gemini Vision call failed:", err.message);
    // Return empty string instead of throwing — vision is optional context
    return "";
  }
}

export default genAI;
