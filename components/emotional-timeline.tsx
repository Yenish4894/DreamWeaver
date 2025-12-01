"use client"

interface Dream {
  id: string
  text: string
  emotion: string
  timestamp: Date
  colors: string[]
  vibe?: string
  decayLevel?: number
}

interface EmotionalTimelineProps {
  dreams: Dream[]
}

const emotionColors: Record<string, string> = {
  joyful: "from-yellow-500 to-orange-500",
  melancholic: "from-blue-600 to-red-500",
  anxious: "from-pink-500 to-purple-600",
  peaceful: "from-cyan-400 to-purple-500",
  surreal: "from-pink-500 to-purple-600",
}

export default function EmotionalTimeline({ dreams }: EmotionalTimelineProps) {
  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (hours < 1) return "Now"
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-3">
      {dreams.length === 0 ? (
        <p className="text-xs text-muted-foreground/60 py-4">Your emotional trail awaits...</p>
      ) : (
        dreams.slice(0, 5).map((dream) => (
          <div
            key={dream.id}
            className="flex gap-3 animate-float group"
            style={{
              opacity: Math.max(1 - (dream.decayLevel || 0) * 0.5, 0.5),
              filter: `blur(${(dream.decayLevel || 0) * 1}px)`,
              transition: "all 0.3s ease-out",
            }}
          >
            <div
              className={`w-2 h-12 rounded-full bg-gradient-to-b ${emotionColors[dream.emotion] || "from-purple-500 to-pink-500"} flex-shrink-0 transition-all`}
              style={{
                boxShadow:
                  dream.vibe === "fame"
                    ? "0 0 12px rgba(0, 217, 255, 0.6)"
                    : dream.vibe === "defame"
                      ? "inset 0 0 12px rgba(255, 0, 110, 0.4)"
                      : "none",
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs text-primary/80 font-medium capitalize group-hover:text-primary transition-colors">
                  {dream.emotion}
                </p>
                <span className="text-xs font-semibold">
                  {dream.vibe === "fame" ? (
                    <span className="text-cyan-400">Rising</span>
                  ) : dream.vibe === "defame" ? (
                    <span className="text-pink-400">Fading</span>
                  ) : (
                    <span className="text-purple-400/50">Neutral</span>
                  )}
                </span>
              </div>
              <p className="text-xs text-foreground/60 line-clamp-2 group-hover:text-foreground/80 transition-colors">
                {dream.text}
              </p>
              <p className="text-xs text-muted-foreground/50 mt-1">{formatDate(dream.timestamp)}</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
