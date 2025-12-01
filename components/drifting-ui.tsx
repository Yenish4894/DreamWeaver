"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"

interface DriftingUIProps {
  children: React.ReactNode
  intensity?: number
}

export default function DriftingUI({ children, intensity = 1 }: DriftingUIProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [blur, setBlur] = useState(0)
  const lastMoveRef = useRef(Date.now())
  const animationFrameRef = useRef<number>()
  const lastUpdateRef = useRef({ x: 0, y: 0, blur: 0 })

  useEffect(() => {
    const animate = () => {
      const now = Date.now()

      const newX = Math.sin(now / (3000 / intensity)) * 5
      const newY = Math.cos(now / (4000 / intensity)) * 5
      const timeSinceLast = now - lastMoveRef.current
      const blurAmount = Math.min(timeSinceLast / 5000, 1)

      if (
        Math.abs(newX - lastUpdateRef.current.x) > 0.1 ||
        Math.abs(newY - lastUpdateRef.current.y) > 0.1 ||
        Math.abs(blurAmount - lastUpdateRef.current.blur) > 0.05
      ) {
        setPosition({ x: newX, y: newY })
        setBlur(blurAmount)
        lastUpdateRef.current = { x: newX, y: newY, blur: blurAmount }
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    const resetBlur = () => {
      lastMoveRef.current = Date.now()
      setBlur(0)
      lastUpdateRef.current.blur = 0
    }

    window.addEventListener("mousemove", resetBlur)
    window.addEventListener("click", resetBlur)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      window.removeEventListener("mousemove", resetBlur)
      window.removeEventListener("click", resetBlur)
    }
  }, [intensity])

  return (
    <div
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        filter: `blur(${blur * 2}px)`,
        transition: "filter 0.3s ease-out",
      }}
    >
      {children}
    </div>
  )
}
