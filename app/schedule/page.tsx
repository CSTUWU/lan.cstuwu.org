'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getStoredMatches, isPlayoffTreePublished, setPlayoffTreePublished, getLiveBroadcastChannel, syncDatabaseMatchesToStorage, areMatchesEquivalent } from '@/lib/storage';
import { INITIAL_MATCHES, getMapImage } from '@/lib/mockData';
import { api } from '@/lib/api';
import { transformBackendMatch } from '@/lib/transformers';
import { Match, MatchStatus } from '@/lib/types';
import { Calendar, Clock, MapPin, Tv, Shield, ChevronRight, CheckCircle2, Trophy, Radio, Bomb } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

export default function SchedulePage() {
  const { isOpen } = useRegistrationStatus();
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [isTreePublished, setIsTreePublished] = useState<boolean>(() => isPlayoffTreePublished());

  const fetchMatches = () => {
    api.public.getSettings().then((res) => {
      if (res?.data?.playoffTreePublished !== undefined) {
        setIsTreePublished(Boolean(res.data.playoffTreePublished));
        setPlayoffTreePublished(Boolean(res.data.playoffTreePublished));
      }
    }).catch(() => {});

    api.public.getMatches().then((res) => {
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const transformed = res.data.map(transformBackendMatch);
        setMatches((prev) => (areMatchesEquivalent(prev, transformed) ? prev : transformed));
        syncDatabaseMatchesToStorage(transformed);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    setMatches(getStoredMatches());
    setIsTreePublished(isPlayoffTreePublished());

    fetchMatches();

    const handleUpdate = () => {
      const stored = getStoredMatches();
      setMatches((prev) => (areMatchesEquivalent(prev, stored) ? prev : stored));
    };
    const handlePub = () => setIsTreePublished(isPlayoffTreePublished());

    window.addEventListener('cst_matches_updated', handleUpdate);
    window.addEventListener('cst_playoff_published_changed', handlePub);

    const channel = getLiveBroadcastChannel();
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === 'CST_PLAYOFF_PUBLISHED_UPDATE') {
        setIsTreePublished(typeof event.data.published === 'boolean' ? event.data.published : isPlayoffTreePublished());
      }
    };
    channel?.addEventListener('message', handleBroadcast);

    const pollInterval = setInterval(() => {
      fetchMatches();
    }, 4000);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('cst_matches_updated', handleUpdate);
      window.removeEventListener('cst_playoff_published_changed', handlePub);
      channel?.removeEventListener('message', handleBroadcast);
    };
  }, []);

  const liveMatch = matches.find((m) => m.status === 'live');
  const hasLive = Boolean(liveMatch);

  const filteredMatches = matches.filter((m) => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const hasPlayoffMatches = matches.some((m) => m.bracketRound && m.bracketRound !== 'groups');
  const showPlayoffBanner = isTreePublished || hasPlayoffMatches;

  return (
    <div className="pt-28 pb-24 bg-military-black min-h-screen">
      <div className="absolute inset-0 tactical-grid-bg opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-mutedText mb-8">
          <Link href="/" className="hover:text-sand transition-colors">HOME</Link>
          <span>/</span>
          <span className="text-tacticalWhite">MISSION TIMETABLE</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gunmetal mb-10">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <Badge variant="orange" size="sm">TIMELINE OPERATIONS</Badge>
            </div>
            <h1 className="font-display font-black text-4xl sm:text-5xl uppercase text-tacticalWhite tracking-tight">
              MISSION <span className="text-sand">SCHEDULE</span>
            </h1>
            <p className="text-xs sm:text-sm font-mono text-mutedText mt-1">
              Competitive tactical fixtures, combat theater assignments, and auditorium stage timelines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {showPlayoffBanner && (
              <Button href="/scoreboard" variant="sand" size="sm" icon={<Trophy className="w-3.5 h-3.5 text-military-black" />}>
                PLAYOFF BRACKET
              </Button>
            )}
            <Button href="/scoreboard" variant="outline" size="sm">
              VIEW STANDINGS
            </Button>
            {isOpen && (
              <Button href="/register" variant="cyan" size="sm">
                ENLIST SQUAD
              </Button>
            )}
          </div>
        </div>

        {/* Live Match Stage Telemetry Card */}
        {liveMatch && (
          <div className="mb-10 bg-gradient-to-r from-card via-[#1A201A] to-card border-2 border-rose-500/60 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl clip-tactical">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="inline-flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                <span className="font-mono text-xs font-black uppercase text-rose-400 tracking-widest flex items-center gap-2">
                  <Radio className="w-4 h-4 animate-pulse" />
                  🔴 LIVE NOW ON AUDITORIUM STAGE SCREEN
                </span>
                <span className="text-xs font-mono text-mutedText">{"//"}</span>
                <span className="text-xs font-mono text-sand uppercase font-bold">
                  {liveMatch.stage}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-mutedText">
                <div className="relative w-8 h-5 overflow-hidden border border-gunmetal shrink-0 clip-tactical">
                  <Image src={getMapImage(liveMatch.map)} alt={liveMatch.map} fill className="object-cover" sizes="32px" />
                </div>
                <span>
                  THEATER: <strong className="text-tacticalWhite uppercase">{liveMatch.map}</strong> • FORMAT: MR12 PROMOD
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6">
              {/* Team A */}
              <div className="md:col-span-4 flex items-center gap-4">
                <div className="relative w-14 h-14 bg-surface border border-gunmetal shrink-0 overflow-hidden clip-tactical">
                  <Image src={liveMatch.teamALogo} alt={liveMatch.teamAName} fill className="object-cover" sizes="56px" />
                </div>
                <div>
                  <span className="text-xs font-mono text-sand font-bold">[{liveMatch.teamATag}]</span>
                  <h3 className="font-display font-black text-lg text-tacticalWhite uppercase truncate">
                    {liveMatch.teamAName}
                  </h3>
                  <span className="text-[10px] font-mono text-sand bg-olive/20 border border-olive px-2 py-0.5 inline-block mt-0.5">
                    {liveMatch.teamASide === 'T' ? 'OPFOR SIDE' : 'TASK FORCE SIDE'}
                  </span>
                </div>
              </div>

              {/* Live Round and Score */}
              <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-mono text-mutedText uppercase tracking-widest mb-1">
                  ROUND {liveMatch.currentRound || (liveMatch.scoreA + liveMatch.scoreB)} {"// TARGET: 13"}
                </span>
                <div className="font-display font-black text-4xl sm:text-5xl text-tacticalWhite flex items-center gap-3">
                  <span className="text-sand">{liveMatch.scoreA}</span>
                  <span className="text-mutedText/50">:</span>
                  <span className="text-khaki">{liveMatch.scoreB}</span>
                </div>
                {liveMatch.c4Planted && (
                  <div className="mt-2 text-rose-400 font-mono text-xs font-bold animate-pulse flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/40 px-2 py-0.5">
                    <Bomb className="w-3.5 h-3.5" />
                    <span>ORDNANCE PLANTED</span>
                  </div>
                )}
              </div>

              {/* Team B */}
              <div className="md:col-span-4 flex items-center justify-end gap-4 text-right">
                <div>
                  <span className="text-xs font-mono text-khaki font-bold">[{liveMatch.teamBTag}]</span>
                  <h3 className="font-display font-black text-lg text-tacticalWhite uppercase truncate">
                    {liveMatch.teamBName}
                  </h3>
                  <span className="text-[10px] font-mono text-khaki bg-card border border-gunmetal px-2 py-0.5 inline-block mt-0.5">
                    {liveMatch.teamBSide === 'CT' ? 'TASK FORCE SIDE' : 'OPFOR SIDE'}
                  </span>
                </div>
                <div className="relative w-14 h-14 bg-surface border border-gunmetal shrink-0 overflow-hidden clip-tactical">
                  <Image src={liveMatch.teamBLogo} alt={liveMatch.teamBName} fill className="object-cover" sizes="56px" />
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gunmetal flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs font-mono text-mutedText">
                Live combat telemetry broadcast directly from the referee operations command.
              </span>
              <div className="flex items-center gap-3">
                <Link
                  href="/scoreboard"
                  className="px-3.5 py-1.5 bg-olive hover:bg-olive/90 text-tacticalWhite font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 clip-tactical border border-gunmetal"
                >
                  <Trophy className="w-3.5 h-3.5 text-sand" />
                  <span>VIEW SCOREBOARD</span>
                </Link>
                <Link
                  href={`/scoreboard/live?matchId=${liveMatch.id}`}
                  target="_blank"
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-tacticalWhite font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 clip-tactical"
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>OPEN AUDITORIUM HUD</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Live Playoff Bracket Banner when Published */}
        {showPlayoffBanner && (
          <div className="mb-8 p-4 bg-surface/90 border border-sand/40 flex flex-col sm:flex-row items-center justify-between gap-4 clip-tactical shadow-lg">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-sand animate-ping shrink-0" />
              <div>
                <div className="text-xs font-mono uppercase font-black text-sand tracking-wider flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5 text-sand" />
                  <span>OFFICIAL PLAYOFF CHAMPIONSHIP TREE IS LIVE</span>
                </div>
                <div className="text-[11px] font-mono text-mutedText mt-0.5">
                  The tournament bracket is published by operations command. Follow squad routes from Round 1 to the Grand Final.
                </div>
              </div>
            </div>
            <Link
              href="/scoreboard"
              className="px-4 py-2 bg-sand hover:bg-sand/90 text-military-black font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 shrink-0 transition-all clip-tactical"
            >
              <span>VIEW INTERACTIVE BRACKET</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-card/70 border border-gunmetal p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {(hasLive ? (['all', 'live', 'upcoming', 'completed'] as const) : (['all', 'upcoming', 'completed'] as const)).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 text-xs font-mono uppercase font-bold tracking-wider border transition-colors flex items-center gap-1.5 ${
                  filter === tab
                    ? 'bg-olive text-tacticalWhite border-olive-light/50 shadow-sm'
                    : 'bg-surface text-mutedText border-gunmetal hover:text-tacticalWhite'
                }`}
              >
                {tab === 'live' && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                <span>{tab} ({tab === 'all' ? matches.length : matches.filter(m => m.status === tab).length})</span>
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-mutedText">
            TIMEZONE: <span className="text-sand font-bold">UTC+5:30 (SRI LANKA)</span>
          </div>
        </div>

        {/* Matches List */}
        <div className="space-y-4">
          {filteredMatches.length === 0 ? (
            <div className="text-center py-20 bg-surface/30 border border-dashed border-gunmetal p-8">
              <Calendar className="w-12 h-12 text-mutedText/40 mx-auto mb-3" />
              <h3 className="font-display font-black text-lg text-tacticalWhite uppercase mb-1">
                {filter !== 'all' ? 'No Missions Found' : 'Tournament Schedule Pending'}
              </h3>
              <p className="text-xs font-mono text-mutedText max-w-md mx-auto">
                {filter !== 'all'
                  ? 'No match fixtures match the selected filter.'
                  : 'Official match fixtures and auditorium stage timetable will be published following roster verification.'}
              </p>
            </div>
          ) : (
            filteredMatches.map((m) => {
              const matchDate = new Date(m.dateTime);
              const isCompleted = m.status === 'completed';

              return (
                <div
                  key={m.id}
                  className="bg-card/90 border border-gunmetal p-5 sm:p-6 backdrop-blur-md transition-all duration-300 hover:border-sand"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    
                    {/* Left Info */}
                    <div className="min-w-[180px]">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-sand px-2 py-0.5 bg-surface border border-gunmetal inline-block mb-1.5 font-bold">
                        {m.stage}
                      </span>
                      <div className="text-xs font-mono text-tacticalWhite font-medium flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-sand" />
                        {matchDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                      <div className="text-[11px] font-mono text-mutedText flex items-center gap-2 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-mutedText" />
                        {matchDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>

                    {/* Middle Matchup & Score */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-7 items-center gap-4 py-2 border-y lg:border-y-0 lg:border-x border-gunmetal lg:px-6">
                      
                      {/* Team A */}
                      <div className="sm:col-span-3 flex items-center gap-3 sm:justify-end">
                        <div className="text-left sm:text-right min-w-0">
                          <span className="text-xs font-mono text-sand block">[{m.teamATag}]</span>
                          <span className="font-display font-black text-base sm:text-lg text-tacticalWhite uppercase tracking-wider truncate block">
                            {m.teamAName}
                          </span>
                        </div>
                        <div className="relative w-12 h-12 bg-surface border border-gunmetal shrink-0 overflow-hidden">
                          <Image src={m.teamALogo} alt={m.teamAName} fill className="object-cover" sizes="48px" />
                        </div>
                      </div>

                      {/* Score / VS Center */}
                      <div className="sm:col-span-1 text-center font-display">
                        {isCompleted ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface border border-gunmetal">
                            <span className={`text-xl font-black ${m.scoreA > m.scoreB ? 'text-sand' : 'text-mutedText'}`}>
                              {m.scoreA}
                            </span>
                            <span className="text-mutedText text-sm">:</span>
                            <span className={`text-xl font-black ${m.scoreB > m.scoreA ? 'text-olive-light' : 'text-mutedText'}`}>
                              {m.scoreB}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-mono font-bold text-mutedText px-3 py-1 bg-surface border border-gunmetal">
                            VS
                          </span>
                        )}
                      </div>

                      {/* Team B */}
                      <div className="sm:col-span-3 flex items-center gap-3 justify-start">
                        <div className="relative w-12 h-12 bg-surface border border-gunmetal shrink-0 overflow-hidden">
                          <Image src={m.teamBLogo} alt={m.teamBName} fill className="object-cover" sizes="48px" />
                        </div>
                        <div className="text-left min-w-0">
                          <span className="text-xs font-mono text-olive-light block">[{m.teamBTag}]</span>
                          <span className="font-display font-black text-base sm:text-lg text-tacticalWhite uppercase tracking-wider truncate block">
                            {m.teamBName}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Right Map & Actions */}
                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 min-w-[160px]">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-12 h-8 overflow-hidden border border-gunmetal shrink-0 clip-tactical group">
                          <Image
                            src={getMapImage(m.map)}
                            alt={m.map}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-mutedText block">THEATER</span>
                          <span className="text-xs font-mono font-bold text-tacticalWhite uppercase">
                            {m.map}
                          </span>
                        </div>
                      </div>

                      {isCompleted ? (
                        <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> FINAL SCORE
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-sand bg-olive/20 border border-olive/40 px-2.5 py-1 uppercase font-semibold">
                          SCHEDULED
                        </span>
                      )}
                    </div>

                  </div>

                  {/* MVP Banner if completed */}
                  {isCompleted && m.mvp && (
                    <div className="mt-4 pt-3 border-t border-gunmetal text-[11px] font-mono text-mutedText flex items-center justify-between">
                      <span className="text-sand font-semibold">MISSION MVP:</span>
                      <span className="text-tacticalWhite font-bold">{m.mvp}</span>
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

