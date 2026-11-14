'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  getStoredTeams,
  setStoredTeams,
  getStoredMatches,
  setStoredMatches,
  createMatch,
  deleteStoredMatch,
  generateAndStorePlayoffBracket,
  createAndSeedPlayoffTree,
  recreatePlayoffTree,
  isPlayoffTreePublished,
  setPlayoffTreePublished,
} from '@/lib/storage';
import { api } from '@/lib/api';
import { transformBackendMatch, transformBackendTeam } from '@/lib/transformers';
import { Team, Match, CS2Map, MatchStatus } from '@/lib/types';
import { CS2_MAP_POOL, getMapImage } from '@/lib/mockData';
import { Swords, Plus, Calendar, Clock, MapPin, CheckCircle2, Shield, RefreshCw, Trophy, GitBranch, Radio, Lock, Trash2, RotateCcw } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function AdminMatchesPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [isTreePublished, setIsTreePublished] = useState<boolean>(() => isPlayoffTreePublished());

  // Form State
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  const [map, setMap] = useState<CS2Map>('Crash');
  const [dateTime, setDateTime] = useState('2026-11-20T14:00:00');
  const [stage, setStage] = useState('Quarterfinal 1 (MR12)');
  const [status, setStatus] = useState<MatchStatus>('upcoming');

  const loadData = async () => {
    setTeams(getStoredTeams());
    setMatches(getStoredMatches());
    setIsTreePublished(isPlayoffTreePublished());

    try {
      const [resTeams, resMatches, resSettings] = await Promise.all([
        api.admin.getTeams().catch(() => null),
        api.admin.getMatches().catch(() => null),
        api.admin.getSettings().catch(() => null),
      ]);

      if (resTeams?.success && Array.isArray(resTeams.data)) {
        const transformedTeams = resTeams.data.map(transformBackendTeam);
        setTeams(transformedTeams);
        setStoredTeams(transformedTeams);
      }

      if (resMatches?.success && Array.isArray(resMatches.data)) {
        const transformedMatches = resMatches.data.map(transformBackendMatch);
        setMatches(transformedMatches);
        setStoredMatches(transformedMatches);
      }

      if (resSettings?.data?.playoffTreePublished !== undefined) {
        setIsTreePublished(resSettings.data.playoffTreePublished);
        setPlayoffTreePublished(resSettings.data.playoffTreePublished);
      }
    } catch (e) {
      // Backend offline: use local state
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      setTeams(getStoredTeams());
      setMatches(getStoredMatches());
    };

    window.addEventListener('cst_teams_updated', handleUpdate);
    window.addEventListener('cst_matches_updated', handleUpdate);

    return () => {
      window.removeEventListener('cst_teams_updated', handleUpdate);
      window.removeEventListener('cst_matches_updated', handleUpdate);
    };
  }, []);

  const approvedTeams = teams.filter((t) => t.status === 'approved');

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamAId || !teamBId) {
      alert('Please select both competing squads.');
      return;
    }
    if (teamAId === teamBId) {
      alert('Team A and Team B must be distinct squads.');
      return;
    }

    const teamA = teams.find((t) => t.id === teamAId);
    const teamB = teams.find((t) => t.id === teamBId);

    if (!teamA || !teamB) return;

    let bracketRound: 'quarterfinals' | 'semifinals' | 'final' | 'third_place' | undefined;
    let bracketPosition: number | undefined;
    let matchNumber: number | undefined;
    let nextMatchNumber: number | undefined;
    let nextMatchSlot: 'teamA' | 'teamB' | undefined;
    let nextMatchId: string | undefined;

    const stageLower = stage.toLowerCase();
    if (stageLower.includes('quarterfinal 1') || stageLower.includes('quarterfinal 01') || stageLower.includes('qf 1') || stageLower.includes('qf 01') || stageLower.includes('qf1')) {
      bracketRound = 'quarterfinals';
      bracketPosition = 1;
      matchNumber = 101;
      nextMatchNumber = 105;
      nextMatchSlot = 'teamA';
      nextMatchId = 'm-sf-1';
    } else if (stageLower.includes('quarterfinal 2') || stageLower.includes('quarterfinal 02') || stageLower.includes('qf 2') || stageLower.includes('qf 02') || stageLower.includes('qf2')) {
      bracketRound = 'quarterfinals';
      bracketPosition = 2;
      matchNumber = 102;
      nextMatchNumber = 105;
      nextMatchSlot = 'teamB';
      nextMatchId = 'm-sf-1';
    } else if (stageLower.includes('quarterfinal 3') || stageLower.includes('quarterfinal 03') || stageLower.includes('qf 3') || stageLower.includes('qf 03') || stageLower.includes('qf3')) {
      bracketRound = 'quarterfinals';
      bracketPosition = 3;
      matchNumber = 103;
      nextMatchNumber = 106;
      nextMatchSlot = 'teamA';
      nextMatchId = 'm-sf-2';
    } else if (stageLower.includes('quarterfinal 4') || stageLower.includes('quarterfinal 04') || stageLower.includes('qf 4') || stageLower.includes('qf 04') || stageLower.includes('qf4')) {
      bracketRound = 'quarterfinals';
      bracketPosition = 4;
      matchNumber = 104;
      nextMatchNumber = 106;
      nextMatchSlot = 'teamB';
      nextMatchId = 'm-sf-2';
    } else if (stageLower.includes('semifinal 1') || stageLower.includes('semifinal 01') || stageLower.includes('sf 1') || stageLower.includes('sf 01')) {
      bracketRound = 'semifinals';
      bracketPosition = 1;
      matchNumber = 105;
      nextMatchNumber = 107;
      nextMatchSlot = 'teamA';
      nextMatchId = 'm-gf';
    } else if (stageLower.includes('semifinal 2') || stageLower.includes('semifinal 02') || stageLower.includes('sf 2') || stageLower.includes('sf 02')) {
      bracketRound = 'semifinals';
      bracketPosition = 2;
      matchNumber = 106;
      nextMatchNumber = 107;
      nextMatchSlot = 'teamB';
      nextMatchId = 'm-gf';
    } else if (stageLower.includes('grand final') || stageLower.includes('championship final') || stageLower === 'final') {
      bracketRound = 'final';
      bracketPosition = 1;
      matchNumber = 107;
    }

    // Backend payload
    const backendData: any = {
      teamA: teamA.id,
      teamB: teamB.id,
      teamAName: teamA.name,
      teamATag: teamA.tag,
      teamALogo: teamA.logo,
      teamBName: teamB.name,
      teamBTag: teamB.tag,
      teamBLogo: teamB.logo,
      mapName: map,
      scheduledAt: new Date(dateTime).toISOString(),
      stage,
      status: status.toUpperCase(),
      bracketRound,
      bracketPosition,
      matchNumber,
      nextMatchNumber,
      nextMatchSlot,
    };

    if (bracketRound) {
      setPlayoffTreePublished(true);
      api.admin.updateSettings({ playoffTreePublished: true }).catch(() => null);
    }

    let backendId: string | undefined;
    try {
      const res = await api.admin.createMatch(backendData);
      backendId = res?.data?._id || res?.data?.id;
      setNotice(`✓ Fixture created on tournament database: ${teamA.tag} vs ${teamB.tag}`);
    } catch (err) {
      console.warn('Backend match creation fallback to local', err);
      setNotice(`✓ Fixture saved locally: ${teamA.tag} vs ${teamB.tag}`);
    }

    // Save locally
    createMatch({
      id: backendId,
      teamAId: teamA.id,
      teamBId: teamB.id,
      teamAName: teamA.name,
      teamATag: teamA.tag,
      teamALogo: teamA.logo,
      teamBName: teamB.name,
      teamBTag: teamB.tag,
      teamBLogo: teamB.logo,
      map,
      dateTime,
      status,
      scoreA: 0,
      scoreB: 0,
      stage,
      bracketRound,
      bracketPosition,
      matchNumber,
      nextMatchId,
      nextMatchSlot,
    });

    setShowCreateModal(false);
    setTimeout(() => setNotice(null), 3000);
    await loadData();
  };

  const handleDeleteMatch = async (match: Match) => {
    const confirmDelete = window.confirm(
      `DELETE MATCH FIXTURE?\n\n` +
      `Are you sure you want to permanently remove this match?\n` +
      `[${match.teamATag}] ${match.teamAName} vs [${match.teamBTag}] ${match.teamBName}\n` +
      `Stage: ${match.stage} | Map: ${match.map}`
    );
    if (!confirmDelete) return;

    try {
      await api.admin.deleteMatch(match.id);
      setNotice(`✓ Match fixture [${match.teamATag}] vs [${match.teamBTag}] deleted from database.`);
    } catch (e) {
      console.warn('Backend match delete fallback to local', e);
      setNotice(`✓ Match fixture [${match.teamATag}] vs [${match.teamBTag}] deleted locally.`);
    }

    deleteStoredMatch(match.id);
    setTimeout(() => setNotice(null), 3000);
    await loadData();
  };

  const handleAutoGeneratePlayoffs = async () => {
    const candidateTeams = teams.filter((t) => (t.status || '').toLowerCase() !== 'rejected');
    if (candidateTeams.length < 2) {
      alert(`At least 2 teams are required to create the playoff bracket (Currently: ${candidateTeams.length} squads). Please enlist or approve squads first.`);
      return;
    }
    const isEightSquad = candidateTeams.length <= 8;
    const confirmSeed = window.confirm(
      `GENERATE OFFICIAL PLAYOFF TREE?\n\n` +
      `• Any 1st round matches you manually scheduled will be preserved and linked into the tree.\n` +
      `• Remaining slots will be filled from registered approved squads.\n` +
      `• Semifinals, Grand Final & Bronze decider start free awaiting match winners.\n` +
      `• When any match is won, the winner will automatically advance into the playoff tree!`
    );
    if (!confirmSeed) return;

    setLoading(true);
    try {
      createAndSeedPlayoffTree(candidateTeams);
      setIsTreePublished(true);
      setPlayoffTreePublished(true);
      try {
        await api.admin.generatePlayoffs().catch(() => null);
        await api.admin.updateSettings({ playoffTreePublished: true }).catch(() => null);
      } catch (e) {}
      setNotice(
        `✓ Playoff Tree generated & published to live public site! 1st round fixtures linked. Match wins will automatically advance winners down the tree.`
      );
    } catch (e) {
      createAndSeedPlayoffTree(candidateTeams);
      setIsTreePublished(true);
      setPlayoffTreePublished(true);
      setNotice('✓ Playoff tree generated & published.');
    } finally {
      await loadData();
      setLoading(false);
      setTimeout(() => setNotice(null), 5000);
    }
  };

  const handleRecreatePlayoffs = async () => {
    const candidateTeams = teams.filter((t) => (t.status || '').toLowerCase() !== 'rejected');
    if (candidateTeams.length < 2) {
      alert(`At least 2 teams are required to recreate the playoff bracket (Currently: ${candidateTeams.length} squads).`);
      return;
    }

    const confirmRecreate = window.confirm(
      'RECREATE OFFICIAL PLAYOFF TREE FROM SCRATCH?\n\n' +
      '• This will wipe previous playoff brackets and match states.\n' +
      '• A fresh bracket will be generated and seeded from all registered approved squads.\n' +
      '• Semifinals, Grand Final & Bronze Decider start clean awaiting match winners.\n' +
      '• The new tree will be immediately published to the live public site.\n\n' +
      'Proceed with recreation?'
    );
    if (!confirmRecreate) return;

    setLoading(true);
    try {
      recreatePlayoffTree(candidateTeams);
      setIsTreePublished(true);
      setPlayoffTreePublished(true);
      try {
        await api.admin.recreatePlayoffs().catch(() => null);
      } catch (e) {}
      setNotice('✓ Playoff Tree has been completely RECREATED from scratch and published to live public site!');
    } catch (e) {
      recreatePlayoffTree(candidateTeams);
      setIsTreePublished(true);
      setPlayoffTreePublished(true);
      setNotice('✓ Playoff tree recreated & published.');
    } finally {
      await loadData();
      setLoading(false);
      setTimeout(() => setNotice(null), 5000);
    }
  };

  const handleTogglePublish = async () => {
    const nextState = !isTreePublished;
    setIsTreePublished(nextState);
    setPlayoffTreePublished(nextState);
    try {
      await api.admin.updateSettings({ playoffTreePublished: nextState });
    } catch (e) {}
    setNotice(
      nextState
        ? '✓ Playoff Tree is now DISPLAYED and VISIBLE on public site!'
        : '✓ Playoff Tree has been DISABLED and hidden from public site.'
    );
    setTimeout(() => setNotice(null), 4000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gunmetal">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <Badge variant="sand" size="sm">FIXTURE CONTROL</Badge>
              <span className="text-[11px] font-mono text-mutedKhaki">{`// ${matches.length} FIXTURES`}</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase text-tacticalWhite tracking-wider">
              MATCH SCHEDULING & MANAGEMENT
            </h1>
            <p className="text-xs font-mono text-mutedKhaki">
              Coordinate squad pairings, designate combat theaters, and schedule auditorium stage rounds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setLoading(true);
                loadData().finally(() => setLoading(false));
              }}
              className="p-2 bg-surface border border-gunmetal text-sand hover:border-sand transition-colors"
              title="Refresh matches"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Button
              onClick={handleAutoGeneratePlayoffs}
              variant="sand"
              size="md"
              icon={<Trophy className="w-4 h-4 text-military-black" />}
            >
              CREATE PLAYOFF TREE
            </Button>
            <Button
              onClick={handleRecreatePlayoffs}
              variant="outline"
              size="md"
              className="border-rose-600/80 text-rose-300 hover:bg-rose-950/70"
              icon={<RotateCcw className="w-4 h-4 text-rose-400" />}
            >
              RECREATE PLAYOFF TREE
            </Button>
            <Button
              onClick={handleTogglePublish}
              variant={isTreePublished ? "outline" : "sand"}
              size="md"
              icon={isTreePublished ? <Lock className="w-4 h-4 text-rose-400" /> : <Radio className="w-4 h-4 text-military-black animate-pulse" />}
            >
              {isTreePublished ? "DISABLE PLAYOFF TREE" : "DISPLAY PLAYOFF TREE"}
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="olive"
              size="md"
              icon={<Plus className="w-4 h-4" />}
            >
              CREATE NEW FIXTURE
            </Button>
          </div>
        </div>

        {notice && (
          <div className="p-3 bg-olive/20 border border-olive text-xs font-mono text-sand flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-olive" />
            <span>{notice}</span>
          </div>
        )}

        <div className="space-y-4">
          {matches.length === 0 ? (
            <div className="bg-card/80 border border-gunmetal p-12 text-center">
              <Swords className="w-12 h-12 text-mutedKhaki/40 mx-auto mb-3" />
              <h3 className="font-display font-black text-lg text-tacticalWhite uppercase mb-1">
                No Match Fixtures Scheduled Yet
              </h3>
              <p className="text-xs font-mono text-mutedKhaki max-w-md mx-auto mb-6">
                No active fixtures found. Use &quot;+ CREATE NEW FIXTURE&quot; above to schedule 1st round matches manually, or click &quot;CREATE PLAYOFF TREE&quot; to seed approved squads automatically.
              </p>
              <Button
                onClick={() => setShowCreateModal(true)}
                variant="olive"
                size="sm"
                icon={<Plus className="w-4 h-4" />}
              >
                CREATE NEW FIXTURE
              </Button>
            </div>
          ) : (
            [...matches]
              .sort((a, b) => {
                if (a.matchNumber && b.matchNumber) return a.matchNumber - b.matchNumber;
                if (a.matchNumber) return -1;
                if (b.matchNumber) return 1;
                return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
              })
              .map((m) => {
                const matchDate = new Date(m.dateTime);
                const isCompleted = m.status === 'completed';
                const isLive = m.status === 'live';
                const teamAWon = isCompleted && m.scoreA > m.scoreB;
                const teamBWon = isCompleted && m.scoreB > m.scoreA;

                return (
                  <div
                    key={m.id}
                    className={`bg-card/90 border p-4 sm:p-5 backdrop-blur-md transition-all ${
                      isLive
                        ? 'border-rose-500/70 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                        : isCompleted
                        ? 'border-gunmetal/80'
                        : 'border-gunmetal hover:border-olive/60'
                    }`}
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-4 lg:gap-6">
                      {/* 1. LEFT: Stage, Date & Map (3 cols on lg) */}
                      <div className="lg:col-span-3 flex flex-col justify-center min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                          {m.matchNumber && (
                            <span className="text-[10px] font-mono font-bold text-sand px-1.5 py-0.5 bg-surface border border-gunmetal shrink-0">
                              #{m.matchNumber}
                            </span>
                          )}
                          <span className="text-[10px] font-mono uppercase tracking-wider text-sand px-2 py-0.5 bg-surface border border-gunmetal truncate max-w-[200px]">
                            {m.stage}
                          </span>
                        </div>

                        <div className="text-xs font-mono text-tacticalWhite font-medium flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-sand shrink-0" />
                          <span className="truncate">
                            {matchDate.toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] font-mono text-mutedKhaki mt-1">
                          <div className="relative w-6 h-4 overflow-hidden border border-gunmetal shrink-0 clip-tactical">
                            <Image
                              src={getMapImage(m.map)}
                              alt={m.map}
                              fill
                              className="object-cover"
                              sizes="24px"
                            />
                          </div>
                          <span className="truncate">
                            THEATER: <strong className="text-tacticalWhite">{m.map}</strong>
                          </span>
                        </div>
                      </div>

                      {/* 2. CENTER: Team A vs Team B (6 cols on lg) */}
                      <div className="lg:col-span-6 grid grid-cols-7 items-center gap-2 py-3 lg:py-0 border-y lg:border-y-0 lg:border-x border-gunmetal lg:px-4">
                        {/* Team A (3 cols: aligned to right) */}
                        <div className="col-span-3 flex items-center justify-end gap-2.5 sm:gap-3 text-right min-w-0">
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-mono text-sand block truncate">
                              [{m.teamATag}]
                            </span>
                            <span
                              className={`font-display font-bold text-sm sm:text-base uppercase truncate block ${
                                teamAWon ? 'text-sand font-black' : 'text-tacticalWhite'
                              }`}
                              title={m.teamAName}
                            >
                              {m.teamAName}
                            </span>
                          </div>
                          <div className="relative w-9 h-9 sm:w-10 sm:h-10 bg-surface border border-gunmetal shrink-0 overflow-hidden clip-tactical">
                            <Image
                              src={
                                m.teamALogo ||
                                'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80'
                              }
                              alt={m.teamAName}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                        </div>

                        {/* Score / VS Center Badge (1 col: strictly centered) */}
                        <div className="col-span-1 flex justify-center">
                          <div
                            className={`w-16 sm:w-20 py-1.5 text-center font-display font-black text-sm sm:text-base border ${
                              isLive
                                ? 'bg-rose-950/40 border-rose-500 text-rose-400 animate-pulse'
                                : isCompleted
                                ? 'bg-surface border-gunmetal text-tacticalWhite'
                                : 'bg-surface/80 border-gunmetal text-mutedKhaki'
                            }`}
                          >
                            {isCompleted ? (
                              <div className="flex items-center justify-center gap-1 font-mono tracking-wider">
                                <span className={teamAWon ? 'text-sand font-bold' : 'text-mutedKhaki'}>
                                  {m.scoreA}
                                </span>
                                <span className="text-mutedKhaki/60">:</span>
                                <span className={teamBWon ? 'text-sand font-bold' : 'text-mutedKhaki'}>
                                  {m.scoreB}
                                </span>
                              </div>
                            ) : isLive ? (
                              <div className="flex items-center justify-center gap-1 font-mono tracking-wider text-rose-400">
                                <span>{m.scoreA}</span>
                                <span className="text-rose-400/60">:</span>
                                <span>{m.scoreB}</span>
                              </div>
                            ) : (
                              <span className="text-mutedKhaki tracking-widest text-xs">VS</span>
                            )}
                          </div>
                        </div>

                        {/* Team B (3 cols: aligned to left) */}
                        <div className="col-span-3 flex items-center justify-start gap-2.5 sm:gap-3 text-left min-w-0">
                          <div className="relative w-9 h-9 sm:w-10 sm:h-10 bg-surface border border-gunmetal shrink-0 overflow-hidden clip-tactical">
                            <Image
                              src={
                                m.teamBLogo ||
                                'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200&auto=format&fit=crop&q=80'
                              }
                              alt={m.teamBName}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-mono text-khaki block truncate">
                              [{m.teamBTag}]
                            </span>
                            <span
                              className={`font-display font-bold text-sm sm:text-base uppercase truncate block ${
                                teamBWon ? 'text-sand font-black' : 'text-tacticalWhite'
                              }`}
                              title={m.teamBName}
                            >
                              {m.teamBName}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 3. RIGHT: Status & Controls (3 cols on lg: right-aligned) */}
                      <div className="lg:col-span-3 flex items-center justify-start lg:justify-end gap-2.5 min-w-0">
                        <span
                          className={`text-[10px] font-mono uppercase font-bold px-2.5 py-1 border shrink-0 ${
                            isCompleted
                              ? 'bg-olive/20 text-sand border-olive'
                              : isLive
                              ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
                              : 'bg-surface text-mutedKhaki border-gunmetal'
                          }`}
                        >
                          {m.status}
                        </span>

                        <Button href="/admin/scoreboard" variant="outline" size="sm" className="shrink-0">
                          SCORE
                        </Button>

                        <button
                          type="button"
                          onClick={() => handleDeleteMatch(m)}
                          className="p-2 bg-surface hover:bg-rose-950/60 border border-gunmetal hover:border-rose-600/60 text-mutedKhaki hover:text-rose-400 transition-colors shrink-0"
                          title="Delete match fixture"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>

      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-military-black/85 backdrop-blur-md">
          <div className="relative bg-card border border-gunmetal max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <h2 className="font-display font-black text-xl text-tacticalWhite uppercase tracking-wider mb-4 border-b border-gunmetal pb-3">
              SCHEDULE NEW COD4 FIXTURE
            </h2>

            <form onSubmit={handleCreateMatch} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-mutedKhaki uppercase mb-1">SQUAD A (TASK FORCE SEED)</label>
                <select
                  value={teamAId}
                  onChange={(e) => setTeamAId(e.target.value)}
                  className="w-full bg-surface border border-gunmetal p-2.5 text-tacticalWhite focus:outline-none focus:border-olive"
                  required
                >
                  <option value="">-- Select Team A --</option>
                  {approvedTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.tag}] {t.name} ({t.university})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-mutedKhaki uppercase mb-1">SQUAD B (OPFOR SEED)</label>
                <select
                  value={teamBId}
                  onChange={(e) => setTeamBId(e.target.value)}
                  className="w-full bg-surface border border-gunmetal p-2.5 text-tacticalWhite focus:outline-none focus:border-olive"
                  required
                >
                  <option value="">-- Select Team B --</option>
                  {approvedTeams.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.tag}] {t.name} ({t.university})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-mutedKhaki uppercase mb-1">COMBAT THEATER</label>
                  <select
                    value={map}
                    onChange={(e) => setMap(e.target.value as CS2Map)}
                    className="w-full bg-surface border border-gunmetal p-2.5 text-tacticalWhite focus:outline-none focus:border-olive"
                  >
                    {CS2_MAP_POOL.map((m) => (
                      <option key={m.callsign} value={m.name}>
                        {m.name} ({m.callsign})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-mutedKhaki uppercase mb-1">STAGE / 1ST ROUND SLOT</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full bg-surface border border-gunmetal p-2.5 text-tacticalWhite focus:outline-none focus:border-olive"
                  >
                    <option value="Quarterfinal 1 (MR12)">Quarterfinal 1 (1st Round • Left Wing Top)</option>
                    <option value="Quarterfinal 2 (MR12)">Quarterfinal 2 (1st Round • Left Wing Bottom)</option>
                    <option value="Quarterfinal 3 (MR12)">Quarterfinal 3 (1st Round • Right Wing Top)</option>
                    <option value="Quarterfinal 4 (MR12)">Quarterfinal 4 (1st Round • Right Wing Bottom)</option>
                    <option value="Semifinal 1 (MR12)">Semifinal 1 (MR12)</option>
                    <option value="Semifinal 2 (MR12)">Semifinal 2 (MR12)</option>
                    <option value="Grand Final (LAN Main Auditorium Stage)">Grand Final (Auditorium Stage)</option>
                    <option value="Exhibition Match">Exhibition / Group Stage Match</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-mutedKhaki uppercase mb-1">MATCH DATE & TIME</label>
                <input
                  type="datetime-local"
                  value={dateTime.slice(0, 16)}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full bg-surface border border-gunmetal p-2.5 text-tacticalWhite focus:outline-none focus:border-olive"
                  required
                />
              </div>

              <div className="pt-4 border-t border-gunmetal flex justify-end gap-3">
                <Button type="button" onClick={() => setShowCreateModal(false)} variant="ghost" size="sm">
                  CANCEL
                </Button>
                <Button type="submit" variant="olive" size="sm">
                  PUBLISH FIXTURE
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
