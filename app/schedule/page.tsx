'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getStoredMatches } from '@/lib/storage';
import { INITIAL_MATCHES } from '@/lib/mockData';
import { api } from '@/lib/api';
import { transformBackendMatch } from '@/lib/transformers';
import { Match, MatchStatus } from '@/lib/types';
import { Calendar, Clock, MapPin, Tv, Shield, ChevronRight, CheckCircle2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function SchedulePage() {
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    setMatches(getStoredMatches());

    api.public.getMatches().then((res) => {
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setMatches(res.data.map(transformBackendMatch));
      }
    }).catch(() => {});

    const handleUpdate = () => setMatches(getStoredMatches());
    window.addEventListener('cst_matches_updated', handleUpdate);
    return () => window.removeEventListener('cst_matches_updated', handleUpdate);
  }, []);

  const filteredMatches = matches.filter((m) => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  return (
    <div className="pt-28 pb-24 bg-[#080B10] min-h-screen">
      <div className="absolute inset-0 tactical-grid-bg opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-secondaryText mb-8">
          <Link href="/" className="hover:text-cyan transition-colors">HOME</Link>
          <span>/</span>
          <span className="text-white">TOURNAMENT SCHEDULE</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-tactical-border mb-10">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <Badge variant="orange" size="sm">TIMELINE OPERATIONS</Badge>
              <span className="text-xs font-mono text-secondaryText">{"// DEMONSTRATION SCHEDULE"}</span>
            </div>
            <h1 className="font-display font-black text-4xl sm:text-5xl uppercase text-white tracking-tight">
              MATCH <span className="text-cyan">SCHEDULE</span>
            </h1>
            <p className="text-xs sm:text-sm font-mono text-secondaryText mt-1">
              Counter-Strike 2 competitive fixtures, map assignments, and auditorium stage timelines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button href="/scoreboard" variant="outline" size="sm">
              VIEW STANDINGS
            </Button>
            <Button href="/register" variant="cyan" size="sm">
              ENLIST TEAM
            </Button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-card/70 border border-tactical-border p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {(['all', 'upcoming', 'completed'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 text-xs font-mono uppercase font-bold tracking-wider border transition-colors ${
                  filter === tab
                    ? 'bg-cyan text-background border-cyan'
                    : 'bg-surface text-secondaryText border-tactical-border hover:text-white'
                }`}
              >
                {tab} ({tab === 'all' ? matches.length : matches.filter(m => m.status === tab).length})
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-secondaryText">
            TIMEZONE: <span className="text-cyan font-bold">UTC+5:30 (SRI LANKA)</span>
          </div>
        </div>

        {/* Matches List */}
        <div className="space-y-4">
          {filteredMatches.length === 0 ? (
            <div className="text-center py-16 bg-surface/30 border border-tactical-border p-8 text-secondaryText font-mono text-xs">
              No matches found under this filter.
            </div>
          ) : (
            filteredMatches.map((m) => {
              const matchDate = new Date(m.dateTime);
              const isCompleted = m.status === 'completed';

              return (
                <div
                  key={m.id}
                  className="bg-card/90 border border-tactical-border p-5 sm:p-6 backdrop-blur-md transition-all duration-300 hover:border-cyan/40"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    
                    {/* Left Info */}
                    <div className="min-w-[180px]">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-cyan px-2 py-0.5 bg-surface border border-cyan/30 inline-block mb-1.5">
                        {m.stage}
                      </span>
                      <div className="text-xs font-mono text-white font-medium flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-orange" />
                        {matchDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-[11px] font-mono text-secondaryText flex items-center gap-2 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-secondaryText" />
                        {matchDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Middle Matchup & Score */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-7 items-center gap-4 py-2 border-y lg:border-y-0 lg:border-x border-tactical-border/70 lg:px-6">
                      
                      {/* Team A */}
                      <div className="sm:col-span-3 flex items-center gap-3 sm:justify-end">
                        <div className="text-left sm:text-right min-w-0">
                          <span className="text-xs font-mono text-cyan block">[{m.teamATag}]</span>
                          <span className="font-display font-black text-base sm:text-lg text-white uppercase tracking-wider truncate block">
                            {m.teamAName}
                          </span>
                        </div>
                        <div className="relative w-12 h-12 bg-surface border border-tactical-border shrink-0 overflow-hidden">
                          <Image src={m.teamALogo} alt={m.teamAName} fill className="object-cover" sizes="48px" />
                        </div>
                      </div>

                      {/* Score / VS Center */}
                      <div className="sm:col-span-1 text-center font-display">
                        {isCompleted ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-tactical-border">
                            <span className={`text-xl font-black ${m.scoreA > m.scoreB ? 'text-cyan' : 'text-secondaryText'}`}>
                              {m.scoreA}
                            </span>
                            <span className="text-secondaryText text-sm">:</span>
                            <span className={`text-xl font-black ${m.scoreB > m.scoreA ? 'text-orange' : 'text-secondaryText'}`}>
                              {m.scoreB}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-mono font-bold text-secondaryText px-3 py-1 bg-surface border border-tactical-border">
                            VS
                          </span>
                        )}
                      </div>

                      {/* Team B */}
                      <div className="sm:col-span-3 flex items-center gap-3 justify-start">
                        <div className="relative w-12 h-12 bg-surface border border-tactical-border shrink-0 overflow-hidden">
                          <Image src={m.teamBLogo} alt={m.teamBName} fill className="object-cover" sizes="48px" />
                        </div>
                        <div className="text-left min-w-0">
                          <span className="text-xs font-mono text-orange block">[{m.teamBTag}]</span>
                          <span className="font-display font-black text-base sm:text-lg text-white uppercase tracking-wider truncate block">
                            {m.teamBName}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Right Map & Actions */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 min-w-[160px]">
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-secondaryText block">MAP ARENA</span>
                        <span className="text-xs font-mono font-bold text-white uppercase">
                          {m.map}
                        </span>
                      </div>

                      {isCompleted ? (
                        <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> FINAL SCORE
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-cyan bg-cyan/10 border border-cyan/30 px-2.5 py-1 uppercase font-semibold">
                          SCHEDULED
                        </span>
                      )}
                    </div>

                  </div>

                  {/* MVP Banner if completed */}
                  {isCompleted && m.mvp && (
                    <div className="mt-4 pt-3 border-t border-tactical-border/50 text-[11px] font-mono text-secondaryText flex items-center justify-between">
                      <span className="text-orange font-semibold">MATCH MVP:</span>
                      <span className="text-white font-bold">{m.mvp}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}

