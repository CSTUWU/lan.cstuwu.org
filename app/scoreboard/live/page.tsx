'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { getStoredMatches, getLiveBroadcastChannel, getActiveLiveMatch } from '@/lib/storage';
import { INITIAL_MATCHES } from '@/lib/mockData';
import { api } from '@/lib/api';
import { transformBackendMatch } from '@/lib/transformers';
import { Match } from '@/lib/types';
import {
  Shield,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Radio,
  Flame,
  Bomb,
  Award,
  ChevronLeft,
  Crosshair,
  Sparkles,
} from 'lucide-react';

function StageProjectorScoreboardContent() {
  const searchParams = useSearchParams();
  const queryMatchId = searchParams.get('matchId');

  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [activeMatch, setActiveMatch] = useState<Match>(() => {
    return INITIAL_MATCHES.find((m) => m.status === 'live') || INITIAL_MATCHES[0];
  });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cleanMode, setCleanMode] = useState(false);
  const [lastUpdateEffect, setLastUpdateEffect] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Audio effects using Web Audio API so no external sound files are required
  const playBeep = useCallback((freq: number = 880, duration: number = 0.15) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // AudioContext policy
    }
  }, [soundEnabled]);

  const syncMatchState = useCallback(() => {
    const allMatches = getStoredMatches();
    setMatches(allMatches);

    let current: Match | undefined;
    if (queryMatchId) {
      current = allMatches.find((m) => m.id === queryMatchId);
    }
    if (!current) {
      current = allMatches.find((m) => m.status === 'live') || allMatches[0];
    }

    if (current) {
      setActiveMatch((prev) => {
        if (prev && (prev.scoreA !== current!.scoreA || prev.scoreB !== current!.scoreB || prev.c4Planted !== current!.c4Planted)) {
          setLastUpdateEffect(true);
          playBeep(current!.c4Planted ? 440 : 880, 0.2);
          setTimeout(() => setLastUpdateEffect(false), 800);
        }
        return current!;
      });
    }

    // Network poll for remote referee updates
    api.public.getScoreboard().then((res) => {
      if (res?.success && res.data?.liveMatches && res.data.liveMatches.length > 0) {
        const liveBackend = transformBackendMatch(res.data.liveMatches[0]);
        if (!queryMatchId || liveBackend.id === queryMatchId) {
          setActiveMatch((prev) => {
            if (prev && (prev.scoreA !== liveBackend.scoreA || prev.scoreB !== liveBackend.scoreB || prev.c4Planted !== liveBackend.c4Planted)) {
              setLastUpdateEffect(true);
              playBeep(liveBackend.c4Planted ? 440 : 880, 0.2);
              setTimeout(() => setLastUpdateEffect(false), 800);
            }
            return liveBackend;
          });
        }
      }
    }).catch(() => {});
  }, [queryMatchId, playBeep]);

  useEffect(() => {
    syncMatchState();

    // 1. Cross-tab BroadcastChannel listener (instant sync from referee)
    const channel = getLiveBroadcastChannel();
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === 'CST_LIVE_MATCH_UPDATE') {
        syncMatchState();
      }
    };
    channel?.addEventListener('message', handleBroadcast);

    // 2. Window storage & custom events
    const handleStorage = () => syncMatchState();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('cst_matches_updated', handleStorage);

    // 3. Fallback polling every 2 seconds for projector reliability
    const interval = setInterval(syncMatchState, 2000);

    return () => {
      channel?.removeEventListener('message', handleBroadcast);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('cst_matches_updated', handleStorage);
      clearInterval(interval);
    };
  }, [syncMatchState]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const teamASide = activeMatch.teamASide || 'CT';
  const teamBSide = activeMatch.teamBSide || 'T';
  const isC4Active = !!activeMatch.c4Planted;
  const currentRound = activeMatch.currentRound ?? (activeMatch.scoreA + activeMatch.scoreB);
  const roundHistory = activeMatch.roundHistory || [];

  return (
    <div className={`min-h-screen bg-[#05070B] text-primaryText relative overflow-hidden select-none flex flex-col justify-between ${
      isC4Active ? 'ring-8 ring-rose-600/70' : ''
    }`}>
      
      {/* Dynamic Background Atmospheric Lighting */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Left Team (CT Cyan or T Orange) */}
        <div
          className={`absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 transition-all duration-700 ${
            teamASide === 'CT' ? 'bg-[#00D5FF]' : 'bg-[#FF7438]'
          }`}
        />
        {/* Right Team (CT Cyan or T Orange) */}
        <div
          className={`absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 transition-all duration-700 ${
            teamBSide === 'CT' ? 'bg-[#00D5FF]' : 'bg-[#FF7438]'
          }`}
        />
        {/* Center Grid */}
        <div className="absolute inset-0 tactical-grid-bg opacity-20" />
      </div>

      {/* TOP STAGE HUD BAR */}
      {!cleanMode && (
        <header className="relative z-30 px-6 py-4 flex items-center justify-between border-b border-tactical-border/70 bg-[#090D14]/90 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Link
              href="/scoreboard"
              className="text-xs font-mono text-secondaryText hover:text-white flex items-center gap-1 bg-surface px-3 py-1.5 border border-tactical-border hover:border-cyan transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>EXIT TO SCOREBOARD</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-display font-black text-sm tracking-wider text-white uppercase">
                AUDITORIUM STAGE PROJECTOR <span className="text-cyan">{"// LIVE BROADCAST"}</span>
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs font-mono text-secondaryText">
            <Shield className="w-4 h-4 text-cyan" />
            <span>CST LAN CHALLENGE 2026 • UVA WELLASSA UNIVERSITY OF SRI LANKA</span>
          </div>

          {/* Projector Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 border text-xs font-mono transition-colors ${
                soundEnabled
                  ? 'bg-cyan/10 border-cyan text-cyan'
                  : 'bg-surface border-tactical-border text-secondaryText hover:text-white'
              }`}
              title={soundEnabled ? 'Mute Alert Beeper' : 'Enable Alert Audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setCleanMode(!cleanMode)}
              className="px-3 py-1.5 bg-surface border border-tactical-border text-xs font-mono text-white hover:border-cyan transition-colors"
              title="Hide top and bottom bars for pure auditorium stage projection"
            >
              SPECTATOR CLEAN HUD
            </button>

            <button
              onClick={toggleFullscreen}
              className="px-3 py-1.5 bg-cyan text-background font-bold border border-cyan text-xs font-mono flex items-center gap-1.5 hover:shadow-[0_0_15px_rgba(0,213,255,0.4)] transition-all"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isFullscreen ? 'EXIT FULLSCREEN' : 'FULLSCREEN (F11)'}</span>
            </button>
          </div>
        </header>
      )}

      {/* C4 BOMB PLANTED EMERGENCY BANNER */}
      {isC4Active && (
        <div className="relative z-40 bg-gradient-to-r from-rose-950 via-rose-600 to-rose-950 text-white py-2.5 px-6 border-y-2 border-rose-400 shadow-[0_0_35px_rgba(244,63,94,0.8)] animate-pulse flex items-center justify-center gap-3 font-mono font-black text-sm sm:text-base tracking-widest uppercase">
          <Bomb className="w-5 h-5 animate-bounce" />
          <span>⚠️ EMERGENCY ALERT: C4 EXPLOSIVE ORDNANCE PLANTED — DEFUSE COUNTDOWN ACTIVE ⚠️</span>
          <Bomb className="w-5 h-5 animate-bounce" />
        </div>
      )}

      {/* MAIN STAGE ARENA DISPLAY */}
      <main className="relative z-20 flex-1 flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
        
        {/* Tournament Phase Badge */}
        <div className="flex flex-col items-center justify-center mb-6 text-center">
          <div className="inline-flex items-center gap-2 bg-surface/90 border border-tactical-border px-4 py-1 mb-2 shadow-lg">
            <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span className="font-mono text-xs uppercase font-bold text-white tracking-widest">
              {activeMatch.stage}
            </span>
            <span className="text-secondaryText font-mono text-xs">{"//"}</span>
            <span className="font-mono text-xs uppercase font-bold text-cyan tracking-widest">
              MAP: {activeMatch.map}
            </span>
          </div>

          <div className="text-xs font-mono text-secondaryText tracking-wider uppercase">
            REGULATION MR12 FORMAT • FIRST SQUAD TO 13 ROUNDS WINS
          </div>
        </div>

        {/* GIANT SCOREBOARD VERSUS SECTION */}
        <div className="grid grid-cols-12 items-center gap-4 sm:gap-6">
          
          {/* TEAM A CARD (LEFT) */}
          <div className={`col-span-12 lg:col-span-5 p-6 sm:p-8 bg-card/90 border-2 backdrop-blur-xl transition-all duration-300 relative overflow-hidden ${
            teamASide === 'CT'
              ? 'border-cyan/50 shadow-[0_0_40px_rgba(0,213,255,0.15)]'
              : 'border-orange/50 shadow-[0_0_40px_rgba(255,116,56,0.15)]'
          }`}>
            {/* Top Side Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 font-mono font-black text-xs uppercase tracking-widest border clip-tactical ${
                teamASide === 'CT'
                  ? 'bg-cyan/15 text-cyan border-cyan/40 shadow-[0_0_12px_rgba(0,213,255,0.3)]'
                  : 'bg-orange/15 text-orange border-orange/40 shadow-[0_0_12px_rgba(255,116,56,0.3)]'
              }`}>
                {teamASide === 'CT' ? '🛡️ CT SIDE (COUNTER-TERRORIST)' : '⚔️ T SIDE (TERRORIST)'}
              </span>
              <span className="text-[11px] font-mono text-secondaryText">TEAM ALPHA</span>
            </div>

            {/* Team Identity */}
            <div className="flex items-center gap-5 mb-4">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-surface border-2 border-tactical-border shrink-0 overflow-hidden clip-tactical">
                <Image src={activeMatch.teamALogo} alt={activeMatch.teamAName} fill className="object-cover" sizes="96px" priority />
              </div>
              <div className="min-w-0">
                <div className={`font-mono text-sm font-bold tracking-wider ${teamASide === 'CT' ? 'text-cyan' : 'text-orange'}`}>
                  [{activeMatch.teamATag}]
                </div>
                <h2 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight truncate">
                  {activeMatch.teamAName}
                </h2>
                <div className="text-xs font-mono text-secondaryText truncate">
                  Uva Wellassa University of Sri Lanka
                </div>
              </div>
            </div>

            {/* Round Streak Callout */}
            <div className="pt-3 border-t border-tactical-border/70 flex items-center justify-between text-xs font-mono text-secondaryText">
              <span>MOMENTUM: {activeMatch.scoreA > activeMatch.scoreB ? 'ROUND LEAD' : 'CHASING'}</span>
              <span className="text-white font-bold">STATUS: {activeMatch.status.toUpperCase()}</span>
            </div>
          </div>

          {/* CENTER GIANT ROUND SCORE HUB */}
          <div className="col-span-12 lg:col-span-2 flex flex-col items-center justify-center text-center p-4">
            
            {/* Round Counter */}
            <div className="text-[11px] font-mono uppercase tracking-widest text-secondaryText mb-1">
              CURRENT ROUND
            </div>
            <div className="font-display font-black text-3xl sm:text-4xl text-white mb-2">
              ROUND {currentRound}
            </div>

            {/* GIANT NUMBERS (11 : 9) */}
            <div className={`flex items-center justify-center gap-3 sm:gap-4 font-display font-black text-6xl sm:text-8xl tracking-tight transition-transform duration-300 ${
              lastUpdateEffect ? 'scale-110' : 'scale-100'
            }`}>
              <span className={teamASide === 'CT' ? 'text-cyan drop-shadow-[0_0_25px_rgba(0,213,255,0.6)]' : 'text-orange drop-shadow-[0_0_25px_rgba(255,116,56,0.6)]'}>
                {activeMatch.scoreA}
              </span>
              <span className="text-secondaryText/60">:</span>
              <span className={teamBSide === 'CT' ? 'text-cyan drop-shadow-[0_0_25px_rgba(0,213,255,0.6)]' : 'text-orange drop-shadow-[0_0_25px_rgba(255,116,56,0.6)]'}>
                {activeMatch.scoreB}
              </span>
            </div>

            {/* Half-Time Status Indicator */}
            <div className="mt-3">
              <span className="px-3 py-1 bg-surface border border-tactical-border text-[11px] font-mono text-secondaryText uppercase tracking-wider">
                {currentRound <= 12 ? 'FIRST HALF (ROUND 1-12)' : currentRound <= 24 ? 'SECOND HALF (ROUND 13-24)' : 'OVERTIME EXTENSION'}
              </span>
            </div>
          </div>

          {/* TEAM B CARD (RIGHT) */}
          <div className={`col-span-12 lg:col-span-5 p-6 sm:p-8 bg-card/90 border-2 backdrop-blur-xl transition-all duration-300 relative overflow-hidden ${
            teamBSide === 'CT'
              ? 'border-cyan/50 shadow-[0_0_40px_rgba(0,213,255,0.15)]'
              : 'border-orange/50 shadow-[0_0_40px_rgba(255,116,56,0.15)]'
          }`}>
            {/* Top Side Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono text-secondaryText">TEAM BRAVO</span>
              <span className={`px-3 py-1 font-mono font-black text-xs uppercase tracking-widest border clip-tactical ${
                teamBSide === 'CT'
                  ? 'bg-cyan/15 text-cyan border-cyan/40 shadow-[0_0_12px_rgba(0,213,255,0.3)]'
                  : 'bg-orange/15 text-orange border-orange/40 shadow-[0_0_12px_rgba(255,116,56,0.3)]'
              }`}>
                {teamBSide === 'CT' ? '🛡️ CT SIDE (COUNTER-TERRORIST)' : '⚔️ T SIDE (TERRORIST)'}
              </span>
            </div>

            {/* Team Identity */}
            <div className="flex items-center justify-end gap-5 mb-4 text-right">
              <div className="min-w-0">
                <div className={`font-mono text-sm font-bold tracking-wider ${teamBSide === 'CT' ? 'text-cyan' : 'text-orange'}`}>
                  [{activeMatch.teamBTag}]
                </div>
                <h2 className="font-display font-black text-2xl sm:text-4xl text-white uppercase tracking-tight truncate">
                  {activeMatch.teamBName}
                </h2>
                <div className="text-xs font-mono text-secondaryText truncate">
                  University of Moratuwa
                </div>
              </div>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-surface border-2 border-tactical-border shrink-0 overflow-hidden clip-tactical">
                <Image src={activeMatch.teamBLogo} alt={activeMatch.teamBName} fill className="object-cover" sizes="96px" priority />
              </div>
            </div>

            {/* Round Streak Callout */}
            <div className="pt-3 border-t border-tactical-border/70 flex items-center justify-between text-xs font-mono text-secondaryText">
              <span className="text-white font-bold">STATUS: {activeMatch.status.toUpperCase()}</span>
              <span>MOMENTUM: {activeMatch.scoreB > activeMatch.scoreA ? 'ROUND LEAD' : 'CHASING'}</span>
            </div>
          </div>

        </div>

        {/* CHRONOLOGICAL ROUND MOMENTUM HISTORY TIMELINE */}
        <div className="mt-8 p-4 bg-card/70 border border-tactical-border backdrop-blur-md">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-secondaryText uppercase tracking-wider flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-cyan" />
              CHRONOLOGICAL ROUND TIMELINE (FIRST TO 13)
            </span>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-cyan inline-block shadow-[0_0_8px_rgba(0,213,255,0.8)]" />
                <span className="text-white font-bold">{activeMatch.teamATag} Won</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-orange inline-block shadow-[0_0_8px_rgba(255,116,56,0.8)]" />
                <span className="text-white font-bold">{activeMatch.teamBTag} Won</span>
              </span>
            </div>
          </div>

          {/* Timeline Dots */}
          <div className="grid grid-cols-24 gap-1 sm:gap-2">
            {Array.from({ length: 24 }).map((_, index) => {
              const roundWinner = roundHistory[index];
              const isCurrent = index === currentRound;
              const isHalfTimeBreak = index === 11;

              return (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-full h-8 sm:h-10 flex items-center justify-center font-mono text-[10px] font-bold border transition-all ${
                      roundWinner === 'teamA'
                        ? 'bg-cyan/30 text-cyan border-cyan shadow-[0_0_10px_rgba(0,213,255,0.4)]'
                        : roundWinner === 'teamB'
                        ? 'bg-orange/30 text-orange border-orange shadow-[0_0_10px_rgba(255,116,56,0.4)]'
                        : isCurrent
                        ? 'bg-surface border-white text-white animate-pulse'
                        : 'bg-surface/30 border-tactical-border/50 text-secondaryText/40'
                    }`}
                  >
                    {roundWinner ? (roundWinner === 'teamA' ? activeMatch.teamATag.slice(0, 2) : activeMatch.teamBTag.slice(0, 2)) : index + 1}
                  </div>
                  {isHalfTimeBreak && (
                    <span className="text-[8px] font-mono text-cyan mt-1 hidden sm:block">HALF</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* MVP HIGHLIGHT (IF AVAILABLE) */}
        {activeMatch.mvp && (
          <div className="mt-4 p-3 bg-tactical-gold/10 border border-tactical-gold/30 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-tactical-gold">
              <Award className="w-4 h-4 shrink-0" />
              <span className="font-bold uppercase tracking-wider">OFFICIAL MATCH MVP SPOTLIGHT:</span>
              <span className="text-white font-bold">{activeMatch.mvp}</span>
            </div>
            <span className="text-secondaryText text-[11px] hidden sm:inline">
              RATED BY CST TOURNAMENT COMMITTEE
            </span>
          </div>
        )}

      </main>

      {/* BOTTOM FOOTER BAR */}
      {!cleanMode && (
        <footer className="relative z-30 px-6 py-3 border-t border-tactical-border/70 bg-[#090D14]/90 backdrop-blur-md flex items-center justify-between text-[11px] font-mono text-secondaryText">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>REAL-TIME STAGE SYNC: ACTIVE (BROADCASTCHANNEL READY)</span>
          </div>

          <div className="hidden sm:block">
            PRESS <strong className="text-white">F11</strong> FOR FULL AUDITORIUM PROJECTION
          </div>

          <div>
            CST LAN CHALLENGE 2026 // OFFICIAL CS2 ARENA
          </div>
        </footer>
      )}

      {/* Floating Exit Clean Mode Button */}
      {cleanMode && (
        <button
          onClick={() => setCleanMode(false)}
          className="fixed bottom-4 right-4 z-50 px-3 py-1.5 bg-card/80 border border-tactical-border text-xs font-mono text-secondaryText hover:text-white hover:border-cyan backdrop-blur-sm"
        >
          RESTORE HUD
        </button>
      )}

    </div>
  );
}

function StageProjectorLoading() {
  return (
    <div className="min-h-screen bg-[#06080C] text-white flex items-center justify-center font-mono">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-2 border-cyan border-t-transparent animate-spin mx-auto clip-tactical" />
        <p className="text-secondaryText text-sm tracking-widest uppercase">INITIALIZING STAGE PROJECTOR HUD...</p>
      </div>
    </div>
  );
}

export default function StageProjectorScoreboard() {
  return (
    <React.Suspense fallback={<StageProjectorLoading />}>
      <StageProjectorScoreboardContent />
    </React.Suspense>
  );
}
