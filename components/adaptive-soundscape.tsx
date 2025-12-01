"use client"

import { useEffect, useRef, useState } from "react"
import type { Dream, Emotion } from "@/app/page"

interface AdaptiveSoundscapeProps {
  emotion: Emotion
  dreams: Dream[]
}

export default function AdaptiveSoundscape({ emotion, dreams }: AdaptiveSoundscapeProps) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const oscillatorsRef = useRef<OscillatorNode[]>([])
  const gainsRef = useRef<GainNode[]>([])
  const [audioParameters, setAudioParameters] = useState<{
    frequencies: number[]
    waveType: string
    intensity: number
  } | null>(null)

  useEffect(() => {
    const emotionFrequencies: Record<Emotion, number[]> = {
      peaceful: [220, 330, 440], // A3, E4, A4
      joyful: [523.25, 659.25, 783.99], // C5, E5, G5
      melancholic: [164.81, 196, 246.94], // E3, G3, B3
      anxious: [349.23, 440, 554.37], // F4, A4, C#5
      surreal: [261.63, 400, 554.37], // C4, G4b, C#5
    }

    const optimizeAudioForDreams = async () => {
      if (dreams.length === 0) {
        setAudioParameters({
          frequencies: emotionFrequencies[emotion],
          waveType: emotion === "peaceful" ? "sine" : emotion === "joyful" ? "square" : "triangle",
          intensity: 0.1,
        })
        return
      }

      try {
        const recentDreamEmotion = dreams[0]?.emotion || emotion
        // Use base frequencies but could be enhanced with AI in future
        setAudioParameters({
          frequencies: emotionFrequencies[recentDreamEmotion as Emotion],
          waveType:
            recentDreamEmotion === "peaceful" ? "sine" : recentDreamEmotion === "joyful" ? "square" : "triangle",
          intensity: Math.min(dreams.length * 0.1, 0.3),
        })
      } catch (error) {
        console.error("[v0] Audio optimization error:", error)
        setAudioParameters({
          frequencies: emotionFrequencies[emotion],
          waveType: "sine",
          intensity: 0.15,
        })
      }
    }

    optimizeAudioForDreams()
  }, [emotion, dreams.length])

  useEffect(() => {
    if (!audioParameters) return

    const initAudio = () => {
      if (!audioContextRef.current) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        audioContextRef.current = audioContext

        const masterGain = audioContext.createGain()
        masterGain.gain.value = 0.1
        masterGain.connect(audioContext.destination)

        audioParameters.frequencies.forEach((freq) => {
          const osc = audioContext.createOscillator()
          const gain = audioContext.createGain()

          osc.frequency.value = freq
          osc.type = (audioParameters.waveType as any) || "sine"

          gain.gain.value = 0
          osc.connect(gain)
          gain.connect(masterGain)
          osc.start()

          oscillatorsRef.current.push(osc)
          gainsRef.current.push(gain)
        })
      }
    }

    const updateSoundscape = () => {
      initAudio()

      const dreamIntensity = audioParameters.intensity
      const pace = emotion === "joyful" ? 0.5 : emotion === "anxious" ? 2 : 1

      gainsRef.current.forEach((gain, index) => {
        const targetGain = Math.sin(Date.now() / (1000 / pace)) * 0.05 * dreamIntensity
        if (audioContextRef.current) {
          gain.gain.linearRampToValueAtTime(targetGain, audioContextRef.current.currentTime + 0.1)

          if (oscillatorsRef.current[index]) {
            const frequencyShift = emotion === "surreal" ? Math.sin(Date.now() / 2000) * 50 : 0
            oscillatorsRef.current[index].frequency.setTargetAtTime(
              audioParameters.frequencies[index] + frequencyShift,
              audioContextRef.current.currentTime,
              0.1,
            )
          }
        }
      })
    }

    updateSoundscape()
    const soundInterval = setInterval(updateSoundscape, 500)

    return () => clearInterval(soundInterval)
  }, [audioParameters, emotion])

  return null
}
