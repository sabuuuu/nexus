'use client'

import { useQuery } from '@tanstack/react-query'
import { getChestTiersAction } from '@/actions/chests'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Box, Lock, Zap, ArrowRight, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { ChestOpenDialog } from '@/components/chest/ChestOpenDialog'
import { useGameStore } from '@/store/gameStore'
import { Skeleton } from '@/components/ui/skeleton'

export function StoreView() {
  const { level } = useGameStore()
  const [selectedChest, setSelectedChest] = useState<{ id: string; name: string; xpCost: number } | null>(null)

  const { data: chests, isLoading } = useQuery({
    queryKey: ['chestTiers'],
    queryFn: () => getChestTiersAction(),
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 bg-white/5 rounded-none" />
        ))}
      </div>
    )
  }

  return (
    <div className="w-full space-y-12 pb-24">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-4xl tracking-tighter text-white italic uppercase bg-primary/10 inline-block px-4 py-1 skew-x-[-10deg]">
          Black Market <span className="text-primary italic">Clearance</span>
        </h2>
        <p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.3em]">
          Authorized hardware acquisition // Level based scaling active
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {chests?.map((chest) => {
          const isLocked = level < chest.minLevel

          return (
            <Card
              key={chest.id}
              className={`
                relative bg-black/60 rounded-none border-2 transition-all duration-300
                ${isLocked ? 'border-white/10 opacity-60 grayscale' : 'border-primary/20 hover:border-primary/60 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)]'}
              `}
            >
              <CardContent className="p-0">
                <div className="p-6 flex justify-between items-start border-b border-white/5 bg-white/5">
                  <div>
                    <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest block mb-1">
                      Crate Tier
                    </span>
                    <h3 className="font-display text-3xl text-white tracking-widest uppercase italic">{chest.name}</h3>
                  </div>
                  {isLocked ? (
                    <Lock className="w-5 h-5 text-white/20" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  )}
                </div>

                <div className="p-8 flex flex-col items-center gap-6">
                  <div className={`
                    w-24 h-24 flex items-center justify-center border-4 rounded-3xl transition-transform duration-500
                    ${isLocked ? 'border-white/10 bg-white/5' : 'border-primary/30 bg-primary/5 hover:rotate-[10deg] hover:scale-110'}
                  `}>
                    <Box className={`w-12 h-12 ${isLocked ? 'text-white/10' : 'text-primary'}`} />
                  </div>

                  <div className="w-full space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-white/40">
                      <span>Requirement</span>
                      <span className={isLocked ? 'text-red-500' : 'text-green-500'}>LVL {chest.minLevel}</span>
                    </div>

                    <Button
                      disabled={isLocked}
                      onClick={() => setSelectedChest({ id: chest.id, name: chest.name, xpCost: chest.xpCost })}
                      className={`
                        w-full h-12 font-display text-lg tracking-widest rounded-none cursor-pointer
                        ${isLocked ? 'bg-white/20 text-white/20' : 'border-white text-white hover:bg-primary/80 transition-colors'}
                      `}
                    >
                      {isLocked ? 'UNAUTHORIZED' : `DECRYPT — ${chest.xpCost.toLocaleString()} XP`}
                    </Button>
                  </div>
                </div>

                {/* Tech bar details */}
                <div className="absolute bottom-0 inset-x-0 h-1 bg-white/5 flex">
                  <div className={`h-full bg-primary/40`} style={{ width: '30%' }} />
                  <div className={`h-full bg-white/10`} style={{ width: '20%' }} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {selectedChest && (
        <ChestOpenDialog
          chestTierId={selectedChest.id}
          chestName={selectedChest.name}
          xpCost={selectedChest.xpCost}
          open={!!selectedChest}
          onOpenChange={(open) => !open && setSelectedChest(null)}
        />
      )}
    </div>
  )
}
