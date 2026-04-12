interface ValidationResult {
  valid:   boolean
  reason?: string
}

export function validateClickPayload(
  pendingXp:  bigint,
  clickPower: number,
  lastSyncAt: Date
): ValidationResult {
  const elapsedSeconds = (Date.now() - lastSyncAt.getTime()) / 1_000
  // assume max 20 clicks/sec, give 2× headroom for burst clicks
  const theoreticalMax = BigInt(Math.ceil(20 * clickPower * Math.max(elapsedSeconds, 1))) * BigInt(2)

  if (pendingXp <= BigInt(0))       return { valid: false, reason: 'XP must be positive' }
  if (pendingXp > theoreticalMax)   return { valid: false, reason: 'XP exceeds theoretical maximum' }

  return { valid: true }
}
