'use server'

import { db } from '@/db/client'
import { gameState, leaderboardEntries, seasons } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { createSupabaseServer } from '@/lib/supabase/server'
import { levelFromTotalXp } from '@/lib/game/formulas'
import { validateClickPayload } from '@/lib/game/anticheat'
import { trackQuestEventAction } from './quests'

const MAX_XP_PER_SYNC = BigInt(100_000)

export async function syncXpAction(pendingXpStr: string) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const pendingXp = BigInt(pendingXpStr)
  if (pendingXp <= BigInt(0) || pendingXp > MAX_XP_PER_SYNC) {
    throw new Error('Invalid XP amount')
  }

  // load current state for anti-cheat validation
  const [current] = await db
    .select()
    .from(gameState)
    .where(eq(gameState.userId, user.id))
    .limit(1)

  if (current) {
    const validation = validateClickPayload(
      pendingXp,
      current.clickPower,
      current.lastSyncAt
    )
    if (!validation.valid) throw new Error(validation.reason)
  }

  // upsert game state
  const now = new Date()
  
  // Update or insert implementation
  const [final] = await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(gameState)
      .where(eq(gameState.userId, user.id))
      .limit(1)

    const newTotalXp = (existing?.totalXp ?? BigInt(0)) + pendingXp
    const newCurrentXp = (existing?.currentXp ?? BigInt(0)) + pendingXp
    const newLevel = levelFromTotalXp(newTotalXp)

    if (existing) {
      return tx
        .update(gameState)
        .set({
          totalXp: newTotalXp,
          currentXp: newCurrentXp,
          level: newLevel,
          lastSyncAt: now,
          updatedAt: now,
        })
        .where(eq(gameState.userId, user.id))
        .returning()
    } else {
      return tx
        .insert(gameState)
        .values({
          userId: user.id,
          totalXp: newTotalXp,
          currentXp: newCurrentXp,
          level: newLevel,
          lastSyncAt: now,
          updatedAt: now,
        })
        .returning()
    }
  })

  // update leaderboard entry for active season
  const [activeSeason] = await db
    .select()
    .from(seasons)
    .where(eq(seasons.isActive, true))
    .limit(1)

  if (activeSeason) {
    const [existing] = await db
      .select()
      .from(leaderboardEntries)
      .where(
        and(
          eq(leaderboardEntries.userId, user.id),
          eq(leaderboardEntries.seasonId, activeSeason.id)
        )
      )
      .limit(1)

    if (existing) {
      await db
        .update(leaderboardEntries)
        .set({
          totalXp: existing.totalXp + pendingXp,
          updatedAt: now,
        })
        .where(eq(leaderboardEntries.id, existing.id))
    } else {
      await db.insert(leaderboardEntries).values({
        userId:   user.id,
        seasonId: activeSeason.id,
        totalXp:  pendingXp,
      })
    }
  }

  // Trigger meta-progression updates in the background (no await needed for UI response)
  const clickPower = current?.clickPower || 1
  const approximateClicks = Math.floor(Number(pendingXp) / clickPower) || 1
  
  Promise.all([
    trackQuestEventAction('XP_EARN', Number(pendingXp)),
    trackQuestEventAction('CLICK_COUNT', approximateClicks),
    trackQuestEventAction('LEVEL_REACH', final.level, true),
  ]).catch((err) => console.error('Quest track error:', err))

  return { totalXp: final.totalXp.toString(), level: final.level }
}

export async function loadGameStateAction() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [state] = await db
    .select()
    .from(gameState)
    .where(eq(gameState.userId, user.id))
    .limit(1)

  return state ?? null
}
