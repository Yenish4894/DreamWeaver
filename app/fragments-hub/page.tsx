"use client"

import { useRef } from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const fragments = [
  {
    id: "fluid-interface",
    title: "Fluid Interface",
    description: "Organic UI that shifts and reacts to your emotional presence",
    color: "from-cyan-400 to-blue-500",
    pages: [
      { name: "Morphing Canvas", path: "/fragments/fluid-interface/morphing-canvas" },
      { name: "Gesture Playground", path: "/fragments/fluid-interface/gesture-playground" },
      { name: "Liquid Buttons", path: "/fragments/fluid-interface/liquid-buttons" },
      { name: "Breathing Forms", path: "/fragments/fluid-interface/breathing-forms" },
    ],
  },
  {
    id: "emotional-memory",
    title: "Emotional Memory",
    description: "The system remembers your feelings, not just data",
    color: "from-purple-400 to-pink-500",
    pages: [
      { name: "Memory Lane", path: "/fragments/emotional-memory/memory-lane" },
      { name: "Emotional Echoes", path: "/fragments/emotional-memory/emotional-echoes" },
      { name: "Feeling Replays", path: "/fragments/emotional-memory/feeling-replays" },
      { name: "Emotional Genealogy", path: "/fragments/emotional-memory/emotional-genealogy" },
    ],
  },
  {
    id: "voice-of-machine",
    title: "Voice of the Machine",
    description: "AI narration and soundscapes that speak your deepest thoughts",
    color: "from-orange-400 to-red-500",
    pages: [
      { name: "Sonic Palette", path: "/fragments/voice-of-machine/sonic-palette" },
      { name: "AI Poetry", path: "/fragments/voice-of-machine/ai-poetry" },
      { name: "Emotional Whispers", path: "/fragments/voice-of-machine/emotional-whispers" },
      { name: "Narrative Weaver", path: "/fragments/voice-of-machine/narrative-weaver" },
    ],
  },
  {
    id: "metamorphic-media",
    title: "Metamorphic Media",
    description: "Visuals and sounds that evolve with your interaction",
    color: "from-green-400 to-teal-500",
    pages: [
      { name: "Evolving Particles", path: "/fragments/metamorphic-media/evolving-particles" },
      { name: "Shape Shifter", path: "/fragments/metamorphic-media/shape-shifter" },
      { name: "Mutation Gallery", path: "/fragments/metamorphic-media/mutation-gallery" },
      { name: "Living Canvas", path: "/fragments/metamorphic-media/living-canvas" },
    ],
  },
  {
    id: "temporal-shifts",
    title: "Temporal Shifts",
    description: "Strange time behavior creates surreal non-linear experiences",
    color: "from-indigo-400 to-purple-500",
    pages: [
      { name: "Time Decay", path: "/fragments/temporal-shifts/time-decay" },
      { name: "Fractal Timeline", path: "/fragments/temporal-shifts/fractal-timeline" },
      { name: "Chronological Chaos", path: "/fragments/temporal-shifts/chronological-chaos" },
      { name: "Loop Universe", path: "/fragments/temporal-shifts/loop-universe" },
    ],
  },
]

export default function FragmentsHub() {
  const [selectedFragment, setSelectedFragment] = useState<string | null>(null)
  const [decay, setDecay] = useState(0)
  const lastInteractionRef = useRef(Date.now())

  useEffect(() => {
    const interval = setInterval(() => {
      const timeSince = Date.now() - lastInteractionRef.current
      setDecay(Math.min(timeSince / 20000, 1))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const handleInteraction = () => {
    lastInteractionRef.current = Date.now()
    setDecay(0)
  }

  return (
    <div
      className="min-h-screen bg-background text-foreground overflow-hidden transition-all duration-500"
      style={{
        opacity: Math.max(1 - decay * 0.3, 0.7),
        filter: `blur(${decay * 1.5}px)`,
      }}
      onMouseMove={handleInteraction}
      onClick={handleInteraction}
    >
      {/* Navigation Back */}
      <div className="fixed top-6 left-6 z-50">
        <Link
          href="/"
          className="px-4 py-2 rounded-lg bg-primary/20 border border-primary/50 hover:border-primary text-primary transition-all duration-300"
        >
          ← Back to Dreams
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
            Dream Fragments
          </h1>
          <p className="text-muted-foreground text-lg">
            Explore 5 unique fragments, each with 4 interactive experiences. Discover how emotions shape reality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fragments.map((fragment) => (
            <div
              key={fragment.id}
              className="group relative rounded-2xl overflow-hidden border border-border/30 hover:border-border/60 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedFragment(selectedFragment === fragment.id ? null : fragment.id)}
            >
              {/* Background Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${fragment.color} opacity-10 group-hover:opacity-20 transition-opacity`}
              />

              {/* Content */}
              <div className="relative p-6 backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-2">{fragment.title}</h2>
                <p className="text-muted-foreground text-sm mb-6">{fragment.description}</p>

                {/* Expandable Pages List */}
                {selectedFragment === fragment.id && (
                  <div className="space-y-2 pt-4 border-t border-border/30">
                    {fragment.pages.map((page) => (
                      <Link
                        key={page.path}
                        href={page.path}
                        className="block p-3 rounded-lg bg-background/50 hover:bg-primary/20 border border-border/30 hover:border-primary/50 transition-all text-sm group/page"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between">
                          <span>{page.name}</span>
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover/page:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Collapsed View */}
                {selectedFragment !== fragment.id && (
                  <div className="text-sm text-muted-foreground">4 unique experiences →</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Screen Decay Overlay */}
      {decay > 0.2 && (
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,${decay * 0.4}) 100%)`,
            zIndex: 5,
          }}
        />
      )}
    </div>
  )
}
