'use server'

import { db } from '@/db/client'
import { questTemplates, questProgress, gameState, leaderboardEntries, seasons } from '@/db/schema'
import { eq, and, gte } from 'drizzle-orm'
import { createSupabaseServer } from '@/lib/supabase/server'

const QUESTS_PER_DAY = 3

function getTodayUTC(): Date {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  return today
}

export async function assignDailyQuestsAction() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const today = getTodayUTC()

  // Check if quests already assigned today
  const existing = await db
    .select()
    .from(questProgress)
    .where(and(eq(questProgress.userId, user.id), gte(questProgress.assignedAt, today)))
    .limit(1)

  if (existing.length > 0) return { alreadyAssigned: true }

  const templates = await db.select().from(questTemplates)
  if (templates.length === 0) return { alreadyAssigned: false }

  // Random selection of QUESTS_PER_DAY templates
  const shuffled = templates.sort(() => Math.random() - 0.5).slice(0, QUESTS_PER_DAY)

  const [state] = await db.select().from(gameState).where(eq(gameState.userId, user.id)).limit(1)
  const currentLevel = state?.level || 1

  await db.transaction(async (tx) => {
    for (const q of shuffled) {
      let initValue = 0
      let isComplete = false

      // Auto-complete or populate bounds for level-based quests
      if (q.type === 'LEVEL_REACH') {
        initValue = currentLevel
        isComplete = currentLevel >= q.targetValue
      }

      await tx.insert(questProgress).values({
        userId:          user.id,
        questTemplateId: q.id,
        assignedAt:      today,
        currentValue:    initValue,
        isComplete:      isComplete,
        completedAt:     isComplete ? today : null,
      })

      if (isComplete && state) {
        await tx.update(gameState).set({
          totalXp: state.totalXp + BigInt(q.rewardXp),
          currentXp: state.currentXp + BigInt(q.rewardXp),
        }).where(eq(gameState.userId, user.id))

        // leaderboard sync
        const [activeSeason] = await tx.select().from(seasons).where(eq(seasons.isActive, true)).limit(1)
        if (activeSeason) {
          const [entry] = await tx.select().from(leaderboardEntries).where(and(eq(leaderboardEntries.userId, user.id), eq(leaderboardEntries.seasonId, activeSeason.id))).limit(1)
          if (entry) {
            await tx.update(leaderboardEntries).set({ totalXp: entry.totalXp + BigInt(q.rewardXp) }).where(eq(leaderboardEntries.id, entry.id))
          }
        }
      }
    }
  })

  return { alreadyAssigned: false }
}

export async function getDailyQuestsAction() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const today = getTodayUTC()

  return db.query.questProgress.findMany({
    where: and(
      eq(questProgress.userId, user.id),
      gte(questProgress.assignedAt, today)
    ),
    with: { quest: true },
  })
}

export async function trackQuestEventAction(type: string, amount: number, isAbsolute = false) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const today = getTodayUTC()

  const active = await db.query.questProgress.findMany({
    where: and(
      eq(questProgress.userId, user.id),
      eq(questProgress.isComplete, false),
      gte(questProgress.assignedAt, today)
    ),
    with: { quest: true },
  })

  for (const progress of active.filter((p) => p.quest.type === type)) {
    const newValue = isAbsolute 
      ? Math.max(progress.currentValue, amount)
      : progress.currentValue + amount
      
    const complete = newValue >= progress.quest.targetValue

    await db
      .update(questProgress)
      .set({
        currentValue: newValue,
        isComplete:   complete,
        completedAt:  complete ? new Date() : null,
      })
      .where(eq(questProgress.id, progress.id))

    // Award XP on completion
    if (complete) {
      const [current] = await db
        .select()
        .from(gameState)
        .where(eq(gameState.userId, user.id))
        .limit(1)

      if (current) {
        await db
          .update(gameState)
          .set({
            totalXp:   current.totalXp   + BigInt(progress.quest.rewardXp),
            currentXp: current.currentXp + BigInt(progress.quest.rewardXp),
          })
          .where(eq(gameState.userId, user.id))

        // leaderboard sync
        const [activeSeason] = await db.select().from(seasons).where(eq(seasons.isActive, true)).limit(1)
        if (activeSeason) {
          const [entry] = await db.select().from(leaderboardEntries).where(and(eq(leaderboardEntries.userId, user.id), eq(leaderboardEntries.seasonId, activeSeason.id))).limit(1)
          if (entry) {
            await db.update(leaderboardEntries).set({ totalXp: entry.totalXp + BigInt(progress.quest.rewardXp) }).where(eq(leaderboardEntries.id, entry.id))
          }
        }
      }
    }
  }
}
