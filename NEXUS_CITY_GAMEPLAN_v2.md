# NEXUS CITY — Game Design & Engineering Document v2

> A superhero-themed idle clicker game with ranked seasons, loot chests, item rarity, and XP-scaled drops.
> Stack: Next.js 14 (App Router) · Drizzle ORM · Supabase (Postgres + Auth + Realtime + Storage) · shadcn/ui · Zustand · TanStack Query · Tailwind CSS

---

## Table of Contents

1. [Design System & Theme](#1-design-system--theme)
2. [Architecture Overview](#2-architecture-overview)
3. [Project Setup](#3-project-setup)
4. [Database Schema — Drizzle](#4-database-schema--drizzle)
5. [Game Mechanics Spec](#5-game-mechanics-spec)
6. [Phase 1 — Core Loop](#6-phase-1--core-loop)
7. [Phase 2 — Chest & Loot System](#7-phase-2--chest--loot-system)
8. [Phase 3 — Leaderboard & Social](#8-phase-3--leaderboard--social)
9. [Phase 4 — Meta Progression & Quests](#9-phase-4--meta-progression--quests)
10. [Phase 5 — Polish & Launch](#10-phase-5--polish--launch)
11. [Folder Structure](#11-folder-structure)
12. [Environment & Config](#12-environment--config)
13. [Anti-Cheat & Security](#13-anti-cheat--security)
14. [Asset Generation Prompts](#14-asset-generation-prompts)

---

## 1. Design System & Theme

### Concept: NEXUS CITY

A gritty, neon-lit superhero metropolis at night. The aesthetic sits between a DC animated series and a cyberpunk comic — dark backgrounds, electric accent colors, cel-shaded hero art. Not cartoonish, not hyper-realistic. Stylized and bold.

All UI is built with **shadcn/ui** components. The shadcn theme is customised via CSS variables in `globals.css` to match the Nexus City palette. Components are used as-is where possible and extended via `className` with Tailwind utilities.

### shadcn/ui Setup Philosophy

- Use `npx shadcn@latest add <component>` for every UI primitive — never hand-roll what shadcn provides.
- Override the default shadcn theme colors in `globals.css` to match the game palette below.
- Extend shadcn components via `className` props and Tailwind — never edit the component source files in `/components/ui/`.
- Use shadcn's `cn()` utility everywhere for conditional class merging.

### CSS Variables — shadcn Theme Override

```css
/* app/globals.css */

@layer base {
  :root {
    /* shadcn base overrides — dark game theme */
    --background:         222 47% 6%;    /* #070B14 — void black */
    --foreground:         210 40% 96%;

    --card:               222 35% 10%;   /* #0B0F1A */
    --card-foreground:    210 40% 96%;

    --popover:            222 35% 10%;
    --popover-foreground: 210 40% 96%;

    --primary:            217 91% 60%;   /* electric blue #3B82F6 */
    --primary-foreground: 222 47% 6%;

    --secondary:          222 28% 16%;   /* #1A2235 */
    --secondary-foreground: 210 40% 80%;

    --muted:              222 28% 14%;
    --muted-foreground:   215 20% 55%;

    --accent:             38 92% 50%;    /* solar gold #F59E0B */
    --accent-foreground:  222 47% 6%;

    --destructive:        0 84% 60%;     /* crimson #EF4444 */
    --destructive-foreground: 210 40% 96%;

    --border:             222 28% 18%;
    --input:              222 28% 16%;
    --ring:               217 91% 60%;

    --radius: 0.625rem;

    /* Game-specific tokens (not shadcn) */
    --rarity-common:    #6B7280;
    --rarity-uncommon:  #22C55E;
    --rarity-rare:      #3B82F6;
    --rarity-epic:      #A855F7;
    --rarity-legendary: #F59E0B;

    --hero-electric:    #3B82F6;
    --hero-crimson:     #EF4444;
    --hero-toxic:       #22C55E;
    --hero-solar:       #F59E0B;
  }
}
```

### Typography

```css
/* app/globals.css — font setup */

@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  --font-display: 'Bebas Neue', sans-serif;    /* XP counters, level numbers, headings */
  --font-ui:      'DM Sans', sans-serif;        /* body, buttons, labels */
  --font-mono:    'JetBrains Mono', monospace;  /* stats, leaderboard numbers */
}

body {
  font-family: var(--font-ui);
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

### shadcn Components Used (install all upfront)

```bash
npx shadcn@latest add button card badge dialog drawer progress
npx shadcn@latest add separator skeleton tabs tooltip avatar
npx shadcn@latest add scroll-area sheet table alert-dialog
npx shadcn@latest add sonner          # toast notifications (replaces shadcn toast)
```

### Rarity Visual System

Each rarity maps to a color, a shadcn `Badge` variant, and a card glow.

| Tier       | Color var            | Badge style                      | Drop rate (base) |
|------------|----------------------|----------------------------------|------------------|
| Common     | `--rarity-common`    | `variant="secondary"`            | 60%              |
| Uncommon   | `--rarity-uncommon`  | green border + text              | 25%              |
| Rare       | `--rarity-rare`      | blue border + text               | 10%              |
| Epic       | `--rarity-epic`      | purple border + text + glow      | 4%               |
| Legendary  | `--rarity-legendary` | gold border + text + pulse anim  | 1%               |

```tsx
// components/ui/rarity-badge.tsx — extends shadcn Badge

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'

const rarityConfig: Record<Rarity, { label: string; className: string }> = {
  COMMON:    { label: 'Common',    className: 'border-[--rarity-common]    text-[--rarity-common]' },
  UNCOMMON:  { label: 'Uncommon',  className: 'border-[--rarity-uncommon]  text-[--rarity-uncommon]' },
  RARE:      { label: 'Rare',      className: 'border-[--rarity-rare]      text-[--rarity-rare]' },
  EPIC:      { label: 'Epic',      className: 'border-[--rarity-epic]      text-[--rarity-epic]  shadow-[0_0_12px_var(--rarity-epic)]' },
  LEGENDARY: { label: 'Legendary', className: 'border-[--rarity-legendary] text-[--rarity-legendary] shadow-[0_0_20px_var(--rarity-legendary)] animate-pulse' },
}

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  const { label, className } = rarityConfig[rarity]
  return (
    <Badge variant="outline" className={cn('font-mono text-xs uppercase tracking-widest', className)}>
      {label}
    </Badge>
  )
}
```

---

## 2. Architecture Overview

### Guiding Principles

- **Server-authoritative**: All XP mutations and loot drops are validated server-side. Never trust the client for game state changes.
- **Optimistic UI**: Client updates instantly for feel via Zustand; syncs to Supabase asynchronously via TanStack Query mutations. Rollback on failure.
- **Layered separation**: UI (shadcn components) → hooks → server actions / API routes → Drizzle queries → Supabase Postgres.
- **Drizzle over raw SQL**: All DB access goes through Drizzle. Raw SQL only for complex window functions in leaderboard queries.
- **Supabase does the heavy lifting**: Auth, Realtime subscriptions, Storage for assets, and Postgres hosting — all Supabase. No separate backend service needed.

### System Diagram

```
┌──────────────────────────────────────────────────────┐
│                   Browser (Next.js)                   │
│                                                       │
│  shadcn/ui components                                 │
│  ↕ Zustand (optimistic local game state)              │
│  ↕ TanStack Query (server sync + cache)               │
│  ↕ Supabase JS client (Realtime subscriptions)        │
└──────────────────────┬───────────────────────────────┘
                       │ HTTPS / WSS
┌──────────────────────▼───────────────────────────────┐
│         Next.js App Router                            │
│                                                       │
│   Server Actions  ←→  API Routes (for crons only)    │
│   ↓                                                   │
│   Drizzle ORM (type-safe queries)                     │
│   ↓                                                   │
│   Supabase Postgres (connection pooling via pgBouncer)│
└──────────────────────────────────────────────────────┘
         │                    │
   Supabase Auth        Supabase Storage
   (SSR cookies)        (item icons, hero art)
```

### Why Server Actions over API Routes

Server Actions (Next.js 14) are used for all game mutations — they run on the server, have direct access to the Supabase session cookie, and avoid the boilerplate of API route handlers. API routes are only used for Vercel cron jobs (which need a GET endpoint).

### State Management

```
Zustand store (client, in-memory)
├── xp, level, clickPower, passiveRate  ← synced from server on mount
├── pendingXp                           ← accumulates between syncs, flushed every 5s
└── inventory, equippedItems            ← loaded on mount, updated after chest opens

TanStack Query
├── useGameState()     → loads initial state (SSR-friendly)
├── useInventory()     → player items with rarity
├── useLeaderboard()   → polling + Realtime invalidation
└── mutations          → openChest, equipItem, syncXp
```

---

## 3. Project Setup

### Install & Init

```bash
# 1. Create Next.js project
npx create-next-app@latest nexus-city \
  --typescript --tailwind --eslint --app --src-dir=false

cd nexus-city

# 2. Install Drizzle
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit

# If using Supabase's direct Postgres (not Neon):
npm install drizzle-orm postgres
npm install -D drizzle-kit

# 3. Supabase client
npm install @supabase/supabase-js @supabase/ssr

# 4. State & data fetching
npm install zustand @tanstack/react-query

# 5. Game utils
npm install howler
npm install -D @types/howler

# 6. shadcn init (choose dark theme, CSS variables: yes)
npx shadcn@latest init

# 7. Add all shadcn components
npx shadcn@latest add button card badge dialog drawer progress
npx shadcn@latest add separator skeleton tabs tooltip avatar
npx shadcn@latest add scroll-area sheet table alert-dialog sonner
```

### Drizzle Config

```typescript
// drizzle.config.ts

import type { Config } from 'drizzle-kit'

export default {
  schema:    './db/schema/index.ts',
  out:       './db/migrations',
  dialect:   'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config
```

### Drizzle Client Singleton

```typescript
// db/client.ts

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Prevent multiple connections in development (Next.js hot reload)
const globalForDb = globalThis as unknown as { connection: postgres.Sql }

const connection =
  globalForDb.connection ??
  postgres(process.env.DATABASE_URL!, { max: 10 })

if (process.env.NODE_ENV !== 'production') globalForDb.connection = connection

export const db = drizzle(connection, { schema, logger: process.env.NODE_ENV === 'development' })
```

### Supabase Server Client

```typescript
// lib/supabase/server.ts
// Used in Server Components, Server Actions, and Route Handlers

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createSupabaseServer() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}

// lib/supabase/client.ts
// Used in Client Components for Realtime subscriptions

import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

## 4. Database Schema — Drizzle

All tables are defined in `db/schema/`. Split by domain for clarity.

### Users

```typescript
// db/schema/users.ts

import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id:        text('id').primaryKey(),           // matches Supabase auth.users.id
  email:     text('email').notNull().unique(),
  username:  text('username').notNull().unique(),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})
```

### Game State

```typescript
// db/schema/gameState.ts

import { pgTable, text, bigint, integer, timestamp } from 'drizzle-orm/pg-core'
import { users } from './users'

export const gameState = pgTable('game_state', {
  id:           text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:       text('user_id').notNull().unique().references(() => users.id, { onDelete: 'cascade' }),

  totalXp:      bigint('total_xp', { mode: 'bigint' }).default(BigInt(0)).notNull(),
  currentXp:    bigint('current_xp', { mode: 'bigint' }).default(BigInt(0)).notNull(),
  level:        integer('level').default(1).notNull(),
  clickPower:   integer('click_power').default(1).notNull(),  // base, before item bonuses
  passiveRate:  integer('passive_rate').default(0).notNull(), // XP/sec, before item bonuses
  prestigeCount: integer('prestige_count').default(0).notNull(),

  lastSeenAt:   timestamp('last_seen_at').defaultNow().notNull(),
  lastSyncAt:   timestamp('last_sync_at').defaultNow().notNull(),
  updatedAt:    timestamp('updated_at').defaultNow().notNull(),
})
```

### Items (Catalog)

```typescript
// db/schema/items.ts

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
```

### Chest Tiers & Loot Tables

```typescript
// db/schema/chests.ts

import { pgTable, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { rarityEnum } from './items'
import { items } from './items'
import { users } from './users'

export const chestTiers = pgTable('chest_tiers', {
  id:       text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:     text('name').notNull(),   // 'COMMON' | 'ELITE' | 'LEGENDARY'
  xpCost:   integer('xp_cost').notNull(),
  minLevel: integer('min_level').default(1).notNull(),
})

export const chestLootTable = pgTable('chest_loot_table', {
  id:           text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  chestTierId:  text('chest_tier_id').notNull().references(() => chestTiers.id),
  itemId:       text('item_id').notNull().references(() => items.id),
  weight:       integer('weight').notNull(),   // relative weight for RNG
  minLevel:     integer('min_level').default(1).notNull(),
})

export const chestOpens = pgTable('chest_opens', {
  id:             text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:         text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  chestTierId:    text('chest_tier_id').notNull(),
  itemId:         text('item_id').notNull(),
  rarity:         rarityEnum('rarity').notNull(),
  playerLevelAt:  integer('player_level_at').notNull(),
  openedAt:       timestamp('opened_at').defaultNow().notNull(),
})
```

### Player Inventory

```typescript
// db/schema/inventory.ts

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
```

### Seasons & Leaderboard

```typescript
// db/schema/leaderboard.ts

import { pgTable, text, bigint, integer, boolean, timestamp, unique, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'

export const rankTierEnum = pgEnum('rank_tier', [
  'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'NEXUS_CHAMPION',
])

export const seasons = pgTable('seasons', {
  id:       text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name:     text('name').notNull(),    // "Season 1: Rise of the Nexus"
  startsAt: timestamp('starts_at').notNull(),
  endsAt:   timestamp('ends_at').notNull(),
  isActive: boolean('is_active').default(false).notNull(),
})

export const leaderboardEntries = pgTable('leaderboard_entries', {
  id:       text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:   text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  seasonId: text('season_id').notNull().references(() => seasons.id),
  totalXp:  bigint('total_xp', { mode: 'bigint' }).default(BigInt(0)).notNull(),
  rank:     integer('rank'),           // materialised by cron
  tier:     rankTierEnum('tier').default('BRONZE').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  uniqueUserSeason: unique().on(t.userId, t.seasonId),
}))
```

### Quests

```typescript
// db/schema/quests.ts

import { pgTable, text, integer, boolean, timestamp, unique, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'

export const questTypeEnum = pgEnum('quest_type', [
  'CLICK_COUNT', 'CHEST_OPEN', 'LEVEL_REACH', 'XP_EARN',
])

export const questTemplates = pgTable('quest_templates', {
  id:          text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  title:       text('title').notNull(),
  description: text('description').notNull(),
  type:        questTypeEnum('type').notNull(),
  targetValue: integer('target_value').notNull(),
  rewardXp:    integer('reward_xp').notNull(),
  rewardChestTierId: text('reward_chest_tier_id'),
})

export const questProgress = pgTable('quest_progress', {
  id:              text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId:          text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  questTemplateId: text('quest_template_id').notNull().references(() => questTemplates.id),
  currentValue:    integer('current_value').default(0).notNull(),
  isComplete:      boolean('is_complete').default(false).notNull(),
  completedAt:     timestamp('completed_at'),
  assignedAt:      timestamp('assigned_at').defaultNow().notNull(),
}, (t) => ({
  uniqueUserQuestDay: unique().on(t.userId, t.questTemplateId, t.assignedAt),
}))
```

### Schema Index

```typescript
// db/schema/index.ts

export * from './users'
export * from './gameState'
export * from './items'
export * from './chests'
export * from './inventory'
export * from './leaderboard'
export * from './quests'
```

### Migrations

```bash
# Generate migration files from schema
npx drizzle-kit generate

# Push directly to Supabase Postgres (dev only)
npx drizzle-kit push

# Apply migrations in production
npx drizzle-kit migrate
```

---

## 5. Game Mechanics Spec

### XP & Level Formula

```typescript
// lib/game/formulas.ts

/**
 * XP required to reach a given level.
 * Quadratic curve — fair early, gated late.
 *
 * Level 10  →    4,500 XP
 * Level 50  →  112,500 XP
 * Level 100 →  450,000 XP
 */
export function xpForLevel(level: number): number {
  return Math.floor(50 * Math.pow(level, 1.8))
}

export function levelFromTotalXp(totalXp: bigint): number {
  let level = 1
  let accumulated = BigInt(0)
  while (accumulated + BigInt(xpForLevel(level + 1)) <= totalXp) {
    accumulated += BigInt(xpForLevel(level + 1))
    level++
  }
  return level
}

export function xpProgressInLevel(totalXp: bigint, level: number): number {
  const xpAtCurrentLevel = Array.from({ length: level - 1 }, (_, i) =>
    xpForLevel(i + 2)
  ).reduce((a, b) => a + b, 0)
  const remaining = Number(totalXp) - xpAtCurrentLevel
  const needed    = xpForLevel(level + 1)
  return Math.min(remaining / needed, 1)
}

export function computeClickPower(
  base: number,
  equippedItems: { statKey: string | null; statValue: number }[],
  prestigeCount: number
): number {
  const itemBonus = equippedItems
    .filter((i) => i.statKey === 'clickPower')
    .reduce((sum, i) => sum + i.statValue, 0)
  const prestigeMultiplier = 1 + prestigeCount * 0.25
  return Math.floor((base + itemBonus) * prestigeMultiplier)
}

export function computePassiveRate(
  equippedItems: { statKey: string | null; statValue: number }[],
  prestigeCount: number
): number {
  const base = equippedItems
    .filter((i) => i.statKey === 'passiveRate')
    .reduce((sum, i) => sum + i.statValue, 0)
  return Math.floor(base * (1 + prestigeCount * 0.1))
}
```

### Loot Drop Algorithm

```typescript
// lib/game/loot.ts

type Rarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'

interface LootEntry {
  itemId:   string
  rarity:   Rarity
  weight:   number
  minLevel: number
}

/**
 * Level-scaled weighted random selection.
 * Higher player level boosts rare tier weights.
 * Caps at level 100 to prevent trivialization.
 */
const RARITY_MULTIPLIERS: Record<Rarity, (level: number) => number> = {
  COMMON:    ()  => 1.0,
  UNCOMMON:  (l) => 1 + Math.min(l / 100, 0.5),
  RARE:      (l) => 1 + Math.min(l / 50,  1.0),
  EPIC:      (l) => 1 + Math.min(l / 30,  2.0),
  LEGENDARY: (l) => 1 + Math.min(l / 25,  3.0),
}

export function rollLoot(table: LootEntry[], playerLevel: number): LootEntry {
  const eligible = table.filter((e) => playerLevel >= e.minLevel)
  if (eligible.length === 0) throw new Error('No eligible loot for this player level')

  const weighted = eligible.map((e) => ({
    ...e,
    adjustedWeight: e.weight * RARITY_MULTIPLIERS[e.rarity](playerLevel),
  }))

  const total = weighted.reduce((s, e) => s + e.adjustedWeight, 0)
  let roll    = Math.random() * total

  for (const entry of weighted) {
    roll -= entry.adjustedWeight
    if (roll <= 0) return entry
  }

  return weighted[weighted.length - 1]
}
```

### Rank Tiers

```typescript
// lib/game/ranks.ts

type RankTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'NEXUS_CHAMPION'

export const RANK_THRESHOLDS: { tier: RankTier; minXp: bigint }[] = [
  { tier: 'NEXUS_CHAMPION', minXp: BigInt(10_000_000) },
  { tier: 'PLATINUM',       minXp: BigInt(1_000_000)  },
  { tier: 'GOLD',           minXp: BigInt(250_000)    },
  { tier: 'SILVER',         minXp: BigInt(50_000)     },
  { tier: 'BRONZE',         minXp: BigInt(0)          },
]

export function tierFromXp(xp: bigint): RankTier {
  return RANK_THRESHOLDS.find((t) => xp >= t.minXp)?.tier ?? 'BRONZE'
}
```

---

## 6. Phase 1 — Core Loop

**Goal:** A working, feel-good click loop persisted to Supabase.
**Timeline:** Week 1–2

### Zustand Game Store

```typescript
// store/gameStore.ts

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { computeClickPower, computePassiveRate } from '@/lib/game/formulas'

interface EquippedItem {
  statKey:   string | null
  statValue: number
}

interface GameStore {
  totalXp:      bigint
  currentXp:    bigint
  level:        number
  clickPower:   number
  passiveRate:  number
  prestigeCount: number
  equippedItems: EquippedItem[]
  pendingXp:    bigint

  registerClick:    () => void
  flushPendingXp:   () => bigint
  applyServerState: (partial: Partial<GameStore>) => void
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    totalXp:       BigInt(0),
    currentXp:     BigInt(0),
    level:         1,
    clickPower:    1,
    passiveRate:   0,
    prestigeCount: 0,
    equippedItems: [],
    pendingXp:     BigInt(0),

    registerClick() {
      const power = BigInt(
        computeClickPower(get().clickPower, get().equippedItems, get().prestigeCount)
      )
      set((s) => ({
        totalXp:   s.totalXp + power,
        currentXp: s.currentXp + power,
        pendingXp: s.pendingXp + power,
      }))
    },

    flushPendingXp() {
      const pending = get().pendingXp
      set({ pendingXp: BigInt(0) })
      return pending
    },

    applyServerState(partial) {
      const equippedItems  = partial.equippedItems  ?? get().equippedItems
      const prestigeCount  = partial.prestigeCount  ?? get().prestigeCount
      const baseClickPower = partial.clickPower     ?? get().clickPower
      set({
        ...partial,
        clickPower:  computeClickPower(baseClickPower, equippedItems, prestigeCount),
        passiveRate: computePassiveRate(equippedItems, prestigeCount),
      })
    },
  }))
)
```

### Server Action — Sync XP

```typescript
// actions/game.ts
'use server'

import { db } from '@/db/client'
import { gameState, leaderboardEntries, seasons } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { createSupabaseServer } from '@/lib/supabase/server'
import { levelFromTotalXp } from '@/lib/game/formulas'
import { validateClickPayload } from '@/lib/game/anticheat'

const MAX_XP_PER_SYNC = BigInt(100_000)

export async function syncXpAction(pendingXpStr: string) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const pendingXp = BigInt(pendingXpStr)
  if (pendingXp <= BigInt(0) || pendingXp > MAX_XP_PER_SYNC) {
    throw new Error('Invalid XP amount')
  }

  // load current state for anti-cheat validation
  const [current] = await db
    .select()
    .from(gameState)
    .where(eq(gameState.userId, user.id))
    .limit(1)

  if (current) {
    const validation = validateClickPayload(
      pendingXp,
      current.clickPower,
      current.lastSyncAt
    )
    if (!validation.valid) throw new Error(validation.reason)
  }

  // upsert game state
  const now = new Date()
  const [updated] = await db
    .insert(gameState)
    .values({
      userId:    user.id,
      totalXp:   pendingXp,
      currentXp: pendingXp,
      lastSyncAt: now,
    })
    .onConflictDoUpdate({
      target: gameState.userId,
      set: {
        totalXp:   db.$with('gs').select({ v: gameState.totalXp }),  // inline increment below
        lastSyncAt: now,
      },
    })
    .returning()

  // Drizzle doesn't support increment in upsert cleanly — use update after upsert
  const [final] = await db
    .update(gameState)
    .set({
      totalXp:    current
        ? (current.totalXp + pendingXp)
        : pendingXp,
      currentXp:  current
        ? (current.currentXp + pendingXp)
        : pendingXp,
      level:      levelFromTotalXp(current ? current.totalXp + pendingXp : pendingXp),
      lastSyncAt: now,
    })
    .where(eq(gameState.userId, user.id))
    .returning()

  // update leaderboard entry for active season
  const [activeSeason] = await db
    .select()
    .from(seasons)
    .where(eq(seasons.isActive, true))
    .limit(1)

  if (activeSeason) {
    const existing = await db
      .select()
      .from(leaderboardEntries)
      .where(
        and(
          eq(leaderboardEntries.userId, user.id),
          eq(leaderboardEntries.seasonId, activeSeason.id)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(leaderboardEntries)
        .set({
          totalXp:   existing[0].totalXp + pendingXp,
          updatedAt: now,
        })
        .where(eq(leaderboardEntries.id, existing[0].id))
    } else {
      await db.insert(leaderboardEntries).values({
        userId:   user.id,
        seasonId: activeSeason.id,
        totalXp:  pendingXp,
      })
    }
  }

  return { totalXp: final.totalXp.toString(), level: final.level }
}

export async function loadGameStateAction() {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const [state] = await db
    .select()
    .from(gameState)
    .where(eq(gameState.userId, user.id))
    .limit(1)

  return state ?? null
}
```

### XP Sync Hook

```typescript
// hooks/useXpSync.ts
'use client'

import { useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useGameStore } from '@/store/gameStore'
import { syncXpAction } from '@/actions/game'
import { toast } from 'sonner'

const SYNC_INTERVAL_MS = 5_000

export function useXpSync() {
  const flushPendingXp   = useGameStore((s) => s.flushPendingXp)
  const applyServerState = useGameStore((s) => s.applyServerState)
  const intervalRef      = useRef<ReturnType<typeof setInterval>>()

  const { mutate: sync } = useMutation({
    mutationFn: async (pending: bigint) => {
      if (pending <= BigInt(0)) return null
      return syncXpAction(pending.toString())
    },
    onSuccess: (data) => {
      if (data) {
        applyServerState({ totalXp: BigInt(data.totalXp), level: data.level })
      }
    },
    onError: () => {
      toast.error('Sync failed — your progress is safe locally.')
    },
  })

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      sync(flushPendingXp())
    }, SYNC_INTERVAL_MS)

    const handleHide = () => {
      if (document.visibilityState === 'hidden') sync(flushPendingXp())
    }
    document.addEventListener('visibilitychange', handleHide)

    return () => {
      clearInterval(intervalRef.current)
      document.removeEventListener('visibilitychange', handleHide)
    }
  }, [flushPendingXp, sync])
}
```

### Passive Income Hook

```typescript
// hooks/usePassiveIncome.ts
'use client'

import { useEffect, useRef } from 'react'
import { useGameStore } from '@/store/gameStore'

const TICK_MS = 1_000

export function usePassiveIncome() {
  const passiveRate = useGameStore((s) => s.passiveRate)
  const rateRef     = useRef(passiveRate)
  rateRef.current   = passiveRate

  useEffect(() => {
    if (rateRef.current === 0) return
    const id = setInterval(() => {
      const gain = BigInt(rateRef.current)
      useGameStore.setState((s) => ({
        totalXp:   s.totalXp + gain,
        currentXp: s.currentXp + gain,
        pendingXp: s.pendingXp + gain,
      }))
    }, TICK_MS)
    return () => clearInterval(id)
  }, [passiveRate])
}
```

### Hero Click Target Component

```tsx
// components/game/HeroClickTarget.tsx
'use client'

import { useState, useCallback } from 'react'
import { useGameStore } from '@/store/gameStore'
import { Card } from '@/components/ui/card'
import { SoundManager } from '@/lib/sound/soundManager'
import { cn } from '@/lib/utils'

interface ClickParticle {
  id:    number
  x:     number
  y:     number
  value: number
}

export function HeroClickTarget() {
  const registerClick = useGameStore((s) => s.registerClick)
  const clickPower    = useGameStore((s) => s.clickPower)
  const [particles,  setParticles] = useState<ClickParticle[]>([])
  const [isPressed,  setIsPressed] = useState(false)

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    registerClick()
    SoundManager.play('click')

    const rect = e.currentTarget.getBoundingClientRect()
    const particle: ClickParticle = {
      id:    Date.now(),
      x:     e.clientX - rect.left,
      y:     e.clientY - rect.top,
      value: clickPower,
    }
    setParticles((prev) => [...prev, particle])
    setTimeout(() => setParticles((prev) => prev.filter((p) => p.id !== particle.id)), 800)
  }, [registerClick, clickPower])

  return (
    <div className="relative select-none">
      <button
        onClick={handleClick}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        className={cn(
          'relative w-64 h-64 rounded-full transition-transform duration-75 cursor-pointer',
          'bg-gradient-to-b from-primary/20 to-primary/5',
          'border-2 border-primary/40 hover:border-primary',
          'shadow-[0_0_40px_hsl(var(--primary)/0.3)]',
          isPressed && 'scale-95'
        )}
        aria-label="Click to earn XP"
      >
        {/* Hero art — replace src with Supabase Storage URL */}
        <img
          src="/heroes/electric-hero.png"
          alt="Hero"
          className="w-full h-full object-contain drop-shadow-lg"
          draggable={false}
        />
      </button>

      {/* Click particles */}
      {particles.map((p) => (
        <span
          key={p.id}
          className="pointer-events-none absolute font-mono font-bold text-primary animate-float-up"
          style={{ left: p.x, top: p.y }}
        >
          +{p.value}
        </span>
      ))}
    </div>
  )
}
```

### XP Bar Component (shadcn Progress)

```tsx
// components/game/XpBar.tsx
'use client'

import { useGameStore } from '@/store/gameStore'
import { Progress } from '@/components/ui/progress'
import { xpProgressInLevel } from '@/lib/game/formulas'

export function XpBar() {
  const { totalXp, level } = useGameStore()
  const progress = xpProgressInLevel(totalXp, level) * 100

  return (
    <div className="w-full space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground font-mono">
        <span>LVL {level}</span>
        <span>{progress.toFixed(1)}%</span>
      </div>
      <Progress
        value={progress}
        className="h-2 bg-secondary [&>div]:bg-primary [&>div]:transition-all [&>div]:duration-300"
      />
    </div>
  )
}
```

---

## 7. Phase 2 — Chest & Loot System

**Goal:** Rewarding chest open loop with animated reveals using shadcn Dialog.
**Timeline:** Week 3–4

### Server Action — Open Chest

```typescript
// actions/chests.ts
'use server'

import { db } from '@/db/client'
import { gameState, chestTiers, chestLootTable, playerItems, chestOpens, items } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { createSupabaseServer } from '@/lib/supabase/server'
import { rollLoot } from '@/lib/game/loot'

export async function openChestAction(chestTierId: string) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // load chest config and player state in parallel
  const [tier, state] = await Promise.all([
    db.query.chestTiers.findFirst({
      where:  eq(chestTiers.id, chestTierId),
      with:   { lootTable: { with: { item: true } } },
    }),
    db.query.gameState.findFirst({
      where: eq(gameState.userId, user.id),
    }),
  ])

  if (!tier || !state)   throw new Error('Not found')
  if (state.level < tier.minLevel) throw new Error('Level requirement not met')
  if (state.currentXp < BigInt(tier.xpCost)) throw new Error('Insufficient XP')

  // server-side loot roll
  const drop = rollLoot(
    tier.lootTable.map((e) => ({
      itemId:   e.itemId,
      rarity:   e.item.rarity,
      weight:   e.weight,
      minLevel: e.minLevel,
    })),
    state.level
  )

  // all mutations in a transaction
  const result = await db.transaction(async (tx) => {
    // deduct XP
    await tx
      .update(gameState)
      .set({ currentXp: state.currentXp - BigInt(tier.xpCost) })
      .where(eq(gameState.userId, user.id))

    // check for duplicate
    const [existing] = await tx
      .select()
      .from(playerItems)
      .where(and(eq(playerItems.userId, user.id), eq(playerItems.itemId, drop.itemId)))
      .limit(1)

    let isDuplicate = false
    if (existing) {
      isDuplicate = true
      await tx
        .update(playerItems)
        .set({ shards: existing.shards + 10 })
        .where(eq(playerItems.id, existing.id))
    } else {
      await tx.insert(playerItems).values({ userId: user.id, itemId: drop.itemId })
    }

    // log the open
    await tx.insert(chestOpens).values({
      userId:        user.id,
      chestTierId,
      itemId:        drop.itemId,
      rarity:        drop.rarity,
      playerLevelAt: state.level,
    })

    return { isDuplicate }
  })

  const droppedItem = await db.query.items.findFirst({ where: eq(items.id, drop.itemId) })

  return { item: droppedItem, isDuplicate: result.isDuplicate }
}
```

### Chest Open Dialog (shadcn Dialog + Framer Motion)

```tsx
// components/chest/ChestOpenDialog.tsx
'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RarityBadge } from '@/components/ui/rarity-badge'
import { openChestAction } from '@/actions/chests'
import { SoundManager } from '@/lib/sound/soundManager'
import { toast } from 'sonner'

interface Props {
  chestTierId: string
  chestName:   string
  xpCost:      number
  open:        boolean
  onOpenChange: (open: boolean) => void
}

export function ChestOpenDialog({ chestTierId, chestName, xpCost, open, onOpenChange }: Props) {
  const [revealedItem, setRevealedItem] = useState<{ name: string; rarity: string; iconUrl: string } | null>(null)
  const [isDuplicate, setIsDuplicate]   = useState(false)
  const queryClient = useQueryClient()

  const { mutate: openChest, isPending } = useMutation({
    mutationFn: () => openChestAction(chestTierId),
    onSuccess: (data) => {
      if (data.item) {
        setRevealedItem(data.item as any)
        setIsDuplicate(data.isDuplicate)
        SoundManager.play(data.item.rarity === 'LEGENDARY' ? 'legendary' : 'chestOpen')
        queryClient.invalidateQueries({ queryKey: ['inventory'] })
        queryClient.invalidateQueries({ queryKey: ['gameState'] })
      }
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleClose = () => {
    setRevealedItem(null)
    setIsDuplicate(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-display tracking-widest text-xl">
            {chestName} CHEST
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
          <AnimatePresence mode="wait">
            {!revealedItem ? (
              <motion.div
                key="chest"
                initial={{ scale: 1 }}
                animate={isPending ? { scale: [1, 1.1, 1], rotate: [-3, 3, -3, 0] } : {}}
                transition={{ duration: 0.6, repeat: isPending ? Infinity : 0 }}
                className="relative w-36 h-36"
              >
                <img src="/chests/elite-chest.png" alt="Chest" className="w-full h-full object-contain" />
              </motion.div>
            ) : (
              <motion.div
                key="item"
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="flex flex-col items-center gap-3"
              >
                <Card className="border-2 p-4 bg-card/80">
                  <CardContent className="flex flex-col items-center gap-2 p-0">
                    <img src={revealedItem.iconUrl} alt={revealedItem.name} className="w-20 h-20 object-contain" />
                    <RarityBadge rarity={revealedItem.rarity as any} />
                    <p className="font-ui font-semibold text-sm">{revealedItem.name}</p>
                    {isDuplicate && (
                      <p className="text-xs text-muted-foreground">Duplicate — +10 shards</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {!revealedItem ? (
            <Button
              size="lg"
              className="w-full font-display tracking-widest"
              onClick={() => openChest()}
              disabled={isPending}
            >
              {isPending ? 'OPENING...' : `OPEN — ${xpCost.toLocaleString()} XP`}
            </Button>
          ) : (
            <Button variant="outline" className="w-full" onClick={handleClose}>
              COLLECT
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

---

## 8. Phase 3 — Leaderboard & Social

**Goal:** Global + weekly leaderboards with realtime updates.
**Timeline:** Week 5–6

### Server Action — Fetch Leaderboard

```typescript
// actions/leaderboard.ts
'use server'

import { db } from '@/db/client'
import { leaderboardEntries, seasons, users } from '@/db/schema'
import { eq, desc, sql } from 'drizzle-orm'
import { createSupabaseServer } from '@/lib/supabase/server'

export async function getLeaderboardAction(page = 0) {
  const PAGE_SIZE = 50

  const [activeSeason] = await db
    .select()
    .from(seasons)
    .where(eq(seasons.isActive, true))
    .limit(1)

  if (!activeSeason) return { entries: [], myRank: null, seasonName: null }

  // window function via Drizzle raw sql helper
  const entries = await db.execute(sql`
    SELECT
      RANK() OVER (ORDER BY le.total_xp DESC)::int AS rank,
      u.id                                          AS "userId",
      u.username,
      le.total_xp::text                             AS "totalXp",
      le.tier
    FROM leaderboard_entries le
    JOIN users u ON u.id = le.user_id
    WHERE le.season_id = ${activeSeason.id}
    ORDER BY le.total_xp DESC
    LIMIT ${PAGE_SIZE} OFFSET ${page * PAGE_SIZE}
  `)

  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  let myRank = null

  if (user) {
    const [mine] = await db.execute(sql`
      SELECT
        RANK() OVER (ORDER BY le.total_xp DESC)::int AS rank,
        le.total_xp::text AS "totalXp"
      FROM leaderboard_entries le
      WHERE le.season_id = ${activeSeason.id}
        AND le.user_id   = ${user.id}
    `)
    myRank = mine ?? null
  }

  return { entries: entries.rows, myRank, seasonName: activeSeason.name }
}
```

### Realtime Leaderboard Hook

```typescript
// hooks/useLeaderboard.ts
'use client'

import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { getLeaderboardAction } from '@/actions/leaderboard'

export function useLeaderboard(page = 0) {
  const queryClient = useQueryClient()
  const supabase    = createSupabaseBrowser()

  const query = useQuery({
    queryKey:      ['leaderboard', page],
    queryFn:       () => getLeaderboardAction(page),
    staleTime:     30_000,
    refetchInterval: 60_000,
  })

  useEffect(() => {
    const channel = supabase
      .channel('leaderboard-live')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'leaderboard_entries' },
        () => queryClient.invalidateQueries({ queryKey: ['leaderboard'] })
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [queryClient, supabase])

  return query
}
```

### Leaderboard Table (shadcn Table)

```tsx
// components/leaderboard/LeaderboardTable.tsx
'use client'

import { useLeaderboard } from '@/hooks/useLeaderboard'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { RankBadge } from './RankBadge'

export function LeaderboardTable() {
  const { data, isLoading } = useLeaderboard()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {data?.seasonName && (
        <p className="text-sm text-muted-foreground font-mono">{data.seasonName}</p>
      )}
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="w-16 font-mono text-xs">RANK</TableHead>
            <TableHead className="font-mono text-xs">PLAYER</TableHead>
            <TableHead className="font-mono text-xs text-right">XP</TableHead>
            <TableHead className="font-mono text-xs text-right">TIER</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.entries.map((entry: any) => (
            <TableRow key={entry.userId} className="border-border">
              <TableCell className="font-display text-xl text-muted-foreground">
                {entry.rank <= 3
                  ? ['🥇', '🥈', '🥉'][entry.rank - 1]
                  : `#${entry.rank}`}
              </TableCell>
              <TableCell className="font-ui text-sm">{entry.username}</TableCell>
              <TableCell className="font-mono text-sm text-right">
                {BigInt(entry.totalXp).toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <RankBadge tier={entry.tier} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
```

---

## 9. Phase 4 — Meta Progression & Quests

**Goal:** Daily quests, achievements, offline earnings.
**Timeline:** Week 7–8

### Server Action — Assign Daily Quests

```typescript
// actions/quests.ts
'use server'

import { db } from '@/db/client'
import { questTemplates, questProgress, gameState } from '@/db/schema'
import { eq, and, gte } from 'drizzle-orm'
import { createSupabaseServer } from '@/lib/supabase/server'

const QUESTS_PER_DAY = 3

export async function assignDailyQuestsAction() {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  // check if already assigned today
  const existing = await db
    .select()
    .from(questProgress)
    .where(
      and(
        eq(questProgress.userId, user.id),
        gte(questProgress.assignedAt, today)
      )
    )
    .limit(1)

  if (existing.length > 0) return { alreadyAssigned: true }

  const templates = await db.select().from(questTemplates)
  const shuffled  = templates.sort(() => Math.random() - 0.5).slice(0, QUESTS_PER_DAY)

  await db.insert(questProgress).values(
    shuffled.map((q) => ({
      userId:          user.id,
      questTemplateId: q.id,
      assignedAt:      today,
    }))
  )

  return { alreadyAssigned: false }
}

export async function trackQuestEventAction(type: string, increment: number) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const active = await db.query.questProgress.findMany({
    where: and(
      eq(questProgress.userId, user.id),
      eq(questProgress.isComplete, false),
      gte(questProgress.assignedAt, today)
    ),
    with: { quest: true },
  })

  for (const progress of active.filter((p) => p.quest.type === type)) {
    const newValue  = progress.currentValue + increment
    const complete  = newValue >= progress.quest.targetValue

    await db
      .update(questProgress)
      .set({
        currentValue: newValue,
        isComplete:   complete,
        completedAt:  complete ? new Date() : null,
      })
      .where(eq(questProgress.id, progress.id))

    if (complete) {
      await db
        .update(gameState)
        .set({
          totalXp:   db.$with('gs'),  // handled below
          currentXp: db.$with('gs'),
        })
        .where(eq(gameState.userId, user.id))

      // increment XP reward
      const [current] = await db.select().from(gameState).where(eq(gameState.userId, user.id))
      if (current) {
        await db
          .update(gameState)
          .set({
            totalXp:   current.totalXp   + BigInt(progress.quest.rewardXp),
            currentXp: current.currentXp + BigInt(progress.quest.rewardXp),
          })
          .where(eq(gameState.userId, user.id))
      }
    }
  }
}
```

### Offline Earnings

```typescript
// lib/game/offline.ts

const MAX_OFFLINE_HOURS = 8

export function calculateOfflineEarnings(passiveRate: number, lastSeenAt: Date): bigint {
  const elapsedSeconds = Math.min(
    (Date.now() - lastSeenAt.getTime()) / 1_000,
    MAX_OFFLINE_HOURS * 3600
  )
  return BigInt(Math.floor(passiveRate * elapsedSeconds))
}
```

### Quest Panel (shadcn Card + Progress)

```tsx
// components/quests/QuestPanel.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

export function QuestPanel() {
  const { data: quests, isLoading } = useQuery({
    queryKey: ['quests'],
    queryFn:  async () => {
      const res = await fetch('/api/quests')
      return res.json()
    },
  })

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="font-display tracking-widest text-base">DAILY QUESTS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)
          : quests?.map((q: any) => (
              <div key={q.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-ui">{q.title}</p>
                  {q.isComplete
                    ? <Badge variant="outline" className="text-green-400 border-green-400 text-xs">DONE</Badge>
                    : <span className="text-xs text-muted-foreground font-mono">{q.currentValue}/{q.targetValue}</span>
                  }
                </div>
                <Progress
                  value={Math.min((q.currentValue / q.targetValue) * 100, 100)}
                  className="h-1.5 bg-secondary [&>div]:bg-primary"
                />
                <p className="text-xs text-muted-foreground">+{q.rewardXp.toLocaleString()} XP</p>
                <Separator className="bg-border" />
              </div>
            ))
        }
      </CardContent>
    </Card>
  )
}
```

---

## 10. Phase 5 — Polish & Launch

**Goal:** Juice, sound, PWA, analytics, economy balance.
**Timeline:** Week 9–10

### Sound Manager

```typescript
// lib/sound/soundManager.ts

import { Howl } from 'howler'

const sounds = {
  click:     new Howl({ src: ['/sounds/click.webm'],      volume: 0.4 }),
  levelUp:   new Howl({ src: ['/sounds/level-up.webm'],   volume: 0.8 }),
  chestOpen: new Howl({ src: ['/sounds/chest-open.webm'], volume: 0.9 }),
  legendary: new Howl({ src: ['/sounds/legendary.webm'],  volume: 1.0 }),
}

export const SoundManager = {
  play:     (key: keyof typeof sounds) => sounds[key].play(),
  setMuted: (muted: boolean) => Object.values(sounds).forEach((s) => s.mute(muted)),
}
```

### Rate Limiting Middleware

```typescript
// middleware.ts

import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis:   Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, '10 s'),
})

export async function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith('/api/cron')) return NextResponse.next()

  const ip = req.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(ip)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }
  return NextResponse.next()
}

export const config = { matcher: '/api/:path*' }
```

### Cron Route — Season Snapshot

```typescript
// app/api/cron/season-snapshot/route.ts

import { NextResponse } from 'next/server'
import { db } from '@/db/client'
import { leaderboardEntries, seasons } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { tierFromXp } from '@/lib/game/ranks'

export async function GET() {
  const [activeSeason] = await db
    .select()
    .from(seasons)
    .where(eq(seasons.isActive, true))
    .limit(1)

  if (!activeSeason) return NextResponse.json({ ok: false })

  const entries = await db
    .select()
    .from(leaderboardEntries)
    .where(eq(leaderboardEntries.seasonId, activeSeason.id))
    .orderBy(desc(leaderboardEntries.totalXp))

  await Promise.all(
    entries.map((entry, index) =>
      db
        .update(leaderboardEntries)
        .set({ rank: index + 1, tier: tierFromXp(entry.totalXp) })
        .where(eq(leaderboardEntries.id, entry.id))
    )
  )

  return NextResponse.json({ ok: true, processed: entries.length })
}
```

### Vercel Cron Config

```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/assign-quests",   "schedule": "0 0 * * *" },
    { "path": "/api/cron/season-snapshot", "schedule": "0 0 * * 1" }
  ]
}
```

### Economy Tuning Reference

| Variable              | Default     | Notes                                              |
|-----------------------|-------------|----------------------------------------------------|
| Base click XP         | 1           | Increase via upgrades and items                    |
| Common chest cost     | 100 XP      | Should be buyable within the first 5 minutes       |
| Elite chest cost      | 1,000 XP    | Target: 30–60 min of play                          |
| Legendary chest cost  | 10,000 XP   | Target: 3–5 hours                                  |
| XP curve exponent     | 1.8         | Increase to slow progression, decrease to speed up |
| Max offline hours     | 8           | Encourages daily login without punishing gaps       |
| Legendary drop base   | 1%          | Scale +0.02% per player level, cap at 5%           |
| Max equipped items    | 4           | Enough to feel meaningful without being overwhelming |

---

## 11. Folder Structure

```
nexus-city/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── callback/route.ts          ← Supabase OAuth callback
│   ├── (game)/
│   │   ├── layout.tsx                 ← loads game state, Providers
│   │   ├── page.tsx                   ← main click screen
│   │   ├── inventory/page.tsx
│   │   ├── chests/page.tsx
│   │   ├── leaderboard/page.tsx
│   │   └── profile/[username]/page.tsx
│   └── api/
│       ├── quests/route.ts            ← GET active quests
│       └── cron/
│           ├── assign-quests/route.ts
│           └── season-snapshot/route.ts
│
├── actions/                           ← Next.js Server Actions
│   ├── game.ts                        ← syncXp, loadGameState
│   ├── chests.ts                      ← openChest
│   ├── items.ts                       ← equipItem, unequipItem
│   ├── leaderboard.ts                 ← getLeaderboard
│   └── quests.ts                      ← assignDailyQuests, trackQuestEvent
│
├── components/
│   ├── game/
│   │   ├── HeroClickTarget.tsx
│   │   ├── XpBar.tsx
│   │   └── PassiveIncomeToast.tsx
│   ├── chest/
│   │   ├── ChestCard.tsx
│   │   └── ChestOpenDialog.tsx        ← shadcn Dialog + Framer Motion
│   ├── inventory/
│   │   ├── ItemCard.tsx
│   │   └── EquipSlots.tsx
│   ├── leaderboard/
│   │   ├── LeaderboardTable.tsx       ← shadcn Table
│   │   └── RankBadge.tsx
│   ├── quests/
│   │   └── QuestPanel.tsx             ← shadcn Card + Progress
│   └── ui/                            ← shadcn generated components (do not edit)
│       ├── rarity-badge.tsx           ← custom extension of shadcn Badge
│       └── number-ticker.tsx          ← animated XP counter
│
├── hooks/
│   ├── useXpSync.ts
│   ├── usePassiveIncome.ts
│   ├── useLeaderboard.ts
│   └── useGameInit.ts
│
├── store/
│   └── gameStore.ts                   ← Zustand
│
├── lib/
│   ├── supabase/
│   │   ├── server.ts
│   │   └── client.ts
│   ├── game/
│   │   ├── formulas.ts
│   │   ├── loot.ts
│   │   ├── ranks.ts
│   │   ├── quests.ts
│   │   ├── offline.ts
│   │   └── anticheat.ts
│   ├── sound/
│   │   └── soundManager.ts
│   └── utils.ts                       ← shadcn cn() utility lives here
│
├── db/
│   ├── client.ts                      ← Drizzle singleton
│   ├── schema/
│   │   ├── index.ts
│   │   ├── users.ts
│   │   ├── gameState.ts
│   │   ├── items.ts
│   │   ├── chests.ts
│   │   ├── inventory.ts
│   │   ├── leaderboard.ts
│   │   └── quests.ts
│   ├── migrations/                    ← generated by drizzle-kit
│   └── seed.ts                        ← seed items, chests, quest templates
│
├── public/
│   ├── sounds/
│   ├── heroes/
│   ├── chests/
│   └── icons/
│
├── middleware.ts
├── drizzle.config.ts
├── vercel.json
└── .env.local
```

---

## 12. Environment & Config

```bash
# .env.local

# Supabase (public — safe to expose)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Supabase (server only — never expose)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Database — use the pooled connection string from Supabase
# (Session mode, port 5432 for Drizzle migrations)
# (Transaction mode, port 6543 for runtime queries via pgBouncer)
DATABASE_URL=postgresql://postgres.xxxx:[password]@aws-0-region.pooler.supabase.com:6543/postgres

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Error tracking
SENTRY_DSN=https://...

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

> **Supabase Postgres + Drizzle note:** Use the **Transaction mode** pooler URL (port 6543) for all runtime Drizzle queries. Use the **Session mode** URL (port 5432) only when running `drizzle-kit push` or `migrate` from your local machine.

---

## 13. Anti-Cheat & Security

### Principles

- **XP is always awarded server-side.** The client sends `pendingXp` as a suggestion; the server validates it against a ceiling based on click speed and elapsed time.
- **Chest drops are always rolled server-side.** RNG never runs on the client.
- **Rate limiting on all mutation routes.** Sliding window via Upstash Redis.
- **Session validation in every Server Action.** `supabase.auth.getUser()` on every action — no anonymous mutations.
- **Item ownership confirmed before equip.** userId checked against playerItem.userId in the DB.

### Click Validation

```typescript
// lib/game/anticheat.ts

interface ValidationResult {
  valid:   boolean
  reason?: string
}

export function validateClickPayload(
  pendingXp:  bigint,
  clickPower: number,
  lastSyncAt: Date
): ValidationResult {
  const elapsedSeconds = (Date.now() - lastSyncAt.getTime()) / 1_000
  // assume max 20 clicks/sec, give 2× headroom for burst clicks
  const theoreticalMax = BigInt(Math.ceil(20 * clickPower * Math.min(elapsedSeconds, 30))) * BigInt(2)

  if (pendingXp <= BigInt(0))       return { valid: false, reason: 'XP must be positive' }
  if (pendingXp > theoreticalMax)   return { valid: false, reason: 'XP exceeds theoretical maximum' }

  return { valid: true }
}
```

---

## 14. Asset Generation Prompts

Save these for Midjourney, DALL-E 3, or Stable Diffusion XL.

### Background

> Aerial view of a dark superhero metropolis at night, neon signs reflecting on rain-slicked streets, comic book cel-shading style, deep navy and electric blue palette, no text, cinematic wide shot, 16:9

### Hero Card Art

> **Electric:** Masked superhero in electric blue armor, crackling lightning aura, dynamic heroic pose, cel-shaded comic book art, dark dramatic background, glowing blue eyes, game card portrait, no text

> **Crimson:** Crimson and black armored hero, fire energy aura, intense battle stance, cel-shaded comic illustration, dark smoky background, glowing red visor, game card portrait, no text

> **Toxic:** Green-armored support hero, swirling toxic energy tendrils, protective stance, comic book style, dark laboratory background, glowing green eyes, game card portrait, no text

> **Solar:** Gold and white legendary hero, radiant solar burst halo, majestic hovering pose, cel-shaded comic style, dark cosmic background, game card portrait, no text

### Chest Designs

> **Common chest:** Worn metal strongbox, simple padlock, faint grey energy seal, comic book art style, dark background, dramatic low-angle lighting

> **Elite chest:** Reinforced titanium container, blue plasma energy seals, glowing circuit patterns, game art style, dark metallic background

> **Legendary chest:** Ornate golden artifact chest, pulsing solar energy aura, ancient runes etched in light, god-ray lighting, epic game loot box art

### Item Icons

> Circular game ability badge icon, [POWER NAME] theme, glowing energy, cel-shaded comic style, dark background, suitable for 64×64 game UI sprite, no text, high contrast

### UI Particles

> **Click spark:** Small electric spark burst, bright blue/white, comic book speed lines, transparent background, sprite sheet style

> **Level up burst:** Golden starburst explosion, comic book radiance lines, transparent background, cel-shaded

---

*v2.0 — Stack updated to Next.js + Drizzle + Supabase + shadcn/ui. Prisma removed entirely.*
