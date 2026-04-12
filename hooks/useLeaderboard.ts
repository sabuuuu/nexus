'use client'

import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { getLeaderboardAction } from '@/actions/leaderboard'

export function useLeaderboard(page = 0) {
  const queryClient = useQueryClient()
  const supabase = createSupabaseBrowser()

  const query = useQuery({
    queryKey: ['leaderboard', page],
    queryFn: () => getLeaderboardAction(page),
    staleTime: 30_000,
    refetchInterval: 60_000,
  })

  useEffect(() => {
    const channel = supabase
      .channel('leaderboard-live')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'leaderboard_entries' },
        () => queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient, supabase])

  return query
}
