"use client"

import { useEffect, useRef } from "react"

interface Dream {
  id: string
  text: string
  emotion: string
  colors: string[]
}

interface DreamCanvasProps {
  dreams: Dream[]
  currentEmotion: string
  activeNarration: string | null
}

export default function DreamCanvas({ dreams, currentEmotion, activeNarration }: DreamCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const timeRef = useRef(0)

  interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    radius: number
    color: string
    alpha: number
  }

  const getEmotionIntensity = () => {
    switch (currentEmotion) {
      case "joyful":
        return 0.7
      case "melancholic":
        return 0.4
      case "anxious":
        return 0.9
      case "peaceful":
        return 0.3
      case "surreal":
        return 0.6
      default:
        return 0.5
    }
  }

  const getEmotionColors = (): string[] => {
    switch (currentEmotion) {
      case "joyful":
        return ["#ffd60a", "#ffc300", "#ffb703"]
      case "melancholic":
        return ["#457b9d", "#1d3557", "#e63946"]
      case "anxious":
        return ["#ff006e", "#8338ec", "#3a86ff"]
      case "peaceful":
        return ["#00d9ff", "#7c3aed", "#d946ef"]
      case "surreal":
        return ["#ff48a4", "#ff006e", "#8338ec"]
      default:
        return ["#7c3aed", "#00d9ff", "#d946ef"]
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

    // Initialize particles
    const colors = getEmotionColors()
    particlesRef.current = Array.from({ length: 50 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      radius: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.3,
    }))

    const animate = () => {
      // Clear canvas with fade effect
      ctx.fillStyle = "rgba(19, 20, 35, 0.15)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const colors = getEmotionColors()
      const intensity = getEmotionIntensity()
      timeRef.current += 0.01

      // Update and draw particles
      particlesRef.current.forEach((p, i) => {
        // Organic floating movement
        p.x += p.vx + Math.sin(timeRef.current + i) * intensity
        p.y += p.vy + Math.cos(timeRef.current + i * 0.7) * intensity

        // Breathing effect
        p.radius = Math.abs(Math.sin(timeRef.current * 0.5 + i) * 3 + 2)
        p.alpha = Math.abs(Math.sin(timeRef.current * 0.3 + i * 0.5) * 0.5 + 0.4)

        // Wrap around edges
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        // Draw particle
        ctx.fillStyle =
          p.color +
          Math.floor(p.alpha * 255)
            .toString(16)
            .padStart(2, "0")
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fill()

        // Draw connecting lines (neural network effect)
        particlesRef.current.forEach((other, j) => {
          if (i < j) {
            const dx = p.x - other.x
            const dy = p.y - other.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 150) {
              ctx.strokeStyle =
                colors[0] +
                Math.floor((1 - distance / 150) * 50)
                  .toString(16)
                  .padStart(2, "0")
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(p.x, p.y)
              ctx.lineTo(other.x, other.y)
              ctx.stroke()
            }
          }
        })
      })

      // Draw emotional aura based on dream count
      if (dreams.length > 0) {
        const haloX = canvas.width * 0.5
        const haloY = canvas.height * 0.5
        const haloSize = 100 + Math.sin(timeRef.current * 0.5) * 50 + dreams.length * 20

        ctx.strokeStyle = colors[1] + "33"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(haloX, haloY, haloSize, 0, Math.PI * 2)
        ctx.stroke()

        ctx.strokeStyle = colors[2] + "22"
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.arc(haloX, haloY, haloSize * 0.7, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Draw narration indicator
      if (activeNarration) {
        const pulseSize = 30 + Math.sin(timeRef.current * 2) * 10
        ctx.fillStyle = colors[0] + "66"
        ctx.beginPath()
        ctx.arc(canvas.width - 50, 50, pulseSize, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = colors[0]
        ctx.font = "12px sans-serif"
        ctx.fillText("Narrating...", canvas.width - 95, 55)
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [currentEmotion, dreams.length, activeNarration])

  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-background via-card to-background">
      <canvas ref={canvasRef} className="w-full h-full" />

      {/* Ambient Title */}
      <div className="absolute top-8 left-8 z-10">
        <p className="text-xs text-muted-foreground opacity-50">Emotional Frequency</p>
        <p className="text-2xl font-bold text-primary/80 capitalize">{currentEmotion}</p>
      </div>

      {/* Mobile Fallback */}
      <div className="lg:hidden absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Canvas optimized for desktop</p>
          <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary to-secondary animate-breathe" />
        </div>
      </div>
    </div>
  )
}
