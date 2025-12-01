"use client"

import { useEffect, useRef, useState } from "react"
import type { Dream, Emotion, DreamVibe } from "@/app/page"

interface DreamMapProps {
  dreams: Dream[]
  currentEmotion: Emotion
  onDreamUpdate: (dreamId: string, vibe: DreamVibe) => void
  onDreamDecay: (dreamId: string, decayLevel: number) => void
}

export default function DreamMap({ dreams, currentEmotion, onDreamUpdate, onDreamDecay }: DreamMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredDream, setHoveredDream] = useState<string | null>(null)
  const [hoveredInterpretation, setHoveredInterpretation] = useState<string>("")
  const [isLoadingInterpretation, setIsLoadingInterpretation] = useState(false)
  const animationFrameRef = useRef<number>()
  const interpretationTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (hoveredDream && !hoveredInterpretation) {
      const dream = dreams.find((d) => d.id === hoveredDream)
      if (dream) {
        setIsLoadingInterpretation(true)
        interpretationTimeoutRef.current = setTimeout(() => {
          fetchInterpretation(dream)
        }, 300) // Delay to avoid too many API calls on hover
      }
    }

    return () => {
      if (interpretationTimeoutRef.current) {
        clearTimeout(interpretationTimeoutRef.current)
      }
    }
  }, [hoveredDream])

  const fetchInterpretation = async (dream: Dream) => {
    try {
      const res = await fetch("/api/dream-interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dreamText: dream.text,
          emotion: dream.emotion,
        }),
      })
      const data = await res.json()
      setHoveredInterpretation(data.interpretation || "")
    } catch (error) {
      console.error("[v0] Interpretation fetch error:", error)
    } finally {
      setIsLoadingInterpretation(false)
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

    const drawMap = () => {
      ctx.fillStyle = "rgba(18, 18, 24, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Draw fame/defame zones
      ctx.strokeStyle = "rgba(0, 217, 255, 0.1)"
      ctx.beginPath()
      ctx.arc(centerX, centerY, 150, 0, Math.PI * 2)
      ctx.stroke()

      // Draw dreams as interactive nodes
      dreams.forEach((dream, index) => {
        const angle = (index / dreams.length) * Math.PI * 2
        const radius = dream.vibe === "fame" ? 180 : dream.vibe === "defame" ? 80 : 130
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius

        // Draw connecting lines
        ctx.strokeStyle = `rgba(${dream.colors[0]
          .substring(1)
          .match(/.{1,2}/g)
          ?.map((x) => Number.parseInt(x, 16))
          .join(", ")}, 0.2)`
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(x, y)
        ctx.stroke()

        // Draw dream node
        const isHovered = hoveredDream === dream.id
        const size = isHovered ? 20 : 12
        ctx.fillStyle = dream.colors[0]
        ctx.globalAlpha = 1 - dream.decayLevel
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fill()

        ctx.globalAlpha = 1
        ctx.strokeStyle = dream.colors[1]
        ctx.lineWidth = isHovered ? 3 : 1
        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.stroke()

        // Update decay based on vibe
        const targetDecay = dream.vibe === "defame" ? 0.8 : dream.vibe === "fame" ? 0.1 : 0.4
        const newDecay = dream.decayLevel + (targetDecay - dream.decayLevel) * 0.02
        onDreamDecay(dream.id, newDecay)
      })

      animationFrameRef.current = requestAnimationFrame(drawMap)
    }

    drawMap()

    const handleCanvasClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const clickY = e.clientY - rect.top

      dreams.forEach((dream, index) => {
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const angle = (index / dreams.length) * Math.PI * 2
        const radius = dream.vibe === "fame" ? 180 : dream.vibe === "defame" ? 80 : 130
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius

        const distance = Math.sqrt((clickX - x) ** 2 + (clickY - y) ** 2)
        if (distance < 25) {
          const vibes: DreamVibe[] = ["fame", "neutral", "defame"]
          const currentIndex = vibes.indexOf(dream.vibe)
          const nextVibe = vibes[(currentIndex + 1) % vibes.length]
          onDreamUpdate(dream.id, nextVibe)
        }
      })
    }

    canvas.addEventListener("click", handleCanvasClick)
    canvas.addEventListener("mousemove", (e) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      let foundHover = false
      dreams.forEach((dream, index) => {
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const angle = (index / dreams.length) * Math.PI * 2
        const radius = dream.vibe === "fame" ? 180 : dream.vibe === "defame" ? 80 : 130
        const x = centerX + Math.cos(angle) * radius
        const y = centerY + Math.sin(angle) * radius

        const distance = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2)
        if (distance < 25) {
          setHoveredDream(dream.id)
          foundHover = true
        }
      })
      if (!foundHover) {
        setHoveredDream(null)
        setHoveredInterpretation("")
      }
    })

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("click", handleCanvasClick)
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [dreams, hoveredDream, onDreamUpdate, onDreamDecay])

  const hoveredDreamData = dreams.find((d) => d.id === hoveredDream)

  return (
    <div className="relative w-full h-full flex flex-col">
      <div className="p-6 border-b border-border/30">
        <h2 className="text-2xl font-bold text-foreground mb-2">Dream Constellation</h2>
        <p className="text-muted-foreground text-sm">Click dreams to move them between Rising, Neutral, and Fading</p>
      </div>
      <canvas
        ref={canvasRef}
        className="flex-1 cursor-pointer"
        style={{
          background: "radial-gradient(circle, rgba(18,18,24,0.5) 0%, rgba(18,18,24,0.8) 100%)",
        }}
      />

      {hoveredDreamData && (
        <div className="absolute bottom-6 left-6 right-6 max-w-sm p-4 bg-gradient-to-r from-card/90 to-card/70 border border-border/50 rounded-lg backdrop-blur-sm">
          <p className="text-xs font-semibold text-foreground/70 mb-2">
            {hoveredDreamData.emotion.toUpperCase()} - {hoveredDreamData.vibe.toUpperCase()}
          </p>
          <p className="text-sm text-foreground/80 line-clamp-2 mb-2">{hoveredDreamData.text}</p>
          {isLoadingInterpretation ? (
            <p className="text-xs text-muted-foreground italic">AI interpreting...</p>
          ) : hoveredInterpretation ? (
            <p className="text-xs text-foreground/70 italic">{hoveredInterpretation}</p>
          ) : null}
        </div>
      )}
    </div>
  )
}
