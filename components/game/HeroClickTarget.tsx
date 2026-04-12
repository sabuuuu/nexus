'use client'

import { useState, useCallback } from 'react'
import { useGameStore } from '@/store/gameStore'
import { SoundManager } from '@/lib/sound/soundManager'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface ClickParticle {
  id:    number
  x:     number
  y:     number
  value: number
}

export function HeroClickTarget() {
  const registerClick = useGameStore((s) => s.registerClick)
  const clickPower    = useGameStore((s) => s.clickPower)
  const [particles,  setParticles] = useState<ClickParticle[]>([])
  const [isPressed,  setIsPressed] = useState(false)

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    registerClick()
    SoundManager.play('click')

    const rect = e.currentTarget.getBoundingClientRect()
    const particle: ClickParticle = {
      id:    Date.now() + Math.random(),
      x:     e.clientX - rect.left,
      y:     e.clientY - rect.top,
      value: clickPower,
    }
    setParticles((prev) => [...prev, particle])
    setTimeout(() => setParticles((prev) => prev.filter((p) => p.id !== particle.id)), 800)
  }, [registerClick, clickPower])

  return (
    <div className="relative select-none">
      <button
        onClick={handleClick}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        className={cn(
          'relative w-64 h-64 rounded-full transition-all duration-75 cursor-pointer flex items-center justify-center overflow-hidden',
          'bg-gradient-to-b from-primary/20 to-primary/5',
          'border-2 border-primary/40 hover:border-primary',
          'shadow-[0_0_40px_hsl(var(--primary)/0.3)]',
          isPressed && 'scale-95 shadow-[0_0_20px_hsl(var(--primary)/0.5)]'
        )}
        aria-label="Click to earn XP"
      >
        {/* Placeholder Hero art */}
        <div className="text-64 relative z-10">⚡</div>
        
        {/* Animated background glow */}
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"
        />
      </button>

      {/* Click particles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ y: p.y, x: p.x, opacity: 1, scale: 0.5 }}
            animate={{ y: p.y - 100, opacity: 0, scale: 1.5 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute font-display font-bold text-2xl text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]"
          >
            +{p.value}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}
