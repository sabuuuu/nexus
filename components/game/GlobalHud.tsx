'use client'

import React from 'react'

export function GlobalHud() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {/* Moving Scanline Overlay */}
      <div className="absolute inset-x-0 h-[200px] bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-scanline pointer-events-none" />

      {/* Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.9)]" />
    </div>
  )
}
