'use server'

import { db } from '@/db/client'
import { leaderboardEntries, seasons, users } from '@/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function getLeaderboardAction(page = 0) {
  const PAGE_SIZE = 50

  const [activeSeason] = await db
    .select()
    .from(seasons)
    .where(eq(seasons.isActive, true))
    .limit(1)

  if (!activeSeason) return { entries: [], myRank: null, seasonName: null }

  // Use raw SQL for RANK() window function which Drizzle query builder doesn't support as easily
  const entries = (await db.execute(sql`
    SELECT
      RANK() OVER (ORDER BY le.total_xp::bigint DESC)::int AS rank,
      u.id                                          AS "userId",
      u.username,
      le.total_xp::text                             AS "totalXp",
      le.tier
    FROM leaderboard_entries le
    JOIN users u ON u.id = le.user_id
    WHERE le.season_id = ${activeSeason.id}
    ORDER BY le.total_xp::bigint DESC
    LIMIT ${PAGE_SIZE} OFFSET ${page * PAGE_SIZE}
  `)) as any[]

  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  let myRank = null

  if (user) {
    // Determine player's specific rank
    const mine = (await db.execute(sql`
      WITH ranked AS (
        SELECT 
          user_id,
          total_xp,
          RANK() OVER (ORDER BY total_xp::bigint DESC)::int as rank
        FROM leaderboard_entries
        WHERE season_id = ${activeSeason.id}
      )
      SELECT rank, total_xp::text as "totalXp"
      FROM ranked
      WHERE user_id = ${user.id}
    `)) as any[]
    myRank = mine[0] ?? null
  }

  return { 
    entries: entries, 
    myRank, 
    seasonName: activeSeason.name 
  }
}
