'use client'

import { useQuery } from '@tanstack/react-query'
import { getUserProfileAction } from '@/actions/auth'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => getUserProfileAction(),
    staleTime: 5 * 60 * 1000, // 5 mins
  })
}
