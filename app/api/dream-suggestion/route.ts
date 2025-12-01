import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: Request) {
  try {
    const { recentEmotions, dreamCount } = await request.json()

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `Based on this emotional journey, generate a poetic prompt to inspire the next dream. Keep it surreal, evocative, and brief (under 20 words).

Recent emotional arc: ${recentEmotions.join(" → ")}
Dreams recorded: ${dreamCount}

Make it feel like a whisper from the subconscious.`

    const result = await model.generateContent(prompt)
    const suggestion = result.response.text()

    return Response.json({ suggestion })
  } catch (error) {
    console.error("[v0] Suggestion generation error:", error)
    return Response.json({ suggestion: "What lies beyond the threshold of forgotten memories?" }, { status: 200 })
  }
}
