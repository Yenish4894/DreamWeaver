import { type NextRequest, NextResponse } from "next/server"

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

export async function POST(req: NextRequest) {
  try {
    const { userMessage } = await req.json()

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `You are a mystical AI narrator speaking through an ancient machine. Respond in exactly ONE poetic sentence. Be emotional, introspective, haunting, and surreal. User thought: "${userMessage}". Respond directly without introduction.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 60,
          },
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.log("[v0] Gemini API Error:", errorData)
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()
    const narration = data.candidates?.[0]?.content?.parts?.[0]?.text || "The machine hums with silence..."

    return NextResponse.json({ narration: narration.trim() })
  } catch (error) {
    console.error("[v0] Gemini API error:", error)
    return NextResponse.json({ narration: "Your thoughts echo through the void..." }, { status: 200 })
  }
}
