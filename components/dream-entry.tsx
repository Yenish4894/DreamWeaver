"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"

type Emotion = "joyful" | "melancholic" | "anxious" | "peaceful" | "surreal"

interface DreamEntryProps {
  onSubmit: (text: string, emotion: Emotion) => void
  onCancel: () => void
}

const emotions: { value: Emotion; label: string }[] = [
  { value: "peaceful", label: "Peaceful" },
  { value: "joyful", label: "Joyful" },
  { value: "surreal", label: "Surreal" },
  { value: "melancholic", label: "Melancholic" },
  { value: "anxious", label: "Intense" },
]

export default function DreamEntry({ onSubmit, onCancel }: DreamEntryProps) {
  const [text, setText] = useState("")
  const [emotion, setEmotion] = useState<Emotion>("peaceful")
  const [typingSpeed, setTypingSpeed] = useState(0)
  const [accentColor, setAccentColor] = useState("from-primary to-secondary")
  const lastKeyPressRef = useRef(Date.now())
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [])

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const now = Date.now()
    const timeSinceLastKey = now - lastKeyPressRef.current
    lastKeyPressRef.current = now

    const speed = Math.max(1 - timeSinceLastKey / 200, 0)
    setTypingSpeed(speed)

    const colorGradients = [
      "from-cyan-500 to-cyan-400",
      "from-purple-500 to-pink-400",
      "from-blue-500 to-purple-400",
      "from-pink-500 to-rose-400",
    ]
    const colorIndex = Math.floor(speed * (colorGradients.length - 1))
    setAccentColor(colorGradients[colorIndex])

    setText(e.target.value)

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setTypingSpeed(0)
      setAccentColor("from-primary to-secondary")
    }, 1000)
  }

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text, emotion)
      setText("")
      setEmotion("peaceful")
      setTypingSpeed(0)
    }
  }

  return (
    <div className="space-y-4 p-4 bg-card/80 rounded-lg border border-border/50 backdrop-blur-sm">
      <div>
        <label className="text-xs font-semibold text-foreground/70 mb-2 block">How does this dream feel?</label>
        <div className="grid grid-cols-5 gap-2">
          {emotions.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setEmotion(value)}
              className={`p-2 rounded-lg text-center transition-all duration-200 ${
                emotion === value
                  ? "bg-primary/30 border border-primary ring-2 ring-primary/50"
                  : "bg-background/50 border border-border/30 hover:bg-background/80"
              }`}
              title={label}
            >
              <div className="text-xs font-medium">{label}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-foreground/70 mb-2 block">Describe your dream</label>
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Floating through crystalline caverns... whispers in the dark..."
          className={`w-full h-24 p-3 bg-background/50 border-2 rounded-lg text-sm text-foreground placeholder-muted-foreground/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none ${
            typingSpeed > 0.5 ? "border-purple-500/50" : typingSpeed > 0 ? "border-blue-500/30" : "border-border/30"
          }`}
          style={{
            boxShadow:
              typingSpeed > 0.5
                ? "0 0 20px rgba(168, 85, 247, 0.3)"
                : typingSpeed > 0
                  ? "0 0 10px rgba(59, 130, 246, 0.2)"
                  : "none",
          }}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className={`flex-1 px-4 py-2 rounded-lg bg-gradient-to-r ${accentColor} text-primary-foreground font-medium hover:from-primary/80 hover:to-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
          style={{
            opacity: Math.max(0.6, 1 - typingSpeed * 0.2),
          }}
        >
          Save Dream
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-background/50 border border-border/30 text-foreground/70 hover:bg-background/80 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
