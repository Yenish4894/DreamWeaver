"use client"

import { useEffect, useRef, useState } from "react"
import type { Dream, Emotion } from "@/app/page"

interface EvolvingFragmentsProps {
  dreams: Dream[]
  emotion: Emotion
  showSmall?: boolean
}

export default function EvolvingFragments({ dreams, emotion, showSmall }: EvolvingFragmentsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const [interactionLevel, setInteractionLevel] = useState(0)
  const [fragmentParams, setFragmentParams] = useState<{
    particleShape: string
    movementPattern: string
    colors: string[]
  } | null>(null)

  useEffect(() => {
    if (dreams.length > 0 && !fragmentParams) {
      generateFragmentParams()
    }
  }, [dreams[0]?.id])

  const generateFragmentParams = async () => {
    try {
      const res = await fetch("/api/fragment-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emotion,
          dreamText: dreams[0]?.text || "silence",
        }),
      })
      const data = await res.json()
      setFragmentParams({
        particleShape: data.particleShape || "circle",
        movementPattern: data.movementPattern || "orbiting",
        colors: data.particleColors || ["#00d9ff", "#7c3aed", "#d946ef"],
      })
    } catch (error) {
      console.error("[v0] Fragment params generation failed:", error)
      setFragmentParams({
        particleShape: "circle",
        movementPattern: "orbiting",
        colors: dreams[0]?.colors || ["#00d9ff", "#7c3aed", "#d946ef"],
      })
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

    let particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      life: number
    }> = []

    const drawFragments = () => {
      ctx.fillStyle = "rgba(18, 18, 24, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const emotionIntensity = interactionLevel
      const fragmentColors = fragmentParams?.colors || dreams[0]?.colors || ["#00d9ff", "#7c3aed", "#d946ef"]

      // Generate particles based on interaction
      if (Math.random() < emotionIntensity * 0.1) {
        particles.push({
          x: mouseRef.current.x,
          y: mouseRef.current.y,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          size: Math.random() * 3 + 1,
          color: fragmentColors[Math.floor(Math.random() * fragmentColors.length)],
          life: 1,
        })
      }

      // Update and draw particles
      particles = particles.filter((p) => {
        p.x += p.vx
        p.y += p.vy
        p.life -= 0.01
        p.size += emotionIntensity * 0.02

        ctx.fillStyle = p.color
        ctx.globalAlpha = p.life
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        return p.life > 0
      })

      ctx.globalAlpha = 1

      const shapeCount = Math.floor(3 + emotionIntensity * 3)
      for (let i = 0; i < shapeCount; i++) {
        const angle = (Date.now() / 3000 + (i / shapeCount) * Math.PI * 2) % (Math.PI * 2)
        const x = canvas.width / 2 + Math.cos(angle) * (100 + emotionIntensity * 50)
        const y = canvas.height / 2 + Math.sin(angle) * (100 + emotionIntensity * 50)

        ctx.strokeStyle = fragmentColors[i % fragmentColors.length]
        ctx.globalAlpha = 0.5 - emotionIntensity * 0.3
        ctx.lineWidth = 2 + emotionIntensity
        ctx.beginPath()
        ctx.arc(x, y, 30 + emotionIntensity * 20, 0, Math.PI * 2)
        ctx.stroke()
      }

      ctx.globalAlpha = 1
      requestAnimationFrame(drawFragments)
    }

    drawFragments()

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
      setInteractionLevel(Math.min(interactionLevel + 0.1, 1))
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", () => setInteractionLevel(Math.max(interactionLevel - 0.05, 0)))

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("mousemove", handleMouseMove)
    }
  }, [dreams, emotion, interactionLevel, fragmentParams])

  return (
    <div className="relative w-full h-full flex flex-col">
      {!showSmall && (
        <div className="p-6 border-b border-border/30">
          <h2 className="text-2xl font-bold text-foreground mb-2">Evolving Fragments</h2>
          <p className="text-muted-foreground text-sm">Move your cursor to evolve the dreamscape</p>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="flex-1"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, rgba(18,18,24,0.8) 100%)" }}
      />
    </div>
  )
}
