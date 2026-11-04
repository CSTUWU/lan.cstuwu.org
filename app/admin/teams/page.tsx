'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { getStoredTeams, updateTeamStatus } from '@/lib/storage';
import { api } from '@/lib/api';
import { transformBackendTeam } from '@/lib/transformers';
import { Team, ApprovalStatus, Player } from '@/lib/types';
import {
  Users,
  Search,
  CheckCircle2,
  Clock,
  Shield,
  Crown,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Crosshair,
  Award,
  Filter,
  RefreshCw,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({});
  const [copiedSteamId, setCopiedSteamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const loadTeams = async () => {
    const local = getStoredTeams();
    setTeams(local);

    try {
      const res = await api.admin.getTeams();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const transformed = res.data.map(transformBackendTeam);
        setTeams(transformed);
        
        const expandedMap: Record<string, boolean> = {};
        transformed.forEach((t) => {
          expandedMap[t.id] = true;
        });
        setExpandedTeams(expandedMap);
        return;
      }
    } catch (e) {
      // Backend offline: use local storage
    }

    const initialExpanded: Record<string, boolean> = {};
    local.forEach((t) => {
      initialExpanded[t.id] = true;
    });
    setExpandedTeams(initialExpanded);
  };

  useEffect(() => {
    loadTeams();

    const handleUpdate = () => setTeams(getStoredTeams());
    window.addEventListener('cst_teams_updated', handleUpdate);
    return () => window.removeEventListener('cst_teams_updated', handleUpdate);
  }, []);

  const toggleExpand = (teamId: string) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  const handleExpandAll = (expand: boolean) => {
    const updated: Record<string, boolean> = {};
    teams.forEach((t) => {
      updated[t.id] = expand;
    });
    setExpandedTeams(updated);
  };

  const handleStatusToggle = async (teamId: string, currentStatus: ApprovalStatus) => {
    const nextStatus: ApprovalStatus = currentStatus === 'approved' ? 'pending' : 'approved';
    const isActive = nextStatus === 'approved';

    try {
      await api.admin.toggleTeamStatus(teamId, isActive);
      setNotice(`Squad status updated on database: ${nextStatus.toUpperCase()}`);
    } catch (e) {
      setNotice(`Squad status updated locally: ${nextStatus.toUpperCase()}`);
    }

    updateTeamStatus(teamId, nextStatus);
    setTimeout(() => setNotice(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSteamId(text);
    setTimeout(() => setCopiedSteamId(null), 2000);
  };

  const filteredTeams = teams.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.captain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.players.some(
        (p) =>
          (p.ign || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.faculty || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.steamId || '').toLowerCase().includes(searchQuery.toLowerCase())
      );

    if (statusFilter === 'approved') return matchesSearch && t.status === 'approved';
    if (statusFilter === 'pending') return matchesSearch && t.status === 'pending';
    return matchesSearch;
  });

  const totalPlayersCount = teams.reduce((acc, t) => acc + t.players.length, 0);
  const approvedCount = teams.filter((t) => t.status === 'approved').length;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-tactical-border">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <Badge variant="cyan" size="sm">TEAM-WISE SQUAD DIRECTORY</Badge>
              <span className="text-[11px] font-mono text-secondaryText">{"// COMPLETE ROSTER DOSSIER"}</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase text-white tracking-wider">
              SQUADS & MEMBER DETAILS (TEAM-WISE)
            </h1>
            <p className="text-xs font-mono text-secondaryText">
              Official roster management: view team captains, 5 starting athletes, and substitutes grouped by squad.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setLoading(true);
                loadTeams().finally(() => setLoading(false));
              }}
              className="px-3 py-2 bg-surface border border-tactical-border text-xs font-mono text-cyan hover:border-cyan transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>REFRESH</span>
            </button>
            <button
              onClick={() => handleExpandAll(true)}
              className="px-3 py-2 bg-surface border border-tactical-border text-xs font-mono text-secondaryText hover:text-white transition-colors"
            >
              EXPAND ALL
            </button>
            <button
              onClick={() => handleExpandAll(false)}
              className="px-3 py-2 bg-surface border border-tactical-border text-xs font-mono text-secondaryText hover:text-white transition-colors"
            >
              COLLAPSE ALL
            </button>
          </div>
        </div>

        {notice && (
          <div className="p-3 bg-cyan/10 border border-cyan/40 text-xs font-mono text-cyan flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan" />
            <span>{notice}</span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card/90 border border-tactical-border p-4">
            <div className="text-[10px] font-mono text-secondaryText uppercase tracking-wider">TOTAL TEAMS</div>
            <div className="font-display font-black text-2xl sm:text-3xl text-white mt-1">{teams.length}</div>
          </div>
          <div className="bg-card/90 border border-emerald-500/40 p-4">
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">APPROVED SQUADS</div>
            <div className="font-display font-black text-2xl sm:text-3xl text-emerald-400 mt-1">{approvedCount}</div>
          </div>
          <div className="bg-card/90 border border-tactical-border p-4">
            <div className="text-[10px] font-mono text-secondaryText uppercase tracking-wider">TOTAL REGISTERED PLAYERS</div>
            <div className="font-display font-black text-2xl sm:text-3xl text-cyan mt-1">{totalPlayersCount}</div>
          </div>
          <div className="bg-card/90 border border-tactical-border p-4">
            <div className="text-[10px] font-mono text-secondaryText uppercase tracking-wider">AVERAGE ROSTER SIZE</div>
            <div className="font-display font-black text-2xl sm:text-3xl text-orange mt-1">
              {teams.length > 0 ? (totalPlayersCount / teams.length).toFixed(1) : '5.0'}
            </div>
          </div>
        </div>

        <div className="bg-card/90 border border-tactical-border p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-secondaryText absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team, IGN, player real name, Steam ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-tactical-border pl-10 pr-4 py-2 text-xs font-mono text-white placeholder-secondaryText/60 focus:outline-none focus:border-cyan"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-mono text-secondaryText uppercase flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5" /> STATUS:
            </span>
            {(['all', 'approved', 'pending'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 text-xs font-mono uppercase font-bold tracking-wider transition-colors border ${
                  statusFilter === filter
                    ? 'bg-cyan text-background border-cyan'
                    : 'bg-surface text-secondaryText border-tactical-border hover:text-white'
                }`}
              >
                {filter} ({filter === 'all' ? teams.length : teams.filter((t) => t.status === filter).length})
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredTeams.length === 0 ? (
            <div className="bg-card/80 border border-tactical-border p-12 text-center">
              <p className="font-mono text-sm text-secondaryText">No squads match your query criteria.</p>
            </div>
          ) : (
            filteredTeams.map((team) => {
              const isExpanded = !!expandedTeams[team.id];
              const isApproved = team.status === 'approved';

              return (
                <div
                  key={team.id}
                  className={`bg-card/90 border transition-all duration-200 overflow-hidden ${
                    isApproved ? 'border-tactical-border hover:border-cyan/40' : 'border-tactical-gold/40'
                  }`}
                >
                  {/* Squad Header Bar (Click to toggle accordion) */}
                  <div
                    onClick={() => toggleExpand(team.id)}
                    className="p-4 sm:p-5 bg-surface/40 hover:bg-surface/70 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors select-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 bg-surface border border-tactical-border shrink-0 overflow-hidden">
                        <Image src={team.logo} alt={team.name} fill className="object-cover" sizes="48px" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-cyan">[{team.tag}]</span>
                          <h3 className="font-display font-black text-lg text-white uppercase tracking-wider">
                            {team.name}
                          </h3>
                        </div>
                        <p className="text-xs font-mono text-secondaryText">
                          {team.university} • {team.players.length} Active Players
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto" onClick={(e) => e.stopPropagation()}>
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-1 uppercase tracking-wider border ${
                          isApproved
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-tactical-gold/10 text-tactical-gold border-tactical-gold/30'
                        }`}
                      >
                        {team.status.toUpperCase()}
                      </span>

                      <button
                        onClick={() => handleStatusToggle(team.id, team.status)}
                        className={`px-3 py-1 text-xs font-mono uppercase font-bold border transition-colors ${
                          isApproved
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500 hover:text-white'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500 hover:text-black'
                        }`}
                      >
                        {isApproved ? 'DEACTIVATE' : 'ACTIVATE SQUAD'}
                      </button>

                      <button
                        onClick={() => toggleExpand(team.id)}
                        className="p-1.5 text-secondaryText hover:text-white border border-tactical-border bg-surface"
                        title={isExpanded ? 'Collapse Roster' : 'Expand Roster'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-cyan" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 sm:p-6 border-t border-tactical-border bg-card/60 space-y-6">
                      
                      <div className="p-4 bg-cyan/5 border border-cyan/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan/20 border border-cyan/60 flex items-center justify-center shrink-0">
                            <Crown className="w-4 h-4 text-cyan" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-cyan uppercase font-bold tracking-widest block">
                              TEAM CAPTAIN & POINT OF CONTACT
                            </span>
                            <span className="font-display font-bold text-sm text-white uppercase tracking-wider">
                              {team.captain.name}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-secondaryText">
                          <a
                            href={`mailto:${team.captain.email}`}
                            className="flex items-center gap-1.5 text-white hover:text-cyan transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 text-cyan" />
                            <span>{team.captain.email}</span>
                          </a>
                          <a
                            href={`tel:${team.captain.phone}`}
                            className="flex items-center gap-1.5 text-white hover:text-cyan transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-cyan" />
                            <span>{team.captain.phone}</span>
                          </a>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2">
                            <Crosshair className="w-3.5 h-3.5 text-cyan" />
                            <span>STARTING LINEUP (5 ATHLETES)</span>
                          </h4>
                          <span className="text-[11px] font-mono text-secondaryText">CS2 COMPETITIVE ROSTER</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                          {team.players.map((player: Player, index: number) => (
                            <div
                              key={player.id || index}
                              className="p-3 bg-surface/70 border border-tactical-border hover:border-cyan/50 transition-colors flex flex-col justify-between"
                            >
                              <div>
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-[10px] font-mono font-bold text-cyan">SLOT 0{index + 1}</span>
                                  <span className="text-[10px] font-mono text-secondaryText uppercase">
                                    {player.role || 'Rifler'}
                                  </span>
                                </div>
                                
                                <div className="font-display font-black text-base text-white truncate" title={player.name || player.ign}>
                                  {player.name || player.ign}
                                </div>

                                <div className="text-xs font-mono text-cyan truncate mt-0.5" title={player.faculty || player.name}>
                                  {player.faculty || (player.ign ? `(${player.ign})` : '')}
                                </div>
                              </div>

                              <div className="mt-3 pt-2.5 border-t border-tactical-border/60 flex items-center justify-between text-[11px] font-mono">
                                <span className="text-secondaryText truncate max-w-[120px]" title={player.steamId || player.faculty}>
                                  {player.steamId || player.faculty}
                                </span>
                                {player.steamId && (
                                  <button
                                    onClick={() => copyToClipboard(player.steamId!)}
                                    className="text-cyan hover:text-white transition-colors ml-1 shrink-0"
                                    title="Copy Steam ID"
                                  >
                                    {copiedSteamId === player.steamId ? (
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                      <Copy className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
