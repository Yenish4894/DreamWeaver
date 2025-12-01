"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

interface Element {
  id: string
  name: string
  symbol: string
  field: string
  hue: number
  energy: number
}

interface Reaction {
  id: string
  element1: string
  element2: string
  result: string
  x: number
  y: number
  age: number
  color: string
}

const universalElements: Element[] = [
  { id: "1", name: "Hydrogen", symbol: "H", field: "Chemistry", hue: 200, energy: 1 },
  { id: "2", name: "Carbon", symbol: "C", field: "Chemistry", hue: 280, energy: 6 },
  { id: "3", name: "Photon", symbol: "γ", field: "Physics", hue: 60, energy: 10 },
  { id: "4", name: "DNA", symbol: "⚛", field: "Biology", hue: 120, energy: 8 },
  { id: "5", name: "Neuron", symbol: "⌘", field: "Neuroscience", hue: 320, energy: 7 },
  { id: "6", name: "Time", symbol: "t", field: "Physics", hue: 180, energy: 9 },
  { id: "7", name: "Entropy", symbol: "S", field: "Thermodynamics", hue: 0, energy: 5 },
  { id: "8", name: "Consciousness", symbol: "Ψ", field: "Philosophy", hue: 280, energy: 10 },
  { id: "9", name: "Gravity", symbol: "G", field: "Physics", hue: 240, energy: 8 },
]

const reactionResults: Record<string, string> = {
  "H+C": "💧 Water of Life",
  "H+γ": "⭐ Stellar Fusion",
  "C+⚛": "🧬 Organic Evolution",
  "⚛+⌘": "🧠 Neural Networks",
  "γ+t": "🌌 Spacetime Warping",
  "S+t": "⏳ Heat Death",
  "Ψ+⌘": "🔮 Sentient Mind",
  "G+t": "🌀 Black Hole",
  "γ+⚛": "🌱 Photosynthesis",
  "C+γ": "💎 Diamond Formation",
}

