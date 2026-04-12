import { Howl } from 'howler'

const sounds = {
  click:     new Howl({ src: ['/sounds/click.webm'],      volume: 0.4 }),
  levelUp:   new Howl({ src: ['/sounds/level-up.webm'],   volume: 0.8 }),
  chestOpen: new Howl({ src: ['/sounds/chest-open.webm'], volume: 0.9 }),
  legendary: new Howl({ src: ['/sounds/legendary.webm'],  volume: 1.0 }),
}

export const SoundManager = {
  play: (key: keyof typeof sounds) => {
    // Only play if audio file exists and we are in browser
    if (typeof window !== 'undefined') {
      try {
        sounds[key].play()
      } catch (e) {
        console.warn(`Failed to play sound: ${key}`, e)
      }
    }
  },
  setMuted: (muted: boolean) => {
    if (typeof window !== 'undefined') {
      Object.values(sounds).forEach((s) => s.mute(muted))
    }
  },
}
