'use client'

import { useQuery } from '@tanstack/react-query'
import { getPlayerInventoryAction } from '@/actions/inventory'

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: () => getPlayerInventoryAction(),
    refetchOnWindowFocus: true,
    staleTime: 0, // Always consider stale after discovery
  })
}
