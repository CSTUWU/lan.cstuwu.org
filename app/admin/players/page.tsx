'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { getStoredTeams, setStoredTeams } from '@/lib/storage';
import { api } from '@/lib/api';
import { transformBackendTeam } from '@/lib/transformers';
import { Team, Player } from '@/lib/types';
import { Search, Shield, Copy, Check, Users, Crosshair, Crown, ArrowRight, LayoutGrid, List, FileSpreadsheet, Download } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { downloadTeamWiseExcel, downloadAllMembersExcel } from '@/lib/exportExcel';

export default function AdminPlayersPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSteamId, setCopiedSteamId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'team-wise' | 'flat'>('team-wise');

  useEffect(() => {
    const loadData = async () => {
      setTeams(getStoredTeams());
      try {
        const res = await api.admin.getTeams();
        if (res.success && Array.isArray(res.data)) {
          const transformed = res.data.map(transformBackendTeam);
          setTeams(transformed);
          setStoredTeams(transformed);
        }
      } catch (e) {
        // Backend offline: use local state
      }
    };

    loadData();
    const handleUpdate = () => setTeams(getStoredTeams());
    window.addEventListener('cst_teams_updated', handleUpdate);
    return () => window.removeEventListener('cst_teams_updated', handleUpdate);
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSteamId(text);
    setTimeout(() => setCopiedSteamId(null), 2000);
  };

  const filteredTeams = (teams || []).map((team) => {
    if (!team) return { team: {} as Team, matchingPlayers: [], isRelevant: false };
    const query = searchQuery.toLowerCase();
    const teamMatches =
      (team.name || '').toLowerCase().includes(query) ||
      (team.tag || '').toLowerCase().includes(query) ||
      (team.university || '').toLowerCase().includes(query) ||
      (team.degreeProgram || '').toLowerCase().includes(query) ||
      (team.captain?.name || '').toLowerCase().includes(query);

    const matchingPlayers = (team.players || []).filter(
      (p) =>
        teamMatches ||
        (p?.ign || '').toLowerCase().includes(query) ||
        (p?.name || '').toLowerCase().includes(query) ||
        (p?.faculty || '').toLowerCase().includes(query) ||
        (p?.degreeProgram || '').toLowerCase().includes(query) ||
        (p?.enrollmentNumber || '').toLowerCase().includes(query) ||
        (p?.steamId || '').toLowerCase().includes(query)
    );

    return {
      team,
      matchingPlayers,
      isRelevant: teamMatches || matchingPlayers.length > 0,
    };
  }).filter((item) => (searchQuery ? item.isRelevant : true));

  const allFlatPlayers: { player: Player; team: Team }[] = [];
  (teams || []).forEach((t) => {
    (t.players || []).forEach((p) => {
      allFlatPlayers.push({ player: p, team: t });
    });
  });

  const filteredFlatPlayers = allFlatPlayers.filter(
    ({ player, team }) =>
      (player?.ign || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (player?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (player?.faculty || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (player?.degreeProgram || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (player?.enrollmentNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (player?.steamId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team?.tag || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gunmetal">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <Badge variant="olive" size="sm">OPERATIVE ROSTER BY SQUAD</Badge>
              <span className="text-[11px] font-mono text-mutedKhaki">{"// TEAM-WISE VERIFICATION"}</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase text-tacticalWhite tracking-wider">
              OPERATIVE ROSTER & CALLSIGNS (TEAM-WISE)
            </h1>
            <p className="text-xs font-mono text-mutedKhaki">
              Every participating operative grouped strictly by collegiate squad for tournament eligibility check.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex border border-gunmetal bg-surface text-xs font-mono">
              <button
                onClick={() => setViewMode('team-wise')}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors ${
                  viewMode === 'team-wise' ? 'bg-olive text-tacticalWhite font-bold' : 'text-mutedKhaki hover:text-tacticalWhite'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5 text-sand" />
                <span>TEAM-WISE (RECOMMENDED)</span>
              </button>
              <button
                onClick={() => setViewMode('flat')}
                className={`flex items-center gap-1.5 px-3 py-1.5 transition-colors border-l border-gunmetal ${
                  viewMode === 'flat' ? 'bg-olive text-tacticalWhite font-bold' : 'text-mutedKhaki hover:text-tacticalWhite'
                }`}
              >
                <List className="w-3.5 h-3.5 text-sand" />
                <span>ALL OPERATIVES LIST</span>
              </button>
            </div>

            <button
              onClick={() => downloadTeamWiseExcel(teams)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-gunmetal hover:border-olive text-tacticalWhite hover:text-sand text-xs font-mono transition-colors"
              title="Download Team-Wise Roster Excel Spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>TEAM-WISE EXCEL</span>
            </button>

            <button
              onClick={() => downloadAllMembersExcel(teams)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-gunmetal hover:border-olive text-tacticalWhite hover:text-sand text-xs font-mono transition-colors"
              title="Download Master All Members List Excel Spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-sand" />
              <span>ALL MEMBERS EXCEL</span>
            </button>

            <Link
              href="/admin/teams"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-gunmetal hover:border-sand text-sand text-xs font-mono transition-colors"
            >
              <span>MANAGE TEAMS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="bg-card/90 border border-gunmetal p-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-mutedKhaki absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by operative IGN, real name, callsign, or squad tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-gunmetal pl-10 pr-4 py-2 text-xs font-mono text-tacticalWhite focus:outline-none focus:border-olive"
            />
          </div>
        </div>

        {viewMode === 'team-wise' ? (
          <div className="space-y-6">
            {filteredTeams.map(({ team, matchingPlayers }) => (
              <div
                key={team.id}
                className="bg-card/90 border border-gunmetal p-5 backdrop-blur-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gunmetal/70 gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 bg-surface border border-gunmetal shrink-0 overflow-hidden">
                      <Image src={team.logo} alt={team.name} fill className="object-cover" sizes="40px" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-sand font-bold">[{team.tag}]</span>
                        <h3 className="font-display font-bold text-base text-tacticalWhite uppercase tracking-wider">
                          {team.name}
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-mutedKhaki">{team.degreeProgram || team.faculty || team.university}</span>
                    </div>
                  </div>

                  <div className="text-xs font-mono flex items-center gap-3">
                    <span className="text-mutedKhaki">
                      LEADER: <strong className="text-tacticalWhite">{team.captain?.name || 'Squad Leader'}</strong> ({team.captain?.phone || team.captain?.whatsappNumber || '—'})
                    </span>
                    <span className={`px-2 py-0.5 uppercase text-[10px] font-bold border ${
                      team.status === 'approved' ? 'bg-olive/20 text-sand border-olive' : 'bg-sand/10 text-sand border-sand/40'
                    }`}>
                      {team.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {matchingPlayers.map((player, idx) => (
                    <div
                      key={player.id || idx}
                      className="bg-surface/80 border border-gunmetal p-3 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] font-mono text-sand font-bold">SLOT 0{idx + 1}</span>
                          <span className="text-[9px] font-mono text-mutedKhaki bg-card px-1 py-0.5 border border-gunmetal truncate max-w-[80px]">
                            {player.role || 'Operative'}
                          </span>
                        </div>
                        <div className="font-display font-black text-sm text-tacticalWhite truncate mb-0.5">
                          {player.name || player.ign}
                        </div>
                        <div className="text-[11px] font-mono text-sand truncate mb-2">
                          {player.faculty || (player.ign ? player.name : '')}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gunmetal/60">
                        {player.steamId ? (
                          <div className="flex items-center justify-between gap-1 bg-card px-1.5 py-1 border border-gunmetal">
                            <span className="text-[9px] font-mono text-sand truncate select-all">
                              {player.steamId}
                            </span>
                            <button
                              onClick={() => copyToClipboard(player.steamId!)}
                              className="text-mutedKhaki hover:text-tacticalWhite shrink-0"
                              title="Copy Callsign / ID"
                            >
                              {copiedSteamId === player.steamId ? (
                                <Check className="w-2.5 h-2.5 text-sand" />
                              ) : (
                                <Copy className="w-2.5 h-2.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="text-[9px] font-mono text-mutedKhaki truncate">
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
              <div className="bg-card/90 border border-gunmetal p-12 text-center text-mutedKhaki font-mono text-xs">
                No matching squads or operatives found.
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card/90 border border-gunmetal overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="bg-surface/80 border-b border-gunmetal text-mutedKhaki text-[10px] uppercase">
                    <th className="py-3 px-4">OPERATIVE NAME</th>
                    <th className="py-3 px-4">FACULTY</th>
                    <th className="py-3 px-4">CALLSIGN / IGN</th>
                    <th className="py-3 px-4">SQUAD</th>
                    <th className="py-3 px-4">ROLE</th>
                    <th className="py-3 px-4">STUDENT EMAIL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gunmetal/60">
                  {filteredFlatPlayers.map(({ player, team }, idx) => (
                    <tr key={`${player.id}-${idx}`} className="hover:bg-surface/40 transition-colors">
                      <td className="py-3 px-4">
                        <span className="font-bold text-tacticalWhite text-sm">{player.name || player.ign}</span>
                      </td>
                      <td className="py-3 px-4 text-sand">{player.faculty || '—'}</td>
                      <td className="py-3 px-4 text-mutedKhaki">{player.steamId || player.ign || '—'}</td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] text-sand">[{team.tag}]</span> {team.name}
                      </td>
                      <td className="py-3 px-4 text-mutedKhaki">{player.role || 'Operative'}</td>
                      <td className="py-3 px-4 text-mutedKhaki">{player.email || '—'}</td>
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
