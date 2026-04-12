'use client'

import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'
import { levelFromTotalXp } from '@/lib/game/formulas'
import { SoundManager } from '@/lib/sound/soundManager'

const TICK_MS = 1_000

export function usePassiveIncome() {
  const passiveRate = useGameStore((s) => s.passiveRate)
  const rateRef     = useRef(passiveRate)
  rateRef.current   = passiveRate

  useEffect(() => {
    // We update the store every second if there's a passive rate
    const id = setInterval(() => {
      if (rateRef.current > 0) {
        const gain = BigInt(rateRef.current)
        useGameStore.setState((s) => {
          const newTotal = s.totalXp + gain
          const newLevel = levelFromTotalXp(newTotal)
          
          if (newLevel > s.level) {
            SoundManager.play('levelUp')
          }

          return {
            totalXp:   newTotal,
            currentXp: s.currentXp + gain,
            pendingXp: s.pendingXp + gain,
            level:     newLevel,
          }
        })
      }
    }, TICK_MS)
    
    return () => clearInterval(id)
  }, []) // Empty dependency array because we use a ref for the rate
}
