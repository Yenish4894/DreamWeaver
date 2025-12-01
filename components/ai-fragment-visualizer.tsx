"use client"

import { useEffect, useRef, useState } from "react"
import type { Emotion } from "@/app/page"

interface FragmentData {
  particleColors: string[]
  particleShape: "circle" | "wave" | "spiral" | "constellation"
  movementPattern: "orbiting" | "drifting" | "pulsing" | "fragmenting"
  intensity: number
  visualMetaphor: string
}

interface AIFragmentVisualizerProps {
  dreamText: string
  emotion: Emotion
}

export default function AIFragmentVisualizer({ dreamText, emotion }: AIFragmentVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [fragmentData, setFragmentData] = useState<FragmentData | null>(null)
  const particlesRef = useRef<
    Array<{
      x: number
      y: number
      vx: number
      vy: number
      color: string
      size: number
    }>
  >([])
  const animationFrameRef = useRef<number>()
  const timeRef = useRef(0)

  useEffect(() => {
    if (dreamText.length > 10) {
      generateFragmentDescription()
    }
  }, [dreamText, emotion])

  const generateFragmentDescription = async () => {
    try {
      const res = await fetch("/api/fragment-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emotion, dreamText }),
      })
      const data = await res.json()
      setFragmentData(data)
      initializeParticles(data)
    } catch (error) {
      console.error("[v0] Fragment generation error:", error)
    }
  }

  const initializeParticles = (data: FragmentData) => {
    const canvas = canvasRef.current
    if (!canvas) return

    particlesRef.current = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      color: data.particleColors[Math.floor(Math.random() * data.particleColors.length)],
      size: Math.random() * 3 + 1,
    }))
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !fragmentData) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    const animate = () => {
      ctx.fillStyle = "rgba(18, 18, 24, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      timeRef.current += 0.01

      const particles = particlesRef.current

      particles.forEach((particle) => {
        if (fragmentData.movementPattern === "orbiting") {
          const angle = timeRef.current + Math.atan2(particle.y - canvas.height / 2, particle.x - canvas.width / 2)
          const distance = Math.hypot(particle.x - canvas.width / 2, particle.y - canvas.height / 2)
          particle.x = canvas.width / 2 + Math.cos(angle) * distance
          particle.y = canvas.height / 2 + Math.sin(angle) * distance
        } else if (fragmentData.movementPattern === "drifting") {
          particle.x += particle.vx * 0.5
          particle.y += particle.vy * 0.5
        } else if (fragmentData.movementPattern === "pulsing") {
          const pulse = Math.sin(timeRef.current) * 10
          particle.x += Math.cos(Math.atan2(particle.y, particle.x)) * pulse * 0.01
          particle.y += Math.sin(Math.atan2(particle.y, particle.x)) * pulse * 0.01
        } else if (fragmentData.movementPattern === "fragmenting") {
          particle.x += particle.vx
          particle.y += particle.vy
        }

        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        ctx.fillStyle = particle.color
        ctx.globalAlpha = 0.7 + Math.sin(timeRef.current) * 0.3
        ctx.beginPath()

        if (fragmentData.particleShape === "circle") {
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        } else if (fragmentData.particleShape === "wave") {
          ctx.rect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size)
        } else if (fragmentData.particleShape === "spiral") {
          ctx.arc(particle.x, particle.y, particle.size * 1.5, 0, Math.PI * 2)
          ctx.fillStyle = particle.color
        }

        ctx.fill()
      })

      ctx.strokeStyle = fragmentData.particleColors[0]
      ctx.globalAlpha = 0.2
      ctx.lineWidth = 1

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      ctx.globalAlpha = 1
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [fragmentData])

  return (
    <div className="space-y-3">
      <div>
        <p className="text-xs font-semibold text-foreground/70 mb-2">
          Fragment Evolution: <span className="text-primary capitalize">{fragmentData?.visualMetaphor}</span>
        </p>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-48 rounded-lg border border-border/30 cursor-pointer"
        style={{
          background: "radial-gradient(circle at center, rgba(18,18,24,0.5) 0%, rgba(18,18,24,0.8) 100%)",
        }}
      />
    </div>
  )
}
