"use client"

import { useEffect } from "react"
import type { Emotion } from "@/app/page"

interface EmotionalStateEngineProps {
  emotion: Emotion
}

export default function EmotionalStateEngine({ emotion }: EmotionalStateEngineProps) {
  useEffect(() => {
    const emotionStyles: Record<Emotion, { hue: number; saturation: number; lightness: number }> = {
      peaceful: { hue: 200, saturation: 70, lightness: 50 },
      joyful: { hue: 45, saturation: 100, lightness: 55 },
      melancholic: { hue: 200, saturation: 50, lightness: 35 },
      anxious: { hue: 280, saturation: 90, lightness: 55 },
      surreal: { hue: 320, saturation: 85, lightness: 50 },
    }

    const style = emotionStyles[emotion]
    const root = document.documentElement

    root.style.setProperty("--emotion-hue", style.hue.toString())
    root.style.setProperty("--emotion-saturation", `${style.saturation}%`)
    root.style.setProperty("--emotion-lightness", `${style.lightness}%`)

    // Adjust animation speed based on emotion
    const animationSpeed = emotion === "joyful" ? 0.5 : emotion === "anxious" ? 1.5 : 1
    root.style.setProperty("--animation-speed", animationSpeed.toString())
  }, [emotion])

  return null
}
