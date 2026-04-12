import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'

const rarityConfig: Record<Rarity, { label: string; className: string }> = {
  COMMON:    { label: 'Common',    className: 'border-rarity-common    text-rarity-common' },
  UNCOMMON:  { label: 'Uncommon',  className: 'border-rarity-uncommon  text-rarity-uncommon' },
  RARE:      { label: 'Rare',      className: 'border-rarity-rare      text-rarity-rare' },
  EPIC:      { label: 'Epic',      className: 'border-rarity-epic      text-rarity-epic  shadow-[0_0_12px_var(--rarity-epic)]' },
  LEGENDARY: { label: 'Legendary', className: 'border-rarity-legendary text-rarity-legendary shadow-[0_0_20px_var(--rarity-legendary)] animate-pulse' },
}

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  const { label, className } = rarityConfig[rarity]
  return (
    <Badge variant="outline" className={cn('font-mono text-xs uppercase tracking-widest', className)}>
      {label}
    </Badge>
  )
}
