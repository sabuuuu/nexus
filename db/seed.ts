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
import { questTemplates, questProgress } from './schema/quests'
import { sql } from 'drizzle-orm'

config({ path: '.env.local' })

const connectionString = process.env.DATABASE_URL!
const client = postgres(connectionString, { max: 1 })
const db = drizzle(client, { 
  schema: { users, gameState, items, chestTiers, chestLootTable, chestOpens, playerItems, seasons, leaderboardEntries, questTemplates, questProgress } 
})

async function main() {
  console.log('--- ⚡ NEXUS CITY SEED START ⚡ ---')

  // Cleanup
  console.log('Cleaning up old data...')
  await db.execute(sql`DELETE FROM "chest_loot_table"`)
  await db.execute(sql`DELETE FROM "chest_opens"`)
  await db.execute(sql`DELETE FROM "player_items"`)
  await db.execute(sql`DELETE FROM "leaderboard_entries"`)
  await db.execute(sql`DELETE FROM "quest_progress"`)
  await db.execute(sql`DELETE FROM "quest_templates"`)
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

  // 5. Seed Quest Templates
  console.log('Seeding Quest Templates...')
  await db.insert(questTemplates).values([
    // --- CLICK_COUNT ---
    { title: 'First Strike',      description: 'Click 50 times.',         type: 'CLICK_COUNT', targetValue: 50,    rewardXp: 500   },
    { title: 'Surge Protocol',    description: 'Click 250 times.',        type: 'CLICK_COUNT', targetValue: 250,   rewardXp: 2000  },
    { title: 'Power Overload',    description: 'Click 1,000 times.',      type: 'CLICK_COUNT', targetValue: 1000,  rewardXp: 7500  },
    { title: 'Core Meltdown',     description: 'Click 5,000 times.',      type: 'CLICK_COUNT', targetValue: 5000,  rewardXp: 30000 },
    // --- CHEST_OPEN ---
    { title: 'Intel Recovery',    description: 'Open 1 crate.',           type: 'CHEST_OPEN',  targetValue: 1,     rewardXp: 1000  },
    { title: 'Supply Run',        description: 'Open 3 crates.',          type: 'CHEST_OPEN',  targetValue: 3,     rewardXp: 4000  },
    { title: 'Black Market Raid', description: 'Open 10 crates.',         type: 'CHEST_OPEN',  targetValue: 10,    rewardXp: 15000 },
    // --- LEVEL_REACH ---
    { title: 'Initiated',         description: 'Reach Level 2.',          type: 'LEVEL_REACH', targetValue: 2,     rewardXp: 500   },
    { title: 'Field Agent',       description: 'Reach Level 5.',          type: 'LEVEL_REACH', targetValue: 5,     rewardXp: 2500  },
    { title: 'Elite Operative',   description: 'Reach Level 10.',         type: 'LEVEL_REACH', targetValue: 10,    rewardXp: 10000 },
    { title: 'Specialist',        description: 'Reach Level 25.',         type: 'LEVEL_REACH', targetValue: 25,    rewardXp: 50000 },
    // --- XP_EARN ---
    { title: 'Energy Spike',      description: 'Earn 1,000 XP.',          type: 'XP_EARN',     targetValue: 1000,  rewardXp: 250   },
    { title: 'Power Surge',       description: 'Earn 10,000 XP.',         type: 'XP_EARN',     targetValue: 10000, rewardXp: 2000  },
    { title: 'Nexus Drain',       description: 'Earn 100,000 XP.',        type: 'XP_EARN',     targetValue: 100000,rewardXp: 15000 },
  ])

  console.log('--- ✅ SEED COMPLETE ✅ ---')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
