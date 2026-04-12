'use server'

import { db } from '@/db/client'
import { playerItems, items } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function getPlayerInventoryAction() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { inventory: [], allItems: [] }

  const [inventory, allItems] = await Promise.all([
    db.query.playerItems.findMany({
      where: eq(playerItems.userId, user.id),
      with: {
        item: true
      }
    }),
    db.query.items.findMany()
  ])

  return { inventory, allItems }
}
