/**
 * Offline earnings calculator.
 * Players earn passive XP while away, capped at MAX_OFFLINE_HOURS.
 */
const MAX_OFFLINE_HOURS = 8

export function calculateOfflineEarnings(passiveRate: number, lastSeenAt: Date): bigint {
  const elapsedSeconds = Math.min(
    (Date.now() - lastSeenAt.getTime()) / 1_000,
    MAX_OFFLINE_HOURS * 3600
  )
  return BigInt(Math.floor(passiveRate * elapsedSeconds))
}
