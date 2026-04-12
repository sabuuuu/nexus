import { type items } from '@/db/schema'

type Rarity = typeof items.$inferSelect['rarity']

interface LootEntry {
  itemId: string
  rarity: Rarity
  weight: number
  minLevel: number
}

/**
 * Level-scaled weighted random selection.
 * Higher player level boosts rare tier weights.
 * Caps at level 100 to prevent trivialization.
 */
const RARITY_MULTIPLIERS: Record<Rarity, (level: number) => number> = {
  COMMON: () => 1.0,
  UNCOMMON: (l) => 1 + Math.min(l / 100, 0.5),
  RARE: (l) => 1 + Math.min(l / 50, 1.0),
  EPIC: (l) => 1 + Math.min(l / 30, 2.0),
  LEGENDARY: (l) => 1 + Math.min(l / 25, 3.0),
}

export function rollLoot(table: LootEntry[], playerLevel: number): LootEntry {
  const eligible = table.filter((e) => playerLevel >= e.minLevel)
  if (eligible.length === 0) throw new Error('No eligible loot for this player level')

  const weighted = eligible.map((e) => ({
    ...e,
    adjustedWeight: e.weight * RARITY_MULTIPLIERS[e.rarity](playerLevel),
  }))

  const total = weighted.reduce((s, e) => s + e.adjustedWeight, 0)
  let roll = Math.random() * total

  for (const entry of weighted) {
    roll -= entry.adjustedWeight
    if (roll <= 0) return entry
  }

  return weighted[weighted.length - 1]
}
