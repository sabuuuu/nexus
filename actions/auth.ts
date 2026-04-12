'use server'

import { db } from '@/db/client'
import { users, gameState } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createSupabaseServer } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function signInAnonymouslyAction() {
  const supabase = await createSupabaseServer()
  
  // 1. Sign in via Supabase
  const { data, error } = await supabase.auth.signInAnonymously()
  if (error) throw error
  if (!data.user) throw new Error('Failed to create guest session')

  const userId = data.user.id

  // 2. Check if user already exists in our DB
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  if (!existingUser) {
    // 3. Initialize user, game state, and leaderboard entry
    await db.transaction(async (tx) => {
      await tx.insert(users).values({
        id: userId,
      })
      await tx.insert(gameState).values({
        userId: userId,
      })

      // Link to active season immediately
      const [activeSeason] = await tx
        .select()
        .from(seasons)
        .where(eq(seasons.isActive, true))
        .limit(1)

      if (activeSeason) {
        await tx.insert(leaderboardEntries).values({
          userId: userId,
          seasonId: activeSeason.id,
          totalXp: BigInt(0),
        })
      }
    })
  }

  revalidatePath('/')
  return { success: true }
}

export async function updateUsernameAction(username: string) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Validate username
  const cleanUsername = username.trim()
  if (cleanUsername.length < 3) throw new Error('Alias too short')
  if (cleanUsername.length > 20) throw new Error('Alias too long')

  await db
    .update(users)
    .set({
      username: cleanUsername,
      updatedAt: new Date(),
    })
    .where(eq(users.id, user.id))

  revalidatePath('/')
  return { success: true }
}

export async function getUserProfileAction() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [profile] = await db
    .select()
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)

  return profile ?? null
}
