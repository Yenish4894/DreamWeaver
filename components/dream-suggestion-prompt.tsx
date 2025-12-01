"use client"

import { useState, useEffect } from "react"
import type { Emotion } from "@/app/page"

interface DreamSuggestionPromptProps {
  recentEmotions: Emotion[]
  dreamCount: number
}

export default function DreamSuggestionPrompt({ recentEmotions, dreamCount }: DreamSuggestionPromptProps) {
  const [suggestion, setSuggestion] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (recentEmotions.length > 0) {
      generateSuggestion()
    }
  }, [recentEmotions.length, dreamCount])

  const generateSuggestion = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/dream-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recentEmotions,
          dreamCount,
        }),
      })
      const data = await res.json()
      setSuggestion(data.suggestion)
    } catch (error) {
      console.error("[v0] Suggestion generation error:", error)
      setSuggestion("What lies beyond the threshold of forgotten memories?")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-4 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-lg border border-border/30 backdrop-blur-sm animate-breathe">
      <p className="text-xs font-semibold text-foreground/70 mb-2">Next Dream Awaits</p>
      <p className="text-sm text-foreground italic leading-relaxed mb-3">
        {isLoading ? "Listening to your emotional echoes..." : suggestion}
      </p>
      <button
        onClick={generateSuggestion}
        disabled={isLoading}
        className="text-xs px-2 py-1 bg-primary/30 text-primary rounded hover:bg-primary/40 disabled:opacity-50 transition-colors"
      >
        {isLoading ? "Generating..." : "Generate New Suggestion"}
      </button>
    </div>
  )
}
