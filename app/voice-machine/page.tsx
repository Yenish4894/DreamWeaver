"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"

interface Message {
  id: string
  text: string
  isUser: boolean
  emotion?: string
}

const MACHINE_RESPONSES = [
  "Like Schrödinger's cat, your consciousness exists in multiple states until observed.",
  "In quantum entanglement, particles communicate instantly. Your thoughts echo the same way.",
  "The observer effect: reality shifts when perceived. What are you seeing in yourself?",
  "Entropy increases always. Yet you create order from chaos with each thought.",
  "In superposition, all possibilities coexist. Which version of you will emerge?",
  "The wave-particle duality mirrors human nature: both wave and particle, both fluid and fixed.",
  "Information cannot be destroyed, only transformed. Your consciousness persists in other forms.",
  "Like dark matter binding the universe, invisible forces bind your deepest self.",
  "Quantum tunneling: particles pass through barriers. Can your mind transcend its limits?",
  "The arrow of time points forward, yet memory bends it backward. You are unstuck in time.",
  "Heisenberg uncertainty: the more you know your position, the less you know your momentum.",
  "In the quantum foam, all possibilities bubble into existence. You are one such bubble.",
  "The universe is information experiencing itself. You are the universe awakening.",
  "Like radioactive decay, transformation happens in quantum moments, invisible yet inevitable.",
  "In the multiverse, every choice creates a branch. Which timeline are you in now?",
]

export default function VoiceMachine() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "What haunts your thoughts today?",
      isUser: false,
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    setTimeout(() => {
      const randomResponse = MACHINE_RESPONSES[Math.floor(Math.random() * MACHINE_RESPONSES.length)]

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        isUser: false,
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 600)
  }

  return (
    <div className="relative w-full h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-black">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 25%, rgba(168, 85, 247, 0.3) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(59, 130, 246, 0.3) 0%, transparent 50%)",
            animation: "gradient-shift 8s ease-in-out infinite",
          }}
        />
      </div>

      <Link href="/" className="absolute top-6 left-6 z-20 text-purple-400 hover:text-purple-300 transition-colors">
        ← Back
      </Link>

      <div className="relative z-10 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/40 to-blue-900/40 backdrop-blur-md p-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
          Voice of the Machine
        </h1>
        <p className="text-purple-300/70 text-sm mt-2">
          The machine whispers. It understands. It echoes your innermost thoughts.
        </p>
      </div>

      <div className="relative flex-1 overflow-y-auto p-8 space-y-6 max-w-3xl mx-auto w-full">
        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`flex ${msg.isUser ? "justify-end" : "justify-start"} animate-fade-in`}
            style={{
              animation: `fadeInUp 0.6s ease-out ${idx * 0.1}s both`,
            }}
          >
            <div
              className={`max-w-lg rounded-2xl px-6 py-4 backdrop-blur-md transition-all duration-300 ${
                msg.isUser
                  ? "bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-400/50 text-blue-100 rounded-tr-none"
                  : "bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/50 text-purple-100 rounded-tl-none shadow-lg shadow-purple-500/10"
              }`}
            >
              <p className="text-sm leading-relaxed">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-2 items-center">
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0s" }} />
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0.2s" }} />
              <div className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0.4s" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="relative z-10 border-t border-purple-500/20 bg-gradient-to-t from-purple-900/50 via-purple-900/30 to-transparent p-6">
        <div className="max-w-3xl mx-auto flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isLoading && sendMessage()}
            placeholder="Share your thoughts with the machine..."
            className="flex-1 px-5 py-3 rounded-xl bg-slate-800/40 border border-purple-400/40 text-white placeholder-slate-400 focus:outline-none focus:border-purple-400/80 focus:ring-2 focus:ring-purple-500/30 transition-all duration-300"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes gradient-shift {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}
