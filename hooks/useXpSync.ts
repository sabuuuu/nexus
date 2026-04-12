'use client'

import { useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useGameStore } from '@/store/gameStore'
import { syncXpAction } from '@/actions/game'
import { toast } from 'sonner'

const SYNC_INTERVAL_MS = 5_000

export function useXpSync() {
  const flushPendingXp   = useGameStore((s) => s.flushPendingXp)
  const applyServerState = useGameStore((s) => s.applyServerState)
  const intervalRef      = useRef<ReturnType<typeof setInterval> | null>(null)

  const syncMutation = useMutation({
    mutationFn: (pending: bigint) => syncXpAction(pending.toString()),
    onSuccess: (data) => {
      if (data) {
        applyServerState({ 
          totalXp: BigInt(data.totalXp), 
          level: data.level 
        })
      }
    },
    onError: (error) => {
      console.error('XP Sync Error:', error)
      toast.error('Sync failed — your progress is safe locally.')
    },
  })

  const sync = syncMutation.mutate

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const pending = flushPendingXp()
      if (pending > BigInt(0)) {
        sync(pending)
      }
    }, SYNC_INTERVAL_MS)

    const handleHide = () => {
      if (document.visibilityState === 'hidden') {
        const pending = flushPendingXp()
        if (pending > BigInt(0)) {
          sync(pending)
        }
      }
    }
    document.addEventListener('visibilitychange', handleHide)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      document.removeEventListener('visibilitychange', handleHide)
    }
  }, [flushPendingXp, sync])
}
