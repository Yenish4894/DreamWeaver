"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"

export default function EvolvingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [decay, setDecay] = useState(0)
  const lastInteractionRef = useRef(Date.now())
  const particlesRef = useRef<any[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Initialize particles
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 100; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          radius: Math.random() * 8 + 2,
          color: ["#00d9ff", "#7c3aed", "#d946ef", "#ff006e"][Math.floor(Math.random() * 4)],
          age: 0,
        })
      }
    }

    const animate = () => {
      ctx.fillStyle = "rgba(12, 18, 45, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle, index) => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.age++

        // Wrap around
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        // Attract to mouse
        const dx = mouseRef.current.x - particle.x
        const dy = mouseRef.current.y - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < 200) {
          particle.vx += (dx / distance) * 0.3
          particle.vy += (dy / distance) * 0.3
        }

        // Draw
        ctx.fillStyle = particle.color
        ctx.globalAlpha = 0.6
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fill()

        // Draw connections
        ctx.globalAlpha = 0.1
        ctx.strokeStyle = particle.color
        for (let j = index + 1; j < Math.min(index + 5, particlesRef.current.length); j++) {
          const other = particlesRef.current[j]
          const dx = other.x - particle.x
          const dy = other.y - particle.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.stroke()
          }
        }

        ctx.globalAlpha = 1
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
      lastInteractionRef.current = Date.now()
      setDecay(0)
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => window.removeEventListener("mousemove", handleMouseMove)
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
      className="w-full h-screen relative overflow-hidden bg-background"
      style={{ opacity: Math.max(1 - decay * 0.3, 0.7) }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="fixed top-6 left-6 z-50">
        <Link
          href="/fragments-hub"
          className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/50 hover:border-primary text-primary transition-all"
        >
          ← Back
        </Link>
      </div>

      <div className="absolute bottom-6 left-6 right-6 z-40 backdrop-blur-sm bg-card/50 p-4 rounded-lg border border-border/30 max-w-md">
        <h1 className="text-2xl font-bold mb-2">Evolving Particles</h1>
        <p className="text-muted-foreground text-sm">
          Move your cursor to attract and mutate the particle network. Watch connections form and dissolve.
        </p>
      </div>
    </div>
  )
}
