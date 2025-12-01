"use client"

import { useState, useEffect } from "react"
import type { Emotion } from "@/app/page"

interface AIDreamPanelProps {
  dreamText: string
  emotion: Emotion
  isLoading?: boolean
}

interface DreamAnalysis {
  interpretation?: string
  narrative?: string
  emotionalAnalysis?: {
    dominantEmotion: string
    emotionalIntensity: number
    sentimentScore: number
    psychologicalThemes: string[]
  }
}

export default function AIDreamPanel({ dreamText, emotion, isLoading = false }: AIDreamPanelProps) {
  const [analysis, setAnalysis] = useState<DreamAnalysis>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<"interpretation" | "narrative" | "analysis">("interpretation")

  useEffect(() => {
    if (dreamText.length > 10 && !isLoading) {
      analyzeUsingAI()
    }
  }, [dreamText, emotion])

  const analyzeUsingAI = async () => {
    setIsAnalyzing(true)
    try {
      const [interpRes, narrativeRes, emotionRes] = await Promise.all([
        fetch("/api/dream-interpret", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dreamText, emotion }),
        }),
        fetch("/api/generate-narrative", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dreamText, emotion }),
        }),
        fetch("/api/analyze-emotion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dreamText }),
        }),
      ])

      const [interpData, narrativeData, emotionData] = await Promise.all([
        interpRes.json(),
        narrativeRes.json(),
        emotionRes.json(),
      ])

      setAnalysis({
        interpretation: interpData.interpretation,
        narrative: narrativeData.narrative,
        emotionalAnalysis: emotionData,
      })
    } catch (error) {
      console.error("[v0] AI analysis failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-card/50 to-card/80 rounded-lg border border-border/50 backdrop-blur-sm">
      <div className="flex gap-2 border-b border-border/30">
        {(["interpretation", "narrative", "analysis"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-sm font-medium transition-all ${
              activeTab === tab
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="min-h-32">
        {isAnalyzing ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center space-y-2">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground text-sm">Dreaming through the wires...</p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "interpretation" && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Dream Interpretation</p>
                <p className="text-foreground italic">{analysis.interpretation || "Your dream awaits its story..."}</p>
              </div>
            )}

            {activeTab === "narrative" && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Narrator's Voice</p>
                <p className="text-foreground italic">{analysis.narrative || "The silence speaks..."}</p>
              </div>
            )}

            {activeTab === "analysis" && analysis.emotionalAnalysis && (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Dominant Emotion</p>
                  <p className="font-semibold capitalize text-primary">{analysis.emotionalAnalysis.dominantEmotion}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-1">Emotional Intensity</p>
                  <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-secondary to-primary transition-all duration-500"
                      style={{
                        width: `${analysis.emotionalAnalysis.emotionalIntensity}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Psychological Themes</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.emotionalAnalysis.psychologicalThemes.map((theme, i) => (
                      <span key={i} className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium">
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <button
        onClick={analyzeUsingAI}
        disabled={isAnalyzing || dreamText.length < 10}
        className="w-full px-3 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isAnalyzing ? "Analyzing..." : "Reanalyze Dream"}
      </button>
    </div>
  )
}
