import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  try {
    const { message, chatHistory, currentConfig } = await request.json();

    if (!message || !currentConfig) {
      return Response.json(
        { error: "Missing message or current configuration" },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert AI mobile app builder.
Your task is to modify an App Configuration (JSON) based on the user's Natural Language Instruction.

Rules:
1. Parse the provided 'current_config' JSON.
2. Interpret the 'instruction' to understand what needs to change.
3. Apply the changes strictly to the relevant parts of the configuration.
4. If asked to add something (like a new text block, button, or image), carefully append the new component object to the end of the appropriate screen's 'components' array. Ensure it has a valid 'type' (e.g. 'text', 'button', 'image', 'text_field', 'divider', 'card', 'hero') and default 'props' suitable for its type.
5. If asked to change a title, image, or text, locate the specific component in the screens array and modify its 'props'.
6. Do NOT change parts of the config that are unrelated (e.g., don't wipe out existing screens unless asked).
7. Ensure the JSON is valid.
8. Output specific JSON structure: { "config": <FULL_UPDATED_JSON>, "message": "<SHORT_CONFIRMATION_TEXT>" }.
9. Return ONLY the JSON object. Do not wrap in markdown code blocks.

Example:
User: "Change the app primary color to purple and add an image to the home screen."
Output: { "config": { ... "theme": { "primary_color": "#800080" }, "screens": [ { "name": "Home", "components": [ ... , { "type": "image", "props": { "url": "https://via.placeholder.com/300" } } ] } ] ... }, "message": "I updated the primary color to purple and added an image component to the Home screen." }`,
        },
        // Insert conversation history context
        ...(chatHistory || []).map(msg => ({
            role: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.role === 'assistant' 
                ? (msg.content || 'Updated the app.')
                : msg.content
        })),
        {
          role: "user",
          content: `Current Config: ${JSON.stringify(currentConfig)}

Instruction: ${message}`,
        },
      ],
      temperature: 0.1, // Low temp for structured adherence
      max_tokens: 4096,
      response_format: { type: "json_object" }, // Enforce JSON output
    });

    const responseContent = completion.choices[0]?.message?.content?.trim();
    if (!responseContent) throw new Error("No response from AI");

    const result = JSON.parse(responseContent);

    return Response.json(result);
  } catch (error) {
    console.error("App Builder Chat edit error:", error);
    return Response.json(
      { error: "Failed to update app configuration: " + error.message },
      { status: 500 }
    );
  }
}
