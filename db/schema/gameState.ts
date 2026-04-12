import { pgTable, text, bigint, integer, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'
import { sql } from 'drizzle-orm'

export const gameState = pgTable('game_state', {
  id:           text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:       text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),

  totalXp:      bigint('total_xp', { mode: 'bigint' }).default(sql`0`).notNull(),
  currentXp:    bigint('current_xp', { mode: 'bigint' }).default(sql`0`).notNull(),
  level:        integer('level').default(1).notNull(),
  clickPower:   integer('click_power').default(1).notNull(),  // base, before item bonuses
  passiveRate:  integer('passive_rate').default(0).notNull(), // XP/sec, before item bonuses
  prestigeCount: integer('prestige_count').default(0).notNull(),

  lastSeenAt:   timestamp('last_seen_at').defaultNow().notNull(),
  lastSyncAt:   timestamp('last_sync_at').defaultNow().notNull(),
  updatedAt:    timestamp('updated_at').defaultNow().notNull(),
})
