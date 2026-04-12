'use server'

import { db } from '@/db/client'
import { gameState } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createSupabaseServer } from '@/lib/supabase/server'
import { calculateOfflineEarnings } from '@/lib/game/offline'
import { levelFromTotalXp } from '@/lib/game/formulas'
import { leaderboardEntries, seasons } from '@/db/schema'
import { and } from 'drizzle-orm'


export async function claimOfflineEarningsAction() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const [state] = await db
    .select()
    .from(gameState)
    .where(eq(gameState.userId, user.id))
    .limit(1)

  if (!state) throw new Error('Game state not found')

  const offlineXp = calculateOfflineEarnings(state.passiveRate, state.lastSeenAt ?? new Date())
  if (offlineXp <= BigInt(0)) return { offlineXp: '0' }

  const newTotalXp   = state.totalXp   + offlineXp
  const newCurrentXp = state.currentXp + offlineXp

  await db
    .update(gameState)
    .set({
      totalXp:    newTotalXp,
      currentXp:  newCurrentXp,
      level:      levelFromTotalXp(newTotalXp),
      lastSeenAt: new Date(),
      updatedAt:  new Date(),
    })
    .where(eq(gameState.userId, user.id))

  // Sync with leaderboard
  const [activeSeason] = await db.select().from(seasons).where(eq(seasons.isActive, true)).limit(1)
  if (activeSeason) {
    const [entry] = await db
      .select()
      .from(leaderboardEntries)
      .where(and(eq(leaderboardEntries.userId, user.id), eq(leaderboardEntries.seasonId, activeSeason.id)))
      .limit(1)
      
    if (entry) {
      await db.update(leaderboardEntries)
        .set({ totalXp: entry.totalXp + offlineXp })
        .where(eq(leaderboardEntries.id, entry.id))
    }
  }

  return { offlineXp: offlineXp.toString() }
}

export async function pingLastSeenAction() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await db
    .update(gameState)
    .set({ lastSeenAt: new Date() })
    .where(eq(gameState.userId, user.id))
}
