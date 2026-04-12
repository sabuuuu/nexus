import { computeClickPower, computePassiveRate } from '@/lib/game/formulas'
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'


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
      set((s) => ({
        totalXp: s.totalXp + power,
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
      const equippedItems = partial.equippedItems ?? get().equippedItems
      const prestigeCount = partial.prestigeCount ?? get().prestigeCount
      const baseClickPower = partial.clickPower ?? get().clickPower
      set({
        ...partial,
        clickPower: computeClickPower(baseClickPower, equippedItems, prestigeCount),
        passiveRate: computePassiveRate(equippedItems, prestigeCount),
      })
    },
  }))
)
