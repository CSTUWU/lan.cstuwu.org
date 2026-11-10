'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { getStoredMatches, getLiveBroadcastChannel, getActiveLiveMatch, getStoredTeams, isPlayoffTreePublished, setPlayoffTreePublished, areSingleMatchesEquivalent, areMatchesEquivalent, syncDatabaseMatchesToStorage } from '@/lib/storage';
import { INITIAL_MATCHES, INITIAL_TEAMS, getMapImage } from '@/lib/mockData';
import { api } from '@/lib/api';
import { transformBackendMatch } from '@/lib/transformers';
import { Match, Team } from '@/lib/types';
import PlayoffBracketTree from '@/components/scoreboard/PlayoffBracketTree';
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
  Trophy,
} from 'lucide-react';

function StageProjectorScoreboardContent() {
  const searchParams = useSearchParams();
  const queryMatchId = searchParams.get('matchId');

  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [activeMatch, setActiveMatch] = useState<Match | undefined>(() => {
    return INITIAL_MATCHES.find((m) => m.status === 'live') || INITIAL_MATCHES[0];
  });
  const [displayMode, setDisplayMode] = useState<'match' | 'bracket'>('match');
  const [isTreePublished, setIsTreePublished] = useState<boolean>(() => isPlayoffTreePublished());
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
    const pub = isPlayoffTreePublished();
    setIsTreePublished(pub);

    const allMatches = getStoredMatches();
    setMatches((prev) => (areMatchesEquivalent(prev, allMatches) ? prev : allMatches));
    setTeams(getStoredTeams());

    let current: Match | undefined;
    if (queryMatchId) {
      current = allMatches.find((m) => m.id === queryMatchId);
    }
    if (!current) {
      current = allMatches.find((m) => m.status === 'live');
    }

    if (current) {
      setActiveMatch((prev) => {
        if (areSingleMatchesEquivalent(prev, current)) return prev;
        if (prev && prev.id === current!.id && (prev.scoreA !== current!.scoreA || prev.scoreB !== current!.scoreB || prev.c4Planted !== current!.c4Planted)) {
          setLastUpdateEffect(true);
          playBeep(current!.c4Planted ? 440 : 880, 0.2);
          setTimeout(() => setLastUpdateEffect(false), 800);
        }
        return current!;
      });
    }

    api.public.getScoreboard().then((res) => {
      if (res?.success && res.data?.liveMatches && res.data.liveMatches.length > 0) {
        const liveBackend = transformBackendMatch(res.data.liveMatches[0]);
        if (!queryMatchId || liveBackend.id === queryMatchId) {
          setActiveMatch((prev) => {
            if (areSingleMatchesEquivalent(prev, liveBackend)) return prev;
            if (prev && prev.id === liveBackend.id && (prev.scoreA !== liveBackend.scoreA || prev.scoreB !== liveBackend.scoreB || prev.c4Planted !== liveBackend.c4Planted)) {
              setLastUpdateEffect(true);
              playBeep(liveBackend.c4Planted ? 440 : 880, 0.2);
              setTimeout(() => setLastUpdateEffect(false), 800);
            }
            return liveBackend;
          });
        }
        syncDatabaseMatchesToStorage(res.data.liveMatches.map(transformBackendMatch));
      } else if (!queryMatchId && res?.success && Array.isArray(res.data?.upcomingMatches) && res.data.upcomingMatches.length > 0) {
        // Fallback to first upcoming match only if no active match
        setActiveMatch((prev) => {
          if (prev && prev.status === 'live') return prev;
          const up = transformBackendMatch(res.data.upcomingMatches[0]);
          return areSingleMatchesEquivalent(prev, up) ? prev : up;
        });
      }
    }).catch(() => {});
  }, [queryMatchId, playBeep]);

  useEffect(() => {
    syncMatchState();

    // Check backend settings for playoffTreePublished
    api.public.getSettings().then((res) => {
      if (res?.data?.playoffTreePublished !== undefined) {
        setIsTreePublished(res.data.playoffTreePublished);
        setPlayoffTreePublished(res.data.playoffTreePublished);
        if (!res.data.playoffTreePublished) {
          setDisplayMode((prev) => (prev === 'bracket' ? 'match' : prev));
        }
      }
    }).catch(() => {});

    const channel = getLiveBroadcastChannel();
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === 'CST_LIVE_MATCH_UPDATE' || event.data?.type === 'CST_16_MATCHES_UPDATE') {
        syncMatchState();
      }
      if (event.data?.type === 'CST_PLAYOFF_PUBLISHED_UPDATE') {
        const pub = typeof event.data.published === 'boolean' ? event.data.published : isPlayoffTreePublished();
        setIsTreePublished(pub);
        if (!pub) {
          setDisplayMode((prev) => (prev === 'bracket' ? 'match' : prev));
        }
      }
    };
    channel?.addEventListener('message', handleBroadcast);

    const handleStorage = () => syncMatchState();
    const handlePubChange = () => {
      const pub = isPlayoffTreePublished();
      setIsTreePublished(pub);
      if (!pub) {
        setDisplayMode((prev) => (prev === 'bracket' ? 'match' : prev));
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('cst_matches_updated', handleStorage);
    window.addEventListener('cst_16_matches_updated', handleStorage);
    window.addEventListener('cst_playoff_published_changed', handlePubChange);

    const interval = setInterval(syncMatchState, 2000);

    return () => {
      channel?.removeEventListener('message', handleBroadcast);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('cst_matches_updated', handleStorage);
      window.removeEventListener('cst_16_matches_updated', handleStorage);
      window.removeEventListener('cst_playoff_published_changed', handlePubChange);
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

  const teamASide = activeMatch?.teamASide || 'CT';
  const teamBSide = activeMatch?.teamBSide || 'T';
  const isC4Active = !!activeMatch?.c4Planted;
  const currentRound = activeMatch ? (activeMatch.currentRound ?? (activeMatch.scoreA + activeMatch.scoreB)) : 0;
  const roundHistory = activeMatch?.roundHistory || [];

  return (
    <div className={`min-h-screen bg-military-black text-tacticalWhite relative overflow-hidden select-none flex flex-col justify-between ${
      isC4Active ? 'ring-8 ring-rose-600/70' : ''
    }`}>
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={`absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 transition-all duration-700 ${
            teamASide === 'CT' ? 'bg-olive' : 'bg-sand'
          }`}
        />
        <div
          className={`absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full blur-[140px] opacity-25 transition-all duration-700 ${
            teamBSide === 'CT' ? 'bg-olive' : 'bg-sand'
          }`}
        />
        <div className="absolute inset-0 tactical-grid-bg opacity-20" />
      </div>

      {!cleanMode && (
        <header className="relative z-30 px-6 py-4 flex items-center justify-between border-b border-gunmetal bg-military-black/95 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Link
              href="/scoreboard"
              className="text-xs font-mono text-mutedKhaki hover:text-tacticalWhite flex items-center gap-1 bg-surface px-3 py-1.5 border border-gunmetal hover:border-sand transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>EXIT TO SCOREBOARD</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="font-display font-black text-sm tracking-wider text-tacticalWhite uppercase">
                AUDITORIUM STAGE PROJECTOR <span className="text-sand">{"// LIVE BROADCAST"}</span>
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3 text-xs font-mono text-mutedKhaki">
            <Shield className="w-4 h-4 text-olive" />
            <span>CST LAN CHALLENGE 2026 • UVA WELLASSA UNIVERSITY OF SRI LANKA</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-surface p-0.5 border border-gunmetal mr-2">
              <button
                onClick={() => setDisplayMode('match')}
                className={`px-2.5 py-1 font-mono text-[11px] uppercase font-bold transition-all ${
                  displayMode === 'match'
                    ? 'bg-olive text-tacticalWhite'
                    : 'text-mutedKhaki hover:text-tacticalWhite'
                }`}
              >
                🔴 ARENA HUD
              </button>
              {isTreePublished && (
                <button
                  onClick={() => setDisplayMode('bracket')}
                  className={`px-2.5 py-1 font-mono text-[11px] uppercase font-bold transition-all flex items-center gap-1 ${
                    displayMode === 'bracket'
                      ? 'bg-sand text-military-black font-black'
                      : 'text-mutedKhaki hover:text-tacticalWhite'
                  }`}
                >
                  <Trophy className="w-3 h-3" />
                  <span>BRACKET HUD</span>
                </button>
              )}
            </div>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 border text-xs font-mono transition-colors ${
                soundEnabled
                  ? 'bg-olive/20 border-olive text-sand'
                  : 'bg-surface border-gunmetal text-mutedKhaki hover:text-tacticalWhite'
              }`}
              title={soundEnabled ? 'Mute Alert Beeper' : 'Enable Alert Audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setCleanMode(!cleanMode)}
              className="px-3 py-1.5 bg-surface border border-gunmetal text-xs font-mono text-tacticalWhite hover:border-sand transition-colors"
              title="Hide top and bottom bars for pure auditorium stage projection"
            >
              SPECTATOR CLEAN HUD
            </button>

            <button
              onClick={toggleFullscreen}
              className="px-3 py-1.5 bg-olive text-tacticalWhite font-bold border border-gunmetal text-xs font-mono flex items-center gap-1.5 hover:bg-olive/90 transition-all"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isFullscreen ? 'EXIT FULLSCREEN' : 'FULLSCREEN (F11)'}</span>
            </button>
          </div>
        </header>
      )}

      {isC4Active && (
        <div className="relative z-40 bg-gradient-to-r from-rose-950 via-rose-700 to-rose-950 text-white py-2.5 px-6 border-y-2 border-rose-500 shadow-2xl animate-pulse flex items-center justify-center gap-3 font-mono font-black text-sm sm:text-base tracking-widest uppercase">
          <Bomb className="w-5 h-5 animate-bounce" />
          <span>⚠️ EMERGENCY ALERT: DEMOLITION ORDNANCE ARMED — DEFUSE TIMELOCK ACTIVE ⚠️</span>
          <Bomb className="w-5 h-5 animate-bounce" />
        </div>
      )}

      <main className="relative z-20 flex-1 flex flex-col justify-center max-w-7xl w-full mx-auto px-4 sm:px-8 py-6">
        
        {displayMode === 'bracket' && isTreePublished ? (
          <div className="py-4">
            <PlayoffBracketTree
              matches={matches}
              teams={teams}
              onRefresh={syncMatchState}
            />
          </div>
        ) : !activeMatch ? (
          <div className="max-w-2xl mx-auto text-center px-4 py-20 relative z-20">
            <div className="w-20 h-20 mx-auto mb-6 bg-surface border-2 border-gunmetal flex items-center justify-center clip-tactical">
              <Radio className="w-10 h-10 text-sand animate-pulse" />
            </div>
            <div className="inline-flex items-center gap-2 bg-surface/90 border border-gunmetal px-4 py-1.5 mb-4">
              <span className="w-2 h-2 rounded-full bg-sand animate-ping" />
              <span className="text-xs font-mono uppercase tracking-widest text-sand font-bold">
                AUDITORIUM STAGE PROJECTOR // STANDBY
              </span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase text-tacticalWhite tracking-wider mb-4">
              AWAITING NEXT FIXTURE
            </h2>
            <p className="text-xs sm:text-sm font-mono text-mutedKhaki mb-8 leading-relaxed">
              Auditorium live projector feed is online. When a tournament match begins or is launched by the referee desk, live round telemetry, ordnance timers, and round streaks will broadcast here automatically in real time.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              {isTreePublished && (
                <button
                  onClick={() => setDisplayMode('bracket')}
                  className="px-5 py-2.5 bg-olive text-tacticalWhite font-mono text-xs font-bold uppercase tracking-wider hover:bg-olive/90 transition-all flex items-center gap-2 border border-gunmetal"
                >
                  <Trophy className="w-4 h-4 text-sand" />
                  <span>VIEW PLAYOFF BRACKET</span>
                </button>
              )}
              <Link
                href="/scoreboard"
                className="px-5 py-2.5 bg-surface border border-gunmetal text-tacticalWhite font-mono text-xs font-bold uppercase tracking-wider hover:border-sand transition-all"
              >
                BACK TO SCOREBOARD
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center mb-6 text-center">
              <div className="inline-flex items-center gap-2.5 bg-surface/90 border border-gunmetal px-4 py-1.5 mb-2 shadow-lg">
                <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span className="font-mono text-xs uppercase font-bold text-tacticalWhite tracking-widest">
                  {activeMatch.stage}
                </span>
                <span className="text-mutedKhaki font-mono text-xs">{"//"}</span>
                <div className="relative w-6 h-4 overflow-hidden border border-gunmetal shrink-0 clip-tactical">
                  <Image src={getMapImage(activeMatch.map)} alt={activeMatch.map} fill className="object-cover" sizes="24px" />
                </div>
                <span className="font-mono text-xs uppercase font-bold text-sand tracking-widest">
                  THEATER: {activeMatch.map}
                </span>
              </div>

              <div className="text-xs font-mono text-mutedKhaki tracking-wider uppercase">
                REGULATION MR12 FORMAT • FIRST SQUAD TO 13 ROUNDS WINS
              </div>
            </div>

        <div className="grid grid-cols-12 items-center gap-4 sm:gap-6">
          
          <div className="col-span-12 lg:col-span-5 p-6 sm:p-8 bg-card/90 border-2 border-gunmetal backdrop-blur-xl transition-all duration-300 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 font-mono font-black text-xs uppercase tracking-widest border clip-tactical ${
                teamASide === 'CT'
                  ? 'bg-olive/20 text-sand border-olive/40'
                  : 'bg-card text-khaki border-gunmetal'
              }`}>
                {teamASide === 'CT' ? '🛡️ TASK FORCE 141 (SAS)' : '⚔️ OPFOR (INSURGENCY)'}
              </span>
              <span className="text-[11px] font-mono text-mutedKhaki">SQUAD ALPHA</span>
            </div>

            <div className="flex items-center gap-5 mb-4">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-surface border-2 border-gunmetal shrink-0 overflow-hidden clip-tactical">
                <Image src={activeMatch.teamALogo} alt={activeMatch.teamAName} fill className="object-cover" sizes="96px" priority />
              </div>
              <div className="min-w-0">
                <div className={`font-mono text-sm font-bold tracking-wider ${teamASide === 'CT' ? 'text-sand' : 'text-khaki'}`}>
                  [{activeMatch.teamATag}]
                </div>
                <h2 className="font-display font-black text-2xl sm:text-4xl text-tacticalWhite uppercase tracking-tight truncate">
                  {activeMatch.teamAName}
                </h2>
                <div className="text-xs font-mono text-mutedKhaki truncate">
                  Uva Wellassa University of Sri Lanka
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gunmetal/70 flex items-center justify-between text-xs font-mono text-mutedKhaki">
              <span>MOMENTUM: {activeMatch.scoreA > activeMatch.scoreB ? 'ROUND LEAD' : 'CHASING'}</span>
              <span className="text-tacticalWhite font-bold">STATUS: {activeMatch.status.toUpperCase()}</span>
            </div>
          </div>

          <div className="col-span-12 lg:col-span-2 flex flex-col items-center justify-center text-center p-4">
            
            <div className="text-[11px] font-mono uppercase tracking-widest text-mutedKhaki mb-1">
              CURRENT ENGAGEMENT
            </div>
            <div className="font-display font-black text-3xl sm:text-4xl text-tacticalWhite mb-2">
              ROUND {currentRound}
            </div>

            <div className={`flex items-center justify-center gap-3 sm:gap-4 font-display font-black text-6xl sm:text-8xl tracking-tight transition-transform duration-300 ${
              lastUpdateEffect ? 'scale-110' : 'scale-100'
            }`}>
              <span className="text-sand">
                {activeMatch.scoreA}
              </span>
              <span className="text-mutedKhaki/60">:</span>
              <span className="text-khaki">
                {activeMatch.scoreB}
              </span>
            </div>

            <div className="mt-3">
              <span className="px-3 py-1 bg-surface border border-gunmetal text-[11px] font-mono text-mutedKhaki uppercase tracking-wider">
                {currentRound <= 12 ? 'FIRST HALF (ROUND 1-12)' : currentRound <= 24 ? 'SECOND HALF (ROUND 13-24)' : 'OVERTIME EXTENSION'}
              </span>
            </div>
          </div>

          {/* TEAM B CARD (RIGHT) */}
          <div className="col-span-12 lg:col-span-5 p-6 sm:p-8 bg-card/90 border-2 border-gunmetal backdrop-blur-xl transition-all duration-300 relative overflow-hidden">
            {/* Top Side Badge */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono text-mutedKhaki">SQUAD BRAVO</span>
              <span className={`px-3 py-1 font-mono font-black text-xs uppercase tracking-widest border clip-tactical ${
                teamBSide === 'CT'
                  ? 'bg-olive/20 text-sand border-olive/40'
                  : 'bg-card text-khaki border-gunmetal'
              }`}>
                {teamBSide === 'CT' ? '🛡️ TASK FORCE 141 (SAS)' : '⚔️ OPFOR (INSURGENCY)'}
              </span>
            </div>

            {/* Team Identity */}
            <div className="flex items-center justify-end gap-5 mb-4 text-right">
              <div className="min-w-0">
                <div className={`font-mono text-sm font-bold tracking-wider ${teamBSide === 'CT' ? 'text-sand' : 'text-khaki'}`}>
                  [{activeMatch.teamBTag}]
                </div>
                <h2 className="font-display font-black text-2xl sm:text-4xl text-tacticalWhite uppercase tracking-tight truncate">
                  {activeMatch.teamBName}
                </h2>
                <div className="text-xs font-mono text-mutedKhaki truncate">
                  University of Moratuwa
                </div>
              </div>
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-surface border-2 border-gunmetal shrink-0 overflow-hidden clip-tactical">
                <Image src={activeMatch.teamBLogo} alt={activeMatch.teamBName} fill className="object-cover" sizes="96px" priority />
              </div>
            </div>

            {/* Round Streak Callout */}
            <div className="pt-3 border-t border-gunmetal/70 flex items-center justify-between text-xs font-mono text-mutedKhaki">
              <span className="text-tacticalWhite font-bold">STATUS: {activeMatch.status.toUpperCase()}</span>
              <span>MOMENTUM: {activeMatch.scoreB > activeMatch.scoreA ? 'ROUND LEAD' : 'CHASING'}</span>
            </div>
          </div>

        </div>

        <div className="mt-8 p-4 bg-card/70 border border-gunmetal backdrop-blur-md">
          <div className="flex items-center justify-between mb-3 text-xs font-mono">
            <span className="text-mutedKhaki uppercase tracking-wider flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-sand" />
              CHRONOLOGICAL ROUND TIMELINE (FIRST TO 13)
            </span>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-sand inline-block" />
                <span className="text-tacticalWhite font-bold">{activeMatch.teamATag} Won</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-khaki inline-block" />
                <span className="text-tacticalWhite font-bold">{activeMatch.teamBTag} Won</span>
              </span>
            </div>
          </div>

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
                        ? 'bg-olive/40 text-sand border-olive'
                        : roundWinner === 'teamB'
                        ? 'bg-card text-khaki border-gunmetal'
                        : isCurrent
                        ? 'bg-surface border-tacticalWhite text-tacticalWhite animate-pulse'
                        : 'bg-surface/30 border-gunmetal/50 text-mutedKhaki/40'
                    }`}
                  >
                    {roundWinner ? (roundWinner === 'teamA' ? activeMatch.teamATag.slice(0, 2) : activeMatch.teamBTag.slice(0, 2)) : index + 1}
                  </div>
                  {isHalfTimeBreak && (
                    <span className="text-[8px] font-mono text-sand mt-1 hidden sm:block">HALF</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {activeMatch.mvp && (
          <div className="mt-4 p-3 bg-olive/10 border border-olive/30 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-sand">
              <Award className="w-4 h-4 shrink-0 text-olive" />
              <span className="font-bold uppercase tracking-wider">OFFICIAL MATCH MVP SPOTLIGHT:</span>
              <span className="text-tacticalWhite font-bold">{activeMatch.mvp}</span>
            </div>
            <span className="text-mutedKhaki text-[11px] hidden sm:inline">
              RATED BY CST TOURNAMENT COMMITTEE
            </span>
          </div>
        )}
          </>
        )}

      </main>

      {!cleanMode && (
        <footer className="relative z-30 px-6 py-3 border-t border-gunmetal bg-military-black/95 backdrop-blur-md flex items-center justify-between text-[11px] font-mono text-mutedKhaki">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>REAL-TIME STAGE SYNC: ACTIVE (BROADCASTCHANNEL READY)</span>
          </div>

          <div className="hidden sm:block">
            PRESS <strong className="text-tacticalWhite">F11</strong> FOR FULL AUDITORIUM PROJECTION
          </div>

          <div>
            CST LAN CHALLENGE 2026 // COD4 MW COMPETITIVE ARENA
          </div>
        </footer>
      )}

      {cleanMode && (
        <button
          onClick={() => setCleanMode(false)}
          className="fixed bottom-4 right-4 z-50 px-3 py-1.5 bg-card/80 border border-gunmetal text-xs font-mono text-mutedKhaki hover:text-tacticalWhite hover:border-sand backdrop-blur-sm"
        >
          RESTORE HUD
        </button>
      )}

    </div>
  );
}

function StageProjectorLoading() {
  return (
    <div className="min-h-screen bg-military-black text-tacticalWhite flex items-center justify-center font-mono">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-2 border-olive border-t-transparent animate-spin mx-auto clip-tactical" />
        <p className="text-mutedKhaki text-sm tracking-widest uppercase">INITIALIZING STAGE PROJECTOR HUD...</p>
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
