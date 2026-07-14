'use client'

import { useEffect, useState } from 'react'

interface Petal {
  id: number
  left: number
  size: number
  opacity: number
  delay: number
  duration: number
  rotation: number
}

export default function SakuraEffect() {
  const [petals, setPetals] = useState<Petal[]>([])

  useEffect(() => {
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isReduced) return

    const isMobile = window.innerWidth < 768
    const count = isMobile ? 5 : 12

    const generated: Petal[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 10 + Math.random() * 15,
      opacity: 0.2 + Math.random() * 0.3,
      delay: Math.random() * 15,
      duration: 12 + Math.random() * 10,
      rotation: Math.random() * 360,
    }))

    setPetals(generated)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden hidden md:block">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute animate-sakura-fall"
          style={{
            left: `${petal.left}%`,
            width: `${petal.size}px`,
            height: `${petal.size * 0.6}px`,
            opacity: petal.opacity,
            animationDuration: `${petal.duration}s`,
            animationDelay: `${petal.delay}s`,
            transform: `rotate(${petal.rotation}deg)`,
            borderRadius: '50% 0 50% 0',
            background: 'linear-gradient(135deg, #FFB7C5, #FFD6DE)',
          }}
        />
      ))}
    </div>
  )
}
