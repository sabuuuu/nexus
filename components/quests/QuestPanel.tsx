'use client'

import { useQuests } from '@/hooks/useQuests'
import { CheckCircle2, Circle, Clock, Zap, Target, Box, TrendingUp, Loader2 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

const QUEST_ICONS: Record<string, React.ReactNode> = {
  CLICK_COUNT: <Zap className="w-4 h-4" />,
  CHEST_OPEN:  <Box className="w-4 h-4" />,
  LEVEL_REACH: <TrendingUp className="w-4 h-4" />,
  XP_EARN:     <Target className="w-4 h-4" />,
}

export function QuestPanel() {
  const { data: quests, isLoading } = useQuests()

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full bg-white/5 rounded-none" />
        ))}
      </div>
    )
  }

  if (!quests || quests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center opacity-30">
        <Clock className="w-12 h-12 mb-4" />
        <p className="font-display text-xl uppercase tracking-widest">No Active Missions</p>
        <p className="font-mono text-xs mt-2 uppercase tracking-widest">Refresh to load daily ops</p>
      </div>
    )
  }

  const completed = quests.filter((q) => q.isComplete).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b-2 border-primary/20 pb-4">
        <div className="flex flex-col">
          <span className="text-[11px] font-mono text-primary font-bold uppercase tracking-[0.3em]">Daily Intel Ops</span>
          <span className="font-display text-3xl text-white italic tracking-widest">Mission Dossier</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest block">Cleared</span>
          <span className="font-mono text-2xl font-black text-primary">{completed}/{quests.length}</span>
        </div>
      </div>

      {/* Quest List */}
      <div className="space-y-4">
        {quests.map((q) => {
          const pct = Math.min((q.currentValue / q.quest.targetValue) * 100, 100)
          
          return (
            <div 
              key={q.id}
              className={`
                relative border-2 p-5 transition-all
                ${q.isComplete 
                  ? 'border-green-500/30 bg-green-500/5' 
                  : 'border-primary/20 bg-white/5 hover:border-primary/40'
                }
              `}
            >
              {/* Completion badge */}
              {q.isComplete && (
                <div className="absolute top-0 right-0 bg-green-500 px-3 py-1">
                  <span className="text-[9px] font-mono font-black text-black uppercase tracking-widest">Cleared</span>
                </div>
              )}

              <div className="flex gap-4 items-start">
                <div className={`
                  flex-shrink-0 w-10 h-10 flex items-center justify-center border-2
                  ${q.isComplete ? 'border-green-500/50 bg-green-500/10 text-green-500' : 'border-primary/30 bg-primary/5 text-primary'}
                `}>
                  {q.isComplete 
                    ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                    : QUEST_ICONS[q.quest.type] ?? <Circle className="w-4 h-4" />
                  }
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h4 className="font-display text-xl text-white tracking-widest leading-tight">{q.quest.title}</h4>
                      <p className="text-[11px] font-mono text-white/40 mt-0.5">{q.quest.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest block">Reward</span>
                      <span className="font-mono text-primary font-black">+{q.quest.rewardXp.toLocaleString()} XP</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-white/30 uppercase tracking-widest">
                      <span>Progress</span>
                      <span>{q.currentValue.toLocaleString()} / {q.quest.targetValue.toLocaleString()}</span>
                    </div>
                    <div className="relative h-2 w-full bg-black/60 border border-primary/10 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${q.isComplete ? 'bg-green-500' : 'bg-primary'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Corner tech decorations */}
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary/10" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/10" />
            </div>
          )
        })}
      </div>

      {/* Daily Reset Timer */}
      <div className="flex justify-between items-center py-3 px-4 bg-white/5 border border-white/5 text-[10px] font-mono text-white/30 uppercase tracking-widest">
        <span>Mission Refresh</span>
        <span className="text-primary flex items-center gap-2 animate-pulse">
          <Clock className="w-3 h-3" /> 00:00 UTC
        </span>
      </div>
    </div>
  )
}
