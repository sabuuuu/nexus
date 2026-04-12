import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SoundManager } from '@/lib/sound/soundManager'

interface SettingsStore {
  isMuted: boolean
  volume: number
  toggleMute: () => void
  setVolume: (val: number) => void
}

export const useSettings = create<SettingsStore>()(
  persist(
    (set, get) => ({
      isMuted: false,
      volume: 80,
      toggleMute: () => {
        const newMuted = !get().isMuted
        set({ isMuted: newMuted })
        SoundManager.setMuted(newMuted)
      },
      setVolume: (val: number) => {
        set({ volume: val })
        SoundManager.setVolume(val)
      }
    }),
    {
      name: 'nexus-settings',
      onRehydrateStorage: () => (state) => {
        if (state) {
          SoundManager.setMuted(state.isMuted)
          SoundManager.setVolume(state.volume)
        }
      },
    }
  )
)
