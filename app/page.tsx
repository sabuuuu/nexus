'use client'

import { useGameStore } from '@/store/gameStore'
import { HeroClickTarget } from '@/components/game/HeroClickTarget'
import { XpBar } from '@/components/game/XpBar'
import { StoreView } from '@/components/game/StoreView'
import { LeaderboardView } from '@/components/leaderboard/LeaderboardView'
import { QuestPanel } from '@/components/quests/QuestPanel'
import { SettingsDialog } from '@/components/game/SettingsDialog'
import { GlobalStabilityBar } from '@/components/game/GlobalStabilityBar'
import { GlobalHud } from '@/components/game/GlobalHud'
import { useXpSync } from '@/hooks/useXpSync'
import { usePassiveIncome } from '@/hooks/usePassiveIncome'
import { useProfile } from '@/hooks/useProfile'
import { useQuestInit } from '@/hooks/useQuests'
import { Zap, Activity, Trophy, ShoppingBag, Crosshair, Database } from 'lucide-react'
import { useEffect, useState } from 'react'
import { loadGameStateAction } from '@/actions/game'
import { motion, AnimatePresence } from 'framer-motion'

export default function GamePage() {
  const [activeTab, setActiveTab] = useState<'mission' | 'store' | 'rankings' | 'ops'>('mission')
  const applyServerState = useGameStore((s) => s.applyServerState)

  // Initialize game loops
  useXpSync()
  usePassiveIncome()
  useQuestInit()

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
    <div className="flex flex-col h-screen bg-[#070B14] relative overflow-y-auto overflow-x-hidden">
      {/* Immersive HUD Layers */}
      <GlobalHud />
      
      {/* Background — full screen, no blur offset */}
      <div 
        className="absolute inset-0 bg-[url('/bg/city_spire.png')] bg-cover bg-center bg-no-repeat opacity-50 pointer-events-none"
      />
      {/* Dark Overlay for better contrast */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none z-0" />

      <main className="flex-1 flex flex-col items-center p-6 md:p-12 max-w-7xl mx-auto w-full gap-8 relative z-10">

      {/* Top Header - User Info & Global Context */}
      <div className="w-full flex justify-between items-start flex-shrink-0">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-mono text-primary/60 tracking-[0.3em] uppercase">Authored Session</span>
          <h2 className="font-display text-4xl text-white tracking-widest uppercase truncate max-w-[200px] italic">
            {profile?.username || 'GUEST_PILOT'}
          </h2>
        </div>

        <div className="flex gap-4 items-center">
          <StatMini icon={<Zap className="w-4 h-4" />} label="Click Pwr" value={clickPower} />
          <StatMini icon={<Database className="w-4 h-4" />} label="Bank" value={currentXp.toLocaleString()} />
          <SettingsDialog />
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col items-center">
        <AnimatePresence mode="wait">
          {activeTab === 'mission' && (
            <motion.div
              key="mission"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col items-center justify-center gap-12 w-full py-6"
            >
              <GlobalStabilityBar />

              <div className="flex-1 flex flex-col items-center justify-center gap-12 w-full">
              <div className="relative">
                <div className="absolute inset-0 -m-8 border border-primary/10 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-0 -m-12 border border-primary/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                <HeroClickTarget />
              </div>

              <div className="flex flex-col items-center gap-2 mt-6">
                <span className="font-mono text-5xl font-black tracking-tighter text-white tabular-nums">
                  {currentXp.toLocaleString()} XP
                </span>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.4em]">
                  Tap to generate energy surge
                </p>
              </div>
            </div>
            </motion.div>
          )}

          {activeTab === 'store' && (
            <motion.div
              key="store"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full"
            >
              <StoreView />
            </motion.div>
          )}

          {activeTab === 'rankings' && (
            <motion.div
              key="rankings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full px-4"
            >
              <LeaderboardView />
            </motion.div>
          )}

          {activeTab === 'ops' && (
            <motion.div
              key="ops"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-2xl mx-auto px-4 pb-24"
            >
              <QuestPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom UI - Progress and Navigation */}
      <div className="w-full flex flex-col items-center gap-8 flex-shrink-0">
        <XpBar />

        <nav className="flex gap-2 p-1 bg-black/40 border-2 border-primary/20 rounded-none backdrop-blur-xl mb-4">
          <NavButton
            active={activeTab === 'mission'}
            onClick={() => setActiveTab('mission')}
            icon={<Zap className="w-5 h-5" />}
            label="Mission"
          />
          <NavButton
            active={activeTab === 'rankings'}
            onClick={() => setActiveTab('rankings')}
            icon={<Trophy className="w-5 h-5" />}
            label="Rankings"
          />
          <NavButton
            active={activeTab === 'ops'}
            onClick={() => setActiveTab('ops')}
            icon={<Crosshair className="w-5 h-5" />}
            label="Ops"
          />
          <div className="w-[1px] h-8 bg-primary/20 mx-2 self-center rotate-12" />
          <NavButton
            active={activeTab === 'store'}
            onClick={() => setActiveTab('store')}
            icon={<ShoppingBag className="w-5 h-5" />}
            label="Market"
          />
        </nav>
      </div>
    </main>
    </div>
  )
}

function StatMini({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="flex items-center gap-4 px-5 py-3 bg-primary/5 border-2 border-primary/10 rounded-none backdrop-blur-md">
      <div className="text-primary">{icon}</div>
      <div className="flex flex-col">
        <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">{label}</span>
        <span className="font-mono text-lg font-black text-white leading-tight tabular-nums">{value}</span>
      </div>
    </div>
  )
}

function NavButton({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-1 px-8 py-3 transition-all relative group
        ${active ? 'text-primary' : 'text-white/40 hover:text-white/80'}
      `}
    >
      <div className={`relative ${active ? 'animate-pulse' : ''}`}>
        {icon}
      </div>
      <span className="text-[10px] font-mono uppercase font-black tracking-widest">{label}</span>

      {active && (
        <motion.div
          layoutId="nav_active"
          className="absolute inset-0 bg-primary/5 border-b-2 border-primary"
        />
      )}
    </button>
  )
}
