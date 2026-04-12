import { NextResponse } from 'next/server'
import { db } from '@/db/client'
import { leaderboardEntries, seasons } from '@/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { rankTierEnum } from '@/db/schema/enums'

// Basic tier mapping for cron
function tierFromXp(xp: bigint): typeof rankTierEnum.enumValues[number] {
  if (xp >= BigInt(5000000)) return 'NEXUS_CHAMPION'
  if (xp >= BigInt(1000000)) return 'PLATINUM'
  if (xp >= BigInt(100000))  return 'GOLD'
  if (xp >= BigInt(10000))   return 'SILVER'
  return 'BRONZE'
}

export async function GET() {
  const [activeSeason] = await db
    .select()
    .from(seasons)
    .where(eq(seasons.isActive, true))
    .limit(1)

  if (!activeSeason) return NextResponse.json({ ok: false, reason: 'No active season' })

  // Use raw SQL window functions for exact ranking
  const entriesWithRank = (await db.execute(sql`
    WITH ranked AS (
      SELECT 
        id, 
        total_xp,
        RANK() OVER (ORDER BY total_xp DESC)::int as rank
      FROM leaderboard_entries
      WHERE season_id = ${activeSeason.id}
    )
    SELECT id, total_xp::text as "totalXp", rank
    FROM ranked
  `)) as any[]

  if (!entriesWithRank.length) return NextResponse.json({ ok: true, processed: 0 })

  // Process updates in a single transaction
  await db.transaction(async (tx) => {
    for (const entry of entriesWithRank) {
      await tx
        .update(leaderboardEntries)
        .set({
          rank: entry.rank,
          tier: tierFromXp(BigInt(entry.totalXp)),
        })
        .where(eq(leaderboardEntries.id, entry.id))
    }
  })

  return NextResponse.json({ ok: true, processed: entriesWithRank.length })
}
