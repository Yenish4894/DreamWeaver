"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

export default function Home() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [loadingText, setLoadingText] = useState("")

  useEffect(() => {
    const text = "DREAMWEAVER"
    let index = 0
    const interval = setInterval(() => {
      if (index <= text.length) {
        setLoadingText(text.substring(0, index))
        index++
      } else {
        clearInterval(interval)
      }
    }, 100)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const fragments = [
    {
      title: "Fluid Interface",
      description: "Reality shifts with your touch. UI that breathes and flows.",
      href: "/fluid-interface",
      color: "from-cyan-500 to-blue-500",
      icon: "≈",
    },
    {
      title: "Emotional Memory",
      description: "Share your feelings. The system remembers. Your trail, forever.",
      href: "/emotional-memory",
      color: "from-purple-500 to-pink-500",
      icon: "◆",
    },
    {
      title: "Voice of the Machine",
      description: "AI speaks your dreams. Machine narrates your deepest thoughts.",
      href: "/voice-machine",
      color: "from-amber-500 to-red-500",
      icon: "◇",
    },
    {
      title: "Metamorphic Media",
      description: "Images that evolve. Music that adapts. Reality that transforms.",
      href: "/metamorphic",
      color: "from-emerald-500 to-teal-500",
      icon: "◎",
    },
  ]

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-purple-900 to-slate-900">
      {/* Animated background grid */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_1px,rgba(147,112,219,0.1)_1px)] bg-[size:50px_50px] animate-pulse" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_1px,rgba(147,112,219,0.1)_1px)] bg-[size:50px_50px] animate-pulse" />
      </div>

      {/* Mouse-follow glow */}
      <div
        className="fixed pointer-events-none"
        style={{
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(147,112,219,0.15) 0%, transparent 70%)",
          left: mousePos.x - 200,
          top: mousePos.y - 200,
          transition: "all 0.1s ease-out",
        }}
      />

      <div className="relative h-full w-full flex flex-col items-center justify-center">
        {/* Title */}
        <div className="text-center mb-20 z-10">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 font-mono tracking-wider">
            {loadingText}
          </h1>
          <p className="text-lg text-purple-300/60 font-light">Choose a fragment to explore</p>
        </div>

        {/* Fragment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 max-w-5xl z-10">
          {fragments.map((fragment, idx) => (
            <Link key={idx} href={fragment.href} className="group relative">
              <div
                className="absolute -inset-1 bg-gradient-to-r opacity-0 group-hover:opacity-75 transition-all duration-500 rounded-xl blur-lg"
                style={{
                  background: `linear-gradient(135deg, ${fragment.color.includes("cyan") ? "#06b6d4" : fragment.color.includes("purple") ? "#a855f7" : fragment.color.includes("amber") ? "#f59e0b" : "#10b981"}, ${fragment.color.includes("blue") ? "#3b82f6" : fragment.color.includes("pink") ? "#ec4899" : fragment.color.includes("red") ? "#ef4444" : "#14b8a6"})`,
                }}
              />

              <div className="relative bg-slate-900/80 backdrop-blur-md p-8 rounded-xl border border-purple-500/30 group-hover:border-purple-500/60 transition-all duration-300 h-full flex flex-col items-center text-center cursor-pointer group-hover:scale-[1.02] group-hover:translate-y-[-2px]">
                <div
                  className={`text-5xl mb-4 bg-gradient-to-r ${fragment.color} bg-clip-text text-transparent font-bold drop-shadow-lg`}
                >
                  {fragment.icon}
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">{fragment.title}</h2>
                <p className="text-sm text-purple-200/80 leading-relaxed">{fragment.description}</p>

                <div className="mt-auto pt-6 text-xs text-purple-400/60 group-hover:text-purple-300 transition-colors font-semibold">
                  ENTER FRAGMENT →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center text-xs text-purple-400/40 z-10">
          <div>Dreamware - by Team DreamCoder</div>
          <div>Every reload feels like waking from a new dream</div>
        </div>
      </div>
    </div>
  )
}
