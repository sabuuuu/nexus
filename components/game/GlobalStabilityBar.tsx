'use client'

import { useWorldBoss } from '@/hooks/useWorldBoss'
import { Progress } from '@/components/ui/progress'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Zap, AlertTriangle } from 'lucide-react'

export function GlobalStabilityBar() {
  const { boss } = useWorldBoss()

  if (!boss) return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2 opacity-20 animate-pulse">
       <div className="h-10 bg-white/10 w-full rounded-none" />
    </div>
  )

  const stabilityPerc = (Number(boss.currentStability) / Number(boss.maxStability)) * 100
  const isCritical = stabilityPerc < 20

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-2">
      <div className="flex justify-between items-end mb-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Shield className={`w-4 h-4 ${isCritical ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
            <span className="text-[10px] font-mono font-bold text-white/60 tracking-[0.2em] uppercase">
              Node-0 Global Stability
            </span>
          </div>
          <span className="font-display text-2xl text-white italic tracking-tighter">
            PROTOCAL <span className="text-primary">LVL {boss.level}</span>
          </span>
        </div>
        
        <div className="text-right flex flex-col items-end">
          <div className="flex items-center gap-2">
             <AnimatePresence mode="wait">
               {isCritical && (
                 <motion.span 
                   initial={{ opacity: 0, scale: 0.5 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.5 }}
                   className="text-[10px] bg-red-500 text-black font-bold px-2 py-0.5 rounded-none animate-bounce"
                 >
                   CORE_WEAKNESS_DETECTED
                 </motion.span>
               )}
             </AnimatePresence>
             <span className="font-mono text-xs text-white/40 uppercase font-bold tracking-widest">Efficiency</span>
          </div>
          <span className={`font-mono text-3xl font-black tabular-nums tracking-tighter ${isCritical ? 'text-red-500' : 'text-primary'}`}>
            {stabilityPerc.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* ── STABILITY BAR ── */}
      <div className="relative h-7 w-full bg-black/70 overflow-hidden"
        style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08), 0 0 0 1px rgba(59,130,246,0.15)' }}
      >
        {/* Fill */}
        <div
          className={`h-full transition-all duration-700 ease-out relative ${
            isCritical
              ? 'bg-red-500 shadow-[0_0_24px_rgba(239,68,68,0.6)]'
              : 'bg-primary shadow-[0_0_24px_rgba(59,130,246,0.5)]'
          }`}
          style={{ width: `${Math.max(0, stabilityPerc)}%` }}
        >
          {/* Inner top highlight — gives depth */}
          <div className="absolute inset-x-0 top-0 h-[40%] bg-white/15 pointer-events-none" />

          {/* Glowing leading edge */}
          {stabilityPerc > 1 && (
            <div className={`absolute right-0 top-0 bottom-0 w-[3px] ${isCritical ? 'bg-red-300' : 'bg-white'} shadow-[0_0_12px_4px_rgba(255,255,255,0.6)]`} />
          )}
        </div>

        {/* Segment tick marks — 10 divisions */}
        <div className="absolute inset-0 flex pointer-events-none z-10">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex-1 border-r border-black/40 last:border-0" />
          ))}
        </div>

        {/* Shimmer sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent w-[25%] animate-[shimmer_3s_infinite_linear] pointer-events-none z-20" />

        {/* Critical glitch flash */}
        {isCritical && (
          <motion.div
            animate={{ opacity: [0, 0.25, 0, 0.15, 0] }}
            transition={{ duration: 0.4, repeat: Infinity }}
            className="absolute inset-0 bg-red-500 pointer-events-none z-30"
          />
        )}
      </div>
      
      <div className="flex justify-between items-center mt-2 opacity-40">
        <span className="text-[8px] font-mono tracking-widest text-white">SYNC_REALTIME::SUPABASE_READY</span>
        <span className="text-[8px] font-mono tracking-widest text-white uppercase">Participants: Total_Global</span>
      </div>
    </div>
  )
}
