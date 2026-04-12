import 'dotenv/config'
import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { gameState, leaderboardEntries, seasons } from '../db/schema'
import { eq, and } from 'drizzle-orm'

config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString, { max: 1 })
const db = drizzle(client, { schema: { gameState, leaderboardEntries, seasons } })

async function main() {
  console.log('Fixing leaderboard entries...')
  const states = await db.select().from(gameState)
  const [activeSeason] = await db.select().from(seasons).where(eq(seasons.isActive, true)).limit(1)

  if (!activeSeason) return

  for (const state of states) {
    const [entry] = await db.select().from(leaderboardEntries).where(and(eq(leaderboardEntries.userId, state.userId), eq(leaderboardEntries.seasonId, activeSeason.id))).limit(1)
    if (entry && entry.totalXp < state.totalXp) {
      console.log(`Updating user ${state.userId} from ${entry.totalXp} to ${state.totalXp}`)
      await db.update(leaderboardEntries).set({ totalXp: state.totalXp }).where(eq(leaderboardEntries.id, entry.id))
    }
  }

  console.log('Done!')
  process.exit(0)
}

main().catch(console.error)
