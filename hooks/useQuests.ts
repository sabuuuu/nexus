'use client'

import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { assignDailyQuestsAction, getDailyQuestsAction } from '@/actions/quests'
import { claimOfflineEarningsAction } from '@/actions/offline'
import { useGameStore } from '@/store/gameStore'
import { toast } from 'sonner'

export function useQuestInit() {
  const queryClient = useQueryClient()
  const applyServerState = useGameStore((s) => s.applyServerState)

  useEffect(() => {
    async function init() {
      // 1. Claim offline earnings
      try {
        const { offlineXp } = await claimOfflineEarningsAction()
        const earned = BigInt(offlineXp)
        if (earned > BigInt(0)) {
          toast.success(`Offline earnings: +${earned.toLocaleString()} XP`, {
            description: 'Your squad kept working while you were away.',
            duration: 6000,
          })
          // Refresh game state from server after claiming
          queryClient.invalidateQueries({ queryKey: ['gameState'] })
        }
      } catch { /* passive rate may be 0 */ }

      // 2. Assign daily quests if needed
      try {
        await assignDailyQuestsAction()
        queryClient.invalidateQueries({ queryKey: ['quests'] })
      } catch { /* ignore */ }
    }

    init()
  }, [queryClient])
}

export function useQuests() {
  return useQuery({
    queryKey: ['quests'],
    queryFn: () => getDailyQuestsAction(),
    staleTime: 60_000,
  })
}
