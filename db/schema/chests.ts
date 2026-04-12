import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { rarityEnum } from './enums'
import { items } from './items'
import { users } from './users'

export const chestTiers = pgTable('chest_tiers', {
  id:       text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:     text('name').notNull(),   // 'COMMON' | 'ELITE' | 'LEGENDARY'
  xpCost:   integer('xp_cost').notNull(),
  minLevel: integer('min_level').default(1).notNull(),
})

export const chestTiersRelations = relations(chestTiers, ({ many }) => ({
  lootTable: many(chestLootTable),
}))

export const chestLootTable = pgTable('chest_loot_table', {
  id:           text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  chestTierId:  text('chest_tier_id').notNull().references(() => chestTiers.id),
  itemId:       text('item_id').notNull().references(() => items.id),
  weight:       integer('weight').notNull(),   // relative weight for RNG
  minLevel:     integer('min_level').default(1).notNull(),
})

export const chestLootTableRelations = relations(chestLootTable, ({ one }) => ({
  chestTier: one(chestTiers, {
    fields: [chestLootTable.chestTierId],
    references: [chestTiers.id],
  }),
  item: one(items, {
    fields: [chestLootTable.itemId],
    references: [items.id],
  }),
}))

export const chestOpens = pgTable('chest_opens', {
  id:             text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:         text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  chestTierId:    text('chest_tier_id').notNull(),
  itemId:         text('item_id').notNull(),
  rarity:         rarityEnum('rarity').notNull(),
  playerLevelAt:  integer('player_level_at').notNull(),
  openedAt:       timestamp('opened_at').defaultNow().notNull(),
})
