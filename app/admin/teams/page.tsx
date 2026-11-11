'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { getStoredTeams, setStoredTeams, updateTeamStatus, createAndSeedPlayoffTree, recreatePlayoffTree, isPlayoffTreePublished, setPlayoffTreePublished } from '@/lib/storage';
import { api } from '@/lib/api';
import { transformBackendTeam } from '@/lib/transformers';
import { Team, ApprovalStatus, Player } from '@/lib/types';
import { extractDegreeFromEnrollment, validateSquadEnrollmentDegrees } from '@/lib/degreeUtils';
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
  Trophy,
  FileSpreadsheet,
  Download,
  Lock,
  Radio,
  RotateCcw,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { downloadTeamWiseExcel, downloadAllMembersExcel } from '@/lib/exportExcel';

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [expandedTeams, setExpandedTeams] = useState<Record<string, boolean>>({});
  const [copiedSteamId, setCopiedSteamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [isTreePublished, setIsTreePublished] = useState<boolean>(() => isPlayoffTreePublished());

  const loadTeams = async () => {
    setLoading(true);
    try {
      const [res, resSettings] = await Promise.allSettled([
        api.admin.getTeams(),
        api.public.getSettings(),
      ]);

      if (res.status === 'fulfilled' && res.value?.success && Array.isArray(res.value.data)) {
        const transformed = res.value.data.map(transformBackendTeam);
        setTeams(transformed);
        
        const expandedMap: Record<string, boolean> = {};
        transformed.forEach((t) => {
          expandedMap[t.id] = true;
        });
        setExpandedTeams(expandedMap);
      }

      if (resSettings.status === 'fulfilled' && resSettings.value?.data?.playoffTreePublished !== undefined) {
        setIsTreePublished(Boolean(resSettings.value.data.playoffTreePublished));
        setPlayoffTreePublished(Boolean(resSettings.value.data.playoffTreePublished));
      }
    } catch (e: any) {
      console.error('Failed to load teams from database:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsTreePublished(isPlayoffTreePublished());
    loadTeams();

    const handlePubChange = (e?: Event) => {
      const customEvent = e as CustomEvent<{ published: boolean }>;
      if (typeof customEvent?.detail?.published === 'boolean') {
        setIsTreePublished(customEvent.detail.published);
      } else {
        setIsTreePublished(isPlayoffTreePublished());
      }
    };
    window.addEventListener('cst_playoff_published_changed', handlePubChange);
    return () => window.removeEventListener('cst_playoff_published_changed', handlePubChange);
  }, []);

  const toggleExpand = (teamId: string) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
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

  const handleCreatePlayoffTree = () => {
    const candidateTeams = teams.filter(t => (t.status || '').toLowerCase() !== 'rejected');
    if (candidateTeams.length < 2) {
      alert(`At least 2 teams are required to create the playoff bracket (Currently: ${candidateTeams.length} squads).`);
      return;
    }
    const isEightSquad = candidateTeams.length <= 8;
    const confirmSeed = window.confirm(
      `GENERATE OFFICIAL PLAYOFF TREE?\n\n` +
      `• Any manually scheduled 1st round matches will be preserved and linked into the tree.\n` +
      `• Remaining slots will be filled from registered approved squads.\n` +
      `• Semifinals, Grand Final & Bronze decider start free awaiting match winners.\n` +
      `• When any match is won, the winner will automatically advance into the playoff tree!`
    );
    if (!confirmSeed) return;

    createAndSeedPlayoffTree(candidateTeams);
    setIsTreePublished(true);
    setPlayoffTreePublished(true);
    try {
      api.admin.generatePlayoffs().catch(() => null);
      api.admin.updateSettings({ playoffTreePublished: true }).catch(() => null);
    } catch (e) {}
    setNotice(
      `✓ Playoff Tree generated & published to live public site! 1st round fixtures linked. Match wins will automatically advance winners down the tree.`
    );
    setTimeout(() => setNotice(null), 5000);
  };

  const handleRecreatePlayoffTree = () => {
    const candidateTeams = teams.filter(t => (t.status || '').toLowerCase() !== 'rejected');
    if (candidateTeams.length < 2) {
      alert(`At least 2 teams are required to recreate the playoff bracket (Currently: ${candidateTeams.length} squads).`);
      return;
    }
    const confirmRecreate = window.confirm(
      'RECREATE OFFICIAL PLAYOFF TREE FROM SCRATCH?\n\n' +
      '• This will wipe previous playoff brackets and match states.\n' +
      '• A fresh bracket will be generated and seeded from all registered and approved squads.\n' +
      '• Semifinals, Grand Final & Bronze Decider start clean awaiting match winners.\n' +
      '• The new tree will be immediately published to the live public site.\n\n' +
      'Proceed with recreation?'
    );
    if (!confirmRecreate) return;

    recreatePlayoffTree(candidateTeams);
    setIsTreePublished(true);
    setPlayoffTreePublished(true);
    try {
      api.admin.recreatePlayoffs().catch(() => null);
    } catch (e) {}
    setNotice(
      '✓ Playoff Tree has been completely RECREATED from scratch and published to live public site!'
    );
    setTimeout(() => setNotice(null), 5000);
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

  const filteredTeams = (teams || []).filter((t) => {
    if (!t) return false;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (t.name || '').toLowerCase().includes(q) ||
      (t.tag || '').toLowerCase().includes(q) ||
      (t.university || '').toLowerCase().includes(q) ||
      (t.degreeProgram || '').toLowerCase().includes(q) ||
      (t.captain?.name || '').toLowerCase().includes(q) ||
      (t.players || []).some(
        (p) =>
          (p?.ign || '').toLowerCase().includes(q) ||
          (p?.name || '').toLowerCase().includes(q) ||
          (p?.faculty || '').toLowerCase().includes(q) ||
          (p?.degreeProgram || '').toLowerCase().includes(q) ||
          (p?.enrollmentNumber || '').toLowerCase().includes(q) ||
          (p?.steamId || '').toLowerCase().includes(q)
      );

    if (statusFilter === 'approved') return matchesSearch && t.status === 'approved';
    if (statusFilter === 'pending') return matchesSearch && t.status === 'pending';
    return matchesSearch;
  });

  const totalPlayersCount = (teams || []).reduce((acc, t) => acc + (t.players?.length || 0), 0);
  const approvedCount = (teams || []).filter((t) => t.status === 'approved').length;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-7xl">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gunmetal">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <Badge variant="olive" size="sm">TEAM-WISE SQUAD DIRECTORY</Badge>
              <span className="text-[11px] font-mono text-mutedKhaki">{"// COMPLETE ROSTER DOSSIER"}</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase text-tacticalWhite tracking-wider">
              SQUADS & OPERATIVE DETAILS (TEAM-WISE)
            </h1>
            <p className="text-xs font-mono text-mutedKhaki">
              Official roster management: view fireteam leaders, 5 starting operatives, and tactical roles grouped by squad.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleTogglePublish}
              className={`px-3.5 py-2 font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 border transition-all ${
                isTreePublished
                  ? 'bg-rose-950/80 border-rose-700 text-rose-300 hover:bg-rose-900 shadow-sm'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-tacticalWhite border-emerald-500 shadow-[0_2px_12px_rgba(16,185,129,0.4)]'
              }`}
              title={
                isTreePublished
                  ? 'Playoff tree is currently DISPLAYED on public site. Click to DISABLE / HIDE it.'
                  : 'Playoff tree is currently DISABLED / HIDDEN. Click to DISPLAY / PUBLISH it on public site.'
              }
            >
              {isTreePublished ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-300" />
                  <span>DISABLE PLAYOFF TREE</span>
                </>
              ) : (
                <>
                  <Radio className="w-3.5 h-3.5 text-tacticalWhite animate-pulse" />
                  <span>DISPLAY PLAYOFF TREE</span>
                </>
              )}
            </button>

            <button
              onClick={handleCreatePlayoffTree}
              className="px-3.5 py-2 bg-sand hover:bg-sand/90 text-military-black font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 border border-sand transition-all"
              title="Seed 1st layer with registered squads; Round 2, Semifinals & Finals start free and advance automatically on win"
            >
              <Trophy className="w-3.5 h-3.5 text-military-black" />
              <span>{isTreePublished ? 'RE-SEED PLAYOFF TREE' : 'CREATE PLAYOFF TREE'}</span>
            </button>

            <button
              onClick={handleRecreatePlayoffTree}
              className="px-3.5 py-2 bg-rose-950/70 hover:bg-rose-900 border border-rose-600 text-rose-300 font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Wipe previous playoff bracket and recreate a completely fresh tree from all registered squads"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              <span>RECREATE PLAYOFF TREE</span>
            </button>
            <button
              onClick={() => downloadTeamWiseExcel(filteredTeams)}
              className="px-3 py-2 bg-surface border border-gunmetal hover:border-olive text-xs font-mono text-tacticalWhite hover:text-sand transition-colors flex items-center gap-1.5"
              title="Download Team-Wise Roster Excel Spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>EXCEL (TEAM-WISE)</span>
            </button>
            <button
              onClick={() => downloadAllMembersExcel(filteredTeams)}
              className="px-3 py-2 bg-surface border border-gunmetal hover:border-olive text-xs font-mono text-tacticalWhite hover:text-sand transition-colors flex items-center gap-1.5"
              title="Download All Members Master List Excel Spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-sand" />
              <span>EXCEL (ALL MEMBERS)</span>
            </button>
            <button
              onClick={() => {
                setLoading(true);
                loadTeams().finally(() => setLoading(false));
              }}
              className="px-3 py-2 bg-surface border border-gunmetal text-xs font-mono text-sand hover:border-sand transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>REFRESH</span>
            </button>
            <button
              onClick={() => handleExpandAll(true)}
              className="px-3 py-2 bg-surface border border-gunmetal text-xs font-mono text-mutedKhaki hover:text-tacticalWhite transition-colors"
            >
              EXPAND ALL
            </button>
            <button
              onClick={() => handleExpandAll(false)}
              className="px-3 py-2 bg-surface border border-gunmetal text-xs font-mono text-mutedKhaki hover:text-tacticalWhite transition-colors"
            >
              COLLAPSE ALL
            </button>
          </div>
        </div>

        {notice && (
          <div className="p-3 bg-olive/20 border border-olive text-xs font-mono text-sand flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-olive" />
            <span>{notice}</span>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card/90 border border-gunmetal p-4">
            <div className="text-[10px] font-mono text-mutedKhaki uppercase tracking-wider">TOTAL SQUADS</div>
            <div className="font-display font-black text-2xl sm:text-3xl text-tacticalWhite mt-1">{teams.length}</div>
          </div>
          <div className="bg-card/90 border border-gunmetal p-4">
            <div className="text-[10px] font-mono text-sand uppercase tracking-wider">APPROVED SQUADS</div>
            <div className="font-display font-black text-2xl sm:text-3xl text-sand mt-1">{approvedCount}</div>
          </div>
          <div className="bg-card/90 border border-gunmetal p-4">
            <div className="text-[10px] font-mono text-mutedKhaki uppercase tracking-wider">TOTAL REGISTERED OPERATIVES</div>
            <div className="font-display font-black text-2xl sm:text-3xl text-olive mt-1">{totalPlayersCount}</div>
          </div>
          <div className="bg-card/90 border border-gunmetal p-4">
            <div className="text-[10px] font-mono text-mutedKhaki uppercase tracking-wider">AVERAGE ROSTER SIZE</div>
            <div className="font-display font-black text-2xl sm:text-3xl text-khaki mt-1">
              {teams.length > 0 ? (totalPlayersCount / teams.length).toFixed(1) : '5.0'}
            </div>
          </div>
        </div>

        <div className="bg-card/90 border border-gunmetal p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-mutedKhaki absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team, IGN, player real name, callsign..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-gunmetal pl-10 pr-4 py-2 text-xs font-mono text-tacticalWhite placeholder-mutedKhaki/60 focus:outline-none focus:border-olive"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-mono text-mutedKhaki uppercase flex items-center gap-1.5 mr-2">
              <Filter className="w-3.5 h-3.5 text-sand" /> STATUS:
            </span>
            {(['all', 'approved', 'pending'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 text-xs font-mono uppercase font-bold tracking-wider transition-colors border ${
                  statusFilter === filter
                    ? 'bg-olive text-black font-bold border-olive'
                    : 'bg-surface text-mutedKhaki border-gunmetal hover:text-tacticalWhite'
                }`}
              >
                {filter} ({filter === 'all' ? teams.length : teams.filter((t) => t.status === filter).length})
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredTeams.length === 0 ? (
            <div className="bg-card/80 border border-gunmetal p-12 text-center">
              <p className="font-mono text-sm text-mutedKhaki">No squads match your query criteria.</p>
            </div>
          ) : (
            filteredTeams.map((team) => {
              const isExpanded = !!expandedTeams[team.id];
              const isApproved = team.status === 'approved';

              return (
                <div
                  key={team.id}
                  className={`bg-card/90 border transition-all duration-200 overflow-hidden ${
                    isApproved ? 'border-gunmetal hover:border-sand/50' : 'border-sand/30'
                  }`}
                >
                  {/* Squad Header Bar (Click to toggle accordion) */}
                  <div
                    onClick={() => toggleExpand(team.id)}
                    className="p-4 sm:p-5 bg-surface/40 hover:bg-surface/70 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors select-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 bg-surface border border-gunmetal shrink-0 overflow-hidden">
                        <Image src={team.logo} alt={team.name} fill className="object-cover" sizes="48px" />
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-sand">[{team.tag}]</span>
                          <h3 className="font-display font-black text-lg text-tacticalWhite uppercase tracking-wider">
                            {team.name}
                          </h3>
                        </div>
                        <p className="text-xs font-mono text-mutedKhaki flex items-center gap-1.5 flex-wrap">
                          <span>{team.degreeProgram || team.faculty || 'UWU'}</span>
                          {(() => {
                            const enrollments = (team.players || []).map((p) => p.enrollmentNumber || '');
                            const check = validateSquadEnrollmentDegrees(enrollments, team.degreeProgram);
                            if (check.isValid && check.degreeCode) {
                              return (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 bg-olive/20 text-sand border border-olive/40 font-bold">
                                  ✓ SAME DEGREE ({check.degreeCode})
                                </span>
                              );
                            }
                            return null;
                          })()}
                          {team.enrollmentNumber ? <span>• Reg: {team.enrollmentNumber}</span> : null}
                          <span>• {team.players.length} Operatives</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto" onClick={(e) => e.stopPropagation()}>
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-1 uppercase tracking-wider border ${
                          isApproved
                            ? 'bg-olive/20 text-sand border-olive'
                            : 'bg-sand/10 text-sand border-sand/40'
                        }`}
                      >
                        {team.status.toUpperCase()}
                      </span>

                      <button
                        onClick={() => handleStatusToggle(team.id, team.status)}
                        className={`px-3 py-1 text-xs font-mono uppercase font-bold border transition-colors ${
                          isApproved
                            ? 'bg-rose-950/60 text-rose-300 border-rose-800 hover:bg-rose-900 hover:text-white'
                            : 'bg-olive/30 text-sand border-olive hover:bg-olive hover:text-black'
                        }`}
                      >
                        {isApproved ? 'DEACTIVATE' : 'ACTIVATE SQUAD'}
                      </button>

                      <button
                        onClick={() => toggleExpand(team.id)}
                        className="p-1.5 text-mutedKhaki hover:text-tacticalWhite border border-gunmetal bg-surface"
                        title={isExpanded ? 'Collapse Roster' : 'Expand Roster'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-sand" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 sm:p-6 border-t border-gunmetal bg-card/60 space-y-6">
                      
                      <div className="p-4 bg-olive/10 border border-olive/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-olive/20 border border-olive/60 flex items-center justify-center shrink-0">
                            <Crown className="w-4 h-4 text-sand" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono text-sand uppercase font-bold tracking-widest block">
                              SQUAD LEADER &amp; COHORT DETAILS
                            </span>
                            <span className="font-display font-bold text-sm text-tacticalWhite uppercase tracking-wider">
                              {team.captain?.name || 'Squad Leader'}
                            </span>
                            <div className="text-[11px] font-mono text-mutedKhaki mt-0.5">
                              {team.degreeProgram || team.faculty || 'Computer Science & Technology (CST)'}
                              {(team.enrollmentNumber || team.column1) && (
                                <span className="text-sand ml-2 font-mono">• Reg: {team.enrollmentNumber || team.column1}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-mutedKhaki">
                          <a
                            href={`mailto:${team.email || team.captain?.email || ''}`}
                            className="flex items-center gap-1.5 text-tacticalWhite hover:text-sand transition-colors"
                          >
                            <Mail className="w-3.5 h-3.5 text-sand" />
                            <span>{team.email || team.captain?.email || '—'}</span>
                          </a>
                          <a
                            href={`https://wa.me/${(team.captain?.whatsappNumber || team.captain?.phone || '').replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-bold transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{team.captain.whatsappNumber || team.captain.phone}</span>
                          </a>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-display font-bold text-xs uppercase tracking-wider text-tacticalWhite flex items-center gap-2">
                            <Crosshair className="w-3.5 h-3.5 text-sand" />
                            <span>STARTING LINEUP (5 OPERATIVES)</span>
                          </h4>
                          <span className="text-[11px] font-mono text-mutedKhaki">COD4 COMPETITIVE ROSTER</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                          {team.players.map((player: Player, index: number) => {
                            const isLeader = index === 0 || player.role === 'Team Leader';
                            return (
                              <div
                                key={player.id || index}
                                className="p-3 bg-surface/70 border border-gunmetal hover:border-sand/50 transition-colors flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-mono font-bold text-sand">SLOT 0{index + 1}</span>
                                    <span className="text-[10px] font-mono text-mutedKhaki uppercase">
                                      {isLeader ? 'Leader' : (player.role || 'Operative')}
                                    </span>
                                  </div>
                                  
                                  <div className="font-display font-black text-base text-tacticalWhite truncate" title={player.name || player.ign}>
                                    {player.name || player.ign}
                                  </div>

                                  <div className="flex items-center justify-between mt-1 text-xs font-mono">
                                    <span className="text-mutedKhaki text-[11px] truncate" title={player.gamingName || player.ign}>
                                      IGN: <strong className="text-sand">{player.gamingName || player.ign || '—'}</strong>
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.2 bg-surface border border-gunmetal text-sand font-bold shrink-0 ml-1">
                                      Year {player.year || '1'}
                                    </span>
                                  </div>
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-gunmetal/60 flex items-center justify-between text-[11px] font-mono">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <span className="text-mutedKhaki truncate max-w-[100px]" title={player.enrollmentNumber || player.steamId || 'Operative'}>
                                      {player.enrollmentNumber || player.steamId || 'Active'}
                                    </span>
                                    {(() => {
                                      const deg = extractDegreeFromEnrollment(player.enrollmentNumber);
                                      return deg ? (
                                        <span className="text-[9px] px-1 py-0.2 bg-olive/20 text-sand border border-olive/40 font-bold shrink-0">
                                          {deg.code}
                                        </span>
                                      ) : null;
                                    })()}
                                  </div>
                                  {(player.enrollmentNumber || player.steamId) && (
                                    <button
                                      onClick={() => copyToClipboard(player.enrollmentNumber || player.steamId!)}
                                      className="text-sand hover:text-tacticalWhite transition-colors ml-1 shrink-0"
                                      title="Copy ID / Callsign"
                                    >
                                      {copiedSteamId === (player.enrollmentNumber || player.steamId) ? (
                                        <Check className="w-3.5 h-3.5 text-sand" />
                                      ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                      )}
                                    </button>
                                  )}
                                </div>

                                {player.configFile && (player.configFile.filename || player.configFile.url || player.configFile.content) && (
                                  <div className="mt-2 pt-2 border-t border-gunmetal/40 flex items-center justify-between text-[10px]">
                                    <span className="text-sand font-mono truncate max-w-[110px]" title={player.configFile.filename}>
                                      {player.configFile.filename || 'config.cfg'}
                                    </span>
                                    <a
                                      href={api.admin.getTeamPlayerConfigDownloadUrl(team.id, index)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="px-1.5 py-0.5 bg-sand/20 hover:bg-sand border border-sand/40 text-sand hover:text-black transition-colors flex items-center gap-1 font-bold"
                                      title="Download .cfg file"
                                    >
                                      <Download className="w-2.5 h-2.5" />
                                      <span>.CFG</span>
                                    </a>
                                  </div>
                                )}
                              </div>
                            );
                          })}
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
