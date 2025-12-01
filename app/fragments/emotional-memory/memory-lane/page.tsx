"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"

interface MemoryPoint {
  id: string
  emotion: string
  color: string
  intensity: number
  x: number
}

export default function MemoryLane() {
  const [memories, setMemories] = useState<MemoryPoint[]>([])
  const [decay, setDecay] = useState(0)
  const lastInteractionRef = useRef(Date.now())

  useEffect(() => {
    const emotions = ["joyful", "melancholic", "anxious", "peaceful", "surreal"]
    const colors = ["#ffd60a", "#e63946", "#ff006e", "#00d9ff", "#7c3aed"]

    const newMemories = Array.from({ length: 20 }).map((_, i) => ({
      id: String(i),
      emotion: emotions[i % 5],
      color: colors[i % 5],
      intensity: Math.random() * 0.8 + 0.2,
      x: (i / 20) * 100,
    }))
    setMemories(newMemories)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const timeSince = Date.now() - lastInteractionRef.current
      setDecay(Math.min(timeSince / 15000, 1))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="w-full h-screen bg-background overflow-hidden flex flex-col"
      onClick={() => {
        lastInteractionRef.current = Date.now()
        setDecay(0)
      }}
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

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-4xl">
          <h1 className="text-4xl font-bold mb-8 text-center">Memory Lane</h1>

          <div className="relative h-32 bg-card/30 rounded-lg border border-border/30 p-8 overflow-x-auto">
            <div className="relative h-full flex items-center">
              {memories.map((memory) => (
                <div
                  key={memory.id}
                  className="flex-shrink-0 group cursor-pointer transition-all hover:scale-110"
                  style={{ left: `${memory.x}%` }}
                >
                  <div
                    className="w-12 h-12 rounded-full border-2 border-border/50 hover:border-primary/100 transition-all animate-pulse"
                    style={{
                      background: memory.color,
                      opacity: memory.intensity,
                    }}
                  />
                  <div className="absolute top-full mt-2 hidden group-hover:block whitespace-nowrap bg-card p-2 rounded border border-border/30 text-xs">
                    {memory.emotion}
                  </div>
                </div>
              ))}

              {/* Timeline line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent" />
            </div>
          </div>

          <p className="text-muted-foreground text-center mt-8">
            Each point represents a remembered emotion from your dream journey. Hover to explore.
          </p>
        </div>
      </div>
    </div>
  )
}
