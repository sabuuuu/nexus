import { Howl, Howler } from 'howler'

const initSound = (src: string, volume: number) => {
  if (typeof window === 'undefined') return null as unknown as Howl
  return new Howl({ src: [src], volume })
}

const sounds = {
  click: initSound('/sounds/click.webm', 0.4),
  levelUp: initSound('/sounds/level-up.webm', 0.8),
  chestOpen: initSound('/sounds/chest-open.webm', 0.9),
  legendary: initSound('/sounds/legendary.webm', 1.0),
}

export const SoundManager = {
  play: (key: keyof typeof sounds) => {
    try {
      if (sounds[key]) sounds[key].play()
    } catch (e) {
      console.warn(`Sound ${key} failed to play`, e)
    }
  },
  setMuted: (muted: boolean) => {
    Object.values(sounds).forEach((s) => {
      if (s) s.mute(muted)
    })
  },
  setVolume: (volume: number) => {
    Howler.volume(volume / 100)
  }
}
