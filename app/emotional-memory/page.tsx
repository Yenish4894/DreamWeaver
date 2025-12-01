"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

interface Memory {
  id: string
  text: string
  poetry?: string
  emotion: string
  timestamp: Date
  x: number
  y: number
  opacity: number
  isLoading?: boolean
}

export default function EmotionalMemory() {
  const [memories, setMemories] = useState<Memory[]>([])
  const [inputValue, setInputValue] = useState("")
  const [typingSpeed, setTypingSpeed] = useState(0)
  const [selectedEmotion, setSelectedEmotion] = useState("peaceful")
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lastTypeRef = useRef(Date.now())
  const lastDecayRef = useRef(Date.now())

  const emotions = ["joyful", "melancholic", "anxious", "peaceful", "surreal"]
  const emotionColors: Record<string, string> = {
    joyful: "from-yellow-400 to-orange-400",
    melancholic: "from-blue-400 to-indigo-400",
    anxious: "from-red-400 to-pink-400",
    peaceful: "from-emerald-400 to-cyan-400",
    surreal: "from-purple-400 to-pink-400",
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const timeSinceType = Date.now() - lastTypeRef.current
      const speed = Math.max(0, 1 - timeSinceType / 2000)
      setTypingSpeed(speed)
    }, 200) // Changed from 50ms to 200ms
    return () => clearInterval(interval)
  }, [])

  const handleType = (value: string) => {
    setInputValue(value)
    lastTypeRef.current = Date.now()
  }

  const generatePoetry = (memoryText: string, emotion: string): string => {
    const poeticPhrases: Record<string, string[]> = {
      joyful: ["sunshine blooms eternal", "laughter echoes forever", "joy radiates outward", "warmth fills the void"],
      melancholic: [
        "tears crystallize slowly",
        "sorrow becomes beauty",
        "rain whispers softly",
        "blue memories linger",
      ],
      anxious: [
        "heartbeat accelerates time",
        "uncertainty becomes art",
        "fear transforms now",
        "trembling reveals truth",
      ],
      peaceful: [
        "silence speaks volumes",
        "calm becomes everything",
        "breath slows infinity",
        "stillness holds worlds",
      ],
      surreal: ["reality bends gently", "dreams leak through", "time dissolves here", "logic fades away"],
    }

    const phrases = poeticPhrases[emotion] || poeticPhrases.peaceful
    return phrases[Math.floor(Math.random() * phrases.length)]
  }

  const addMemory = () => {
    if (!inputValue.trim()) return

    console.log("[v0] Adding memory:", inputValue) // Debug log

    const newMemory: Memory = {
      id: Date.now().toString(),
      text: inputValue,
      poetry: generatePoetry(inputValue, selectedEmotion),
      emotion: selectedEmotion,
      timestamp: new Date(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 20,
      opacity: 1,
    }

    console.log("[v0] New memory created:", newMemory) // Debug log

    setMemories((prev) => {
      const updated = [newMemory, ...prev]
      console.log("[v0] Updated memories array:", updated) // Debug log
      return updated
    })
    setInputValue("")
    lastTypeRef.current = Date.now()
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      // Only update every 2 seconds
      if (now - lastDecayRef.current > 2000) {
        lastDecayRef.current = now
        setMemories(
          (prev) =>
            prev
              .map((m) => ({
                ...m,
                opacity: m.opacity - 0.01, // Faster decay per update but less frequent
              }))
              .filter((m) => m.opacity > 0), // Remove invisible memories
        )
      }
    }, 2000) // Changed from 100ms to 2000ms
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-purple-900 to-slate-900">
      <Link href="/" className="fixed top-6 left-6 z-20 text-purple-400 hover:text-purple-300 transition-colors">
        ← Back
      </Link>

      {/* Memory particles */}
      <div className="absolute inset-0 z-0">
        {memories.map((memory, idx) => {
          console.log("[v0] Rendering memory:", memory.id, memory.poetry) // Debug log
          return (
            <div
              key={memory.id}
              className={`absolute p-4 rounded-lg backdrop-blur-sm bg-gradient-to-r ${emotionColors[memory.emotion]} shadow-2xl max-w-[200px] text-center transition-all duration-700 ease-out animate-[float_6s_ease-in-out_infinite]`}
              style={{
                left: `${memory.x}%`,
                top: `${Math.min(memory.y, 70)}%`,
                opacity: memory.opacity,
                fontSize: `${16 + memory.opacity * 8}px`,
                transform: `scale(${0.9 + memory.opacity * 0.1})`,
                animationDelay: `${idx * 0.3}s`,
              }}
              title={memory.text}
            >
              <p className="text-white font-bold drop-shadow-2xl line-clamp-3">{memory.poetry || memory.text}</p>
              <p className="text-white/60 text-xs mt-1">{memory.emotion}</p>
            </div>
          )
        })}
      </div>

      {/* Emotional trail line */}
      <svg className="absolute inset-0" style={{ pointerEvents: "none" }}>
        <polyline
          points={memories
            .map((m) => `${(m.x / 100) * window.innerWidth},${(m.y / 100) * window.innerHeight}`)
            .join(" ")}
          stroke="rgba(147,112,219,0.3)"
          strokeWidth="2"
          fill="none"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Input area */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent p-8 pt-20 z-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-4 flex gap-2 flex-wrap justify-center">
            {emotions.map((emotion) => (
              <button
                key={emotion}
                onClick={() => setSelectedEmotion(emotion)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105 ${
                  selectedEmotion === emotion
                    ? `bg-gradient-to-r ${emotionColors[emotion]} text-white shadow-lg`
                    : "bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-700/70"
                }`}
              >
                {emotion}
              </button>
            ))}
          </div>

          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => handleType(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) addMemory()
            }}
            placeholder="Share a memory... Your emotions shape reality."
            className="w-full p-5 rounded-xl bg-slate-800/70 border-2 transition-all duration-300 text-white placeholder-slate-400 resize-none focus:outline-none focus:shadow-lg"
            style={{
              borderColor: `rgba(147, 112, 219, ${0.3 + typingSpeed * 0.4})`,
              backgroundColor: `rgba(30, 41, 59, ${0.7 + typingSpeed * 0.2})`,
            }}
            rows={4}
          />

          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-slate-400">
              Total memories: <span className="text-purple-400 font-bold">{memories.length}</span> • Press Ctrl+Enter to
              save
            </p>
            <button
              onClick={addMemory}
              disabled={!inputValue.trim()}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Remember This
            </button>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <h1 className="text-5xl font-bold text-purple-400/20">Emotional Memory</h1>
        <p className="text-purple-300/20 mt-2">Your feelings become permanent</p>
      </div>
    </div>
  )
}
