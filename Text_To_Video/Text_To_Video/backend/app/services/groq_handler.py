import os
from groq import Groq

# Using the key provided by user via env var
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

client = Groq(api_key=GROQ_API_KEY)

def enhance_prompt(prompt: str) -> str:
    """
    Uses Groq (Llama3/Mixtral) to enhance the video generation prompt.
    """
    system_prompt = (
        "You are an expert AI Video Prompt Engineer. "
        "Your task is to take a simple user idea and rewrite it into a detailed, high-quality text-to-video prompt. "
        "Add details about lighting, camera angle, style (cinematic, photorealistic), and atmosphere. "
        "Keep the prompt under 4 sentences. "
        "Return ONLY the enhanced prompt, nothing else."
    )
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": f"Enhance this video prompt: {prompt}",
                }
            ],
            model="llama3-8b-8192",
            temperature=0.7,
            max_tokens=200,
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq API Error: {e}")
        # Fallback to simple enhancement if API fails
        return f"{prompt}, cinematic lighting, 8k resolution, photorealistic, highly detailed, professional cinematography"
