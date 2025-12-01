import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: Request) {
  try {
    const { emotion, dreamText } = await request.json()

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `Generate vivid visual descriptions for an abstract dream visualization. Provide JSON with:
- particleColors: array of 3 hex colors (#XXXXXX format)
- particleShape: "circle", "wave", "spiral", or "constellation"
- movementPattern: "orbiting", "drifting", "pulsing", "fragmenting"
- intensity: 0-100
- visualMetaphor: one poetic word describing the visual theme

Emotion: ${emotion}
Dream essence: "${dreamText.substring(0, 100)}"

Respond ONLY with valid JSON.`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    const fragmentData = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : {
          particleColors: ["#9945FF", "#00D9FF", "#FF006E"],
          particleShape: "spiral",
          movementPattern: "orbiting",
          intensity: 60,
          visualMetaphor: "transcendence",
        }

    return Response.json(fragmentData)
  } catch (error) {
    console.error("[v0] Fragment description error:", error)
    return Response.json(
      {
        particleColors: ["#9945FF", "#00D9FF", "#FF006E"],
        particleShape: "spiral",
        movementPattern: "orbiting",
        intensity: 60,
        visualMetaphor: "transcendence",
      },
      { status: 200 },
    )
  }
}
