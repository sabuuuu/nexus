'use client'

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RarityBadge } from '@/components/ui/RarityBadge'
import { openChestAction } from '@/actions/chests'
import { SoundManager } from '@/lib/sound/soundManager'
import { toast } from 'sonner'
import { Zap, Box, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  chestTierId: string
  chestName: string
  xpCost: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChestOpenDialog({ chestTierId, chestName, xpCost, open, onOpenChange }: Props) {
  const [revealedItem, setRevealedItem] = useState<{ name: string; rarity: string; iconUrl: string } | null>(null)
  const [isDuplicate, setIsDuplicate] = useState(false)
  const queryClient = useQueryClient()

  const { mutate: openChest, isPending } = useMutation({
    mutationFn: () => openChestAction(chestTierId),
    onSuccess: (data) => {
      if (data.item) {
        setRevealedItem(data.item as any)
        setIsDuplicate(data.isDuplicate)
        SoundManager.play(data.item.rarity === 'LEGENDARY' ? 'legendary' : 'chestOpen')
        queryClient.invalidateQueries({ queryKey: ['inventory'] })
        queryClient.invalidateQueries({ queryKey: ['gameState'] })
      }
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleClose = () => {
    if (isPending) return
    setRevealedItem(null)
    setIsDuplicate(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-[#070B14] border-2 border-primary/20 p-0 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,1)]">
        <DialogHeader className="p-6 bg-primary/5 border-b border-primary/10 flex flex-col items-center justify-center">
          <DialogTitle className="font-display tracking-[0.2em] text-2xl text-white flex items-center justify-center gap-3 w-full text-center">
            <Box className="text-primary w-6 h-6" />
            {chestName} CLEARANCE
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center gap-8 p-10 relative w-full overflow-hidden">
          {/* Background Tech Details */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-primary" />
            <div className="absolute bottom-0 left-0 w-32 h-32 border-b border-l border-primary" />
          </div>

          <AnimatePresence mode="wait">
            {!revealedItem ? (
              <motion.div
                key="chest"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0, filter: 'blur(10px)' }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative size-64 flex items-center justify-center"
              >
                {/* Visual pulse for pending state */}
                {isPending && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.3, 0.1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute inset-0 bg-primary rounded-full blur-3xl"
                  />
                )}

                <div className="relative z-10 overflow-hidden">
                  <img
                    src={`/chests/${chestName?.toLowerCase() || 'common'}.png`}
                    alt="Data Crate"
                    className={cn(
                      "size-64 object-contain mix-blend-screen transition-all duration-1000",
                      isPending && "animate-pulse scale-105"
                    )}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="item"
                initial={{ scale: 0.8, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                className="flex flex-col items-center gap-6"
              >
                <div className="relative">
                  {/* Legendary Glow */}
                  {revealedItem.rarity === 'LEGENDARY' && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 3 }}
                      className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full"
                    />
                  )}

                  <Card className="border-4 border-primary/40 p-8 bg-black/80 relative z-10 rounded-none w-56">
                    <CardContent className="flex flex-col items-center gap-4 p-0">
                      <div className="w-32 h-32 bg-primary/5 border border-primary/20 flex items-center justify-center">
                        <img
                          src={revealedItem.iconUrl}
                          alt={revealedItem.name}
                          className="w-24 h-24 object-contain"
                          onError={(e) => (e.target as any).src = '/chests/common.png'}
                        />
                      </div>
                      <div className="text-center space-y-1">
                        <RarityBadge rarity={revealedItem.rarity as any} />
                        <h3 className="font-display text-2xl text-white tracking-widest mt-2">
                          {revealedItem.name.replace('_', ' ')}
                        </h3>
                      </div>
                      {isDuplicate && (
                        <div className="bg-primary/10 border border-primary/20 px-3 py-1 flex items-center gap-2">
                          <Sparkles className="w-3 h-3 text-primary" />
                          <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">+10 SHARDS</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!revealedItem ? (
            <div className="w-full space-y-4">
              <Button
                size="lg"
                disabled={isPending}
                onClick={() => openChest()}
                className="w-full h-14 font-display text-md tracking-[0.2em] rounded-none border-b-4 border-primary/50 cursor-pointer transition-all active:translate-y-1"
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    DECRYPTING...
                  </>
                ) : (
                  <>AUTHORIZE ACCESS — {xpCost.toLocaleString()} XP</>
                )}
              </Button>
              <Button
                variant="ghost"
                className="w-full font-mono text-xs opacity-40 hover:opacity-100 cursor-pointer"
                onClick={handleClose}
                disabled={isPending}
              >
                CANCEL ORDER
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              variant="outline"
              className="w-full h-14 font-display text-xl tracking-[0.2em] rounded-none border-primary text-primary cursor-pointer"
              onClick={handleClose}
            >
              COLLECT ASSET
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
