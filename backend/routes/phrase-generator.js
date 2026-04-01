import { Router } from "express";
import Groq from "groq-sdk";

const router = Router();

// POST /api/enhance-prompt — Enhance event description for website generation
router.post("/", async (req, res) => {
  try {
    const { prompt, topic, tone, platform, type } = req.body;

    // If topic is provided, this is a phrase generation request
    if (topic) {
      return generatePhrases(req, res, { topic, tone, platform });
    }

    // Otherwise, it's a prompt enhancement request
    if (!prompt || prompt.trim().length < 5) {
      return res.status(400).json({ error: "Prompt must be at least 5 characters" });
    }

    let systemPrompt = "You are a prompt enhancement specialist.";
    let userPromptHint = "Enhance this text:";
    
    if (type === "video") {
      systemPrompt = `You are an expert AI Video Prompt Engineer. Take a simple user idea and rewrite it into a detailed, high-quality text-to-video prompt. Add details about lighting, camera angle, and visual style. Keep under 3 sentences. Return ONLY the enhanced prompt.`;
      userPromptHint = "Enhance this video prompt:";
    } else if (type === "image") {
      systemPrompt = `You are an expert AI Image Prompt Engineer. Take a user concept and rewrite it into a highly descriptive, visually striking text-to-image prompt. Add keywords for lighting, texture, atmosphere, and artistic style. Keep under 50 words. Return ONLY the enhanced prompt.`;
      userPromptHint = "Enhance this image prompt:";
    } else if (type === "website") {
      systemPrompt = `You are a prompt enhancement specialist for event websites. Take a brief user description of an event and expand it into a detailed, well-structured description for a website generator. Keep it under 200 words, remain factual but make it sound professional and engaging. Output ONLY the enhanced text.`;
      userPromptHint = "Enhance this event description for a website:";
    } else {
      systemPrompt = `You are an expert copywriter. Take the user's brief concept and rewrite it into a punchy, highly engaging, and clear description that is twice as descriptive but still very concise. Return ONLY the enhanced text, no quotes or prefixes.`;
      userPromptHint = "Enhance this phrase/concept:";
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${userPromptHint}\n\n${prompt}` },
      ],
      temperature: 0.7,
      max_tokens: 512,
    });

    res.json({ enhanced: completion.choices[0]?.message?.content?.trim() });
  } catch (error) {
    console.error("Enhance prompt error:", error);
    res.status(500).json({ error: "Failed to enhance prompt" });
  }
});

// Helper: Generate catchy phrases using Llama
async function generatePhrases(req, res, { topic, tone, platform }) {
  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    
    const toneDescriptions = {
      professional: "professional, polished, and authoritative",
      funny: "funny, witty, and humorous with wordplay",
      inspirational: "inspirational, motivational, and uplifting",
      dramatic: "dramatic, impactful, and attention-grabbing",
      urgency: "urgent, FOMO-inducing, and action-oriented",
    };

    const platformGuides = {
      instagram: "Instagram caption (include relevant emojis, hashtags, 150-200 chars)",
      twitter: "Twitter/X post (punchy, under 280 chars, viral-worthy)",
      linkedin: "LinkedIn post (professional, thought-leadership tone)",
      email: "Email subject line (compelling, 50-60 chars, high open-rate)",
      tagline: "Brand tagline (memorable, 5-10 words, iconic)",
    };

    const toneDesc = toneDescriptions[tone] || "engaging and creative";
    const platformGuide = platformGuides[platform] || "social media post";

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a world-class copywriter and social media strategist. Generate exactly 5 unique, creative, and catchy phrases/captions.

Rules:
- Tone: ${toneDesc}
- Format: ${platformGuide}
- Each phrase must be unique and approach the topic from a different angle
- Use appropriate emojis (2-3 per phrase max)
- Make them scroll-stopping and engaging
- Do NOT number them or add labels
- Output ONLY the 5 phrases, one per line, separated by newlines
- No quotes, no bullets, no numbering — just the raw phrases`,
        },
        {
          role: "user",
          content: `Generate 5 catchy ${platform} phrases about: "${topic}"`,
        },
      ],
      temperature: 0.8,
      max_tokens: 600,
    });

    const responseText = completion.choices[0]?.message?.content?.trim() || "";
    const phrases = responseText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 5 && !line.match(/^\d+[\.\)]/))
      .slice(0, 5);

    if (phrases.length === 0) {
      return res.status(500).json({ error: "AI returned empty results. Please try again." });
    }

    res.json({ phrases });
  } catch (error) {
    console.error("Phrase generation error:", error);
    res.status(500).json({ error: "Failed to generate phrases: " + error.message });
  }
}

export default router;
