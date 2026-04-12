'use client'

import * as React from 'react'
import { useProfile } from '@/hooks/useProfile'
import { updateUsernameAction } from '@/actions/auth'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { ShieldAlert } from 'lucide-react'

export function AliasGateway() {
  const { data: profile, refetch, isLoading } = useProfile()
  const [alias, setAlias] = React.useState('')
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Only show if logged in but no username
  const isOpen = !isLoading && !!profile && !profile.username

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!alias.trim()) return

    setIsSubmitting(true)
    try {
      await updateUsernameAction(alias)
      toast.success(`Welcome to the Nexus, Agent ${alias}`)
      await refetch()
    } catch (error: any) {
      toast.error(error.message || 'Failed to register alias')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent 
        showCloseButton={false}
        className="border-primary/50 shadow-[0_0_50px_-12px_rgba(var(--primary),0.3)] sm:max-w-md bg-background/95 backdrop-blur-xl"
      >
        <DialogHeader className="space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
            <ShieldAlert className="w-6 h-6 text-primary shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
          </div>
          <div className="space-y-2 text-center">
            <DialogTitle className="font-display text-3xl tracking-wider uppercase">
              Uplink Requirements
            </DialogTitle>
            <DialogDescription className="font-mono text-xs text-muted-foreground uppercase tracking-tight">
              A secure Pilot Alias is required before access to the metropolis is granted.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="alias" className="font-mono text-[10px] uppercase text-primary tracking-[0.2em] ml-1">
              Agent Code Name
            </Label>
            <Input
              id="alias"
              placeholder="E.G. NIGHTHAWK"
              value={alias}
              onChange={(e) => setAlias(e.target.value.toUpperCase())}
              className="bg-primary/5 border-primary/20 font-display text-xl tracking-widest h-12 text-center placeholder:text-muted-foreground/30 focus-visible:ring-primary/30"
              autoFocus
              maxLength={20}
              autoComplete="off"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting || alias.trim().length < 3}
            className="w-full font-display text-lg tracking-[0.2em] h-12 shadow-[0_4px_20px_-5px_rgba(var(--primary),0.5)] uppercase"
          >
            {isSubmitting ? 'Registering...' : 'Initialize Uplink'}
          </Button>
          
          <p className="text-[10px] font-mono text-muted-foreground text-center uppercase tracking-widest">
            Note: Your Alias will be visible on global season leaderboards.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
