---
name: NexusCity
description: Core instructions for building and maintaining the Nexus City superhero idle clicker game.
---

# Nexus City Engineering Skill

Use this skill when developing features, debugging mechanics, or expanding the content for **Nexus City**, a gritty, neon-lit superhero idle clicker.

## Core Principles

1.  **Server-Authoritative Loop**: NEVER trust the client for XP gains or loot drops.
    -   The client (Zustand) tracks `pendingXp` optimistically.
    -   Periodic syncs via `syncXpAction` must validate gains against a theoretical maximum Click Power/Time ceiling.
    -   Loot RNG is rolled strictly on the server during the `openChestAction`.
2.  **Optimistic User Experience**: Interaction must feel instantaneous and "juicy."
    -   Use `framer-motion` for particles, glows, and transitions.
    -   Update Zustand store locally before server confirmation.
    -   Rollback state on sync failure using TanStack Query's `onError`.
3.  **Gritty Neon Aesthetic**: Maintain the stylized, cel-shaded comic book feel.
    -   Palette: Dark #070B14 base with electric blue, solar gold, toxic green, and crimson accents.
    -   Typography: `Bebas Neue` for numbers/headings, `DM Sans` for UI, `JetBrains Mono` for stats.
    -   Rarity: Consistent visual hierarchy (Common/Grey → Legendary/Gold with Pulse).

## Implementation Workflow

### 1. Database & Schema
- Define tables in `db/schema/` using Drizzle ORM.
- Group by domain: `users`, `gameState`, `items`, `chests`, `inventory`, `leaderboard`, `quests`.
- Always use the Drizzle singleton from `db/client.ts`.

### 2. Game Mechanics
- Keep formulas in `lib/game/formulas.ts` pure and shared.
- XP Curve: Quadratic `Math.floor(50 * Math.pow(level, 1.8))`.
- Click/Passive Power: Sum of equipped items multiplied by (1 + prestige bonus).

### 3. State & Sync
- **Zustand (`store/gameStore.ts`)**: The source of truth for the active session.
- **Hooks (`hooks/`)**:
    - `useXpSync`: Periodic flush every 5s.
    - `usePassiveIncome`: Real-time XP ticking every 1s.
- **Server Actions (`actions/`)**: All mutations must check `supabase.auth.getUser()`.

### 4. Components
- **Game UI**: Keep in `components/game/` (e.g., `HeroClickTarget`, `XpBar`).
- **Shadcn/ui**: Use and extend components in `components/ui/` (e.g., `RarityBadge`).
- **Optimization**: Use `React.memo` and `useCallback` for the click target to avoid re-renders during high CPS.

## Quality Standards

- **TypeScript**: No `any`. Use `bigint` for XP values to prevent overflow in late-game sessions.
- **Performance**: Monitor main thread during particle bursts. Limit active particles to < 20.
- **Security**: Validate item ownership in the DB before allowing "Equip."
- **Feedback**: Use `Sonner` for critical gameplay events (Level Up, Legendary Drop).
