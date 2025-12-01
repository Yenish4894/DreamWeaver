import { type NextRequest, NextResponse } from "next/server"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function POST(req: NextRequest) {
  try {
    const { memory } = await req.json()

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Generate a very short poetic narrative (2-3 words max) about this memory: "${memory}". Make it dreamlike, surreal, and emotional. Examples: "echoes fade gently", "shadows dance free", "silence blooms eternal"`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 20, // Minimal tokens for efficiency
          },
        }),
      },
    )

    const data = await response.json()
    const poetry = data.candidates?.[0]?.content?.parts?.[0]?.text || memory

    return NextResponse.json({ poetry })
  } catch (error) {
    console.error("Poetry generation error:", error)
    return NextResponse.json({ poetry: "echoes fade" }, { status: 500 })
  }
}
