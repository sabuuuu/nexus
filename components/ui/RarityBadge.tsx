'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { type items } from '@/db/schema'

type Rarity = typeof items.$inferSelect['rarity']

const rarityConfig: Record<Rarity, { label: string; className: string }> = {
  COMMON:    { label: 'Common',    className: 'border-white/20 text-white/50' },
  UNCOMMON:  { label: 'Uncommon',  className: 'border-green-500/40 text-green-500 bg-green-500/5' },
  RARE:      { label: 'Rare',      className: 'border-primary/40 text-primary bg-primary/5' },
  EPIC:      { label: 'Epic',      className: 'border-purple-500/50 text-purple-400 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.2)]' },
  LEGENDARY: { label: 'Legendary', className: 'border-amber-500/60 text-amber-500 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse' },
}

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  const { label, className } = rarityConfig[rarity]
  return (
    <Badge variant="outline" className={cn('font-mono text-[10px] uppercase tracking-widest rounded-none px-2', className)}>
      {label}
    </Badge>
  )
}
