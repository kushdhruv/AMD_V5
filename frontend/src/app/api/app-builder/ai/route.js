import Groq from "groq-sdk";

export async function POST(request) {
  try {
    const { action, text, context } = await request.json();

    if (!process.env.GROQ_API_KEY) {
        return Response.json({ result: `[MOCK AI] ${action === 'enhance' ? 'Enhanced:' : 'Generated:'} ${text}` });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    let systemPrompt = "You are a helpful assistant.";
    let userPrompt = "";

    if (action === "generate") {
        systemPrompt = "You are an expert event announcement writer. Create a short, engaging, and professional announcement based on the keywords provided. Keep it under 100 words. Focus on clarity and excitement.";
        userPrompt = `Generate an event announcement based on these keywords/topic: "${text}". app_name: ${context?.appName || "Event App"}`;
    } else if (action === "enhance") {
        systemPrompt = "You are an expert editor. Rewrite the following text to be more professional, engaging, and clear. Keep the same meaning but significantly improve the tone and grammar. Keep it under 100 words.";
        userPrompt = `Rewrite/Enhance this text: "${text}"`;
    } else {
        return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    const result = completion.choices[0]?.message?.content?.trim();
    return Response.json({ result });

  } catch (error) {
    console.error("AI Error:", error);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
