import { computeClickPower, computePassiveRate, levelFromTotalXp } from '@/lib/game/formulas'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { SoundManager } from '@/lib/sound/soundManager'


interface EquippedItem {
  statKey: string | null
  statValue: number
}

interface GameStore {
  totalXp: bigint
  currentXp: bigint
  level: number
  clickPower: number
  passiveRate: number
  prestigeCount: number
  equippedItems: EquippedItem[]
  pendingXp: bigint

  registerClick: () => void
  flushPendingXp: () => bigint
  rollbackPendingXp: (amount: bigint) => void
  applyServerState: (partial: Partial<GameStore>) => void
}

export const useGameStore = create<GameStore>()(
  subscribeWithSelector((set, get) => ({
    totalXp: BigInt(0),
    currentXp: BigInt(0),
    level: 1,
    clickPower: 1,
    passiveRate: 0,
    prestigeCount: 0,
    equippedItems: [],
    pendingXp: BigInt(0),

    registerClick() {
      const power = BigInt(get().clickPower)
      const newTotal = get().totalXp + power
      const newLevel = levelFromTotalXp(newTotal)

      if (newLevel > get().level) {
        SoundManager.play('levelUp')
      }

      set((s) => ({
        totalXp: newTotal,
        currentXp: s.currentXp + power,
        pendingXp: s.pendingXp + power,
        level: newLevel,
      }))
    },

    flushPendingXp() {
      const pending = get().pendingXp
      if (pending === BigInt(0)) return BigInt(0)
      set({ pendingXp: BigInt(0) })
      return pending
    },

    rollbackPendingXp(amount) {
      set((s) => ({
        pendingXp: s.pendingXp + amount
      }))
    },

    applyServerState(partial) {
      const state = get()
      const equippedItems = partial.equippedItems ?? state.equippedItems
      const prestigeCount = partial.prestigeCount ?? state.prestigeCount
      const baseClickPower = partial.clickPower ?? state.clickPower
      
      // CRITICAL: Merge server authoritative state with local unsynced progress
      // to prevent "rubber banding" or losing clicks that happened during flight.
      const totalXp = partial.totalXp !== undefined ? partial.totalXp + state.pendingXp : state.totalXp
      const currentXp = partial.currentXp !== undefined ? partial.currentXp + state.pendingXp : state.currentXp
      const level = partial.totalXp !== undefined ? levelFromTotalXp(totalXp) : (partial.level ?? state.level)

      set({
        ...partial,
        totalXp,
        currentXp,
        level,
        clickPower: computeClickPower(baseClickPower, equippedItems, prestigeCount),
        passiveRate: computePassiveRate(equippedItems, prestigeCount),
      })
    },
  }))
)
