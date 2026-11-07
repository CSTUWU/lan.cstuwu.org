'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  getStoredMatches,
  getStored16Matches,
  getStoredTeams,
  updateMatchScore,
  incrementMatchScore,
  switchMatchSides,
  toggleMatchC4,
  setMatchLiveStatus,
  updateLiveMatch,
  createAndSeedPlayoffTree,
} from '@/lib/storage';
import { api } from '@/lib/api';
import { transformBackendMatch } from '@/lib/transformers';
import { Match, MatchStatus } from '@/lib/types';
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
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function AdminScoreboardPage() {
  const [bracketFilter, setBracketFilter] = useState<'16-squad' | '8-squad' | 'all'>('16-squad');
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [scoreA, setScoreA] = useState<number>(0);
  const [scoreB, setScoreB] = useState<number>(0);
  const [status, setStatus] = useState<MatchStatus>('live');
  const [mvp, setMvp] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const getCombinedMatches = (filter: '16-squad' | '8-squad' | 'all') => {
    const list8 = getStoredMatches();
    const list16 = getStored16Matches();
    if (filter === '16-squad') return list16;
    if (filter === '8-squad') return list8;
    return [...list16, ...list8];
  };

  const loadMatches = async () => {
    const combined = getCombinedMatches(bracketFilter);
    setMatches(combined);

    try {
      const res = await api.admin.getMatches();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const transformed = res.data.map(transformBackendMatch);
        if (bracketFilter === '8-squad' || bracketFilter === 'all') {
          setMatches(bracketFilter === '8-squad' ? transformed : [...getStored16Matches(), ...transformed]);
        }
      }
    } catch (e) {
      // Backend offline: continue with local list
    }
    return combined;
  };

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
      }
    });

    const handleUpdate = () => {
      const updated = getCombinedMatches(bracketFilter);
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
  }, [bracketFilter, selectedMatchId]);

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
    showNotice(state ? '⚠️ C4 Planted alert broadcast to projector!' : 'C4 bomb alert cleared on projector.');
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

  const handleCreatePlayoffTree = () => {
    const currentTeams = getStoredTeams();
    const approved = currentTeams.filter((t) => (t.status || '').toLowerCase() === 'approved');
    const sourceTeams = approved.length > 0 ? approved : currentTeams.filter((t) => (t.status || '').toLowerCase() !== 'rejected');
    const isEightSquad = sourceTeams.length <= 8;

    const confirmSeed = window.confirm(
      `CREATE PLAYOFF TREE from ${sourceTeams.length} registered squads?\n\n` +
      (isEightSquad
        ? `• 8-TEAM DUAL-WING BRACKET:\n` +
          `  - Left Wing: 4 squads (2 Quarterfinal matches)\n` +
          `  - Right Wing: 4 squads (2 Quarterfinal matches)\n` +
          `  - Round 2 (Semifinals) and Grand Final will start completely free.\n`
        : `• 16-TEAM DUAL-WING BRACKET:\n` +
          `  - Left Wing: 8 squads (4 Round of 16 matches)\n` +
          `  - Right Wing: 8 squads (4 Round of 16 matches)\n` +
          `  - Round 2 (Quarterfinals), Semifinals & Grand Final will start completely free.\n`) +
      `• Winning match scores will automatically advance winners down the tree to the trophy!`
    );
    if (!confirmSeed) return;

    createAndSeedPlayoffTree();
    const updated = getCombinedMatches(bracketFilter);
    setMatches(updated);
    showNotice(
      `✓ ${isEightSquad ? '8-Squad Dual-Wing' : '16-Squad Major'} Playoff Tree created! Downstream rounds are free.`
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-tactical-border">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <Badge variant="cyan" size="sm">LIVE REFEREE CONSOLE</Badge>
              <span className="text-[11px] font-mono text-secondaryText">{"// STAGE PROJECTOR CONTROLLER"}</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase text-white tracking-wider">
              REAL-TIME MATCH & SCOREBOARD REFEREE
            </h1>
            <p className="text-xs font-mono text-secondaryText">
              Live scoring desk: update rounds in 1 click, swap sides, toggle C4 plant alert, and project to stage screen.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCreatePlayoffTree}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:brightness-110 text-white font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 border border-amber-400 shadow-[0_0_20px_rgba(255,184,0,0.3)] transition-all shrink-0"
              title="Seed 1st layer with registered squads; Round 2, Semifinals & Finals start free and advance automatically on win"
            >
              <Trophy className="w-4 h-4 text-tactical-gold" />
              <span>CREATE PLAYOFF TREE</span>
            </button>

            <button
              onClick={openProjectorWindow}
              className="px-4 py-2.5 bg-gradient-to-r from-cyan to-blue-600 hover:from-cyan hover:to-cyan text-background font-display font-black text-xs uppercase tracking-wider flex items-center gap-2 border border-cyan shadow-[0_0_20px_rgba(0,213,255,0.4)] transition-all shrink-0"
            >
              <ExternalLink className="w-4 h-4" />
              <span>LAUNCH STAGE PROJECTOR (NEW WINDOW)</span>
            </button>
          </div>
        </div>

        {actionNotice && (
          <div className="p-4 bg-cyan/10 border border-cyan/50 flex items-center gap-3 text-xs font-mono text-cyan animate-pulse">
            <Radio className="w-4 h-4 shrink-0 text-cyan animate-ping" />
            <span>{actionNotice}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-secondaryText uppercase font-bold mr-1">BRACKET POOL:</span>
          <button
            type="button"
            onClick={() => setBracketFilter('16-squad')}
            className={`px-3 py-1.5 font-mono text-xs uppercase font-bold border transition-colors ${
              bracketFilter === '16-squad'
                ? 'bg-gradient-to-r from-purple-600 to-cyan text-white border-purple-400 shadow-sm'
                : 'bg-card text-secondaryText border-tactical-border hover:text-white'
            }`}
          >
            16-SQUAD MAJOR DUAL-WING
          </button>
          <button
            type="button"
            onClick={() => setBracketFilter('8-squad')}
            className={`px-3 py-1.5 font-mono text-xs uppercase font-bold border transition-colors ${
              bracketFilter === '8-squad'
                ? 'bg-cyan text-black border-cyan font-black'
                : 'bg-card text-secondaryText border-tactical-border hover:text-white'
            }`}
          >
            8-SQUAD UWU
          </button>
          <button
            type="button"
            onClick={() => setBracketFilter('all')}
            className={`px-3 py-1.5 font-mono text-xs uppercase font-bold border transition-colors ${
              bracketFilter === 'all'
                ? 'bg-tactical-gold text-black border-tactical-gold font-black'
                : 'bg-card text-secondaryText border-tactical-border hover:text-white'
            }`}
          >
            ALL FIXTURES ({getCombinedMatches('all').length})
          </button>
        </div>

        <div className="bg-card/90 border border-tactical-border p-4">
          <label className="block text-xs font-mono text-secondaryText uppercase tracking-wider mb-2">
            SELECT FIXTURE ON STAGE:
          </label>
          <select
            value={selectedMatchId}
            onChange={(e) => handleSelectMatch(e.target.value)}
            className="w-full bg-surface border border-tactical-border px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-cyan"
          >
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                [{m.status.toUpperCase()}] {m.teamATag} vs {m.teamBTag} • Map: {m.map} • Stage: {m.stage} ({m.scoreA} : {m.scoreB})
              </option>
            ))}
          </select>
        </div>

        {currentMatch && (
          <div className="bg-card/90 border-2 border-cyan/40 p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-cyan text-background font-mono text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
              ACTIVE REFEREE DESK
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-tactical-border gap-4">
              <div>
                <span className="text-xs font-mono text-cyan uppercase font-bold tracking-wider">
                  {`${currentMatch.stage} // MAP: ${currentMatch.map}`}
                </span>
                <div className="text-[11px] font-mono text-secondaryText mt-1">
                  MR12 Regulation (First to 13 rounds wins)
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-secondaryText mr-1">STATE:</span>
                {(['upcoming', 'live', 'completed'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSetStatus(s)}
                    className={`px-3 py-1 text-xs font-mono uppercase font-bold border transition-colors ${
                      status === s
                        ? s === 'live'
                          ? 'bg-rose-500 text-white border-rose-500 animate-pulse'
                          : s === 'completed'
                          ? 'bg-emerald-500 text-black border-emerald-500'
                          : 'bg-cyan text-background border-cyan'
                        : 'bg-surface text-secondaryText border-tactical-border hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="my-8 grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
              
              <div className="md:col-span-5 bg-surface/80 border border-tactical-border p-5 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-12 h-12 bg-surface border border-tactical-border shrink-0 overflow-hidden">
                    <Image src={currentMatch.teamALogo} alt={currentMatch.teamAName} fill className="object-cover" sizes="48px" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-cyan">[{currentMatch.teamATag}]</span>
                    <h3 className="font-display font-black text-lg text-white uppercase truncate max-w-[200px]">
                      {currentMatch.teamAName}
                    </h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 font-bold uppercase ${
                      currentMatch.teamASide === 'CT' ? 'bg-cyan/20 text-cyan border border-cyan/40' : 'bg-orange/20 text-orange border border-orange/40'
                    }`}>
                      {currentMatch.teamASide || 'CT'} SIDE
                    </span>
                  </div>
                </div>

                <div className="text-center py-4 bg-background/60 border border-tactical-border my-3">
                  <div className="font-display font-black text-6xl text-white">
                    {scoreA}
                  </div>
                  <div className="text-[10px] font-mono text-secondaryText uppercase tracking-wider mt-1">
                    ROUNDS WON
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => handleQuickScore('teamA', 1)}
                    className="py-3 bg-cyan text-background hover:bg-cyan/90 font-display font-black text-sm uppercase flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>WIN ROUND (+1)</span>
                  </button>
                  <button
                    onClick={() => handleQuickScore('teamA', -1)}
                    className="py-3 bg-surface border border-tactical-border text-secondaryText hover:text-white font-display font-black text-xs uppercase flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>CORRECT (-1)</span>
                  </button>
                </div>
              </div>

              <div className="md:col-span-1 flex flex-col items-center justify-center gap-4 py-2">
                <span className="font-display font-black text-xl text-secondaryText">VS</span>
                
                <button
                  onClick={handleSideSwitch}
                  title="Switch Halftime Sides (CT <-> T)"
                  className="p-3 bg-surface border border-tactical-border hover:border-cyan text-secondaryText hover:text-cyan transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>

                <button
                  onClick={handleToggleC4}
                  title="Toggle C4 Planted Emergency Strobe on Stage Projector"
                  className={`p-3 border transition-colors ${
                    currentMatch.c4Planted
                      ? 'bg-rose-600 text-white border-rose-500 animate-bounce'
                      : 'bg-surface border-tactical-border hover:border-rose-500 text-rose-500'
                  }`}
                >
                  <Bomb className="w-5 h-5" />
                </button>
              </div>

              <div className="md:col-span-5 bg-surface/80 border border-tactical-border p-5 relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative w-12 h-12 bg-surface border border-tactical-border shrink-0 overflow-hidden">
                    <Image src={currentMatch.teamBLogo} alt={currentMatch.teamBName} fill className="object-cover" sizes="48px" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-orange">[{currentMatch.teamBTag}]</span>
                    <h3 className="font-display font-black text-lg text-white uppercase truncate max-w-[200px]">
                      {currentMatch.teamBName}
                    </h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 font-bold uppercase ${
                      currentMatch.teamBSide === 'CT' ? 'bg-cyan/20 text-cyan border border-cyan/40' : 'bg-orange/20 text-orange border border-orange/40'
                    }`}>
                      {currentMatch.teamBSide || 'T'} SIDE
                    </span>
                  </div>
                </div>

                <div className="text-center py-4 bg-background/60 border border-tactical-border my-3">
                  <div className="font-display font-black text-6xl text-white">
                    {scoreB}
                  </div>
                  <div className="text-[10px] font-mono text-secondaryText uppercase tracking-wider mt-1">
                    ROUNDS WON
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => handleQuickScore('teamB', 1)}
                    className="py-3 bg-orange text-white hover:bg-orange/90 font-display font-black text-sm uppercase flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>WIN ROUND (+1)</span>
                  </button>
                  <button
                    onClick={() => handleQuickScore('teamB', -1)}
                    className="py-3 bg-surface border border-tactical-border text-secondaryText hover:text-white font-display font-black text-xs uppercase flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span>CORRECT (-1)</span>
                  </button>
                </div>
              </div>

            </div>

            <form onSubmit={handlePublishScore} className="border-t border-tactical-border pt-6 mt-6 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="font-display font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-tactical-gold" /> RATIFY SCORE & UPDATE TOURNAMENT STANDINGS
                </span>
                <span className="text-[11px] text-secondaryText">Updates public scoreboard and database</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-secondaryText uppercase mb-1">
                    {currentMatch.teamATag} SCORE
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={scoreA}
                    onChange={(e) => setScoreA(parseInt(e.target.value) || 0)}
                    className="w-full bg-surface border border-tactical-border p-2.5 text-white focus:outline-none focus:border-cyan text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-secondaryText uppercase mb-1">
                    {currentMatch.teamBTag} SCORE
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={scoreB}
                    onChange={(e) => setScoreB(parseInt(e.target.value) || 0)}
                    className="w-full bg-surface border border-tactical-border p-2.5 text-white focus:outline-none focus:border-cyan text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-secondaryText uppercase mb-1">MATCH MVP (OPTIONAL)</label>
                  <input
                    type="text"
                    value={mvp}
                    onChange={(e) => setMvp(e.target.value)}
                    placeholder="e.g. V3CT0R_99 (Rating: 1.64)"
                    className="w-full bg-surface border border-tactical-border p-2.5 text-white focus:outline-none focus:border-cyan text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {saveSuccess ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> OFFICIAL SCORE RATIFIED & SYNCHRONIZED
                  </span>
                ) : (
                  <span className="text-secondaryText text-[11px]">
                    Projected window updates in real-time. Click below to lock final scores.
                  </span>
                )}

                <Button type="submit" variant="cyan" size="md" icon={<CheckCircle2 className="w-4 h-4" />}>
                  RATIFY & PUBLISH OFFICIAL RESULT
                </Button>
              </div>
            </form>

          </div>
        )}

      </div>
    </AdminLayout>
  );
}
