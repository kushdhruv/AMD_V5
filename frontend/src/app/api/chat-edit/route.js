
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request) {
  try {
    const { message, chatHistory, currentBlueprint, currentTheme } = await request.json();

    if (!message || !currentBlueprint) {
      return Response.json(
        { error: "Missing message or blueprint" },
        { status: 400 }
      );
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an expert AI website structural engineer and designer.
Your task is to modify a Website JSON Blueprint and Theme based on the user's Natural Language Instruction.

Rules:
1. Parse the provided 'current_blueprint' and 'current_theme' JSON.
2. Interpret the 'instruction' to understand what needs to change.
3. Apply the changes strictly to the relevant parts.
4. If the user asks to ADD a new section (like a gallery, testimonials, schedule, or pricing), add a new object to the appropriate place in the blueprint structure. Use typical component structures (e.g. { "title": "...", "items": [...] }).
5. If the user asks to CHANGE an existing element (like replacing an image, changing a headline), locate the specific part of the blueprint JSON and modify it. (e.g. to add a background image to the hero, add 'background_image' to the 'hero' object).
6. If the user asks to CHANGE COLORS, FONTS, or STYLES, modify the 'theme' object. Theme fields: 'primary', 'accent', 'background', 'surface', 'text', 'textSecondary'.
7. Make your changes robust. If the user asks for a structural change that the current template doesn't explicitly have, synthesize a reasonable JSON structure for it that the front-end renderer can gracefully handle.
8. Do NOT change fields that are undeniably unrelated to the instruction.
9. Ensure the JSON is valid.
10. Output specific JSON structure: { "blueprint": <FULL_UPDATED_BLUEPRINT_JSON>, "theme": <FULL_UPDATED_THEME_JSON>, "message": "<SHORT_CONFIRMATION_TEXT>" }.
11. Return ONLY the JSON object. Do not wrap in markdown code blocks.

Example:
User: "Change the primary color to red and add a new speaker named John with image url X."
Output: { "theme": { ... "primary": "red" ... }, "blueprint": { ... "speakers": [ ... , { "name": "John", "image": "X", "role": "Speaker" } ] ... }, "message": "I updated the primary color to red and added John to the speakers section." }`,
        },
        // Insert conversation history for context
        ...(chatHistory || []).map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.role === 'assistant' 
              ? (msg.content || 'Updated the website.') // Stripped down previous AI output to save tokens
              : msg.content
        })),
        {
          role: "user",
          content: `Current Blueprint: ${JSON.stringify(currentBlueprint, null, 2)}
Current Theme: ${JSON.stringify(currentTheme || {}, null, 2)}

Instruction: ${message}`,
        },
      ],
      temperature: 0.1, // Low temp for precision
      max_tokens: 4096,
      response_format: { type: "json_object" }, // Enforce JSON
    });

    const responseContent = completion.choices[0]?.message?.content?.trim();
    if (!responseContent) throw new Error("No response from AI");

    const result = JSON.parse(responseContent);

    return Response.json(result);
  } catch (error) {
    console.error("Chat edit error:", error);
    return Response.json(
      { error: "Failed to update website: " + error.message },
      { status: 500 }
    );
  }
}
