'use client'

import { useState, useCallback } from 'react'
import { useGameStore } from '@/store/gameStore'
import { SoundManager } from '@/lib/sound/soundManager'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { useWorldBoss } from '@/hooks/useWorldBoss'

interface ClickParticle {
  id: number
  x: number
  y: number
  value: number
}

export function HeroClickTarget() {
  const registerClick = useGameStore((s) => s.registerClick)
  const clickPower = useGameStore((s) => s.clickPower)
  const { damageBoss } = useWorldBoss()
  const [particles, setParticles] = useState<ClickParticle[]>([])
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    registerClick()
    damageBoss(clickPower)
    SoundManager.play('click')

    const rect = e.currentTarget.getBoundingClientRect()
    const particle: ClickParticle = {
      id: Date.now() + Math.random(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      value: clickPower,
    }
    setParticles((prev) => [...prev, particle])
    setTimeout(() => setParticles((prev) => prev.filter((p) => p.id !== particle.id)), 800)
  }, [registerClick, clickPower, damageBoss])

  return (
    <div className="relative select-none">
      <button
        onClick={handleClick}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        className={cn(
          'relative w-[340px] h-[340px] transition-all duration-75 cursor-pointer flex items-center justify-center',
          isPressed && 'scale-95'
        )}
        aria-label="Hack the Overseer"
      >
        {/* THE OVERSEER BOSS ASSET */}
        <motion.div
          animate={{
            y: [0, -15, 0],
            rotate: [0, 0.5, 0, -0.5, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 z-10"
        >
          <img
            src="/overseer/boss.png"
            alt="The Overseer"
            className="w-full h-full object-contain filter drop-shadow-[0_0_35px_rgba(59,130,246,0.4)] mix-blend-screen"
          />
        </motion.div>

        {/* Pulsing Energy Core */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute w-56 h-56 bg-primary/20 blur-[90px] rounded-full z-0"
        />
      </button>

      {/* Animated Hacking Spark Particles (Sprite Sheet) */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ left: p.x, top: p.y, opacity: 1, scale: 0.5 }}
            animate={{ top: p.y - 140, opacity: 0, scale: 1.4 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute z-50 flex flex-col items-center"
          >
            {/* THE 4-FRAME SPARK ANIMATION */}
            <div
              className="w-[100px] h-[100px] bg-contain bg-center bg-no-repeat animate-hack-spark"
            />
            <span className="font-display font-bold text-3xl text-primary -mt-6 drop-shadow-[0_0_12px_#3B82F6]">
              +{p.value}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
