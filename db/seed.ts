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

  // 3. Seed Items (Collectibles & Heroes)
  console.log('Seeding Items...')
  const itemData = [
    // --- COMMON ---
    { name: 'STATIC_DATAPAD', description: 'Cracked tablet stuck on a loop of corporate propaganda. Worthless but heavy.', rarity: 'COMMON', type: 'COSMETIC', iconUrl: '/items/static_datapad.png' },
    { name: 'ECHO_STIM', description: 'Basic adrenaline injector. The label says property of Nexus Medical.', rarity: 'COMMON', type: 'COSMETIC', iconUrl: '/items/echo_stim.png' },
    { name: 'SECTOR_BADGE', description: 'Rusted security badge from the flooded lower districts.', rarity: 'COMMON', type: 'COSMETIC', iconUrl: '/items/sector_badge.png' },
    { name: 'VOLT_TAPE', description: 'Industrial-grade conductive tape. Smells like ozone and desperation.', rarity: 'COMMON', type: 'COSMETIC', iconUrl: '/items/volt_tape.png' },
    
    // --- UNCOMMON ---
    { name: 'NEON_TANTO', description: 'Carbon-fiber blade with a chem-luminescent edge. Sharp enough to cut data.', rarity: 'UNCOMMON', type: 'COSMETIC', iconUrl: '/items/neon_tanto.png' },
    { name: 'EMP_CHARGE', description: 'Tactical disruption device. Effectively kills Wi-Fi in a 3-block radius.', rarity: 'UNCOMMON', type: 'COSMETIC', iconUrl: '/items/emp_charge.png' },
    { name: 'SCAN_VISOR', description: 'Retro-fitted headgear that overlays heat signatures onto vision.', rarity: 'UNCOMMON', type: 'COSMETIC', iconUrl: '/items/scan_visor.png' },
    { name: 'SIGNAL_JAMMER', description: 'Crude device for staying off-grid during city transit.', rarity: 'UNCOMMON', type: 'COSMETIC', iconUrl: '/items/signal_jammer.png' },

    // --- RARE ---
    { name: 'VOID_DAGGER', description: 'Blade forged from dark-matter. It feels colder than the void.', rarity: 'RARE', type: 'COSMETIC', iconUrl: '/items/void_dagger.png' },
    { name: 'NET_DECK', description: 'Customized hacking interface with liquid-nitrogen cooling pipes.', rarity: 'RARE', type: 'COSMETIC', iconUrl: '/items/net_deck.png' },
    { name: 'ARC_THROWER', description: 'Handheld railgun prototype. Discharges blue lightning in beautiful arcs.', rarity: 'RARE', type: 'COSMETIC', iconUrl: '/items/arc_thrower.png' },
    { name: 'ENCRYPTED_HDD', description: 'Data cylinder containing 400TB of encrypted military chatter.', rarity: 'RARE', type: 'COSMETIC', iconUrl: '/items/encrypted_hdd.png' },

    // --- EPIC ---
    { name: 'PHANTOM_MASK', description: 'Samurai mask integrated with a localized HUD and modulator.', rarity: 'EPIC', type: 'COSMETIC', iconUrl: '/items/phantom_mask.png' },
    { name: 'DRAGON_LANTERN', description: 'Holographic projection unit that generates a spectral dragon protector.', rarity: 'EPIC', type: 'COSMETIC', iconUrl: '/items/dragon_lantern.png' },
    { name: 'NEURAL_RELIC', description: 'Bio-chip containing the fragmented memories of a legendary rebel.', rarity: 'EPIC', type: 'COSMETIC', iconUrl: '/items/neural_relic.png' },
    { name: 'SENTINEL_SHIELD', description: 'Hexagonal energy shield generator used by high-tier corporate security.', rarity: 'EPIC', type: 'COSMETIC', iconUrl: '/items/sentinel_shield.png' },

    // --- LEGENDARY ---
    { name: 'OVERSEER_EYE', description: 'Salvaged sensor node from NODE-0 itself. It still watches.', rarity: 'LEGENDARY', type: 'COSMETIC', iconUrl: '/items/overseer_eye.png' },
    { name: 'CELESTIAL_VANDAL', description: 'Rifle made of marble and gold, pulsing with Radiant energy.', rarity: 'LEGENDARY', type: 'COSMETIC', iconUrl: '/items/celestial_vandal.png' },
    { name: 'MASTER_KEY', description: 'Legendary override tool that can bypass any firewall in the city.', rarity: 'LEGENDARY', type: 'COSMETIC', iconUrl: '/items/master_key.png' },
    { name: 'NEXUS_CORE', description: 'Fragment of the city reactor. Glows with blinding solar-gold light.', rarity: 'LEGENDARY', type: 'COSMETIC', iconUrl: '/items/nexus_core.png' },
  ] as any[]

  const allItems = await db.insert(items).values(itemData).returning()

  // 4. Seed Loot Tables
  console.log('Seeding Loot Tables...')
  const lootEntries: any[] = []

  // Helper to add items to loot table
  const addByRarity = (chestId: string, rarity: string, weight: number) => {
    const tieredItems = allItems.filter(i => i.rarity === rarity)
    const perItemWeight = Math.floor(weight / tieredItems.length)
    tieredItems.forEach(i => {
      lootEntries.push({ chestTierId: chestId, itemId: i.id, weight: perItemWeight, minLevel: 1 })
    })
  }

  // Common Chest: 70% Common, 25% Uncommon, 5% Rare
  addByRarity(commonChest.id, 'COMMON', 700)
  addByRarity(commonChest.id, 'UNCOMMON', 250)
  addByRarity(commonChest.id, 'RARE', 50)

  // Elite Chest: 40% Uncommon, 40% Rare, 18% Epic, 2% Legendary
  addByRarity(eliteChest.id, 'UNCOMMON', 400)
  addByRarity(eliteChest.id, 'RARE', 400)
  addByRarity(eliteChest.id, 'EPIC', 180)
  addByRarity(eliteChest.id, 'LEGENDARY', 20)

  // Legendary Chest: 30% Rare, 40% Epic, 30% Legendary
  addByRarity(legendaryChest.id, 'RARE', 300)
  addByRarity(legendaryChest.id, 'EPIC', 400)
  addByRarity(legendaryChest.id, 'LEGENDARY', 300)

  await db.insert(chestLootTable).values(lootEntries)

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
