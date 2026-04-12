'use client'

import { useEffect, useMemo, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { getWorldBossAction, damageWorldBossAction } from '@/actions/game'

export interface BossState {
  level: number
  currentStability: bigint
  maxStability: bigint
}

export function useWorldBoss() {
  const [boss, setBoss] = useState<BossState | null>(null)
  // Memoize so the client reference is stable across renders
  const supabase = useMemo(() => createSupabaseBrowser(), [])

  useEffect(() => {
    // 1. Load initial state
    const fetchBoss = async () => {
      const data = await getWorldBossAction()
      if (data) {
        setBoss({
          level: data.level,
          currentStability: BigInt(data.currentStability),
          maxStability: BigInt(data.maxStability),
        })
      }
    }
    fetchBoss()

    // 2. Unique channel name per mount to bypass Supabase's internal channel cache.
    // Reusing the same name returns an already-subscribed channel in Strict Mode,
    // causing the "cannot add callbacks after subscribe()" error.
    const channelName = `world_boss_changes_${Math.random()}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'world_boss',
          filter: 'id=eq.current_boss',
        },
        (payload) => {
          const updated = payload.new as any
          setBoss({
            level: updated.level,
            currentStability: BigInt(updated.current_stability),
            maxStability: BigInt(updated.max_stability),
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const damageBoss = async (damage: number) => {
    // Optimistic UI update (optional, but good for "feel")
    if (boss) {
      setBoss(prev => prev ? {
        ...prev,
        currentStability: prev.currentStability - BigInt(damage)
      } : null)
    }
    
    // Server Sync
    await damageWorldBossAction(damage.toString())
  }

  return { boss, damageBoss }
}
