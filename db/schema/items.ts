import { pgTable, text, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { chestLootTable } from './chests'
import { playerItems } from './inventory'
import { itemTypeEnum, rarityEnum, heroClassEnum } from './enums'

export const items = pgTable('items', {
  id:          text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:        text('name').notNull(),
  description: text('description').notNull(),
  type:        itemTypeEnum('type').notNull(),
  rarity:      rarityEnum('rarity').notNull(),
  iconUrl:     text('icon_url').notNull(),
  statKey:     text('stat_key'),    // 'clickPower' | 'passiveRate' | null for cosmetics
  statValue:   integer('stat_value').default(0).notNull(),
  heroClass:   heroClassEnum('hero_class'),
})

export const itemsRelations = relations(items, ({ many }) => ({
  lootEntries: many(chestLootTable),
  playerItems: many(playerItems),
}))
