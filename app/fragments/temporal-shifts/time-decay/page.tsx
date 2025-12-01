"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"

interface DecayElement {
  id: string
  opacity: number
  blur: number
  scale: number
}

export default function TimeDecay() {
  const [elements, setElements] = useState<DecayElement[]>([])
  const [decay, setDecay] = useState(0)
  const lastInteractionRef = useRef(Date.now())

  useEffect(() => {
    setElements(
      Array.from({ length: 12 }).map((_, i) => ({
        id: String(i),
        opacity: 1,
        blur: 0,
        scale: 1,
      })),
    )
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const timeSince = Date.now() - lastInteractionRef.current
      const newDecay = Math.min(timeSince / 15000, 1)
      setDecay(newDecay)

      setElements((prev) =>
        prev.map((el, i) => ({
          ...el,
          opacity: Math.max(1 - (newDecay + i * 0.08), 0.1),
          blur: newDecay * 10 + i * 0.5,
          scale: 1 - newDecay * 0.2 - i * 0.02,
        })),
      )
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className="w-full h-screen bg-background flex items-center justify-center overflow-hidden"
      onClick={() => {
        lastInteractionRef.current = Date.now()
        setDecay(0)
      }}
    >
      <div className="fixed top-6 left-6 z-50">
        <Link
          href="/fragments-hub"
          className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/50 hover:border-primary text-primary transition-all"
        >
          ← Back
        </Link>
      </div>

      <div className="relative w-96 h-96">
        {elements.map((el, i) => (
          <div
            key={el.id}
            className="absolute inset-0 rounded-full border border-primary/50 flex items-center justify-center"
            style={{
              opacity: el.opacity,
              filter: `blur(${el.blur}px)`,
              transform: `scale(${el.scale})`,
              transition: "all 0.1s linear",
            }}
          >
            <div className="w-full h-full rounded-full border border-secondary/30" />
          </div>
        ))}

        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div>
            <h1 className="text-4xl font-bold mb-2">Time Decay</h1>
            <p className="text-muted-foreground">Click to reset. Watch time consume the layers.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
