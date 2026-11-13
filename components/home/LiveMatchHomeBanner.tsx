'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Radio, ExternalLink, Bomb, Activity } from 'lucide-react';
import { useLiveMatch } from '@/hooks/useLiveMatch';

export default function LiveMatchHomeBanner() {
  const [mounted, setMounted] = useState(false);
  const { liveMatch } = useLiveMatch();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always return a stable persistent container to preserve React DOM tree hierarchy with GSAP pinned siblings
  if (!mounted || !liveMatch) {
    return <div id="live-match-banner-wrapper" className="hidden" aria-hidden="true" />;
  }

  const currentRound = liveMatch.currentRound || liveMatch.scoreA + liveMatch.scoreB;

  return (
    <div id="live-match-banner-wrapper" className="w-full">
      {/* Floating Tactical Live HUD Pill (Always reachable across viewport without layout shifts) */}
      <aside aria-label="Live Match Status" className="fixed bottom-6 right-6 z-50 pointer-events-auto">
        <Link
          href="/scoreboard/live"
          target="_blank"
          className="group flex items-center gap-3 px-3.5 py-2.5 bg-military-black/95 hover:bg-military-black border border-rose-500/80 rounded-md shadow-[0_4px_25px_rgba(225,29,72,0.4)] backdrop-blur-xl transition-all duration-300 hover:scale-105"
        >
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
          </span>

          <div className="font-mono text-left text-xs leading-tight">
            <div className="flex items-center gap-1.5 font-black text-rose-400 uppercase tracking-wider text-[11px]">
              <span>LIVE MATCH</span>
              <span className="text-gunmetal">|</span>
              <span className="text-sand">ROUND {currentRound}</span>
            </div>
            <div className="text-tacticalWhite font-bold mt-0.5">
              [{liveMatch.teamATag}] {liveMatch.scoreA} : {liveMatch.scoreB} [{liveMatch.teamBTag}]
            </div>
          </div>

          <span className="ml-1 px-2.5 py-1 bg-rose-600 group-hover:bg-rose-500 text-white font-mono text-[10px] font-black uppercase tracking-wider rounded-sm flex items-center gap-1 shadow-sm">
            <span>HUD</span>
            <ExternalLink className="w-3 h-3" />
          </span>
        </Link>
      </aside>

      {/* Main Full-Width Section */}
      <section className="relative z-30 w-full bg-military-black border-y-2 border-rose-600/60 shadow-[0_0_35px_rgba(225,29,72,0.25)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-950/30 via-military-black to-rose-950/30 pointer-events-none" />
        <div className="absolute inset-0 tactical-grid-bg opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 relative z-10">
          
          {/* Header telemetry line */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-gunmetal/60">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
              </span>
              <span className="font-mono text-xs sm:text-sm font-black uppercase text-rose-400 tracking-widest flex items-center gap-1.5">
                <span>LIVE COMBAT ENGAGEMENT IN PROGRESS</span>
              </span>
              <span className="text-mutedKhaki font-mono text-xs hidden sm:inline">{"//"}</span>
              <span className="text-sand font-mono text-xs font-bold uppercase hidden sm:inline">
                {liveMatch.stage}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-mutedKhaki">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-sand animate-pulse" />
                <span>THEATER: <strong className="text-tacticalWhite uppercase">{liveMatch.map}</strong></span>
              </div>
              <span>•</span>
              <span className="text-tacticalWhite font-bold">S&amp;D PML220</span>
            </div>
          </div>

          {/* Live Match Scoreboard Bar */}
          <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-5 sm:gap-6 bg-surface/90 border border-gunmetal p-4 sm:p-5 backdrop-blur-md">
            
            {/* Team A */}
            <div className="md:col-span-4 flex items-center gap-3.5">
              <div className="relative w-12 sm:w-14 h-12 sm:h-14 bg-card border border-gunmetal shrink-0 overflow-hidden clip-tactical">
                <Image
                  src={liveMatch.teamALogo || '/images/team-placeholder.svg'}
                  alt={liveMatch.teamAName}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
              <div className="min-w-0">
                <span className="text-xs font-mono text-sand font-bold">[{liveMatch.teamATag}]</span>
                <h3 className="font-display font-black text-lg sm:text-xl text-tacticalWhite uppercase truncate">
                  {liveMatch.teamAName}
                </h3>
                <span className="text-[10px] font-mono text-sand/80 uppercase">
                  {liveMatch.teamASide === 'T' ? 'OPFOR SIDE' : 'TASK FORCE SIDE'}
                </span>
              </div>
            </div>

            {/* Center Round Counter & Live Score */}
            <div className="md:col-span-4 flex flex-col items-center justify-center text-center py-1">
              <span className="text-[10px] font-mono text-mutedKhaki uppercase tracking-widest mb-1">
                ROUND {currentRound} {"// TARGET: 13"}
              </span>
              <div className="font-display font-black text-4xl sm:text-5xl text-tacticalWhite flex items-center gap-3">
                <span className="text-sand">{liveMatch.scoreA}</span>
                <span className="text-mutedKhaki/40">:</span>
                <span className="text-khaki">{liveMatch.scoreB}</span>
              </div>

              {liveMatch.c4Planted && (
                <div className="mt-2 text-rose-400 font-mono text-[11px] font-bold animate-pulse flex items-center gap-1.5 bg-rose-500/15 border border-rose-500/40 px-2.5 py-0.5 rounded-sm">
                  <Bomb className="w-3.5 h-3.5 shrink-0" />
                  <span>ORDNANCE PLANTED // DEFUSE ACTIVE</span>
                </div>
              )}
            </div>

            {/* Team B */}
            <div className="md:col-span-4 flex items-center justify-start md:justify-end gap-3.5 text-left md:text-right">
              <div className="min-w-0 order-2 md:order-1">
                <span className="text-xs font-mono text-khaki font-bold">[{liveMatch.teamBTag}]</span>
                <h3 className="font-display font-black text-lg sm:text-xl text-tacticalWhite uppercase truncate">
                  {liveMatch.teamBName}
                </h3>
                <span className="text-[10px] font-mono text-khaki/80 uppercase">
                  {liveMatch.teamBSide === 'CT' ? 'TASK FORCE SIDE' : 'OPFOR SIDE'}
                </span>
              </div>
              <div className="relative w-12 sm:w-14 h-12 sm:h-14 bg-card border border-gunmetal shrink-0 overflow-hidden clip-tactical order-1 md:order-2">
                <Image
                  src={liveMatch.teamBLogo || '/images/team-placeholder.svg'}
                  alt={liveMatch.teamBName}
                  fill
                  className="object-cover"
                  sizes="56px"
                />
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-gunmetal/60">
            <div className="text-xs font-mono text-mutedKhaki flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Real-time round feeds broadcast directly from referee match console.</span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/scoreboard"
                className="px-4 py-2 bg-surface hover:bg-surface/80 border border-gunmetal text-tacticalWhite font-mono text-xs uppercase font-bold tracking-wider transition-colors"
              >
                FULL SCOREBOARD &amp; BRACKET
              </Link>
              <Link
                href="/scoreboard/live"
                target="_blank"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-tacticalWhite font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>STAGE AUDITORIUM HUD</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
