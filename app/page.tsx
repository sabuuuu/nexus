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
import { InventoryView } from '@/components/inventory/InventoryView'
import { useXpSync } from '@/hooks/useXpSync'
import { usePassiveIncome } from '@/hooks/usePassiveIncome'
import { useProfile } from '@/hooks/useProfile'
import { useQuestInit } from '@/hooks/useQuests'
import { Zap, Activity, Trophy, ShoppingBag, Crosshair, Database } from 'lucide-react'
import { useEffect, useState } from 'react'
import { loadGameStateAction } from '@/actions/game'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import { getLeaderboardAction } from '@/actions/leaderboard'
import { getChestTiersAction } from '@/actions/chests'
import { getPlayerInventoryAction } from '@/actions/inventory'
import { getDailyQuestsAction } from '@/actions/quests'

export default function GamePage() {
  const [activeTab, setActiveTab] = useState<'mission' | 'store' | 'rankings' | 'ops' | 'storage'>('mission')
  const applyServerState = useGameStore((s) => s.applyServerState)

  const queryClient = useQueryClient()

  // Initialize game loops
  useXpSync()
  usePassiveIncome()
  useQuestInit()

  // Prefetch all tab data immediately on mount so tabs load instantly
  useEffect(() => {
    queryClient.prefetchQuery({ queryKey: ['leaderboard', 0], queryFn: () => getLeaderboardAction(0), staleTime: 30_000 })
    queryClient.prefetchQuery({ queryKey: ['chestTiers'], queryFn: () => getChestTiersAction(), staleTime: 5 * 60_000 })
    queryClient.prefetchQuery({ queryKey: ['inventory'], queryFn: () => getPlayerInventoryAction(), staleTime: 30_000 })
    queryClient.prefetchQuery({ queryKey: ['quests'], queryFn: () => getDailyQuestsAction(), staleTime: 60_000 })
  }, [queryClient])

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
  const { clickPower, passiveRate, currentXp, totalXp } = useGameStore()

  return (
    <div className="flex flex-col h-screen bg-[#070B14] relative overflow-y-auto overflow-x-hidden">
      {/* Immersive HUD Layers */}
      <GlobalHud />

      {/* Background — full screen, fixed to viewport */}
      <div
        className="fixed inset-0 bg-[url('/bg/city_spire.png')] bg-cover bg-center bg-no-repeat opacity-50 pointer-events-none"
      />
      {/* Dark Overlay — fixed to viewport */}
      <div className="fixed inset-0 bg-black/40 pointer-events-none z-0" />

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
                      {totalXp.toLocaleString()} XP
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

            {activeTab === 'storage' && (
              <motion.div
                key="storage"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-6xl mx-auto px-4"
              >
                <InventoryView />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-full flex flex-col items-center gap-8 flex-shrink-0">
          <XpBar />

          <nav className="flex items-center justify-center bg-black/75 border-t border-primary/25 backdrop-blur-2xl relative overflow-hidden" style={{ height: 64 }}>
            {/* HUD Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#3B82F6_0.5px,transparent_0.5px)] [background-size:10px_10px]" />

            {/* Scanline sweep */}
            <div className="absolute bottom-0 h-px w-2/5 bg-gradient-to-r from-transparent via-primary/60 to-transparent animate-[scan_3s_linear_infinite] pointer-events-none" />

            <NavButton active={activeTab === 'mission'} onClick={() => setActiveTab('mission')} icon={<Zap className="w-[18px] h-[18px]" />} label="Mission" />
            <NavButton active={activeTab === 'rankings'} onClick={() => setActiveTab('rankings')} icon={<Trophy className="w-[18px] h-[18px]" />} label="Rankings" />

            <div className="w-px h-7 mx-0 flex-shrink-0 bg-gradient-to-b from-transparent via-white/12 to-transparent skew-x-[-15deg]" />

            <NavButton active={activeTab === 'ops'} onClick={() => setActiveTab('ops')} icon={<Crosshair className="w-[18px] h-[18px]" />} label="Ops" />

            <div className="w-px h-7 mx-0 flex-shrink-0 bg-gradient-to-b from-transparent via-white/12 to-transparent skew-x-[-15deg]" />

            <NavButton active={activeTab === 'storage'} onClick={() => setActiveTab('storage')} icon={<Database className="w-[18px] h-[18px]" />} label="Vault" />
            <NavButton active={activeTab === 'store'} onClick={() => setActiveTab('store')} icon={<ShoppingBag className="w-[18px] h-[18px]" />} label="Market" />

            {/* Bottom pulse line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-primary/20 animate-pulse" />
          </nav>
        </div>
      </main>
    </div>
  )
}

function StatMini({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <div className="flex items-center gap-4 px-5 py-3 bg-primary/5 border-2 border-primary/10 rounded-none backdrop-blur-md relative group overflow-hidden">
      <div className="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
      <div className="text-primary relative z-10">{icon}</div>
      <div className="flex flex-col relative z-10">
        <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">{label}</span>
        <span className="font-mono text-lg font-black text-white leading-tight tabular-nums">{value}</span>
      </div>
    </div>
  )
}

function NavButton({ icon, label, active = false, onClick, large = false }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void, large?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-1.5 px-6 py-6 transition-all relative group h-24
        ${large ? 'min-w-[160px]' : 'min-w-[100px]'}
        ${active ? 'text-primary' : 'text-white/30 hover:text-white/80'}
      `}
    >
      <div className={`relative z-10 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
        {icon}
      </div>
      <span className="text-[10px] font-mono uppercase font-black tracking-[0.2em] relative z-10">{label}</span>

      {active && (
        <>
          <motion.div
            layoutId="nav_active_bg"
            className="absolute inset-0 bg-primary/5 border-b-4 border-primary shadow-[inset_0_-10px_20px_rgba(59,130,246,0.1)]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent pointer-events-none" />
        </>
      )}

      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/5 group-hover:border-primary/40 transition-colors" />
    </button>
  )
}
