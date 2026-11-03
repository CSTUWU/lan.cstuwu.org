'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { getStoredTeams } from '@/lib/storage';
import { Team, Player } from '@/lib/types';
import { Search, Shield, Copy, Check, Users, Crosshair, Crown, ArrowRight, LayoutGrid, List } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export default function AdminPlayersPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSteamId, setCopiedSteamId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'team-wise' | 'flat'>('team-wise');

  useEffect(() => {
    setTeams(getStoredTeams());
    const handleUpdate = () => setTeams(getStoredTeams());
    window.addEventListener('cst_teams_updated', handleUpdate);
    return () => window.removeEventListener('cst_teams_updated', handleUpdate);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSteamId(text);
    setTimeout(() => setCopiedSteamId(null), 2000);
  };

  // Filter teams and their players
  const filteredTeams = teams.map((team) => {
    const query = searchQuery.toLowerCase();
    const teamMatches =
      team.name.toLowerCase().includes(query) ||
      team.tag.toLowerCase().includes(query) ||
      team.university.toLowerCase().includes(query);

    const matchingPlayers = team.players.filter(
      (p) =>
        teamMatches ||
        (p.ign || '').toLowerCase().includes(query) ||
        p.name.toLowerCase().includes(query) ||
        (p.faculty || '').toLowerCase().includes(query) ||
        (p.steamId || '').toLowerCase().includes(query)
    );

    return {
      team,
      matchingPlayers,
      isRelevant: teamMatches || matchingPlayers.length > 0,
    };
  }).filter((item) => (searchQuery ? item.isRelevant : true));

  // Flat list for alternate view
  const allFlatPlayers: { player: Player; team: Team }[] = [];
  teams.forEach((t) => {
    t.players.forEach((p) => {
      allFlatPlayers.push({ player: p, team: t });
    });
  });

  const filteredFlatPlayers = allFlatPlayers.filter(
    ({ player, team }) =>
      (player.ign || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (player.faculty && player.faculty.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (player.steamId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-tactical-border">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <Badge variant="cyan" size="sm">PLAYER ROSTER BY SQUAD</Badge>
              <span className="text-[11px] font-mono text-secondaryText">{"// TEAM-WISE VERIFICATION"}</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase text-white tracking-wider">
              ATHLETE ROSTER & STEAM IDS (TEAM-WISE)
            </h1>
            <p className="text-xs font-mono text-secondaryText">
              Every participating athlete grouped strictly by collegiate squad for tournament eligibility check.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex border border-tactical-border bg-surface text-xs font-mono">
              <button
                onClick={() => setViewMode('team-wise')}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                  viewMode === 'team-wise' ? 'bg-cyan text-background font-bold' : 'text-secondaryText hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>TEAM-WISE (RECOMMENDED)</span>
              </button>
              <button
                onClick={() => setViewMode('flat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border-l border-tactical-border ${
                  viewMode === 'flat' ? 'bg-cyan text-background font-bold' : 'text-secondaryText hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>ALL PLAYERS LIST</span>
              </button>
            </div>

            <Link
              href="/admin/teams"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-tactical-border hover:border-cyan text-cyan text-xs font-mono transition-colors"
            >
              <span>MANAGE TEAMS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="bg-card/90 border border-tactical-border p-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-secondaryText absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by athlete IGN, real name, Steam ID, or squad tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-tactical-border pl-10 pr-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan"
            />
          </div>
        </div>

        {/* VIEW MODE 1: TEAM-WISE (USER REQUIREMENT) */}
        {viewMode === 'team-wise' ? (
          <div className="space-y-6">
            {filteredTeams.map(({ team, matchingPlayers }) => (
              <div
                key={team.id}
                className="bg-card/90 border border-tactical-border p-5 backdrop-blur-md"
              >
                {/* Team Sub-Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-tactical-border/70 gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 bg-surface border border-tactical-border shrink-0 overflow-hidden">
                      <Image src={team.logo} alt={team.name} fill className="object-cover" sizes="40px" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-cyan font-bold">[{team.tag}]</span>
                        <h3 className="font-display font-bold text-base text-white uppercase tracking-wider">
                          {team.name}
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-secondaryText">{team.university}</span>
                    </div>
                  </div>

                  <div className="text-xs font-mono flex items-center gap-3">
                    <span className="text-secondaryText">
                      CAPTAIN: <strong className="text-white">{team.captain.name}</strong> ({team.captain.phone})
                    </span>
                    <span className={`px-2 py-0.5 uppercase text-[10px] font-bold border ${
                      team.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-tactical-gold/10 text-tactical-gold border-tactical-gold/30'
                    }`}>
                      {team.status}
                    </span>
                  </div>
                </div>

                {/* Team's Athletes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {matchingPlayers.map((player, idx) => (
                    <div
                      key={player.id || idx}
                      className="bg-surface/80 border border-tactical-border p-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-mono text-cyan font-bold">SLOT 0{idx + 1}</span>
                          <span className="text-[9px] font-mono text-secondaryText bg-card px-1 py-0.5 border border-tactical-border truncate max-w-[80px]">
                            {player.role || 'Rifler'}
                          </span>
                        </div>
                        <div className="font-display font-black text-sm text-white truncate mb-0.5">
                          {player.name || player.ign}
                        </div>
                        <div className="text-[11px] font-mono text-cyan truncate mb-2">
                          {player.faculty || (player.ign ? player.name : '')}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-tactical-border/60">
                        {player.steamId ? (
                          <div className="flex items-center justify-between gap-1 bg-card px-1.5 py-1 border border-tactical-border">
                            <span className="text-[9px] font-mono text-cyan truncate select-all">
                              {player.steamId}
                            </span>
                            <button
                              onClick={() => copyToClipboard(player.steamId!)}
                              className="text-secondaryText hover:text-white shrink-0"
                              title="Copy Steam ID"
                            >
                              {copiedSteamId === player.steamId ? (
                                <Check className="w-2.5 h-2.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-2.5 h-2.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="text-[9px] font-mono text-secondaryText truncate">
                            {player.faculty}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filteredTeams.length === 0 && (
              <div className="bg-card/90 border border-tactical-border p-12 text-center text-secondaryText font-mono text-xs">
                No matching squads or athletes found.
              </div>
            )}
          </div>
        ) : (
          /* FLAT TABLE VIEW (ALTERNATIVE) */
          <div className="bg-card/90 border border-tactical-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="bg-surface/80 border-b border-tactical-border text-secondaryText text-[10px] uppercase">
                    <th className="py-3 px-4">PLAYER NAME</th>
                    <th className="py-3 px-4">FACULTY</th>
                    <th className="py-3 px-4">STEAM / IGN</th>
                    <th className="py-3 px-4">SQUAD</th>
                    <th className="py-3 px-4">ROLE</th>
                    <th className="py-3 px-4">STUDENT EMAIL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tactical-border/60">
                  {filteredFlatPlayers.map(({ player, team }, idx) => (
                    <tr key={`${player.id}-${idx}`} className="hover:bg-surface/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-white text-sm">{player.name || player.ign}</span>
                      </td>
                      <td className="py-3 px-4 text-cyan">{player.faculty || '—'}</td>
                      <td className="py-3 px-4 text-secondaryText">{player.steamId || player.ign || '—'}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] text-cyan">[{team.tag}]</span> {team.name}
                      </td>
                      <td className="py-3 px-4 text-secondaryText">{player.role || 'Player'}</td>
                      <td className="py-3 px-4 text-secondaryText">{player.email || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
