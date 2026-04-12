'use client'

import { useLeaderboard } from '@/hooks/useLeaderboard'
import { Trophy, Medal, Users, Target, Loader2, ArrowUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function LeaderboardView() {
  const { data: leaderboard, isLoading } = useLeaderboard()

  if (isLoading) {
    return (
      <div className="w-full space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-16 w-full bg-white/5 rounded-none" />
        ))}
      </div>
    )
  }

  const entries = leaderboard?.entries || []
  const myRank = leaderboard?.myRank

  return (
    <div className="w-full space-y-12 pb-24 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className="font-display text-4xl tracking-tighter text-white italic uppercase bg-primary/10 inline-block px-4 py-1 skew-x-[-10deg]">
          Global <span className="text-primary italic">Rankings</span>
        </h2>
        <div className="flex justify-between items-center text-[10px] font-mono text-white/40 uppercase tracking-[0.3em]">
          <span>Season: {leaderboard?.seasonName || 'STATION_RECRUITMENT'}</span>
          <span className="text-primary animate-pulse">Live Feed Active</span>
        </div>
      </div>

      {/* Top 3 Spotlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {entries.slice(0, 3).map((entry: any, i: number) => (
           <Card key={entry.userId} className={`
             relative bg-black/60 rounded-none border-2 transition-all 
             ${i === 0 ? 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)] scale-105 z-10' : 'border-primary/20'}
           `}>
             <CardContent className="p-6 flex flex-col items-center text-center gap-4">
               <div className={`
                 w-16 h-16 rounded-full flex items-center justify-center border-4
                 ${i === 0 ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 bg-white/5'}
               `}>
                 {i === 0 ? <Trophy className="w-8 h-8 text-amber-500" /> : <Medal className="w-8 h-8 text-white/40" />}
               </div>
               <div>
                  <h3 className="font-display text-2xl text-white truncate max-w-[150px]">{entry.username || 'ANON_PILOT'}</h3>
                  <p className="text-xs font-mono text-primary font-bold uppercase tracking-widest mt-1">
                    {parseInt(entry.totalXp).toLocaleString()} XP
                  </p>
               </div>
               <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 border border-white/10 font-mono text-xs font-bold text-white italic">
                 #0{entry.rank}
               </div>
             </CardContent>
           </Card>
         ))}
      </div>

      {/* Your Rank Pin */}
      {myRank && (
        <div className="bg-primary/20 border-ly border-t-2 border-b-2 border-primary/40 py-4 px-6 flex justify-between items-center group hover:bg-primary/30 transition-all">
          <div className="flex items-center gap-6">
            <span className="font-display text-3xl text-primary italic"># {myRank.rank}</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">Your Current Protocol</span>
              <span className="font-mono text-white text-lg font-bold">{(parseInt(myRank.totalXp)).toLocaleString()} XP</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-primary font-bold font-mono text-xs uppercase tracking-widest animate-pulse">
            <ArrowUp className="w-4 h-4" /> Climb Ranks
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="space-y-2 border-l-2 border-white/5 pl-4">
        {entries.slice(3).map((entry: any) => (
          <div 
            key={entry.userId}
            className="flex justify-between items-center py-4 px-6 bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-white/10 transition-all relative group"
          >
            <div className="flex items-center gap-8">
               <span className="font-mono text-xl text-white/20 font-black italic min-w-[40px] group-hover:text-primary transition-colors">
                 {entry.rank.toString().padStart(2, '0')}
               </span>
               <div className="flex flex-col">
                 <span className="text-lg font-display text-white tracking-widest">{entry.username || 'ANON_PILOT'}</span>
                 <span className="text-[10px] font-mono text-white/20 uppercase tracking-widest">ID: {entry.userId.slice(0, 8)}</span>
               </div>
            </div>
            <div className="text-right">
               <span className="font-mono text-lg text-primary font-bold tabular-nums">
                 {parseInt(entry.totalXp).toLocaleString()} XP
               </span>
               <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mt-1 italic">Authorized</p>
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-24 text-center opacity-20">
          <Target className="w-16 h-16 mb-4" />
          <p className="font-display text-2xl uppercase tracking-[0.4em]">No Logs Detected</p>
          <p className="font-mono text-xs uppercase mt-2">Season initialization in progress</p>
        </div>
      )}
    </div>
  )
}
