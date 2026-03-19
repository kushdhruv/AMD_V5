
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  try {
    const { prompt } = await request.json();

    if (!prompt || prompt.trim().length < 10) {
      return Response.json(
        { error: "Prompt must be at least 10 characters" },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are a prompt enhancement specialist for event websites. Your job is to take a brief user description of an event and expand it into a detailed, well-structured prompt that will help generate a comprehensive event website.

Rules:
- Keep the enhanced prompt under 300 words
- Add specific details the user might have omitted: event format, target audience, key activities
- Maintain the user's original intent and facts
- Make it actionable for a website builder
- If the user mentions specific names, dates, or facts, keep them exactly as provided
- Output ONLY the enhanced prompt text, nothing else`,
        },
        {
          role: "user",
          content: `Enhance this event description for website generation:\n\n${prompt}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 512,
    });

    const enhanced = completion.choices[0]?.message?.content?.trim();

    return Response.json({ enhanced });
  } catch (error) {
    console.error("Enhance prompt error:", error);
    return Response.json(
      { error: "Failed to enhance prompt" },
      { status: 500 }
    );
  }
}
