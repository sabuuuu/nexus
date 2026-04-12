import 'dotenv/config'
import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { users } from './schema/users'
import { gameState } from './schema/gameState'
import { items } from './schema/items'
import { chestTiers, chestLootTable, chestOpens } from './schema/chests'
import { playerItems } from './schema/inventory'
import { seasons, leaderboardEntries } from './schema/leaderboard'
import { sql } from 'drizzle-orm'

config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString, { max: 1 })
const db = drizzle(client, { 
  schema: { users, gameState, items, chestTiers, chestLootTable, chestOpens, playerItems, seasons, leaderboardEntries } 
})

async function main() {
  console.log('--- ⚡ NEXUS CITY SEED START ⚡ ---')

  // Cleanup
  console.log('Cleaning up old data...')
  await db.execute(sql`DELETE FROM "chest_loot_table"`)
  await db.execute(sql`DELETE FROM "chest_opens"`)
  await db.execute(sql`DELETE FROM "player_items"`)
  await db.execute(sql`DELETE FROM "leaderboard_entries"`)
  await db.execute(sql`DELETE FROM "seasons"`)
  await db.execute(sql`DELETE FROM "chest_tiers"`)
  await db.execute(sql`DELETE FROM "items"`)

  // 1. Seed Seasons
  console.log('Seeding Seasons...')
  const [season1] = await db.insert(seasons).values({
    name: 'Season 1: Rise of the Nexus',
    startsAt: new Date(),
    endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    isActive: true,
  }).returning()

  // 2. Seed Chest Tiers
  console.log('Seeding Chest Tiers...')
  const [commonChest, eliteChest, legendaryChest] = await db.insert(chestTiers).values([
    { name: 'COMMON',    xpCost: 1000,   minLevel: 1 },
    { name: 'ELITE',     xpCost: 10000,  minLevel: 5 },
    { name: 'LEGENDARY', xpCost: 100000, minLevel: 10 },
  ]).returning()

  // 3. Seed Items (Heroes)
  console.log('Seeding Heroes...')
  const [h1, h2, h3, h4] = await db.insert(items).values([
    {
      name: 'VOLT_AGENT',
      description: 'Electric hero with high click power.',
      type: 'HERO',
      rarity: 'COMMON',
      heroClass: 'ELECTRIC',
      statKey: 'clickPower',
      statValue: 5,
      iconUrl: '/heroes/volt.png',
    },
    {
      name: 'TOXIC_REAPER',
      description: 'Poisonous hero providing passive income.',
      type: 'HERO',
      rarity: 'UNCOMMON',
      heroClass: 'TOXIC',
      statKey: 'passiveRate',
      statValue: 10,
      iconUrl: '/heroes/toxic.png',
    },
    {
      name: 'CRIMSON_KNIGHT',
      description: 'Heavy hitter with massive click bonuses.',
      type: 'HERO',
      rarity: 'RARE',
      heroClass: 'CRIMSON',
      statKey: 'clickPower',
      statValue: 25,
      iconUrl: '/heroes/crimson.png',
    },
    {
      name: 'SOLAR_PRIME',
      description: 'Ascended being with godly stats.',
      type: 'HERO',
      rarity: 'LEGENDARY',
      heroClass: 'SOLAR',
      statKey: 'passiveRate',
      statValue: 100,
      iconUrl: '/heroes/solar.png',
    },
  ]).returning()

  // 4. Seed Loot Tables
  console.log('Seeding Loot Tables...')
  await db.insert(chestLootTable).values([
    // Common Chest
    { chestTierId: commonChest.id, itemId: h1.id, weight: 80, minLevel: 1 },
    { chestTierId: commonChest.id, itemId: h2.id, weight: 20, minLevel: 1 },
    
    // Elite Chest
    { chestTierId: eliteChest.id, itemId: h2.id, weight: 60, minLevel: 1 },
    { chestTierId: eliteChest.id, itemId: h3.id, weight: 35, minLevel: 1 },
    { chestTierId: eliteChest.id, itemId: h4.id, weight: 5,  minLevel: 1 },
    
    // Legendary Chest
    { chestTierId: legendaryChest.id, itemId: h3.id, weight: 60, minLevel: 1 },
    { chestTierId: legendaryChest.id, itemId: h4.id, weight: 40, minLevel: 1 },
  ])

  console.log('--- ✅ SEED COMPLETE ✅ ---')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
