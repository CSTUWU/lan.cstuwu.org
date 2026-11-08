'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  getStoredTeams,
  getStoredMatches,
  createMatch,
  generateAndStorePlayoffBracket,
  createAndSeedPlayoffTree,
} from '@/lib/storage';
import { api } from '@/lib/api';
import { transformBackendMatch, transformBackendTeam } from '@/lib/transformers';
import { Team, Match, CS2Map, MatchStatus } from '@/lib/types';
import { Swords, Plus, Calendar, Clock, MapPin, CheckCircle2, Shield, RefreshCw, Trophy, GitBranch } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function AdminMatchesPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Form State
  const [teamAId, setTeamAId] = useState('');
  const [teamBId, setTeamBId] = useState('');
  const [map, setMap] = useState<CS2Map>('Mirage');
  const [dateTime, setDateTime] = useState('2026-11-20T14:00:00');
  const [stage, setStage] = useState('Quarterfinal Match');
  const [status, setStatus] = useState<MatchStatus>('upcoming');

  const loadData = async () => {
    setTeams(getStoredTeams());
    setMatches(getStoredMatches());

    try {
      const [resTeams, resMatches] = await Promise.all([
        api.admin.getTeams().catch(() => null),
        api.admin.getMatches().catch(() => null),
      ]);

      if (resTeams?.success && Array.isArray(resTeams.data) && resTeams.data.length > 0) {
        setTeams(resTeams.data.map(transformBackendTeam));
      }

      if (resMatches?.success && Array.isArray(resMatches.data) && resMatches.data.length > 0) {
        setMatches(resMatches.data.map(transformBackendMatch));
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

    // Backend payload
    const backendData = {
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
    };

    try {
      await api.admin.createMatch(backendData);
      setNotice(`Fixture created on tournament database: ${teamA.tag} vs ${teamB.tag}`);
    } catch (err) {
      console.warn('Backend match creation fallback to local', err);
      setNotice(`Fixture saved locally: ${teamA.tag} vs ${teamB.tag}`);
    }

    // Save locally
    createMatch({
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
    });

    setShowCreateModal(false);
    setTimeout(() => setNotice(null), 3000);
    loadData();
  };

  const handleAutoGeneratePlayoffs = async () => {
    const candidateTeams = teams.filter((t) => (t.status || '').toLowerCase() !== 'rejected');
    if (candidateTeams.length < 2) {
      alert(`At least 2 teams are required to create the playoff bracket (Currently: ${candidateTeams.length} squads). Please enlist or approve squads first.`);
      return;
    }
    const isEightSquad = candidateTeams.length <= 8;
    const confirmSeed = window.confirm(
      `CREATE PLAYOFF TREE from ${candidateTeams.length} registered squads?\n\n` +
      (isEightSquad
        ? `• 8-TEAM DUAL-WING BRACKET:\n` +
          `  - Left Wing: 4 squads (2 Quarterfinal matches)\n` +
          `  - Right Wing: 4 squads (2 Quarterfinal matches)\n` +
          `  - Round 2 (Semifinals) and Grand Final will be completely free.\n`
        : `• 16-TEAM DUAL-WING BRACKET:\n` +
          `  - Left Wing: 8 squads (4 Round of 16 matches)\n` +
          `  - Right Wing: 8 squads (4 Round of 16 matches)\n` +
          `  - Round 2 (Quarterfinals), Semifinals & Grand Final will be completely free.\n`) +
      `• Match wins will automatically advance winners down the tree to the trophy!`
    );
    if (!confirmSeed) return;

    setLoading(true);
    try {
      createAndSeedPlayoffTree(candidateTeams);
      setNotice(
        `✓ ${isEightSquad ? '8-Squad Dual-Wing' : '16-Squad Major'} Playoff Tree created! Seeded with ${candidateTeams.length} squads; downstream rounds are free.`
      );
      try {
        await api.admin.generatePlayoffs().catch(() => null);
      } catch (e) {}
    } catch (e) {
      createAndSeedPlayoffTree(candidateTeams);
      setNotice('✓ Playoff tree created locally.');
    } finally {
      await loadData();
      setLoading(false);
      setTimeout(() => setNotice(null), 5000);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-tactical-border">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <Badge variant="orange" size="sm">FIXTURE CONTROL</Badge>
              <span className="text-[11px] font-mono text-secondaryText">{`// ${matches.length} FIXTURES`}</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase text-white tracking-wider">
              MATCH SCHEDULING & MANAGEMENT
            </h1>
            <p className="text-xs font-mono text-secondaryText">
              Coordinate team pairings, designate CS2 maps, and schedule auditorium stage rounds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setLoading(true);
                loadData().finally(() => setLoading(false));
              }}
              className="p-2 bg-surface border border-tactical-border text-cyan hover:border-cyan transition-colors"
              title="Refresh matches"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Button
              onClick={handleAutoGeneratePlayoffs}
              variant="orange"
              size="md"
              icon={<Trophy className="w-4 h-4 text-background" />}
            >
              CREATE PLAYOFF TREE
            </Button>
            <Button
              onClick={() => setShowCreateModal(true)}
              variant="cyan"
              size="md"
              icon={<Plus className="w-4 h-4" />}
            >
              CREATE NEW FIXTURE
            </Button>
          </div>
        </div>

        {notice && (
          <div className="p-3 bg-cyan/10 border border-cyan/40 text-xs font-mono text-cyan flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan" />
            <span>{notice}</span>
          </div>
        )}

        <div className="space-y-4">
          {matches.map((m) => (
            <div
              key={m.id}
              className="bg-card/90 border border-tactical-border p-5 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan px-2 py-0.5 bg-surface border border-cyan/30 inline-block mb-1">
                  {m.stage}
                </span>
                <div className="text-xs font-mono text-white font-bold flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-orange" />
                  {new Date(m.dateTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-[11px] font-mono text-secondaryText mt-0.5">
                  MAP: <strong className="text-white">{m.map}</strong>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2.5 text-right">
                  <div>
                    <span className="text-[10px] font-mono text-cyan block">[{m.teamATag}]</span>
                    <span className="font-display font-bold text-base text-white uppercase">{m.teamAName}</span>
                  </div>
                  <div className="relative w-10 h-10 bg-surface border border-tactical-border shrink-0 overflow-hidden">
                    <Image src={m.teamALogo} alt={m.teamAName} fill className="object-cover" sizes="40px" />
                  </div>
                </div>

                <div className="px-3 py-1.5 bg-surface border border-tactical-border font-display font-black text-lg">
                  {m.status === 'completed' ? `${m.scoreA} : ${m.scoreB}` : 'VS'}
                </div>

                <div className="flex items-center gap-2.5 text-left">
                  <div className="relative w-10 h-10 bg-surface border border-tactical-border shrink-0 overflow-hidden">
                    <Image src={m.teamBLogo} alt={m.teamBName} fill className="object-cover" sizes="40px" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-orange block">[{m.teamBTag}]</span>
                    <span className="font-display font-bold text-base text-white uppercase">{m.teamBName}</span>
                  </div>
                </div>
              </div>

              <div className="text-right flex items-center gap-3">
                <span className={`text-[10px] font-mono uppercase font-bold px-2.5 py-1 border ${
                  m.status === 'completed'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : m.status === 'live'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                    : 'bg-cyan/10 text-cyan border-cyan/30'
                }`}>
                  {m.status}
                </span>

                <Button href="/admin/scoreboard" variant="outline" size="sm">
                  SCORE
                </Button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md">
          <div className="relative bg-card border border-cyan/50 max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <h2 className="font-display font-black text-xl text-white uppercase tracking-wider mb-4 border-b border-tactical-border pb-3">
              SCHEDULE NEW CS2 FIXTURE
            </h2>

            <form onSubmit={handleCreateMatch} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-secondaryText uppercase mb-1">TEAM A (CT SEED)</label>
                <select
                  value={teamAId}
                  onChange={(e) => setTeamAId(e.target.value)}
                  className="w-full bg-surface border border-tactical-border p-2.5 text-white focus:outline-none focus:border-cyan"
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
                <label className="block text-secondaryText uppercase mb-1">TEAM B (T SEED)</label>
                <select
                  value={teamBId}
                  onChange={(e) => setTeamBId(e.target.value)}
                  className="w-full bg-surface border border-tactical-border p-2.5 text-white focus:outline-none focus:border-cyan"
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
                  <label className="block text-secondaryText uppercase mb-1">CS2 MAP</label>
                  <select
                    value={map}
                    onChange={(e) => setMap(e.target.value as CS2Map)}
                    className="w-full bg-surface border border-tactical-border p-2.5 text-white focus:outline-none focus:border-cyan"
                  >
                    <option value="Mirage">Mirage</option>
                    <option value="Dust II">Dust II</option>
                    <option value="Inferno">Inferno</option>
                    <option value="Ancient">Ancient</option>
                    <option value="Nuke">Nuke</option>
                    <option value="Anubis">Anubis</option>
                    <option value="Vertigo">Vertigo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-secondaryText uppercase mb-1">STAGE / ROUND</label>
                  <input
                    type="text"
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    placeholder="e.g. Upper Semifinal 1"
                    className="w-full bg-surface border border-tactical-border p-2.5 text-white focus:outline-none focus:border-cyan"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-secondaryText uppercase mb-1">MATCH DATE & TIME</label>
                <input
                  type="datetime-local"
                  value={dateTime.slice(0, 16)}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full bg-surface border border-tactical-border p-2.5 text-white focus:outline-none focus:border-cyan"
                  required
                />
              </div>

              <div className="pt-4 border-t border-tactical-border flex justify-end gap-3">
                <Button type="button" onClick={() => setShowCreateModal(false)} variant="ghost" size="sm">
                  CANCEL
                </Button>
                <Button type="submit" variant="cyan" size="sm">
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