export default function MetamorphicMedia() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [selectedElements, setSelectedElements] = useState<string[]>([])
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null)
  const [totalEnergy, setTotalEnergy] = useState(0)
  const [universeAge, setUniverseAge] = useState(0)
  const reactionsRef = useRef<Reaction[]>([])

  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    setAudioContext(ctx)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setUniverseAge((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    reactionsRef.current = reactions
  }, [reactions])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    let animationId: number
    let frameCount = 0

    const animate = () => {
      ctx.fillStyle = "rgba(5, 5, 15, 0.15)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.strokeStyle = "rgba(100, 80, 200, 0.1)"
      ctx.lineWidth = 1
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
      }

      const currentReactions = reactionsRef.current

      currentReactions.forEach((reaction) => {
        const alpha = 1 - reaction.age / 100
        const radius = 20 + reaction.age * 2

        ctx.strokeStyle = reaction.color
        ctx.lineWidth = 3
        ctx.globalAlpha = alpha * 0.7
        ctx.beginPath()
        ctx.arc(reaction.x, reaction.y, radius, 0, Math.PI * 2)
        ctx.stroke()

        ctx.font = "bold 16px monospace"
        ctx.fillStyle = reaction.color
        ctx.globalAlpha = alpha
        ctx.fillText(reaction.result, reaction.x - 40, reaction.y - radius - 10)
      })

      ctx.globalAlpha = 1

      frameCount++
      if (frameCount % 5 === 0) {
        setReactions((prev) => prev.map((r) => ({ ...r, age: r.age + 5 })).filter((r) => r.age < 100))
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  const handleElementClick = (element: Element) => {
    if (selectedElements.length === 0) {
      setSelectedElements([element.id])
    } else if (selectedElements.length === 1) {
      const elem1 = universalElements.find((e) => e.id === selectedElements[0])!
      const reactionKey = `${elem1.symbol}+${element.symbol}`
      const reverseKey = `${element.symbol}+${elem1.symbol}`
      const result = reactionResults[reactionKey] || reactionResults[reverseKey] || "⚡ Unknown Reaction"

      const newReaction: Reaction = {
        id: Date.now().toString(),
        element1: elem1.name,
        element2: element.name,
        result,
        x: Math.random() * window.innerWidth * 0.8 + window.innerWidth * 0.1,
        y: Math.random() * window.innerHeight * 0.6 + window.innerHeight * 0.2,
        age: 0,
        color: `hsl(${(elem1.hue + element.hue) / 2}, 100%, 60%)`,
      }

      setReactions((prev) => [...prev, newReaction])
      setTotalEnergy((prev) => prev + elem1.energy + element.energy)
      setSelectedElements([])

      if (audioContext) {
        playReactionSound(elem1.energy + element.energy)
      }
    }
  }

  const playReactionSound = (energy: number) => {
    if (!audioContext) return

    const now = audioContext.currentTime
    const osc = audioContext.createOscillator()
    const gain = audioContext.createGain()

    osc.connect(gain)
    gain.connect(audioContext.destination)

    const freq = 200 + energy * 50
    osc.type = "sine"
    osc.frequency.setValueAtTime(freq, now)
    osc.frequency.exponentialRampToValueAtTime(freq * 2, now + 0.5)

    gain.gain.setValueAtTime(0.3, now)
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5)

    osc.start(now)
    osc.stop(now + 0.5)
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      <Link
        href="/"
        className="absolute top-6 left-6 z-20 text-purple-400 hover:text-purple-300 transition-colors font-semibold"
      >
        ← Back
      </Link>

      <div className="absolute top-6 right-6 z-20 bg-slate-900/70 backdrop-blur-md p-4 rounded-xl border border-purple-400/30">
        <p className="text-xs text-purple-300">Universe Age</p>
        <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text">
          {universeAge}s
        </p>
        <p className="text-xs text-purple-300 mt-2">Total Energy</p>
        <p className="text-xl font-bold text-yellow-400">{totalEnergy} ⚡</p>
        <p className="text-xs text-purple-300 mt-2">Reactions</p>
        <p className="text-xl font-bold text-cyan-400">{reactions.length}</p>
      </div>

      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-center pointer-events-none z-0">
        <h1 className="text-6xl font-bold text-purple-400/20">Reality Forge</h1>
        <p className="text-purple-300/20 mt-2 text-lg">Combine elements. Build your universe.</p>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 w-11/12 max-w-7xl">
        <div className="bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-purple-400/40 shadow-2xl">
          <p className="text-center text-purple-300 mb-5 font-bold text-lg">
            {selectedElements.length === 0 ? "🌌 Select first element to begin" : "⚡ Select second element to react"}
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3 md:gap-4">
            {universalElements.map((element) => {
              const isSelected = selectedElements.includes(element.id)
              return (
                <button
                  key={element.id}
                  onClick={() => handleElementClick(element)}
                  className={`group relative aspect-square rounded-xl transition-all duration-300 hover:scale-110 cursor-pointer border-2 ${
                    isSelected ? "scale-110 shadow-2xl z-10" : ""
                  }`}
                  style={{
                    borderColor: `hsl(${element.hue}, 100%, ${isSelected ? "70%" : "50%"})`,
                    backgroundColor: isSelected
                      ? `hsla(${element.hue}, 100%, 40%, 0.5)`
                      : `hsla(${element.hue}, 100%, 30%, 0.25)`,
                    boxShadow: isSelected ? `0 0 40px hsl(${element.hue}, 100%, 60%)` : "none",
                  }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                    <p
                      className="text-2xl md:text-3xl font-bold mb-1"
                      style={{
                        color: `hsl(${element.hue}, 100%, 80%)`,
                        textShadow: `0 0 15px hsl(${element.hue}, 100%, 60%)`,
                      }}
                    >
                      {element.symbol}
                    </p>
                    <p className="text-[10px] md:text-xs text-white/90 font-semibold text-center">{element.name}</p>
                    <p className="text-[8px] md:text-[10px] text-white/60 mt-0.5 text-center">{element.field}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
