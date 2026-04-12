# Codex Configuration for Nexus City

## ⚠️ ENFORCEMENT NOTICE
**ALL (MUST) rules are MANDATORY. NO EXCEPTIONS.**

- Reference rule numbers when making decisions (e.g., "Following CD-1...")
- Check ALL applicable rules before ANY code changes
- Immediately correct violations

## Project Overview
**Nexus City** — A gritty, neon-lit superhero metropolis idle clicker game. Players earn XP, level up, collect rare item drops from chests, and compete in ranked seasons.

**Production URL**: https://nexus-city.app (Placeholder)

## Purpose

These rules ensure maintainability, security (anti-cheat), and the distinct "gritty neon" aesthetic of Nexus City.
**MUST** rules are enforced; **SHOULD** rules are strongly recommended.

## Rule Taxonomy

- **BC** = Before Coding → rules to follow before writing any code.
- **CD** = Coding → rules to follow while writing code.
- **SC** = Security & Anti-Cheat → critical for idle game integrity.
- **GIT** = Git → rules for version control.
- **DC** = Development Commands → rules controlling execution of dev commands.
- **OF** = Output Formatting → presentation rules.

---

### BC - Before Coding Rules

- **BC-1** (MUST) Ask clarifying questions if game mechanic requirements are ambiguous.
- **BC-2** (SHOULD) Draft and confirm the logic for new formulas (XP, drop rates).
- **BC-3** (SHOULD) Compare approaches for complex UI animations (Framer Motion vs CSS).
- **BC-4** (SHOULD) Review existing game state patterns in Zustand before adding new state.

### CD - Coding Rules

- **CD-1** (MUST) Name functions with game domain vocabulary (e.g., `registerClick`, `flushPendingXp`).
- **CD-2** (MUST) Follow Next.js App Router conventions (Server Components by default).
- **CD-3** (MUST) Keep components focused (e.g., `XpBar`, `HeroClickTarget`).
- **CD-4** (MUST) Avoid hard-coded secrets; use `.env.local`.
- **CD-5** (MUST) Handle errors gracefully with Sonner toasts.
- **CD-6** (MUST) Use established state management: Zustand for optimistic UI, TanStack Query for server sync.
- **CD-7** (MUST) Follow Tailwind CSS v4 utility patterns.
- **CD-8** (MUST) **Always use Shadcn/UI components over native HTML elements** when an equivalent exists in `components/ui`.
- **CD-9** (MUST) Use `import type { … }` for type-only imports.
- **CD-10** (MUST) Implement proper loading/skeleton states for async UI (Leaderboards, Inventory).

### SC - Security & Anti-Cheat Rules

- **SC-1** (MUST) **Server-authoritative logic**: All XP mutations and loot drops MUST be validated/generated server-side.
- **SC-2** (MUST) **Click Validation**: Check `pendingXp` against a theoretical maximum based on elapsed time and click power.
- **SC-3** (MUST) **Session Validation**: Use `supabase.auth.getUser()` in every Server Action to confirm identity.
- **SC-4** (MUST) **RNG Integrity**: Chest rolls MUST happen on the server, never the client.
- **SC-5** (MUST) **Ownership Check**: Confirm item ownership in the DB before allowing an "Equip" action.

### GIT - Git Rules

- **GIT-1** (MUST) Write clear, concise commit messages following conventional commits.
- **GIT-2** (MUST) **NEVER** include AI attribution or footer in commit messages.

### DC - Development Commands Rules

- **DC-1** (MUST) NEVER run `npm run dev`, `npm run build`, etc., unless explicitly requested.
- **DC-2** (MUST) Do not automatically start the dev server without instruction.

### OF - Output Formatting Rules

- **OF-1** (MUST) Include meaningful comments for complex game formulas.
- **OF-2** (SHOULD) Group related game logic in consistent directory paths (e.g., `lib/game/`).

---

## Tech Stack

### Core Framework
- **Next.js 14+ (App Router)** - React framework for the web.
- **React v19** - UI library.
- **TypeScript** - Type safety.

### Database & Backend
- **Drizzle ORM** - Type-safe SQL ORM.
- **Supabase** - Postgres, Auth, Realtime (Leaderboards), and Storage (Assets).
- **PostgreSQL** - Relational database.

### UI & Styling
- **Tailwind CSS v4** - Utility-first CSS.
- **Shadcn/ui** - Base UI components.
- **Framer Motion v12** - Animation library for "juice" and chest reveals.
- **Howler.js** - Audio management.

### State Management
- **Zustand** - Local optimistic game state.
- **TanStack Query v5** - Server state and data fetching.

---

## Visual & Design Standards

### Aesthetic: NEXUS CITY
- **Theme**: Gritty, neon-lit superhero metropolis at night.
- **Palette**: Dark backgrounds (#070B14), electric blue, solar gold, toxic green, crimson red.
- **Typography**: 
    - Display: *Bebas Neue* (XP, levels, headings).
    - UI: *DM Sans* (buttons, labels).
    - Mono: *JetBrains Mono* (stats, leaderboards).
- **Rarity System**: Consistent color/glow mapping for Common, Uncommon, Rare, Epic, Legendary.

---

## Key Directories

```
/
├── app/               # App Router pages and layouts
├── actions/           # Next.js Server Actions (Game mutations)
├── components/
│   ├── ui/           # Shadcn/ui & RarityBadge
│   ├── game/         # Core clicker components
│   ├── chest/        # Loot and reveal components
│   ├── inventory/    # Item management
│   └── leaderboard/  # Ranking tables
├── db/
│   ├── schema/       # Drizzle table definitions
│   └── client.ts     # Drizzle singleton
├── hooks/             # useXpSync, usePassiveIncome, etc.
├── lib/
│   ├── game/         # Formulas, Loot tables, Anti-cheat
│   ├── supabase/     # Server/Client supabase initializers
│   └── sound/        # SoundManager
├── store/             # Zustand (gameStore.ts)
└── public/            # Game assets (heroes, chests, sounds)
```

## Game Features
- **Core Loop**: Click-to-earn XP, level up.
- **Loot System**: Open chests for rare item drops.
- **Inventory**: Equip items to boost click power or passive rate.
- **Leaderboards**: Real-time seasonal rankings via Supabase.
- **Meta**: Daily quests, prestige system, offline earnings.
