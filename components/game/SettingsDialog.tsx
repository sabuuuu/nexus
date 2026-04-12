'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Settings, Volume2, VolumeX, Mail, Loader2 } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'
import { useProfile } from '@/hooks/useProfile'
import { linkEmailAction } from '@/actions/auth'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'

export function SettingsDialog() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isLinking, setIsLinking] = useState(false)
  const { isMuted, volume, toggleMute, setVolume } = useSettings()
  const { data: profile, mutate: refetchProfile } = useProfile()

  const handleLinkEmail = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Invalid email protocol detected')
      return
    }

    setIsLinking(true)
    try {
      await linkEmailAction(email)
      toast.success('Protocol Secured: Save file encrypted with email')
      refetchProfile()
    } catch (e: any) {
      toast.error(e.message || 'Linkage failed')
    } finally {
      setIsLinking(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex items-center gap-4 px-5 py-3 bg-primary/5 border-2 border-primary/10 rounded-none backdrop-blur-md hover:bg-primary/10 hover:border-primary/30 transition-all cursor-pointer text-left group">
        <div className="text-primary group-hover:animate-pulse">
          <Settings className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest group-hover:text-primary/70 transition-colors">System</span>
          <span className="font-mono text-lg font-black text-white leading-tight uppercase group-hover:text-primary transition-colors">Config</span>
        </div>
      </DialogTrigger>
      
      <DialogContent className="max-w-md bg-[#070B14] border border-primary/20">
        <DialogHeader>
          <DialogTitle className="font-display tracking-widest text-xl flex items-center gap-2 text-white">
            <Settings className="w-5 h-5 text-primary" />
            SYSTEM PREFERENCES
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          
          {/* Sounds Toggle & Volume */}
          <div className="flex flex-col gap-4 border-b border-primary/10 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-mono text-sm text-white font-bold">Audio Protocol</span>
                <span className="text-[10px] uppercase tracking-widest text-white/40">Master Level</span>
              </div>
              <Button
                variant={isMuted ? "outline" : "default"}
                size="icon"
                onClick={toggleMute}
                className={isMuted ? "border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-400" : ""}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <VolumeX className="w-4 h-4 text-white/20" />
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                disabled={isMuted}
                className="flex-1 accent-primary h-1 bg-white/10 rounded-full appearance-none cursor-pointer disabled:opacity-20 transition-opacity"
              />
              <Volume2 className="w-4 h-4 text-primary" />
              <span className="font-mono text-[10px] text-primary w-8 font-bold">{volume}%</span>
            </div>
          </div>

          {/* Account Details */}
          <div className="flex flex-col gap-2">
             <div className="flex flex-col mb-2">
              <span className="font-mono text-sm text-white font-bold">Pilot Link</span>
              <span className="text-[10px] uppercase tracking-widest text-white/40">Secure Your Progress</span>
            </div>
            
            <div className="bg-black/50 border border-primary/20 p-4 flex flex-col gap-3">
               {profile?.email ? (
                 <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-primary">{profile.email}</span>
                    <span className="text-[10px] border border-primary text-primary px-2 py-0.5 uppercase tracking-wider">Verified</span>
                 </div>
               ) : (
                 <div className="space-y-4">
                   <p className="text-xs text-muted-foreground leading-relaxed">
                     You are currently playing on a highly-volatile Guest Protocol. 
                     Sync your email to permanently encrypt your save file into the global Nexus database.
                   </p>
                   <div className="flex gap-2">
                    <Input 
                      placeholder="ENTER_EMAIL_ADDRESS" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-black/60 border-primary/20 font-mono text-xs text-white placeholder:text-white/20"
                    />
                    <Button 
                      onClick={handleLinkEmail}
                      disabled={isLinking}
                      className="font-display tracking-widest bg-primary text-black hover:bg-primary/80"
                    >
                      {isLinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    </Button>
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
