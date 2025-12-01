"use client"

import { useState, useRef, useEffect } from "react"
import type { Dream } from "@/app/page"

interface VoiceNarratorProps {
  dream: Dream
  isActive: boolean
  onToggle: (id: string) => void
}

export default function VoiceNarrator({ dream, isActive, onToggle }: VoiceNarratorProps) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakingIntensity, setSpeakingIntensity] = useState(0)
  const [aiNarrative, setAiNarrative] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)
  const pulseIntervalRef = useRef<NodeJS.Timeout>()

  const emotionVoices: Record<string, Partial<SpeechSynthesisUtterance>> = {
    peaceful: { rate: 0.8, pitch: 0.9 },
    joyful: { rate: 1.1, pitch: 1.2 },
    anxious: { rate: 1.3, pitch: 1.4 },
    melancholic: { rate: 0.7, pitch: 0.7 },
    surreal: { rate: 0.9, pitch: 1.1 },
  }

  useEffect(() => {
    if (dream.text && !aiNarrative && !isGenerating) {
      generateNarrative()
    }
  }, [dream.id])

  const generateNarrative = async () => {
    setIsGenerating(true)
    try {
      const res = await fetch("/api/generate-narrative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dreamText: dream.text,
          emotion: dream.emotion,
        }),
      })
      const data = await res.json()
      setAiNarrative(data.narrative || dream.text)
    } catch (error) {
      console.error("[v0] Narrative generation failed:", error)
      setAiNarrative(dream.text)
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleNarration = async () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current)
      onToggle(dream.id)
      return
    }

    const textToSpeak = aiNarrative || dream.text
    const utterance = new SpeechSynthesisUtterance(textToSpeak)
    const voiceSettings = emotionVoices[dream.emotion] || emotionVoices.peaceful

    utterance.rate = voiceSettings.rate || 1
    utterance.pitch = voiceSettings.pitch || 1
    utterance.volume = 1

    utterance.onstart = () => {
      setIsSpeaking(true)
      onToggle(dream.id)

      pulseIntervalRef.current = setInterval(() => {
        setSpeakingIntensity((prev) => {
          const next = prev + 0.1
          return next > 1 ? 0 : next
        })
      }, 100)
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current)
      setSpeakingIntensity(0)
      onToggle(dream.id)
    }

    synthRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel()
      }
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current)
    }
  }, [isSpeaking])

  return (
    <div className="p-4 bg-background/50 border border-border/30 rounded-lg space-y-3 animate-breathe">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground/80">Voice of the Machine</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {isSpeaking
              ? "Narrating your dream..."
              : isGenerating
                ? "Generating AI narrative..."
                : "Let the system speak your emotions"}
          </p>
        </div>
      </div>

      <button
        onClick={toggleNarration}
        disabled={isGenerating}
        className={`w-full py-2 rounded-lg font-medium text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
          isSpeaking
            ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground ring-2 ring-primary/50"
            : "bg-primary/20 border border-primary/50 text-primary hover:bg-primary/30 disabled:opacity-50"
        }`}
      >
        <svg
          className={`w-4 h-4 ${isSpeaking || isGenerating ? "animate-spin" : ""}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9 4a4 4 0 100 8 4 4 0 000-8zM2 9a7 7 0 1114 0A7 7 0 012 9z" />
        </svg>
        {isSpeaking ? "Stop Narration" : isGenerating ? "Generating..." : "Narrate Dream"}
      </button>

      {isActive && (
        <div className="flex gap-1 items-end justify-center h-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`w-1 rounded-full bg-gradient-to-t from-primary to-secondary opacity-70 ${
                isSpeaking ? "animate-pulse" : ""
              }`}
              style={{
                height: `${20 + Math.sin(speakingIntensity * Math.PI + (i / 5) * Math.PI * 2) * 15}px`,
                animationDelay: `${i * 0.1}s`,
                transition: "height 0.1s ease-out",
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
