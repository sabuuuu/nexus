'use client'

import { useInventory } from '@/hooks/useInventory'
import { CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { RarityBadge } from '@/components/ui/RarityBadge'
import { Lock, Box, Zap } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

const RARITIES = ['ALL', 'COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY']

export function InventoryView() {
  const { data, isLoading } = useInventory()
  const [filter, setFilter] = useState('ALL')
  const [selectedItem, setSelectedItem] = useState<any | null>(null)

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <Skeleton key={i} className="aspect-square bg-white/5 rounded-none" />
        ))}
      </div>
    )
  }

  const { inventory = [], allItems = [] } = (data as any) || {}
  const ownedIds = new Set(inventory.map((i: any) => i.itemId))

  const filteredItems = allItems
    .filter((it: any) => filter === 'ALL' || it.rarity === filter)
    .sort((a: any, b: any) => RARITIES.indexOf(a.rarity) - RARITIES.indexOf(b.rarity))

  const stats = {
    total: allItems.length,
    owned: ownedIds.size,
    percent: Math.round((ownedIds.size / allItems.length) * 100)
  }

  return (
    <div className="w-full space-y-8 pb-32">
      {/* Collection Stats Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <Box className="w-6 h-6 text-primary" />
             <h2 className="font-display text-4xl tracking-tighter text-white italic uppercase">Storage <span className="text-primary italic">Vault</span></h2>
          </div>
          <p className="font-mono text-[10px] text-white/40 uppercase tracking-[0.3em]">
            Central database // Authorized equipment logs
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
           <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-[10px] font-mono text-white/40 uppercase block">Sync Progress</span>
                <span className="font-mono text-2xl font-black text-white">{stats.owned}/{stats.total}</span>
              </div>
              <div className="w-32 h-2 bg-black/40 border border-white/10 relative overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.percent}%` }}
                  className="absolute inset-y-0 left-0 bg-primary shadow-[0_0_10px_#3B82F6]"
                />
              </div>
           </div>
        </div>
      </div>

      {/* Rarity Tabs */}
      <div className="flex flex-wrap gap-2">
         {RARITIES.map(r => (
           <button
             key={r}
             onClick={() => setFilter(r)}
             className={cn(
               "px-4 py-1.5 font-mono text-[10px] font-bold tracking-widest uppercase transition-all border cursor-pointer",
               filter === r 
                 ? "bg-primary text-black border-primary" 
                 : "bg-white/5 text-white/40 border-white/10 hover:border-white/20"
             )}
           >
             {r}
           </button>
         ))}
      </div>

      {/* Item Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredItems.map((item: any) => {
          const isOwned = ownedIds.has(item.id)
          
          return (
            <motion.div
              layout
              key={item.id}
              onClick={() => isOwned && setSelectedItem(item)}
              className={cn(
                "group relative aspect-square border-2 transition-all duration-300 overflow-hidden",
                isOwned 
                  ? "bg-black/40 border-primary/20 hover:border-primary/60 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] cursor-pointer" 
                  : "bg-black/60 border-white/5 opacity-40 grayscale pointer-events-none"
              )}
            >
              {/* Rarity Corner Glow */}
              {isOwned && (
                <div className={cn(
                  "absolute -top-12 -right-12 w-24 h-24 blur-3xl opacity-20",
                  item.rarity === 'COMMON' && 'bg-gray-500',
                  item.rarity === 'UNCOMMON' && 'bg-green-500',
                  item.rarity === 'RARE' && 'bg-blue-500',
                  item.rarity === 'EPIC' && 'bg-purple-500',
                  item.rarity === 'LEGENDARY' && 'bg-amber-500',
                )} />
              )}

              <CardContent className="p-4 flex flex-col items-center justify-center h-full gap-3 relative z-10 text-center">
                {!isOwned ? (
                  <Lock className="w-8 h-8 text-white/10" />
                ) : (
                  <>
                    <img 
                      src={item.iconUrl} 
                      alt={item.name} 
                      className="w-20 h-20 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                      onError={(e) => {
                        (e.target as any).src = '/chests/common.png'
                      }}
                    />
                    <div className="text-center">
                       <p className="text-[9px] font-mono text-white/40 uppercase truncate max-w-[100px] mb-1">
                          {item.name.replace(/_/g, ' ')}
                       </p>
                       <RarityBadge rarity={item.rarity as any} className="scale-75 origin-center" />
                    </div>
                  </>
                )}
              </CardContent>

              {isOwned && (
                <div className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 border border-white/10">
                   <span className="text-[8px] font-mono text-white/60">LV.1</span>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Item Detail Panel */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               onClick={() => setSelectedItem(null)}
               className="absolute inset-0 bg-black/80 backdrop-blur-sm"
             />
             <motion.div
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="relative w-full max-w-lg bg-[#070B14] border-2 border-primary/40 p-8 shadow-[0_0_100px_rgba(59,130,246,0.15)] overflow-hidden"
             >
                {/* Tech frames */}
                <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-primary/10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 border-b border-l border-primary/10 pointer-events-none" />

                <div className="flex flex-col md:flex-row gap-8 items-center">
                   <div className="relative group flex-shrink-0">
                      <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-50" />
                      <img 
                        src={selectedItem.iconUrl} 
                        alt={selectedItem.name} 
                        className="w-48 h-48 object-contain relative z-10"
                        onError={(e) => (e.target as any).src = '/chests/common.png'}
                      />
                   </div>
                   
                   <div className="flex-1 space-y-6">
                      <div className="space-y-2 text-center md:text-left">
                        <RarityBadge rarity={selectedItem.rarity as any} />
                        <h3 className="font-display text-4xl text-white tracking-widest uppercase italic">
                           {selectedItem.name.replace(/_/g, ' ')}
                        </h3>
                        <p className="font-mono text-xs text-white/60 leading-relaxed italic">
                           "{selectedItem.description}"
                        </p>
                      </div>

                      <div className="p-4 bg-white/5 border-l-4 border-primary space-y-3">
                         <div className="flex justify-between items-center text-[10px] font-mono uppercase text-white/40">
                            <span>Status</span>
                            <span className="text-primary font-bold">Authorized</span>
                         </div>
                         <div className="flex justify-between items-center text-[10px] font-mono uppercase text-white/40">
                            <span>Class</span>
                            <span className="text-white">Artifact</span>
                         </div>
                      </div>

                      <button 
                        onClick={() => setSelectedItem(null)}
                        className="w-full py-3 bg-primary text-black font-display text-lg tracking-widest hover:bg-white transition-colors cursor-pointer"
                      >
                         CLOSE_INTEL
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
