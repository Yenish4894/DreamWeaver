"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"

export default function SonicPalette() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const [decay, setDecay] = useState(0)
  const [activeFrequencies, setActiveFrequencies] = useState<number[]>([])
  const lastInteractionRef = useRef(Date.now())

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const timeSince = Date.now() - lastInteractionRef.current
      setDecay(Math.min(timeSince / 15000, 1))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const playTone = (frequency: number) => {
    const ctx = audioContextRef.current
    if (!ctx) return

    lastInteractionRef.current = Date.now()
    setDecay(0)

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    oscillator.frequency.value = frequency
    oscillator.type = "sine"

    gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1)

    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 1)

    setActiveFrequencies((prev) => [...prev, frequency])
    setTimeout(() => {
      setActiveFrequencies((prev) => prev.filter((f) => f !== frequency))
    }, 1000)
  }

  const frequencies = [261.63, 293.66, 329.63, 349.23, 392.0, 440.0, 493.88, 523.25]
  const emotionColors = ["#ffd60a", "#e63946", "#ff006e", "#00d9ff", "#7c3aed", "#ff006e", "#00d9ff", "#7c3aed"]

  return (
    <div
      className="w-full h-screen bg-background flex flex-col items-center justify-center overflow-hidden"
      style={{ opacity: Math.max(1 - decay * 0.3, 0.7) }}
    >
      <div className="fixed top-6 left-6 z-50">
        <Link
          href="/fragments-hub"
          className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/50 hover:border-primary text-primary transition-all"
        >
          ← Back
        </Link>
      </div>

      <h1 className="text-4xl font-bold mb-4">Sonic Palette</h1>
      <p className="text-muted-foreground mb-12 max-w-md text-center">
        Click buttons to compose emotional frequencies. Each tone represents a feeling.
      </p>

      <div className="grid grid-cols-4 gap-4">
        {frequencies.map((freq, i) => (
          <button
            key={freq}
            onClick={() => playTone(freq)}
            className="w-20 h-20 rounded-lg border-2 transition-all transform hover:scale-110 active:scale-95"
            style={{
              borderColor: activeFrequencies.includes(freq) ? emotionColors[i] : "rgba(100,100,100,0.3)",
              background: activeFrequencies.includes(freq) ? emotionColors[i] + "30" : "transparent",
            }}
          >
            <div className="text-xs font-semibold text-muted-foreground">{freq.toFixed(0)}</div>
            <div className="text-xs text-muted-foreground/60">Hz</div>
          </button>
        ))}
      </div>
    </div>
  )
}
