'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  getStoredMatches,
  getStored16Matches,
  getStoredTeams,
  setStoredTeams,
  setStoredMatches,
  deleteStoredMatch,
  updateMatchScore,
  incrementMatchScore,
  switchMatchSides,
  toggleMatchC4,
  setMatchLiveStatus,
  updateLiveMatch,
  createAndSeedPlayoffTree,
  isPlayoffTreePublished,
  setPlayoffTreePublished,
} from '@/lib/storage';
import { api } from '@/lib/api';
import { transformBackendMatch, transformBackendTeam } from '@/lib/transformers';
import { Match, MatchStatus } from '@/lib/types';
import { getMapImage } from '@/lib/mockData';
import {
  Trophy,
  CheckCircle2,
  Swords,
  Award,
  ExternalLink,
  Plus,
  Minus,
  RefreshCw,
  Bomb,
  Radio,
  Flame,
  Shield,
  Zap,
  Lock,
  Trash2,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function AdminScoreboardPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [scoreA, setScoreA] = useState<number>(0);
  const [scoreB, setScoreB] = useState<number>(0);
  const [status, setStatus] = useState<MatchStatus>('live');
  const [mvp, setMvp] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isTreePublished, setIsTreePublished] = useState<boolean>(() => isPlayoffTreePublished());

  const getCleanMatches = () => {
    const list = getStoredMatches();
    // Filter out dummy/sample placeholders so only real scheduled fixtures appear
    return list.filter((m) => {
      const isDummyA = (m.teamAName || '').startsWith('TBD (Slot') || (m.teamATag || '').startsWith('SLOT');
      const isDummyB = (m.teamBName || '').startsWith('TBD (Slot') || (m.teamBTag || '').startsWith('SLOT');
      return !(isDummyA && isDummyB);
    });
  };

  const loadMatches = useCallback(async () => {
    let clean = getCleanMatches();
    setMatches(clean);

    try {
      const [resMatches, resTeams] = await Promise.all([
        api.admin.getMatches().catch(() => null),
        api.admin.getTeams().catch(() => null),
      ]);

      if (resTeams?.success && Array.isArray(resTeams.data)) {
        setStoredTeams(resTeams.data.map(transformBackendTeam));
      }

      if (resMatches?.success && Array.isArray(resMatches.data)) {
        const transformed = resMatches.data.map(transformBackendMatch).filter((m) => {
          const isDummyA = (m.teamAName || '').startsWith('TBD (Slot') || (m.teamATag || '').startsWith('SLOT');
          const isDummyB = (m.teamBName || '').startsWith('TBD (Slot') || (m.teamBTag || '').startsWith('SLOT');
          return !(isDummyA && isDummyB);
        });
        setMatches(transformed);
        setStoredMatches(transformed);
        clean = transformed;
      }
    } catch (e) {
      // Backend offline: continue with clean list
    }
    return clean;
  }, []);

  useEffect(() => {
    loadMatches().then((list) => {
      if (list.length > 0) {
        // Default to live match if available or first match
        const currentStillExists = list.find((m) => m.id === selectedMatchId);
        const active = currentStillExists || list.find((m) => m.status === 'live') || list[0];
        setSelectedMatchId(active.id);
        setScoreA(active.scoreA);
        setScoreB(active.scoreB);
        setStatus(active.status);
        setMvp(active.mvp || '');
      } else {
        setSelectedMatchId('');
        setScoreA(0);
        setScoreB(0);
      }
    });

    const handleUpdate = () => {
      const updated = getCleanMatches();
      setMatches(updated);
      const cur = updated.find((m) => m.id === selectedMatchId);
      if (cur) {
        setScoreA(cur.scoreA);
        setScoreB(cur.scoreB);
        setStatus(cur.status);
      }
    };

    window.addEventListener('cst_matches_updated', handleUpdate);
    window.addEventListener('cst_16_matches_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('cst_matches_updated', handleUpdate);
      window.removeEventListener('cst_16_matches_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [selectedMatchId, loadMatches]);

  const handleDeleteSelectedMatch = async () => {
    const current = matches.find((m) => m.id === selectedMatchId);
    if (!current) return;

    const confirmDelete = window.confirm(
      `DELETE MATCH FIXTURE?\n\n` +
      `Are you sure you want to permanently delete this match fixture?\n` +
      `[${current.teamATag}] ${current.teamAName} vs [${current.teamBTag}] ${current.teamBName}\n` +
      `Stage: ${current.stage} | Map: ${current.map}`
    );
    if (!confirmDelete) return;

    try {
      await api.admin.deleteMatch(current.id);
      showNotice(`✓ Match [${current.teamATag}] vs [${current.teamBTag}] deleted from database.`);
    } catch (e) {
      showNotice(`✓ Match [${current.teamATag}] vs [${current.teamBTag}] deleted locally.`);
    }

    deleteStoredMatch(current.id);
    setSelectedMatchId('');
    await loadMatches();
  };

  const handleSelectMatch = (matchId: string) => {
    setSelectedMatchId(matchId);
    const m = matches.find((item) => item.id === matchId);
    if (m) {
      setScoreA(m.scoreA);
      setScoreB(m.scoreB);
      setStatus(m.status);
      setMvp(m.mvp || '');
    }
  };

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const currentMatch = matches.find((m) => m.id === selectedMatchId);

  // Quick 1-click round increment for live match
  const handleQuickScore = async (team: 'teamA' | 'teamB', delta: number) => {
    if (!selectedMatchId) return;

    // Instant local BroadcastChannel update (<10ms)
    const updated = incrementMatchScore(selectedMatchId, team, delta);
    if (updated) {
      setScoreA(updated.scoreA);
      setScoreB(updated.scoreB);
      setStatus(updated.status);
      showNotice(
        `Round ${delta > 0 ? '+1' : '-1'} awarded to ${team === 'teamA' ? updated.teamATag : updated.teamBTag}! Projected instantly to auditorium screen.`
      );

      try {
        await api.admin.updateMatchScore(selectedMatchId, {
          scoreA: updated.scoreA,
          scoreB: updated.scoreB,
          currentRound: updated.scoreA + updated.scoreB,
          status: updated.status.toUpperCase(),
        });
      } catch (e) {
        // Safe backend sync fail
      }
    }
  };

  const handleSideSwitch = async () => {
    if (!selectedMatchId) return;
    const updated = switchMatchSides(selectedMatchId);
    if (updated) {
      showNotice(`Sides switched! Team Alpha is now ${updated.teamASide}, Team Bravo is ${updated.teamBSide}.`);
      try {
        await api.admin.updateMatchScore(selectedMatchId, {
          teamASide: updated.teamASide,
          teamBSide: updated.teamBSide,
          half: updated.half,
        });
      } catch (e) {}
    }
  };

  const handleToggleC4 = async () => {
    if (!selectedMatchId) return;
    const state = toggleMatchC4(selectedMatchId);
    showNotice(state ? '⚠️ Demolition ordnance armed alert broadcast to projector!' : 'Ordnance alert cleared on projector.');
    try {
      await api.admin.updateMatchScore(selectedMatchId, {
        c4Planted: state,
      });
    } catch (e) {}
  };

  const handleSetStatus = async (newStatus: MatchStatus) => {
    if (!selectedMatchId) return;
    setMatchLiveStatus(selectedMatchId, newStatus);
    setStatus(newStatus);
    showNotice(`Match status set to: ${newStatus.toUpperCase()}`);
    try {
      await api.admin.updateMatchScore(selectedMatchId, {
        status: newStatus.toUpperCase(),
      });
    } catch (e) {}
  };

  const handlePublishScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchId) return;

    updateMatchScore(selectedMatchId, Number(scoreA), Number(scoreB), status, mvp);
    setSaveSuccess(true);
    showNotice('Official score ratified! Public scoreboard and university standings updated.');
    setTimeout(() => setSaveSuccess(false), 3000);

    try {
      await api.admin.publishMatchScore(selectedMatchId, {
        scoreA: Number(scoreA),
        scoreB: Number(scoreB),
        status: status.toUpperCase(),
        mvp: mvp || undefined,
      });
    } catch (e) {
      console.warn('Backend publish score fallback to local storage', e);
    }
  };

  const openProjectorWindow = () => {
    if (typeof window !== 'undefined') {
      const url = `/scoreboard/live${selectedMatchId ? `?matchId=${selectedMatchId}` : ''}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCreatePlayoffTree = async () => {
    let currentTeams = getStoredTeams();
    try {
      const resTeams = await api.admin.getTeams().catch(() => null);
      if (resTeams?.success && Array.isArray(resTeams.data) && resTeams.data.length > 0) {
        const fetchedTeams = resTeams.data.map(transformBackendTeam);
        setStoredTeams(fetchedTeams);
        currentTeams = fetchedTeams;
      }
    } catch (e) {}

    const sourceTeams = currentTeams.filter((t) => (t.status || '').toLowerCase() !== 'rejected');
    const isEightSquad = sourceTeams.length <= 8;

    const confirmSeed = window.confirm(
      `GENERATE OFFICIAL PLAYOFF TREE?\n\n` +
      `• Any manually scheduled 1st round matches will be preserved and linked into the tree.\n` +
      `• Remaining slots will be filled from registered approved squads.\n` +
      `• Semifinals, Grand Final & Bronze decider start free awaiting match winners.\n` +
      `• When any match is won, the winner will automatically advance into the playoff tree!`
    );
    if (!confirmSeed) return;

    createAndSeedPlayoffTree(sourceTeams);
    try {
      await api.admin.generatePlayoffs().catch(() => null);
    } catch (e) {}

    const updated = getCleanMatches();
    setMatches(updated);
    showNotice(
      `✓ Playoff Tree generated! 1st round fixtures linked. Match wins will automatically advance winners down the tree.`
    );
  };

  const handleTogglePublish = async () => {
    const nextState = !isTreePublished;
    setIsTreePublished(nextState);
    setPlayoffTreePublished(nextState);
    try {
      await api.admin.updateSettings({ playoffTreePublished: nextState });
    } catch (e) {}
    showNotice(
      nextState
        ? '✓ Playoff Championship Tree PUBLISHED to live public scoreboard!'
        : '✓ Playoff Championship Tree UNPUBLISHED (Standby screen active).'
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gunmetal">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <Badge variant="olive" size="sm">LIVE REFEREE CONSOLE</Badge>
              <span className="text-[11px] font-mono text-mutedKhaki">{"// STAGE PROJECTOR CONTROLLER"}</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase text-tacticalWhite tracking-wider">
              REAL-TIME MATCH & SCOREBOARD REFEREE
            </h1>
            <p className="text-xs font-mono text-mutedKhaki">
              Live scoring desk: update rounds in 1 click, swap sides, toggle ordnance alert, and project to stage screen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCreatePlayoffTree}
              className="px-4 py-2.5 bg-sand hover:bg-sand/90 text-military-black font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 border border-sand transition-all shrink-0"
              title="Seed 1st layer with registered squads; Round 2, Semifinals & Finals start free and advance automatically on win"
            >
              <Trophy className="w-4 h-4 text-military-black" />
              <span>CREATE PLAYOFF TREE</span>
            </button>

            <button
              onClick={handleTogglePublish}
              className={`px-4 py-2.5 font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 border transition-all shrink-0 ${
                isTreePublished
                  ? 'bg-rose-950/80 border-rose-700 text-rose-300 hover:bg-rose-900 shadow-sm'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-tacticalWhite border-emerald-500 shadow-[0_2px_12px_rgba(16,185,129,0.4)]'
              }`}
              title={isTreePublished ? 'Unpublish bracket from public scoreboard' : 'Publish bracket to public scoreboard'}
            >
              {isTreePublished ? (
                <>
                  <Lock className="w-4 h-4 text-rose-300" />
                  <span>UNPUBLISH BRACKET</span>
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4 text-tacticalWhite animate-pulse" />
                  <span>PUBLISH PLAYOFF TREE</span>
                </>
              )}
            </button>

            <button
              onClick={openProjectorWindow}
              className="px-4 py-2.5 bg-olive hover:bg-olive/90 text-tacticalWhite font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 border border-gunmetal transition-all shrink-0"
            >
              <ExternalLink className="w-4 h-4 text-sand" />
              <span>LAUNCH STAGE PROJECTOR (NEW WINDOW)</span>
            </button>
          </div>
        </div>

        {actionNotice && (
          <div className="p-4 bg-olive/20 border border-olive flex items-center gap-3 text-xs font-mono text-sand">
            <Radio className="w-4 h-4 shrink-0 text-sand animate-ping" />
            <span>{actionNotice}</span>
          </div>
        )}

        <div className="bg-card/90 border border-gunmetal p-4">
          <label className="block text-xs font-mono text-mutedKhaki uppercase tracking-wider mb-2">
            SELECT FIXTURE ON STAGE:
          </label>
          <select
            value={selectedMatchId}
            onChange={(e) => handleSelectMatch(e.target.value)}
            className="w-full bg-surface border border-gunmetal px-4 py-3 text-xs font-mono text-tacticalWhite focus:outline-none focus:border-olive"
          >
            {matches.length === 0 && (
              <option value="">No fixtures scheduled yet</option>
            )}
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                [{m.status.toUpperCase()}] {m.teamATag} vs {m.teamBTag} • Theater: {m.map} • Stage: {m.stage} ({m.scoreA} : {m.scoreB})
              </option>
            ))}
          </select>
        </div>

        {currentMatch ? (
          <div className="bg-card/90 border-2 border-gunmetal p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-olive text-tacticalWhite font-mono text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
              ACTIVE REFEREE DESK
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gunmetal gap-4">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-8 overflow-hidden border border-gunmetal shrink-0 clip-tactical">
                  <Image src={getMapImage(currentMatch.map)} alt={currentMatch.map} fill className="object-cover" sizes="48px" />
                </div>
                <div>
                  <span className="text-xs font-mono text-sand uppercase font-bold tracking-wider">
                    {`${currentMatch.stage} // THEATER: ${currentMatch.map}`}
                  </span>
                  <div className="text-[11px] font-mono text-mutedKhaki mt-0.5">
                    MR12 Regulation (First to 13 rounds wins)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-mutedKhaki mr-1">STATE:</span>
                {(['upcoming', 'live', 'completed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSetStatus(s)}
                    className={`px-3 py-1 text-xs font-mono uppercase font-bold border transition-colors ${
                      status === s
                        ? s === 'live'
                          ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                          : s === 'completed'
                          ? 'bg-olive text-tacticalWhite border-olive'
                          : 'bg-sand text-military-black border-sand'
                        : 'bg-surface text-mutedKhaki border-gunmetal hover:text-tacticalWhite'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="my-8 grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
              
              <div className="md:col-span-5 bg-surface/80 border border-gunmetal p-5 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-12 h-12 bg-surface border border-gunmetal shrink-0 overflow-hidden">
                    <Image src={currentMatch.teamALogo} alt={currentMatch.teamAName} fill className="object-cover" sizes="48px" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-sand">[{currentMatch.teamATag}]</span>
                    <h3 className="font-display font-black text-lg text-tacticalWhite uppercase truncate max-w-[200px]">
                      {currentMatch.teamAName}
                    </h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 font-bold uppercase ${
                      currentMatch.teamASide === 'CT' ? 'bg-olive/20 text-sand border border-olive' : 'bg-card text-khaki border border-gunmetal'
                    }`}>
                      {currentMatch.teamASide === 'T' ? 'OPFOR SIDE' : 'TASK FORCE SIDE'}
                    </span>
                  </div>
                </div>

                <div className="text-center py-4 bg-background/60 border border-gunmetal my-3">
                  <div className="font-display font-black text-6xl text-tacticalWhite">
                    {scoreA}
                  </div>
                  <div className="text-[10px] font-mono text-mutedKhaki uppercase tracking-wider mt-1">
                    ROUNDS WON
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => handleQuickScore('teamA', 1)}
                    className="py-3 bg-olive text-tacticalWhite hover:bg-olive/90 font-display font-black text-sm uppercase flex items-center justify-center gap-1.5 transition-colors border border-gunmetal"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>WIN ROUND (+1)</span>
                  </button>
                  <button
                    onClick={() => handleQuickScore('teamA', -1)}
                    className="py-3 bg-surface border border-gunmetal text-mutedKhaki hover:text-tacticalWhite font-display font-black text-xs uppercase flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>CORRECT (-1)</span>
                  </button>
                </div>
              </div>

              <div className="md:col-span-1 flex flex-col items-center justify-center gap-4 py-2">
                <span className="font-display font-black text-xl text-mutedKhaki">VS</span>
                
                <button
                  onClick={handleSideSwitch}
                  title="Switch Halftime Sides (Task Force <-> Opfor)"
                  className="p-3 bg-surface border border-gunmetal hover:border-sand text-mutedKhaki hover:text-sand transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>

                <button
                  onClick={handleToggleC4}
                  title="Toggle Demolition Ordnance Armed Strobe on Stage Projector"
                  className={`p-3 border transition-colors ${
                    currentMatch.c4Planted
                      ? 'bg-rose-700 text-white border-rose-500 animate-bounce'
                      : 'bg-surface border-gunmetal hover:border-rose-500 text-rose-500'
                  }`}
                >
                  <Bomb className="w-5 h-5" />
                </button>
              </div>

              <div className="md:col-span-5 bg-surface/80 border border-gunmetal p-5 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-12 h-12 bg-surface border border-gunmetal shrink-0 overflow-hidden">
                    <Image src={currentMatch.teamBLogo} alt={currentMatch.teamBName} fill className="object-cover" sizes="48px" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-khaki">[{currentMatch.teamBTag}]</span>
                    <h3 className="font-display font-black text-lg text-tacticalWhite uppercase truncate max-w-[200px]">
                      {currentMatch.teamBName}
                    </h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 font-bold uppercase ${
                      currentMatch.teamBSide === 'CT' ? 'bg-olive/20 text-sand border border-olive' : 'bg-card text-khaki border border-gunmetal'
                    }`}>
                      {currentMatch.teamBSide === 'CT' ? 'TASK FORCE SIDE' : 'OPFOR SIDE'}
                    </span>
                  </div>
                </div>

                <div className="text-center py-4 bg-background/60 border border-gunmetal my-3">
                  <div className="font-display font-black text-6xl text-tacticalWhite">
                    {scoreB}
                  </div>
                  <div className="text-[10px] font-mono text-mutedKhaki uppercase tracking-wider mt-1">
                    ROUNDS WON
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => handleQuickScore('teamB', 1)}
                    className="py-3 bg-sand text-military-black hover:bg-sand/90 font-display font-black text-sm uppercase flex items-center justify-center gap-1.5 transition-colors border border-sand"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>WIN ROUND (+1)</span>
                  </button>
                  <button
                    onClick={() => handleQuickScore('teamB', -1)}
                    className="py-3 bg-surface border border-gunmetal text-mutedKhaki hover:text-tacticalWhite font-display font-black text-xs uppercase flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>CORRECT (-1)</span>
                  </button>
                </div>
              </div>

            </div>

            <form onSubmit={handlePublishScore} className="border-t border-gunmetal pt-6 mt-6 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-sm text-tacticalWhite uppercase tracking-wider flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-sand" /> RATIFY SCORE & UPDATE TOURNAMENT STANDINGS
                </span>
                <span className="text-[11px] text-mutedKhaki">Updates public scoreboard and database</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-mutedKhaki uppercase mb-1">
                    {currentMatch.teamATag} SCORE
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={scoreA}
                    onChange={(e) => setScoreA(parseInt(e.target.value) || 0)}
                    className="w-full bg-surface border border-gunmetal p-2.5 text-tacticalWhite focus:outline-none focus:border-olive text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-mutedKhaki uppercase mb-1">
                    {currentMatch.teamBTag} SCORE
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={scoreB}
                    onChange={(e) => setScoreB(parseInt(e.target.value) || 0)}
                    className="w-full bg-surface border border-gunmetal p-2.5 text-tacticalWhite focus:outline-none focus:border-olive text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-mutedKhaki uppercase mb-1">MATCH MVP (OPTIONAL)</label>
                  <input
                    type="text"
                    value={mvp}
                    onChange={(e) => setMvp(e.target.value)}
                    placeholder="e.g. SOAP_MACTAVISH (Rating: 1.64)"
                    className="w-full bg-surface border border-gunmetal p-2.5 text-tacticalWhite focus:outline-none focus:border-olive text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {saveSuccess ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> OFFICIAL SCORE RATIFIED & SYNCHRONIZED
                  </span>
                ) : (
                  <span className="text-mutedKhaki text-[11px]">
                    Projected window updates in real-time. Click below to lock final scores.
                  </span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteSelectedMatch}
                    className="px-3.5 py-2.5 bg-surface hover:bg-rose-950/60 border border-gunmetal hover:border-rose-700 text-rose-300 font-mono text-xs flex items-center gap-1.5 transition-colors"
                    title="Delete this match fixture"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>DELETE FIXTURE</span>
                  </button>

                  <Button type="submit" variant="olive" size="md" icon={<CheckCircle2 className="w-4 h-4" />}>
                    RATIFY & PUBLISH OFFICIAL RESULT
                  </Button>
                </div>
              </div>
            </form>

          </div>
        ) : (
          <div className="bg-card/90 border border-gunmetal p-12 text-center">
            <Trophy className="w-12 h-12 text-mutedKhaki/40 mx-auto mb-3" />
            <h3 className="font-display font-black text-lg text-tacticalWhite uppercase mb-1">
              Referee Desk Standby
            </h3>
            <p className="text-xs font-mono text-mutedKhaki max-w-md mx-auto mb-6">
              No match fixture currently loaded. Click &quot;CREATE PLAYOFF TREE&quot; above or schedule fixtures from the Matches panel to begin refereeing live rounds.
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={handleCreatePlayoffTree} variant="olive" size="sm">
                CREATE PLAYOFF TREE
              </Button>
              <Button href="/admin/matches" variant="outline" size="sm">
                SCHEDULE FIXTURE
              </Button>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
