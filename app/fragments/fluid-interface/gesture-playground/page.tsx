"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"

export default function GesturePlayground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [items, setItems] = useState<Array<{ id: string; x: number; y: number; rotation: number }>>([])
  const [decay, setDecay] = useState(0)
  const lastInteractionRef = useRef(Date.now())

  useEffect(() => {
    const initialItems = Array.from({ length: 8 }).map((_, i) => ({
      id: String(i),
      x: Math.random() * 80,
      y: Math.random() * 80,
      rotation: Math.random() * 360,
    }))
    setItems(initialItems)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const timeSince = Date.now() - lastInteractionRef.current
      setDecay(Math.min(timeSince / 15000, 1))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const handleMouseMove = (e: React.MouseEvent) => {
    lastInteractionRef.current = Date.now()
    setDecay(0)

    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const mouseX = ((e.clientX - rect.left) / rect.width) * 100
    const mouseY = ((e.clientY - rect.top) / rect.height) * 100

    setItems((prev) =>
      prev.map((item) => {
        const dx = mouseX - item.x
        const dy = mouseY - item.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 30) {
          return {
            ...item,
            x: item.x - Math.sign(dx) * 5,
            y: item.y - Math.sign(dy) * 5,
            rotation: item.rotation + (Math.random() - 0.5) * 10,
          }
        }
        return item
      }),
    )
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-screen bg-gradient-to-br from-background to-card relative overflow-hidden"
      onMouseMove={handleMouseMove}
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

      {items.map((item) => (
        <div
          key={item.id}
          className="absolute w-24 h-24 rounded-full border-2 border-primary/50 flex items-center justify-center animate-pulse"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            transform: `translate(-50%, -50%) rotate(${item.rotation}deg)`,
            background: `conic-gradient(#00d9ff, #7c3aed, #d946ef, #00d9ff)`,
            opacity: 0.3,
          }}
        >
          <div className="w-16 h-16 rounded-full bg-background" />
        </div>
      ))}

      <div className="absolute bottom-6 left-6 right-6 z-40 backdrop-blur-sm bg-card/50 p-4 rounded-lg border border-border/30">
        <h1 className="text-2xl font-bold mb-2">Gesture Playground</h1>
        <p className="text-muted-foreground text-sm">
          Move your cursor across the screen to push and repel the fluid orbs. Watch them respond organically to your
          presence.
        </p>
      </div>
    </div>
  )
}
