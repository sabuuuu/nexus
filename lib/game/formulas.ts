/**
 * XP required to reach a given level.
 * Quadratic curve — fair early, gated late.
 *
 * Level 10  →    4,500 XP
 * Level 50  →  112,500 XP
 * Level 100 →  450,000 XP
 */
export function xpForLevel(level: number): number {
  return Math.floor(50 * Math.pow(level, 1.8))
}

export function levelFromTotalXp(totalXp: bigint): number {
  let level = 1
  let currentLevelXp = BigInt(0)
  
  while (true) {
    const nextLevelXp = BigInt(xpForLevel(level + 1))
    if (totalXp < currentLevelXp + nextLevelXp) break
    currentLevelXp += nextLevelXp
    level++
  }
  
  return level
}

export function xpProgressInLevel(totalXp: bigint, level: number): number {
  let totalXpToCurrentLevel = BigInt(0)
  for (let i = 1; i < level; i++) {
    totalXpToCurrentLevel += BigInt(xpForLevel(i + 1))
  }
  
  const progressInCurrentLevel = totalXp - totalXpToCurrentLevel
  const xpNeededForNextLevel = BigInt(xpForLevel(level + 1))
  
  return Number(progressInCurrentLevel) / Number(xpNeededForNextLevel)
}

export function computeClickPower(
  base: number,
  equippedItems: { statKey: string | null; statValue: number }[],
  prestigeCount: number
): number {
  const itemBonus = equippedItems
    .filter((i) => i.statKey === 'clickPower')
    .reduce((sum, i) => sum + i.statValue, 0)
  const prestigeMultiplier = 1 + prestigeCount * 0.25
  return Math.floor((base + itemBonus) * prestigeMultiplier)
}

export function computePassiveRate(
  equippedItems: { statKey: string | null; statValue: number }[],
  prestigeCount: number
): number {
  const base = equippedItems
    .filter((i) => i.statKey === 'passiveRate')
    .reduce((sum, i) => sum + i.statValue, 0)
  return Math.floor(base * (1 + prestigeCount * 0.1))
}
