'use client'

import { useGameStore } from '@/store/gameStore'
import { HeroClickTarget } from '@/components/game/HeroClickTarget'
import { XpBar } from '@/components/game/XpBar'
import { useXpSync } from '@/hooks/useXpSync'
import { usePassiveIncome } from '@/hooks/usePassiveIncome'
import { useProfile } from '@/hooks/useProfile'
import { Zap, Activity, Users } from 'lucide-react'
import { useEffect } from 'react'
import { loadGameStateAction } from '@/actions/game'

export default function GamePage() {
  const applyServerState = useGameStore((s) => s.applyServerState)

  // Initialize game loops
  useXpSync()
  usePassiveIncome()

  useEffect(() => {
    async function init() {
      const state = await loadGameStateAction()
      if (state) {
        applyServerState({
          totalXp: BigInt(state.totalXp),
          currentXp: BigInt(state.currentXp),
          level: state.level,
          clickPower: state.clickPower,
          passiveRate: state.passiveRate,
          prestigeCount: state.prestigeCount,
        })
      }
    }
    init()
  }, [applyServerState])

  const { data: profile } = useProfile()
  const { clickPower, passiveRate, currentXp } = useGameStore()

  return (
    <main className="flex-1 flex flex-col items-center justify-between p-6 md:p-12 max-w-7xl mx-auto w-full gap-12 overflow-hidden">

      {/* Top Header - User Info & Global Context */}
      <div className="w-full flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono text-primary/60 tracking-[0.3em] uppercase">Authored Session</span>
          <h2 className="font-display text-3xl text-white tracking-widest uppercase truncate max-w-[200px]">
            {profile?.username || 'GUEST_PILOT'}
          </h2>
        </div>

        <div className="flex gap-4">
          <StatMini icon={<Zap className="w-4 h-4" />} label="Click Pwr" value={clickPower} />
          <StatMini icon={<Activity className="w-4 h-4" />} label="Passive" value={`${passiveRate}/s`} />
        </div>
      </div>

      {/* Centerpiece - The Hero Interaction Area */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 py-12">
        <div className="relative">
          {/* Decorative scanner ring */}
          <div className="absolute inset-0 -m-8 border border-primary/10 rounded-full animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-0 -m-12 border border-primary/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

          <HeroClickTarget />
        </div>

        <div className="flex flex-col items-center gap-2 mt-12">
          <span className="font-mono text-3xl font-bold tracking-tighter text-white">
            {currentXp.toLocaleString()} XP
          </span>
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            Tap to generate energy surge
          </p>
        </div>
      </div>

      {/* Bottom UI - Progress and Navigation */}
      <div className="w-full flex flex-col items-center gap-8">
        <XpBar />

        {/* Basic Footer Nav Placeholders */}
        <nav className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
          <NavButton active icon={<Zap className="w-5 h-5" />} label="Mission" />
          <NavButton icon={<Users className="w-5 h-5" />} label="Agents" />
          <div className="w-px h-6 bg-white/10 mx-2 self-center" />
          <NavButton icon={<div className="w-5 h-5 border-2 border-dashed border-primary/40 rounded-sm" />} label="Store" />
        </nav>
      </div>
    </main>
  )
}

function StatMini({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-primary/5 border border-primary/10 rounded-xl backdrop-blur-sm">
      <div className="text-primary">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-wider">{label}</span>
        <span className="font-mono text-sm font-bold text-white leading-tight">{value}</span>
      </div>
    </div>
  )
}

function NavButton({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`
      flex flex-col items-center gap-1 px-6 py-3 rounded-xl transition-all
      ${active ? 'bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary),0.4)]' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}
    `}>
      {icon}
      <span className="text-[9px] font-mono uppercase font-bold tracking-wider">{label}</span>
    </button>
  )
}
