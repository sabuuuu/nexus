'use client'

import * as React from 'react'
import { signInAnonymouslyAction } from '@/actions/auth'
import { createSupabaseBrowser } from '@/lib/supabase/client'
import { useProfile } from '@/hooks/useProfile'
import { AliasGateway } from '@/components/auth/AliasGateway'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: profile, refetch } = useProfile()
  const [initializing, setInitializing] = React.useState(true)

  React.useEffect(() => {
    const initAuth = async () => {
      const supabase = createSupabaseBrowser()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        try {
          await signInAnonymouslyAction()
          await refetch()
        } catch (error) {
          console.error('Failed to initialize anonymous session:', error)
        }
      }
      setInitializing(false)
    }

    initAuth()
  }, [refetch])

  if (initializing) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="font-mono text-xs uppercase tracking-widest animate-pulse">Establishing Nexus Uplink...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <AliasGateway />
      {children}
    </>
  )
}
