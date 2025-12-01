"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"

type FluidMode = "paint" | "vortex" | "gravity" | "repulsion" | "wave"

export default function FluidInterface() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [particles, setParticles] = useState<
    Array<{ x: number; y: number; vx: number; vy: number; life: number; hue: number }>
  >([])
  const [mode, setMode] = useState<FluidMode>("paint")
  const [screenDecay, setScreenDecay] = useState(0)
  const decayTimeRef = useRef(Date.now())
  const [stats, setStats] = useState({ particles: 0, energy: 0, reynolds: 0 })

  // Screen decay on idle
  useEffect(() => {
    const handleInteraction = () => {
      decayTimeRef.current = Date.now()
      setScreenDecay(0)
    }

    const decayInterval = setInterval(() => {
      const timeSince = (Date.now() - decayTimeRef.current) / 1000
      setScreenDecay(Math.min(timeSince / 10, 1))
    }, 1000) // Reduced frequency from 100ms to 1000ms

    window.addEventListener("mousemove", handleInteraction)
    window.addEventListener("click", handleInteraction)
    window.addEventListener("keydown", handleInteraction)

    return () => {
      clearInterval(decayInterval)
      window.removeEventListener("mousemove", handleInteraction)
      window.removeEventListener("click", handleInteraction)
      window.removeEventListener("keydown", handleInteraction)
    }
  }, [])

  // Particle animation with physics
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    let animationId: number
    let frameCount = 0 // Added frame counter to reduce stat updates

    const animate = () => {
      ctx.fillStyle = "rgba(10, 15, 30, 0.08)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      setParticles((prev) => {
        let totalEnergy = 0

        const updated = prev
          .map((p) => {
            let fx = 0
            let fy = 0

            // Simplified fluid dynamics - particles influence each other
            prev.forEach((other) => {
              if (other === p) return
              const dx = other.x - p.x
              const dy = other.y - p.y
              const dist = Math.sqrt(dx * dx + dy * dy)

              if (dist < 50 && dist > 0) {
                // Attraction at medium distance (cohesion)
                const force = 0.02
                fx += (dx / dist) * force
                fy += (dy / dist) * force
              }
            })

            const newVx = p.vx + fx
            const newVy = p.vy + fy + 0.02 // gravity

            const speed = Math.sqrt(newVx * newVx + newVy * newVy)
            totalEnergy += speed

            return {
              ...p,
              x: p.x + newVx,
              y: p.y + newVy,
              vx: newVx * 0.99, // air resistance
              vy: newVy * 0.99,
              life: p.life - 0.005,
              hue: (p.hue + 0.5) % 360, // color shift over time
            }
          })
          .filter((p) => p.life > 0 && p.x > -50 && p.x < canvas.width + 50 && p.y < canvas.height + 50)

        updated.forEach((p, i) => {
          // Draw connections to nearby particles
          updated.slice(i + 1).forEach((other) => {
            const dx = other.x - p.x
            const dy = other.y - p.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < 60) {
              ctx.strokeStyle = `hsla(${(p.hue + other.hue) / 2}, 70%, 60%, ${0.2 * (1 - dist / 60)})`
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(p.x, p.y)
              ctx.lineTo(other.x, other.y)
              ctx.stroke()
            }
          })

          // Draw particle with glow
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8)
          gradient.addColorStop(0, `hsla(${p.hue}, 80%, 70%, ${p.life * 0.9})`)
          gradient.addColorStop(0.5, `hsla(${p.hue}, 70%, 50%, ${p.life * 0.5})`)
          gradient.addColorStop(1, `hsla(${p.hue}, 60%, 30%, 0)`)

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(p.x, p.y, 8, 0, Math.PI * 2)
          ctx.fill()
        })

        frameCount++
        if (frameCount % 10 === 0) {
          const avgSpeed = updated.length > 0 ? totalEnergy / updated.length : 0
          const viscosity = 0.01
          const density = updated.length / 1000
          const reynoldsNumber = (density * avgSpeed) / viscosity

          setStats({
            particles: updated.length,
            energy: Math.round(totalEnergy),
            reynolds: Math.round(reynoldsNumber * 10),
          })
        }

        return updated
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationId)
  }, [])

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    let newParticles: Array<{ x: number; y: number; vx: number; vy: number; life: number; hue: number }> = []

    switch (mode) {
      case "paint":
        // Standard particle emission
        newParticles = Array.from({ length: 30 }, () => ({
          x,
          y,
          vx: (Math.random() - 0.5) * 5,
          vy: (Math.random() - 0.5) * 5 - 2,
          life: 1,
          hue: Math.random() * 60 + 180, // blue-cyan range
        }))
        break

      case "vortex":
        // Circular vortex emission
        newParticles = Array.from({ length: 40 }, (_, i) => {
          const angle = (i / 40) * Math.PI * 2
          const radius = 3
          return {
            x: x + Math.cos(angle) * radius,
            y: y + Math.sin(angle) * radius,
            vx: Math.sin(angle) * 4,
            vy: -Math.cos(angle) * 4,
            life: 1,
            hue: (angle * 180) / Math.PI, // rainbow vortex
          }
        })
        break

      case "gravity":
        // Gravity well - pulls nearby particles
        setParticles((prev) =>
          prev.map((p) => {
            const dx = x - p.x
            const dy = y - p.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 200 && dist > 0) {
              const force = 2 / dist
              return {
                ...p,
                vx: p.vx + (dx / dist) * force,
                vy: p.vy + (dy / dist) * force,
                hue: 280, // purple for gravity
              }
            }
            return p
          }),
        )
        newParticles = Array.from({ length: 10 }, () => ({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          vx: 0,
          vy: 0,
          life: 0.5,
          hue: 280,
        }))
        break

      case "repulsion":
        // Repulsion field - pushes particles away
        setParticles((prev) =>
          prev.map((p) => {
            const dx = p.x - x
            const dy = p.y - y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 150 && dist > 0) {
              const force = 3 / dist
              return {
                ...p,
                vx: p.vx + (dx / dist) * force,
                vy: p.vy + (dy / dist) * force,
                hue: 0, // red for repulsion
              }
            }
            return p
          }),
        )
        newParticles = Array.from({ length: 5 }, () => ({
          x: x + (Math.random() - 0.5) * 10,
          y: y + (Math.random() - 0.5) * 10,
          vx: 0,
          vy: 0,
          life: 0.3,
          hue: 0,
        }))
        break

      case "wave":
        // Wave propagation
        newParticles = Array.from({ length: 50 }, (_, i) => {
          const angle = (i / 50) * Math.PI * 2
          const speed = 6
          return {
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            hue: 120, // green for waves
          }
        })
        break
    }

    setParticles((prev) => [...prev, ...newParticles])
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950">
      {/* Canvas for particles */}
      <canvas ref={canvasRef} onClick={handleCanvasClick} className="absolute inset-0 cursor-crosshair" />

      {/* Screen decay overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-all duration-300"
        style={{
          opacity: screenDecay * 0.4,
          filter: `blur(${screenDecay * 3}px)`,
        }}
      />

      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 pointer-events-none z-10 max-w-4xl px-6">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-cyan-300 mb-3 drop-shadow-[0_0_30px_rgba(34,211,238,0.9)]">
            Computational Fluid Dynamics
          </h1>
          <p className="text-cyan-200 mb-2 text-base drop-shadow-[0_0_15px_rgba(103,232,249,0.7)]">
            Paint with forces. Create turbulence. Witness emergence.
          </p>
          <p className="text-cyan-200/80 text-sm leading-relaxed drop-shadow-[0_0_12px_rgba(103,232,249,0.5)]">
            Real fluid behavior simulated through particle systems. Each mode represents fundamental physics: laminar
            flow, vorticity, gravitational fields, divergence, and wave propagation.
          </p>
        </div>
      </div>

      <div className="fixed left-6 top-52 space-y-2 z-20 bg-slate-900/20 backdrop-blur-md p-4 rounded-xl border border-cyan-500/30 shadow-2xl max-w-[240px]">
        <div className="text-cyan-400 text-sm font-bold mb-3">Interaction Mode</div>
        {[
          { mode: "paint", label: "Paint Flow", color: "#06b6d4", desc: "Laminar" },
          { mode: "vortex", label: "Vortex", color: "#a855f7", desc: "Rotational" },
          { mode: "gravity", label: "Gravity Well", color: "#8b5cf6", desc: "Attraction" },
          { mode: "repulsion", label: "Repulsion", color: "#ef4444", desc: "Divergence" },
          { mode: "wave", label: "Wave Field", color: "#10b981", desc: "Propagation" },
        ].map((item) => (
          <button
            key={item.mode}
            onClick={() => setMode(item.mode as FluidMode)}
            className={`w-full px-4 py-3 rounded-lg border transition-all text-left hover:scale-[1.02] ${
              mode === item.mode ? "shadow-lg" : ""
            }`}
            style={{
              borderColor: mode === item.mode ? item.color : `${item.color}33`,
              backgroundColor: mode === item.mode ? `${item.color}40` : `${item.color}10`,
              color: mode === item.mode ? "#fff" : `${item.color}cc`,
            }}
          >
            <div className="font-semibold text-sm">{item.label}</div>
            <div className="text-xs opacity-70 mt-0.5">{item.desc}</div>
          </button>
        ))}
      </div>

      <div className="fixed right-6 top-64 bg-slate-900/20 backdrop-blur-md px-5 py-4 rounded-xl border border-cyan-500/30 z-20 min-w-[220px] shadow-2xl">
        <div className="text-cyan-400 text-sm font-bold mb-3">Fluid Dynamics</div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-cyan-300/80">
            <span>Particles:</span>
            <span className="text-cyan-300 font-mono font-bold">{stats.particles}</span>
          </div>
          <div className="flex justify-between text-cyan-300/80">
            <span>Energy:</span>
            <span className="text-cyan-300 font-mono font-bold">{stats.energy}</span>
          </div>
          <div className="flex justify-between text-cyan-300/80">
            <span>Reynolds #:</span>
            <span className="text-cyan-300 font-mono font-bold">{stats.reynolds}</span>
          </div>
        </div>
        <div className="text-[10px] text-cyan-300/50 mt-4 leading-relaxed">
          Reynolds number indicates flow regime: low = laminar, high = turbulent
        </div>
      </div>

      <Link
        href="/"
        className="fixed right-6 top-6 px-4 py-2 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition-all z-20"
      >
        Back
      </Link>
    </div>
  )
}
