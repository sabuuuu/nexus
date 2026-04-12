import { pgTable, text, bigint, integer, timestamp } from 'drizzle-orm/pg-core'

export const worldBoss = pgTable('world_boss', {
  id:                text('id').primaryKey().$defaultFn(() => 'current_boss'), // Only one boss at a time
  level:             integer('level').default(1).notNull(),
  currentStability:  bigint('current_stability', { mode: 'bigint' }).default(BigInt(1000000)).notNull(),
  maxStability:      bigint('max_stability', { mode: 'bigint' }).default(BigInt(1000000)).notNull(),
  lastResetAt:       timestamp('last_reset_at').defaultNow().notNull(),
  updatedAt:         timestamp('updated_at').defaultNow().notNull(),
})
