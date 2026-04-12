import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'

export const metadata: Metadata = {
  title: 'Nexus City | Superhero Idle Clicker',
  description: 'Climb the ranks in a gritty, neon-lit superhero metropolis.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark h-full antialiased" style={{ colorScheme: 'dark' }}>
      <body className="min-h-full flex flex-col font-ui bg-background text-foreground">
        <QueryProvider>
          <AuthProvider>
            <TooltipProvider>
              {children}
              <Toaster richColors closeButton position="top-right" />
            </TooltipProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
