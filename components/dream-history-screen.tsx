"use client"

import { useEffect, useRef, useState } from "react"
import type { Dream } from "@/app/page"

interface DreamHistoryScreenProps {
  dreams: Dream[]
  onClose: () => void
}

export default function DreamHistoryScreen({ dreams, onClose }: DreamHistoryScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [arcInsight, setArcInsight] = useState<string>("")
  const [isLoadingInsight, setIsLoadingInsight] = useState(false)

  useEffect(() => {
    if (dreams.length > 2 && !arcInsight && !isLoadingInsight) {
      generateArcInsight()
    }
  }, [dreams.length])

  const generateArcInsight = async () => {
    setIsLoadingInsight(true)
    try {
      const recentEmotions = dreams.slice(0, 5).map((d) => d.emotion)
      const res = await fetch("/api/dream-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recentEmotions,
          dreamCount: dreams.length,
        }),
      })
      const data = await res.json()
      setArcInsight(data.suggestion)
    } catch (error) {
      console.error("[v0] Arc insight generation failed:", error)
    } finally {
      setIsLoadingInsight(false)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const draw = () => {
      ctx.fillStyle = "rgba(18, 18, 24, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const padding = 50
      const graphWidth = canvas.width - padding * 2
      const graphHeight = canvas.height - padding * 2

      // Draw grid
      ctx.strokeStyle = "rgba(124, 58, 237, 0.1)"
      ctx.lineWidth = 1
      for (let i = 0; i <= 10; i++) {
        const x = padding + (graphWidth / 10) * i
        const y = padding + (graphHeight / 10) * i
        ctx.beginPath()
        ctx.moveTo(x, padding)
        ctx.lineTo(x, canvas.height - padding)
        ctx.stroke()
        ctx.beginPath()
        ctx.moveTo(padding, y)
        ctx.lineTo(canvas.width - padding, y)
        ctx.stroke()
      }

      // Draw emotional trail
      dreams.forEach((dream, index) => {
        const x = padding + (index / Math.max(dreams.length - 1, 1)) * graphWidth
        const emotionMap: Record<string, number> = {
          joyful: 0.9,
          peaceful: 0.6,
          surreal: 0.5,
          melancholic: 0.3,
          anxious: 0.1,
        }
        const y = canvas.height - padding - emotionMap[dream.emotion] * graphHeight

        ctx.fillStyle = dream.colors[0]
        ctx.globalAlpha = 1 - dream.decayLevel
        ctx.beginPath()
        ctx.arc(x, y, 8, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = dream.colors[1]
        ctx.lineWidth = 2
        ctx.stroke()

        ctx.globalAlpha = 1
      })

      // Draw connecting line
      if (dreams.length > 1) {
        ctx.strokeStyle = "rgba(147, 112, 219, 0.3)"
        ctx.lineWidth = 2
        ctx.beginPath()

        const emotionMap: Record<string, number> = {
          joyful: 0.9,
          peaceful: 0.6,
          surreal: 0.5,
          melancholic: 0.3,
          anxious: 0.1,
        }

        dreams.forEach((dream, index) => {
          const x = padding + (index / Math.max(dreams.length - 1, 1)) * graphWidth
          const y = canvas.height - padding - emotionMap[dream.emotion] * graphHeight
          if (index === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })

        ctx.stroke()
      }

      requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [dreams])

  return (
    <div className="relative w-full h-full flex flex-col bg-background">
      <div className="p-6 border-b border-border/30 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Emotional Trail</h2>
          <p className="text-muted-foreground text-sm">Your dream journey mapped over time</p>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/50 hover:border-primary text-primary transition-all"
        >
          Back
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="flex-1"
        style={{
          background: "radial-gradient(circle, rgba(18,18,24,0.3) 0%, rgba(18,18,24,0.8) 100%)",
        }}
      />
      {arcInsight && (
        <div className="p-6 border-t border-border/30 bg-gradient-to-r from-secondary/20 to-primary/20 backdrop-blur-sm">
          <p className="text-xs font-semibold text-foreground/70 mb-2">Emotional Arc Interpretation</p>
          <p className="text-sm text-foreground italic leading-relaxed">
            {isLoadingInsight ? "Analyzing your emotional journey..." : arcInsight}
          </p>
        </div>
      )}
    </div>
  )
}
