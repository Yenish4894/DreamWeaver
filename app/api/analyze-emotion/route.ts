import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: Request) {
  try {
    const { dreamText } = await request.json()

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `Analyze the emotional undertones in this dream text. Provide a JSON response with:
- dominantEmotion: the primary emotion (joy, fear, melancholy, peace, wonder, or existential)
- emotionalIntensity: 0-100 scale
- sentimentScore: -1 to 1 (negative to positive)
- psychologicalThemes: array of 2-3 key themes

Dream text: "${dreamText}"

Respond ONLY with valid JSON, no markdown or explanation.`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    const analysis = jsonMatch
      ? JSON.parse(jsonMatch[0])
      : {
          dominantEmotion: "surreal",
          emotionalIntensity: 50,
          sentimentScore: 0,
          psychologicalThemes: ["unknown", "mystery"],
        }

    return Response.json(analysis)
  } catch (error) {
    console.error("[v0] Emotion analysis error:", error)
    return Response.json(
      {
        dominantEmotion: "surreal",
        emotionalIntensity: 50,
        sentimentScore: 0,
        psychologicalThemes: ["error", "mystery"],
      },
      { status: 200 },
    )
  }
}
