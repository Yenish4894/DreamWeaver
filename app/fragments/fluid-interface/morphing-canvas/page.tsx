"use client"

import { useRef, useEffect, useState } from "react"
import Link from "next/link"

export default function MorphingCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [decay, setDecay] = useState(0)
  const lastInteractionRef = useRef(Date.now())
  const particlesRef = useRef<
    Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      color: string
    }>
  >([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Initialize particles
    if (particlesRef.current.length === 0) {
      const colors = ["#00d9ff", "#7c3aed", "#d946ef", "#ff006e", "#ffd60a"]
      for (let i = 0; i < 50; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          radius: Math.random() * 5 + 2,
          color: colors[Math.floor(Math.random() * colors.length)],
        })
      }
    }

    const animate = () => {
      ctx.fillStyle = "rgba(12, 18, 45, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        ctx.fillStyle = particle.color
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
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
      onClick={() => {
        lastInteractionRef.current = Date.now()
        setDecay(0)
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" style={{ opacity: Math.max(1 - decay * 0.3, 0.7) }} />

      <div className="fixed top-6 left-6 z-50">
        <Link
          href="/fragments-hub"
          className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/50 hover:border-primary text-primary transition-all"
        >
          ← Back
        </Link>
      </div>

      <div className="absolute bottom-6 left-6 right-6 z-40 backdrop-blur-sm bg-card/50 p-4 rounded-lg border border-border/30">
        <h1 className="text-2xl font-bold mb-2">Morphing Canvas</h1>
        <p className="text-muted-foreground text-sm">
          Watch particles flow and morph with organic motion. Move your mouse to interact with the ethereal forms.
        </p>
      </div>
    </div>
  )
}
