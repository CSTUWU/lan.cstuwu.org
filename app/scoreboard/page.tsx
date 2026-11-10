'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getStoredTeams, setStoredTeams, getStoredMatches, getActiveLiveMatch, isPlayoffTreePublished, setPlayoffTreePublished, getLiveBroadcastChannel, syncDatabaseMatchesToStorage, areMatchesEquivalent } from '@/lib/storage';
import { INITIAL_TEAMS, INITIAL_MATCHES, getMapImage } from '@/lib/mockData';
import { api } from '@/lib/api';
import { transformBackendTeam, transformBackendMatch } from '@/lib/transformers';
import { Team, Match } from '@/lib/types';
import {
  Trophy,
  Shield,
  Calendar,
  Clock,
  Crosshair,
  CheckCircle2,
  ChevronRight,
  Award,
  Zap,
  Radio,
  ExternalLink,
  Flame,
  Bomb,
  TrendingUp,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import PlayoffBracketTree from '@/components/scoreboard/PlayoffBracketTree';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

export default function ScoreboardPage() {
  const { isOpen } = useRegistrationStatus();
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [matches, setMatches] = useState<Match[]>(INITIAL_MATCHES);
  const [isTreePublished, setIsTreePublished] = useState<boolean>(() => isPlayoffTreePublished());
  const [activeTab, setActiveTab] = useState<'playoffs' | 'standings' | 'completed' | 'upcoming'>(() =>
    isPlayoffTreePublished() ? 'playoffs' : 'standings'
  );

  const reloadData = (isInitial: boolean = false) => {
    if (isInitial) {
      setTeams(getStoredTeams());
      setMatches(getStoredMatches());
      setIsTreePublished(isPlayoffTreePublished());
    }

    // Fetch all registered collegiate squads from API
    api.public.getTeams().then((res) => {
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const fetchedTeams = res.data.map(transformBackendTeam);
        setTeams(fetchedTeams);
        setStoredTeams(fetchedTeams);
      }
    }).catch(() => {});

    // Sync public settings including playoffTreePublished
    api.public.getSettings().then((res) => {
      if (res?.data?.playoffTreePublished !== undefined) {
        const isPub = Boolean(res.data.playoffTreePublished);
        setIsTreePublished(isPub);
        setPlayoffTreePublished(isPub);
        if (isPub) {
          setActiveTab((prev) => (prev === 'standings' ? 'playoffs' : prev));
        } else {
          setActiveTab((prev) => (prev === 'playoffs' ? 'standings' : prev));
        }
      }
    }).catch(() => {});

    // Fetch live scoreboard & standings from API
    api.public.getScoreboard().then((res) => {
      if (res?.success && res.data) {
        if (res.data.playoffTreePublished !== undefined) {
          const isPub = Boolean(res.data.playoffTreePublished);
          setIsTreePublished(isPub);
          setPlayoffTreePublished(isPub);
          if (isPub) {
            setActiveTab((prev) => (prev === 'standings' ? 'playoffs' : prev));
          } else {
            setActiveTab((prev) => (prev === 'playoffs' ? 'standings' : prev));
          }
        }
        if (Array.isArray(res.data.standings) && res.data.standings.length > 0) {
          setTeams(res.data.standings.map(transformBackendTeam));
        }
        const apiMatches: Match[] = [];
        if (Array.isArray(res.data.liveMatches)) {
          apiMatches.push(...res.data.liveMatches.map(transformBackendMatch));
        }
        if (Array.isArray(res.data.upcomingMatches)) {
          apiMatches.push(...res.data.upcomingMatches.map(transformBackendMatch));
        }
        if (Array.isArray(res.data.completedMatches)) {
          apiMatches.push(...res.data.completedMatches.map(transformBackendMatch));
        }
        if (Array.isArray(res.data.playoffMatches)) {
          const playoffBackend = res.data.playoffMatches.map(transformBackendMatch);
          for (const pm of playoffBackend) {
            if (!apiMatches.some((m) => m.id === pm.id)) {
              apiMatches.push(pm);
            }
          }
        }
        if (apiMatches.length > 0) {
          setMatches((prev) => (areMatchesEquivalent(prev, apiMatches) ? prev : apiMatches));
          syncDatabaseMatchesToStorage(apiMatches);
        }
      }
    }).catch(() => {});
  };

  useEffect(() => {
    reloadData(true);

    const handleTeamsUpdate = () => setTeams(getStoredTeams());
    const handleMatchesUpdate = () => {
      const stored = getStoredMatches();
      setMatches((prev) => (areMatchesEquivalent(prev, stored) ? prev : stored));
    };
    const handlePubChange = (e?: Event) => {
      const customEvent = e as CustomEvent<{ published: boolean }>;
      const pub = typeof customEvent?.detail?.published === 'boolean'
        ? customEvent.detail.published
        : isPlayoffTreePublished();
      setIsTreePublished(pub);
      if (pub) {
        setActiveTab('playoffs');
      } else {
        setActiveTab((prev) => (prev === 'playoffs' ? 'standings' : prev));
      }
    };

    const channel = getLiveBroadcastChannel();
    const handleBroadcast = (event: MessageEvent) => {
      if (event.data?.type === 'CST_PLAYOFF_PUBLISHED_UPDATE') {
        const pub = typeof event.data.published === 'boolean' ? event.data.published : isPlayoffTreePublished();
        setIsTreePublished(pub);
        if (pub) {
          setActiveTab('playoffs');
        } else {
          setActiveTab((prev) => (prev === 'playoffs' ? 'standings' : prev));
        }
      }
    };
    channel?.addEventListener('message', handleBroadcast);

    window.addEventListener('cst_teams_updated', handleTeamsUpdate);
    window.addEventListener('cst_matches_updated', handleMatchesUpdate);
    window.addEventListener('cst_16_matches_updated', handleMatchesUpdate);
    window.addEventListener('cst_playoff_published_changed', handlePubChange);
    const handleStorageChange = () => reloadData(false);
    window.addEventListener('storage', handleStorageChange);

    const pollInterval = setInterval(() => {
      reloadData(false);
    }, 4000);

    return () => {
      clearInterval(pollInterval);
      channel?.removeEventListener('message', handleBroadcast);
      window.removeEventListener('cst_teams_updated', handleTeamsUpdate);
      window.removeEventListener('cst_matches_updated', handleMatchesUpdate);
      window.removeEventListener('cst_16_matches_updated', handleMatchesUpdate);
      window.removeEventListener('cst_playoff_published_changed', handlePubChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const sortedStandings = [...teams]
    .filter((t) => t.status === 'approved')
    .sort((a, b) => {
      if ((b.points || 0) !== (a.points || 0)) {
        return (b.points || 0) - (a.points || 0);
      }
      if ((b.roundDiff || 0) !== (a.roundDiff || 0)) {
        return (b.roundDiff || 0) - (a.roundDiff || 0);
      }
      return (b.wins || 0) - (a.wins || 0);
    });

  const hasPlayoffMatches = matches.some(
    (m) => m.bracketRound && m.bracketRound !== 'groups'
  );
  const showPlayoffTab = isTreePublished || hasPlayoffMatches;

  const liveMatch = matches.find((m) => m.status === 'live');
  const upcomingMatches = matches.filter((m) => m.status === 'upcoming');
  const completedMatches = matches.filter((m) => m.status === 'completed');

  return (
    <div className="pt-28 pb-24 bg-military-black min-h-screen">
      <div className="absolute inset-0 tactical-grid-bg opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex items-center gap-2 text-xs font-mono text-mutedKhaki mb-8">
          <Link href="/" className="hover:text-sand transition-colors">HOME</Link>
          <span>/</span>
          <span className="text-tacticalWhite">TOURNAMENT SCOREBOARD</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gunmetal mb-8">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <Badge variant="olive" size="sm">LIVE METRICS // ADVANCED LEADERBOARD</Badge>
              <span className="text-xs font-mono text-mutedKhaki">{"// COD4 MW COMPETITIVE STANDINGS"}</span>
            </div>
            <h1 className="font-display font-black text-4xl sm:text-5xl uppercase text-tacticalWhite tracking-tight">
              TOURNAMENT <span className="text-sand">SCOREBOARD</span>
            </h1>
            <p className="text-xs sm:text-sm font-mono text-mutedKhaki mt-1">
              Collegiate ranking matrix, round differentials, and real-time live auditorium stage telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/scoreboard/live"
              target="_blank"
              className="px-4 py-2.5 bg-olive hover:bg-olive/90 text-tacticalWhite font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 border border-gunmetal transition-all"
            >
              <Radio className="w-4 h-4 animate-pulse text-sand" />
              <span>STAGE AUDITORIUM PROJECTOR HUD</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {isOpen && (
              <Button href="/register" variant="outline" size="sm">
                REGISTER SQUAD
              </Button>
            )}
          </div>
        </div>

        {liveMatch && (
          <div className="mb-10 bg-gradient-to-r from-card via-[#1A201A] to-card border-2 border-gunmetal p-6 sm:p-8 backdrop-blur-md relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-olive/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div className="inline-flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span className="font-mono text-xs font-black uppercase text-rose-400 tracking-widest">
                  🔴 CURRENTLY LIVE ON AUDITORIUM STAGE SCREEN
                </span>
                <span className="text-xs font-mono text-mutedKhaki">{"//"}</span>
                <span className="text-xs font-mono text-sand uppercase font-bold">
                  {liveMatch.stage}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-mutedKhaki">
                <div className="relative w-8 h-5 overflow-hidden border border-gunmetal shrink-0 clip-tactical">
                  <Image src={getMapImage(liveMatch.map)} alt={liveMatch.map} fill className="object-cover" sizes="32px" />
                </div>
                <span>
                  THEATER: <strong className="text-tacticalWhite uppercase">{liveMatch.map}</strong> • FORMAT: MR12 SEARCH &amp; DESTROY
                </span>
              </div>
            </div>

            {/* Live Teams & Scoreboard */}
            <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-6">
              
              {/* Team A */}
              <div className="md:col-span-4 flex items-center gap-4">
                <div className="relative w-16 h-16 bg-surface border border-gunmetal shrink-0 overflow-hidden clip-tactical">
                  <Image src={liveMatch.teamALogo} alt={liveMatch.teamAName} fill className="object-cover" sizes="64px" />
                </div>
                <div>
                  <span className="text-xs font-mono text-sand font-bold">[{liveMatch.teamATag}]</span>
                  <h3 className="font-display font-black text-xl text-tacticalWhite uppercase truncate">
                    {liveMatch.teamAName}
                  </h3>
                  <span className="text-[11px] font-mono text-sand bg-olive/15 border border-gunmetal px-2 py-0.5 inline-block mt-1">
                    {liveMatch.teamASide === 'T' ? 'OPFOR SIDE' : 'TASK FORCE SIDE'}
                  </span>
                </div>
              </div>

              {/* Center Live Score */}
              <div className="md:col-span-4 flex flex-col items-center justify-center text-center py-2">
                <span className="text-[10px] font-mono text-mutedKhaki uppercase tracking-widest mb-1">
                  ROUND {liveMatch.currentRound || (liveMatch.scoreA + liveMatch.scoreB)} {"// TARGET: 13"}
                </span>
                <div className="font-display font-black text-5xl sm:text-6xl text-tacticalWhite flex items-center gap-3">
                  <span className="text-sand">{liveMatch.scoreA}</span>
                  <span className="text-mutedKhaki/50">:</span>
                  <span className="text-khaki">{liveMatch.scoreB}</span>
                </div>
                {liveMatch.c4Planted && (
                  <div className="mt-2 text-rose-400 font-mono text-xs font-bold animate-pulse flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/40 px-2 py-0.5">
                    <Bomb className="w-3.5 h-3.5" />
                    <span>ORDNANCE PLANTED (DEFUSE ACTIVE)</span>
                  </div>
                )}
              </div>

              {/* Team B */}
              <div className="md:col-span-4 flex items-center justify-end gap-4 text-right">
                <div>
                  <span className="text-xs font-mono text-khaki font-bold">[{liveMatch.teamBTag}]</span>
                  <h3 className="font-display font-black text-xl text-tacticalWhite uppercase truncate">
                    {liveMatch.teamBName}
                  </h3>
                  <span className="text-[11px] font-mono text-khaki bg-card border border-gunmetal px-2 py-0.5 inline-block mt-1">
                    {liveMatch.teamBSide === 'CT' ? 'TASK FORCE SIDE' : 'OPFOR SIDE'}
                  </span>
                </div>
                <div className="relative w-16 h-16 bg-surface border border-gunmetal shrink-0 overflow-hidden clip-tactical">
                  <Image src={liveMatch.teamBLogo} alt={liveMatch.teamBName} fill className="object-cover" sizes="64px" />
                </div>
              </div>

            </div>

            {/* Bottom Projector Launch Link */}
            <div className="mt-6 pt-4 border-t border-gunmetal flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs font-mono text-mutedKhaki">
                Tactical combat telemetry broadcast directly from the referee operations command.
              </span>
              <Link
                href={`/scoreboard/live?matchId=${liveMatch.id}`}
                target="_blank"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-sand hover:text-tacticalWhite transition-colors uppercase"
              >
                <span>OPEN FULL AUDITORIUM STAGE PROJECTOR</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-3 mb-8 border-b border-gunmetal pb-4">
          {showPlayoffTab && (
            <button
              onClick={() => setActiveTab('playoffs')}
              className={`px-4 py-2.5 font-mono text-xs uppercase font-bold tracking-wider transition-all border flex items-center gap-2 ${
                activeTab === 'playoffs'
                  ? 'bg-olive text-tacticalWhite border-olive'
                  : 'bg-card text-mutedKhaki border-gunmetal hover:text-tacticalWhite hover:border-sand/40'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-sand" />
              <span>PLAYOFF BRACKET</span>
              <span className="w-2 h-2 rounded-full bg-sand animate-ping" />
            </button>
          )}
          <button
            onClick={() => setActiveTab('standings')}
            className={`px-4 py-2.5 font-mono text-xs uppercase font-bold tracking-wider transition-all border flex items-center gap-2 ${
              activeTab === 'standings' || (!showPlayoffTab && activeTab === 'playoffs')
                ? 'bg-olive text-tacticalWhite border-olive'
                : 'bg-card text-mutedKhaki border-gunmetal hover:text-tacticalWhite hover:border-sand/40'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-sand" />
            <span>STANDINGS & ADVANCED MATRIX</span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2.5 font-mono text-xs uppercase font-bold tracking-wider transition-all border flex items-center gap-2 ${
              activeTab === 'completed'
                ? 'bg-olive text-tacticalWhite border-olive'
                : 'bg-card text-mutedKhaki border-gunmetal hover:text-tacticalWhite hover:border-sand/40'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-sand" />
            <span>COMPLETED ENGAGEMENTS ({completedMatches.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2.5 font-mono text-xs uppercase font-bold tracking-wider transition-all border flex items-center gap-2 ${
              activeTab === 'upcoming'
                ? 'bg-olive text-tacticalWhite border-olive'
                : 'bg-card text-mutedKhaki border-gunmetal hover:text-tacticalWhite hover:border-sand/40'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-sand" />
            <span>SCHEDULED FIXTURES ({upcomingMatches.length})</span>
          </button>
        </div>

        {/* TAB 0: PLAYOFF BRACKET TREE (ONLY WHEN PUBLISHED) */}
        {isTreePublished && activeTab === 'playoffs' && (
          <div className="mb-12">
            <PlayoffBracketTree
              matches={matches}
              teams={teams}
              onRefresh={reloadData}
            />
          </div>
        )}

        {activeTab === 'standings' && (
          <div className="bg-card/90 border border-gunmetal overflow-hidden backdrop-blur-md mb-12">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="bg-surface/80 border-b border-gunmetal text-mutedKhaki uppercase tracking-wider text-[11px]">
                    <th className="py-4 px-4 w-14 text-center">RANK</th>
                    <th className="py-4 px-4">COLLEGIATE SQUAD</th>
                    <th className="py-4 px-4 hidden md:table-cell">UNIVERSITY</th>
                    <th className="py-4 px-3 text-center">MP</th>
                    <th className="py-4 px-3 text-center text-sand">W</th>
                    <th className="py-4 px-3 text-center text-rose-400">L</th>
                    <th className="py-4 px-3 text-center hidden sm:table-cell">RW</th>
                    <th className="py-4 px-3 text-center hidden sm:table-cell">RL</th>
                    <th className="py-4 px-3 text-center">RD</th>
                    <th className="py-4 px-3 text-center hidden lg:table-cell">WIN%</th>
                    <th className="py-4 px-4 text-center hidden sm:table-cell">FORM</th>
                    <th className="py-4 px-4 text-center text-sand font-bold">PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gunmetal/60">
                  {sortedStandings.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-12 text-center text-mutedKhaki font-mono text-xs">
                        No team standings recorded yet. Approved squads will appear here upon tournament commencement.
                      </td>
                    </tr>
                  ) : (
                    sortedStandings.map((team, idx) => {
                      const rank = idx + 1;
                      const rd = team.roundDiff || 0;
                      const winRate = team.winRate ?? (team.matchesPlayed ? Math.round(((team.wins || 0) / team.matchesPlayed) * 100) : 0);
                      const form = team.form || [];

                      return (
                        <tr
                          key={team.id}
                          className="hover:bg-surface/40 transition-colors group"
                        >
                        {/* Rank */}
                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-7 h-7 font-display font-black text-sm clip-tactical ${
                              rank === 1
                                ? 'bg-sand text-military-black'
                                : rank === 2
                                ? 'bg-gunmetal text-tacticalWhite'
                                : rank === 3
                                ? 'bg-khaki text-military-black'
                                : 'bg-surface text-mutedKhaki border border-gunmetal'
                            }`}
                          >
                            {rank}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 bg-surface border border-gunmetal overflow-hidden shrink-0">
                              <Image src={team.logo} alt={team.name} fill className="object-cover" sizes="40px" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[10px] text-sand block font-bold">[{team.tag}]</span>
                              <span className="font-display font-bold text-sm text-tacticalWhite uppercase tracking-wider truncate block group-hover:text-sand transition-colors">
                                {team.name}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-mutedKhaki hidden md:table-cell truncate max-w-xs">
                          {team.university}
                        </td>

                        <td className="py-4 px-3 text-center text-tacticalWhite font-medium">
                          {team.matchesPlayed || 0}
                        </td>

                        <td className="py-4 px-3 text-center text-sand font-bold">
                          {team.wins || 0}
                        </td>

                        <td className="py-4 px-3 text-center text-mutedKhaki">
                          {team.losses || 0}
                        </td>

                        <td className="py-4 px-3 text-center text-mutedKhaki hidden sm:table-cell">
                          {team.roundsWon || 0}
                        </td>

                        <td className="py-4 px-3 text-center text-mutedKhaki hidden sm:table-cell">
                          {team.roundsLost || 0}
                        </td>

                        <td className="py-4 px-3 text-center font-bold">
                          <span className={rd > 0 ? 'text-emerald-400' : rd < 0 ? 'text-rose-400' : 'text-mutedKhaki'}>
                            {rd > 0 ? `+${rd}` : rd}
                          </span>
                        </td>

                        <td className="py-4 px-3 text-center hidden lg:table-cell text-tacticalWhite">
                          {winRate}%
                        </td>

                        <td className="py-4 px-4 text-center hidden sm:table-cell">
                          <div className="flex items-center justify-center gap-1">
                            {form.length > 0 ? (
                              form.map((res, fIdx) => (
                                <span
                                  key={fIdx}
                                  className={`w-4 h-4 flex items-center justify-center text-[9px] font-bold ${
                                    res === 'W'
                                      ? 'bg-olive/40 text-sand border border-olive'
                                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                  }`}
                                >
                                  {res}
                                </span>
                              ))
                            ) : (
                              <span className="text-[10px] text-mutedKhaki">-</span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className="inline-block px-3 py-1 bg-surface border border-sand/40 text-sand font-display font-black text-base">
                            {team.points || 0}
                          </span>
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-surface/50 border-t border-gunmetal text-[11px] font-mono text-mutedKhaki flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>* MP: Matches Played | RW: Rounds Won | RL: Rounds Lost | RD: Round Difference | PTS: 3 per Win</span>
              <span className="text-sand">Standings update in real time with stage matches.</span>
            </div>
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="space-y-4 mb-12">
            {completedMatches.length === 0 ? (
              <div className="text-center py-16 bg-surface/30 border border-dashed border-gunmetal p-8">
                <CheckCircle2 className="w-12 h-12 text-mutedKhaki/40 mx-auto mb-3" />
                <h3 className="font-display font-black text-lg text-tacticalWhite uppercase mb-1">No Completed Results</h3>
                <p className="text-xs font-mono text-mutedKhaki max-w-md mx-auto">
                  Match results will be published here upon official ratification by tournament referees.
                </p>
              </div>
            ) : (
              completedMatches.map((m) => (
                <div
                  key={m.id}
                  className="bg-card/90 border border-gunmetal p-6 backdrop-blur-md hover:border-olive transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gunmetal/70 gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="relative w-8 h-5 overflow-hidden border border-gunmetal shrink-0 clip-tactical">
                        <Image src={getMapImage(m.map)} alt={m.map} fill className="object-cover" sizes="32px" />
                      </div>
                      <span className="text-xs font-mono text-sand font-bold">{m.stage}</span>
                      <span className="text-xs font-mono text-mutedKhaki">• Theater: {m.map}</span>
                    </div>
                    <div className="text-xs font-mono text-mutedKhaki flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 uppercase font-bold">VERIFIED FINAL RESULT</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
                    {/* Team A */}
                    <div className="md:col-span-5 flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-surface border border-gunmetal shrink-0 overflow-hidden">
                        <Image src={m.teamALogo} alt={m.teamAName} fill className="object-cover" sizes="48px" />
                      </div>
                      <div>
                        <span className="text-xs font-mono text-sand font-bold">[{m.teamATag}]</span>
                        <h4 className="font-display font-bold text-base text-tacticalWhite uppercase">{m.teamAName}</h4>
                      </div>
                    </div>

                    {/* Center Score */}
                    <div className="md:col-span-2 text-center py-2 bg-surface/50 border border-gunmetal/70">
                      <div className="font-display font-black text-2xl text-tacticalWhite">
                        <span className={m.scoreA > m.scoreB ? 'text-sand' : 'text-mutedKhaki'}>{m.scoreA}</span>
                        <span className="text-mutedKhaki/50 mx-2">:</span>
                        <span className={m.scoreB > m.scoreA ? 'text-khaki' : 'text-mutedKhaki'}>{m.scoreB}</span>
                      </div>
                    </div>

                    {/* Team B */}
                    <div className="md:col-span-5 flex items-center justify-end gap-3 text-right">
                      <div>
                        <span className="text-xs font-mono text-khaki font-bold">[{m.teamBTag}]</span>
                        <h4 className="font-display font-bold text-base text-tacticalWhite uppercase">{m.teamBName}</h4>
                      </div>
                      <div className="relative w-12 h-12 bg-surface border border-gunmetal shrink-0 overflow-hidden">
                        <Image src={m.teamBLogo} alt={m.teamBName} fill className="object-cover" sizes="48px" />
                      </div>
                    </div>
                  </div>

                  {m.mvp && (
                    <div className="mt-4 pt-3 border-t border-gunmetal/60 flex items-center gap-2 text-xs font-mono text-sand">
                      <Award className="w-3.5 h-3.5" />
                      <span>OPERATIONAL MVP: {m.mvp}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'upcoming' && (
          <div className="space-y-4 mb-12">
            {upcomingMatches.length === 0 ? (
              <div className="text-center py-16 bg-surface/30 border border-dashed border-gunmetal p-8">
                <Clock className="w-12 h-12 text-mutedKhaki/40 mx-auto mb-3" />
                <h3 className="font-display font-black text-lg text-tacticalWhite uppercase mb-1">No Upcoming Fixtures</h3>
                <p className="text-xs font-mono text-mutedKhaki max-w-md mx-auto">
                  Stage schedule will appear here when fixtures are seeded.
                </p>
              </div>
            ) : (
              upcomingMatches.map((m) => (
              <div
                key={m.id}
                className="bg-card/90 border border-gunmetal p-6 backdrop-blur-md hover:border-olive transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gunmetal/70 gap-2 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-5 overflow-hidden border border-gunmetal shrink-0 clip-tactical">
                      <Image src={getMapImage(m.map)} alt={m.map} fill className="object-cover" sizes="32px" />
                    </div>
                    <span className="text-xs font-mono text-sand font-bold">{m.stage}</span>
                    <span className="text-xs font-mono text-mutedKhaki">• Theater: {m.map}</span>
                  </div>
                  <div className="text-xs font-mono text-sand flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>SCHEDULED FIXTURE</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4">
                  {/* Team A */}
                  <div className="md:col-span-5 flex items-center gap-3">
                    <div className="relative w-12 h-12 bg-surface border border-gunmetal shrink-0 overflow-hidden">
                      <Image src={m.teamALogo} alt={m.teamAName} fill className="object-cover" sizes="48px" />
                    </div>
                    <div>
                      <span className="text-xs font-mono text-sand font-bold">[{m.teamATag}]</span>
                      <h4 className="font-display font-bold text-base text-tacticalWhite uppercase">{m.teamAName}</h4>
                    </div>
                  </div>

                  {/* Center VS */}
                  <div className="md:col-span-2 text-center py-2 bg-surface/50 border border-gunmetal/70 font-display font-black text-lg text-mutedKhaki">
                    VS
                  </div>

                  {/* Team B */}
                  <div className="md:col-span-5 flex items-center justify-end gap-3 text-right">
                    <div>
                      <span className="text-xs font-mono text-khaki font-bold">[{m.teamBTag}]</span>
                      <h4 className="font-display font-bold text-base text-tacticalWhite uppercase">{m.teamBName}</h4>
                    </div>
                    <div className="relative w-12 h-12 bg-surface border border-gunmetal shrink-0 overflow-hidden">
                      <Image src={m.teamBLogo} alt={m.teamBName} fill className="object-cover" sizes="48px" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      </div>
    </div>
  );
}
