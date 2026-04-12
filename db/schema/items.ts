import { pgTable, text, integer, pgEnum } from 'drizzle-orm/pg-core'

export const itemTypeEnum  = pgEnum('item_type',  ['CLICK_BOOST', 'PASSIVE_BOOST', 'COSMETIC', 'HERO'])
export const rarityEnum    = pgEnum('rarity',     ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'])
export const heroClassEnum = pgEnum('hero_class', ['ELECTRIC', 'CRIMSON', 'TOXIC', 'SOLAR'])

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
