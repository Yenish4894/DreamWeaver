import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: Request) {
  try {
    const { dreamText, emotion, previousDreams } = await request.json()

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const dreamHistory = previousDreams
      ? `Previous dreams in this journey: ${previousDreams.slice(-2).join(" | ")}`
      : ""

    const prompt = `You are a surreal dream narrator. Generate a poetic, flowing narrative voice-over (1-2 sentences) that would be spoken to the dreamer. Make it haunting, introspective, and emotionally resonant. Reference the dream's imagery and the emotional journey.

Dream: "${dreamText}"
Emotion: ${emotion}
${dreamHistory}

Respond ONLY with the narrative, nothing else. Make it sound like someone speaking into the void.`

    const result = await model.generateContent(prompt)
    const narrative = result.response.text()

    return Response.json({ narrative })
  } catch (error) {
    console.error("[v0] Narrative generation error:", error)
    return Response.json({ narrative: "The dream fades into silence..." }, { status: 200 })
  }
}
