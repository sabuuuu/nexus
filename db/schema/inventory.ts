import { pgTable, text, integer, boolean, timestamp, unique } from 'drizzle-orm/pg-core'
import { users } from './users'
import { items } from './items'

export const playerItems = pgTable('player_items', {
  id:         text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:     text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  itemId:     text('item_id').notNull().references(() => items.id),
  quantity:   integer('quantity').default(1).notNull(),
  shards:     integer('shards').default(0).notNull(),   // from duplicate drops
  isEquipped: boolean('is_equipped').default(false).notNull(),
  obtainedAt: timestamp('obtained_at').defaultNow().notNull(),
}, (t) => ({
  uniqueUserItem: unique().on(t.userId, t.itemId),
}))
