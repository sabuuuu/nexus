import { pgEnum } from 'drizzle-orm/pg-core'

export const itemTypeEnum  = pgEnum('item_type',  ['CLICK_BOOST', 'PASSIVE_BOOST', 'COSMETIC', 'HERO'])
export const rarityEnum    = pgEnum('rarity',     ['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'])
export const heroClassEnum = pgEnum('hero_class', ['ELECTRIC', 'CRIMSON', 'TOXIC', 'SOLAR'])
export const rankTierEnum  = pgEnum('rank_tier',  ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'NEXUS_CHAMPION'])
