import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: Request) {
  try {
    const { dreamText, emotion } = await request.json()

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `You are a poetic dream interpreter. Analyze this dream and provide a brief, haunting interpretation that reveals deeper emotional meaning. Keep it concise (2-3 sentences) and mystical.

Dream: "${dreamText}"
Emotion: ${emotion}

Respond ONLY with the interpretation, nothing else.`

    const result = await model.generateContent(prompt)
    const interpretation = result.response.text()

    return Response.json({ interpretation })
  } catch (error) {
    console.error("[v0] Dream interpretation error:", error)
    return Response.json({ error: "Failed to interpret dream" }, { status: 500 })
  }
}
