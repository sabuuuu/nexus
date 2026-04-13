'use client'

import { useQuery } from '@tanstack/react-query'
import { getPlayerInventoryAction } from '@/actions/inventory'

export function useInventory() {
  return useQuery({
    queryKey: ['inventory'],
    queryFn: () => getPlayerInventoryAction(),
    refetchOnWindowFocus: true,
    staleTime: 30 * 1000, // Keep in memory for 30s
  })
}
