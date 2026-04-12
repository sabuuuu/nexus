'use client'

import { useGameStore } from '@/store/gameStore'
import { Progress } from '@/components/ui/progress'
import { xpProgressInLevel } from '@/lib/game/formulas'

export function XpBar() {
  const { totalXp, level } = useGameStore()
  const progress = xpProgressInLevel(totalXp, level) * 100

  return (
    <div className="w-full max-w-2xl space-y-2">
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <span className="text-xs font-mono text-muted-foreground tracking-tighter uppercase">Nexus Level</span>
          <span className="font-display text-4xl leading-none">LVL {level}</span>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-xs font-mono text-muted-foreground uppercase">Progress</span>
          <span className="font-mono text-xl text-primary">{progress.toFixed(1)}%</span>
        </div>
      </div>
      
      <div className="relative">
        <Progress
          value={progress}
          className="h-4 bg-secondary border border-border overflow-hidden"
        />
        {/* Progress bar glow effect */}
        <div 
          className="absolute inset-y-0 left-0 bg-primary/20 blur-sm pointer-events-none transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <p className="text-[10px] font-mono text-muted-foreground text-center uppercase tracking-[0.2em]">
        Advance to the next tier to unlock elite hero drops
      </p>
    </div>
  )
}
