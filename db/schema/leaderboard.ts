import { pgTable, text, bigint, integer, boolean, timestamp, unique } from 'drizzle-orm/pg-core'
import { rankTierEnum } from './enums'
import { users } from './users'
import { sql } from 'drizzle-orm'

export const seasons = pgTable('seasons', {
  id:       text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:     text('name').notNull(),    // "Season 1: Rise of the Nexus"
  startsAt: timestamp('starts_at').notNull(),
  endsAt:   timestamp('ends_at').notNull(),
  isActive: boolean('is_active').default(false).notNull(),
})

export const leaderboardEntries = pgTable('leaderboard_entries', {
  id:       text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:   text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  seasonId: text('season_id').notNull().references(() => seasons.id),
  totalXp:  bigint('total_xp', { mode: 'bigint' }).default(sql`0`).notNull(),
  rank:     integer('rank'),           // materialised by cron
  tier:     rankTierEnum('tier').default('BRONZE').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  uniqueUserSeason: unique().on(t.userId, t.seasonId),
}))
