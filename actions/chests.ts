'use server'

import { db } from '@/db/client'
import { gameState, chestTiers, chestLootTable, playerItems, chestOpens, items } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { createSupabaseServer } from '@/lib/supabase/server'
import { rollLoot } from '@/lib/game/loot'
import { trackQuestEventAction } from './quests'
import { revalidatePath } from 'next/cache'

export async function getChestTiersAction() {
  return db.query.chestTiers.findMany({
    orderBy: (t, { asc }) => [asc(t.xpCost)],
  })
}

export async function openChestAction(chestTierId: string) {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // load chest config and player state
  const tier = await db.query.chestTiers.findFirst({
    where: eq(chestTiers.id, chestTierId),
    with: {
      lootTable: {
        with: {
          item: true,
        },
      },
    },
  })

  const state = await db.query.gameState.findFirst({
    where: eq(gameState.userId, user.id),
  })

  if (!tier || !state) throw new Error('Configuration or State not found')
  if (state.level < tier.minLevel) throw new Error(`Level ${tier.minLevel} required to open this chest`)
  if (state.currentXp < BigInt(tier.xpCost)) throw new Error('Insufficient XP')

  // server-side loot roll
  const drop = rollLoot(
    tier.lootTable.map((e) => ({
      itemId: e.itemId,
      rarity: e.item.rarity,
      weight: e.weight,
      minLevel: e.minLevel,
    })),
    state.level
  )

  // mutations in a transaction
  const result = await db.transaction(async (tx) => {
    // deduct XP
    await tx
      .update(gameState)
      .set({ currentXp: state.currentXp - BigInt(tier.xpCost) })
      .where(eq(gameState.userId, user.id))

    // check for duplicate
    const existing = await tx.query.playerItems.findFirst({
      where: and(eq(playerItems.userId, user.id), eq(playerItems.itemId, drop.itemId)),
    })

    let isDuplicate = false
    if (existing) {
      isDuplicate = true
      // Duplicates grant shards (currency for future upgrades)
      await tx
        .update(playerItems)
        .set({ shards: existing.shards + 10 })
        .where(eq(playerItems.id, existing.id))
    } else {
      await tx.insert(playerItems).values({
        userId: user.id,
        itemId: drop.itemId,
      })
    }

    // log the open
    await tx.insert(chestOpens).values({
      userId: user.id,
      chestTierId,
      itemId: drop.itemId,
      rarity: drop.rarity,
      playerLevelAt: state.level,
    })

    return { isDuplicate }
  })

  const droppedItem = await db.query.items.findFirst({
    where: eq(items.id, drop.itemId),
  })

  trackQuestEventAction('CHEST_OPEN', 1).catch(() => { })

  revalidatePath('/')

  return { item: droppedItem, isDuplicate: result.isDuplicate }
}
