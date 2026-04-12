'use client'

import { useGameStore } from '@/store/gameStore'
import { xpProgressInLevel } from '@/lib/game/formulas'
import { Zap } from 'lucide-react'

export function XpBar() {
  const { totalXp, level } = useGameStore()
  const progress = Math.min(100, Math.max(0, xpProgressInLevel(totalXp, level) * 100))

  return (
    <div className="w-full max-w-3xl space-y-4 px-2">
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-[12px] font-mono text-primary font-bold tracking-[0.4em] uppercase">
            Core Output Status
          </span>
          <span className="font-display text-7xl leading-none text-white tracking-tighter italic drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            LVL <span className="text-primary">{level}</span>
          </span>
        </div>
        <div className="text-right flex flex-col items-end pb-1">
          <span className="text-[12px] font-mono text-white/40 uppercase tracking-widest font-bold">Accumulated Load</span>
          <span className="font-mono text-5xl text-primary font-black tabular-nums tracking-tighter leading-none">
            {progress.toFixed(1)}<span className="text-2xl opacity-40">%</span>
          </span>
        </div>
      </div>
      
      {/* Massive Industrial Power Bar */}
      <div className="relative h-10 w-full bg-black/60 border-4 border-primary/30 rounded-none overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        {/* Heavy Casing Segments */}
        <div className="absolute inset-0 flex pointer-events-none z-20">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex-1 border-r-4 border-black/40 last:border-0" />
          ))}
        </div>

        {/* The Overcharged Fill */}
        <div 
          className="h-full bg-primary transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) relative z-0"
          style={{ 
            width: `${progress}%`,
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.8), inset 0 0 15px rgba(255,255,255,0.4)'
          }}
        >
          {/* Internal Glow Effect */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-white/20" />
          
          {/* The High-Vis Lead Laser Edge */}
          <div className="absolute right-0 top-0 bottom-0 w-[4px] bg-white shadow-[0_0_25px_#fff,0_0_50px_var(--color-primary)] z-30" />
        </div>
        
        {/* Moving Scanline high-vis highlight */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent w-[30%] animate-[shimmer_3s_infinite] pointer-events-none" />
      </div>
      
      <div className="flex justify-between items-center opacity-80">
        <div className="flex gap-6">
          <p className="text-[11px] font-mono text-white/50 uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="w-2 h-2 bg-primary animate-ping rounded-full" /> Power Node: 0.14
          </p>
          <p className="text-[11px] font-mono text-white/50 uppercase tracking-[0.3em]">
            State: Persistent
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-12 h-[1px] bg-primary/30" />
          <p className="text-[11px] font-mono text-primary font-black uppercase tracking-[0.3em] animate-pulse">
            Syncing...
          </p>
        </div>
      </div>
    </div>
  )
}
