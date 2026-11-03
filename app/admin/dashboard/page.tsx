'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { getStoredTeams, getStoredMatches, updateTeamStatus } from '@/lib/storage';
import { api } from '@/lib/api';
import { transformBackendRegistration, transformBackendMatch } from '@/lib/transformers';
import { Team, Match } from '@/lib/types';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Swords,
  Trophy,
  ArrowUpRight,
  Shield,
  Activity,
  AlertTriangle,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function AdminDashboardPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [backendStats, setBackendStats] = useState<any>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    // 1. Initial immediate local render
    const localTeams = getStoredTeams();
    const localMatches = getStoredMatches();
    setTeams(localTeams);
    setMatches(localMatches);

    // 2. Fetch live telemetry from backend
    try {
      const [resOverview, resActivity, resRegs, resMatches] = await Promise.all([
        api.admin.getOverview().catch(() => null),
        api.admin.getActivity().catch(() => null),
        api.admin.getRegistrations().catch(() => null),
        api.admin.getMatches().catch(() => null),
      ]);

      if (resOverview?.success && resOverview.data?.stats) {
        setBackendStats(resOverview.data.stats);
      }

      if (resActivity?.success && Array.isArray(resActivity.data)) {
        setActivityLogs(resActivity.data);
      }

      if (resRegs?.success && Array.isArray(resRegs.data) && resRegs.data.length > 0) {
        setTeams(resRegs.data.map(transformBackendRegistration));
      }

      if (resMatches?.success && Array.isArray(resMatches.data) && resMatches.data.length > 0) {
        setMatches(resMatches.data.map(transformBackendMatch));
      }
    } catch (e) {
      // Backend offline or starting: continue with localStorage
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

  const totalTeams = backendStats?.totalRegistrations ?? teams.length;
  const pendingTeams = backendStats?.pendingRegistrations ?? teams.filter((t) => t.status === 'pending').length;
  const approvedTeams = backendStats?.approvedRegistrations ?? teams.filter((t) => t.status === 'approved').length;
  const rejectedTeams = backendStats?.rejectedRegistrations ?? teams.filter((t) => t.status === 'rejected').length;
  const totalMatches = backendStats?.totalMatches ?? matches.length;
  const completedMatches = backendStats?.completedMatches ?? matches.filter((m) => m.status === 'completed').length;

  const handleQuickStatus = async (teamId: string, status: 'approved' | 'rejected') => {
    try {
      if (status === 'approved') {
        await api.admin.approveRegistration(teamId);
      } else {
        await api.admin.rejectRegistration(teamId, 'Administrative decision from dashboard');
      }
    } catch (e) {
      console.warn('Backend status update fallback to local', e);
    }
    updateTeamStatus(teamId, status);
    // Reload data
    loadData();
  };

  const statCards = [
    { label: 'REGISTERED TEAMS', value: totalTeams, icon: <Users className="w-5 h-5 text-cyan" />, color: 'border-cyan/40' },
    { label: 'PENDING APPROVAL', value: pendingTeams, icon: <Clock className="w-5 h-5 text-tactical-gold" />, color: 'border-tactical-gold/40' },
    { label: 'APPROVED SQUADS', value: approvedTeams, icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />, color: 'border-emerald-500/40' },
    { label: 'REJECTED ROSTERS', value: rejectedTeams, icon: <XCircle className="w-5 h-5 text-rose-500" />, color: 'border-rose-500/40' },
    { label: 'TOTAL MATCHES', value: totalMatches, icon: <Swords className="w-5 h-5 text-orange" />, color: 'border-orange/40' },
    { label: 'COMPLETED MATCHES', value: completedMatches, icon: <Trophy className="w-5 h-5 text-cyan" />, color: 'border-cyan/40' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-tactical-border">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <Badge variant="cyan" size="sm">COMMAND TELEMETRY</Badge>
              <span className="text-[11px] font-mono text-secondaryText">{"// CST-2026 OPERATIONS"}</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase text-white tracking-wider">
              TOURNAMENT DASHBOARD OVERVIEW
            </h1>
            <p className="text-xs font-mono text-secondaryText">
              Official governance hub for the CST LAN Challenge 2026.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setLoading(true);
                loadData().finally(() => setLoading(false));
              }}
              className="p-2 bg-surface border border-tactical-border text-secondaryText hover:text-white transition-colors"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan' : ''}`} />
            </button>
            <Link
              href="/scoreboard/live"
              target="_blank"
              className="px-3.5 py-2 bg-gradient-to-r from-cyan to-blue-600 text-background text-xs font-mono font-bold uppercase clip-tactical hover:shadow-[0_0_15px_rgba(0,213,255,0.4)] transition-all flex items-center gap-1.5"
            >
              <span>STAGE PROJECTOR HUD</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/admin/registrations"
              className="px-3.5 py-2 bg-surface border border-tactical-border text-xs font-mono text-cyan hover:border-cyan transition-colors"
            >
              REVIEW REGISTRATIONS ({pendingTeams})
            </Link>
            <Link
              href="/admin/scoreboard"
              className="px-3.5 py-2 bg-surface border border-tactical-border text-xs font-mono text-white hover:border-cyan transition-colors"
            >
              REFEREE CONSOLE
            </Link>
          </div>
        </div>

        {/* 6 Key Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              className={`bg-card/90 border p-4 backdrop-blur-sm ${card.color} transition-all hover:-translate-y-0.5`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-secondaryText uppercase tracking-wider">
                  {card.label}
                </span>
                {card.icon}
              </div>
              <div className="font-display font-black text-3xl sm:text-4xl text-white">
                {card.value}
              </div>
            </div>
          ))}
        </div>

        {/* 2-Column Section: Recent Registrations & Upcoming Fixtures */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Recent Registrations Table */}
          <div className="lg:col-span-7 bg-card/90 border border-tactical-border p-6 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-tactical-border pb-4 mb-4">
              <h3 className="font-display font-bold text-base text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan" /> RECENT ENLISTMENTS
              </h3>
              <Link
                href="/admin/registrations"
                className="text-xs font-mono text-cyan hover:underline flex items-center gap-1"
              >
                <span>MANAGE ALL</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-tactical-border text-secondaryText text-[10px] uppercase">
                    <th className="py-2.5">SQUAD</th>
                    <th className="py-2.5">UNIVERSITY</th>
                    <th className="py-2.5 text-center">STATUS</th>
                    <th className="py-2.5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tactical-border/60">
                  {teams.slice(0, 5).map((team) => (
                    <tr key={team.id} className="hover:bg-surface/40 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="relative w-8 h-8 bg-surface border border-tactical-border shrink-0 overflow-hidden">
                            <Image src={team.logo} alt={team.name} fill className="object-cover" sizes="32px" />
                          </div>
                          <div>
                            <span className="text-[10px] text-cyan block font-bold">[{team.tag}]</span>
                            <span className="text-white font-semibold truncate block max-w-[130px]">{team.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-secondaryText truncate max-w-[140px]">
                        {team.university}
                      </td>
                      <td className="py-3 text-center">
                        {team.status === 'approved' && (
                          <span className="text-[10px] text-emerald-400 font-bold px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30">
                            APPROVED
                          </span>
                        )}
                        {team.status === 'pending' && (
                          <span className="text-[10px] text-tactical-gold font-bold px-1.5 py-0.5 bg-tactical-gold/10 border border-tactical-gold/30">
                            PENDING
                          </span>
                        )}
                        {team.status === 'rejected' && (
                          <span className="text-[10px] text-rose-500 font-bold px-1.5 py-0.5 bg-rose-500/10 border border-rose-500/30">
                            REJECTED
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {team.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleQuickStatus(team.id, 'approved')}
                              className="px-2 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-black text-[10px] font-bold uppercase transition-colors"
                              title="Approve Squad"
                            >
                              APPROVE
                            </button>
                            <button
                              onClick={() => handleQuickStatus(team.id, 'rejected')}
                              className="px-2 py-1 bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500 hover:text-white text-[10px] font-bold uppercase transition-colors"
                              title="Reject Squad"
                            >
                              REJECT
                            </button>
                          </div>
                        ) : (
                          <Link
                            href="/admin/registrations"
                            className="text-[10px] text-cyan hover:underline"
                          >
                            DETAILS
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upcoming Matches & Activity Log */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Matches preview */}
            <div className="bg-card/90 border border-tactical-border p-6 backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-tactical-border pb-4 mb-4">
                <h3 className="font-display font-bold text-base text-white uppercase tracking-wider flex items-center gap-2">
                  <Swords className="w-4 h-4 text-orange" /> MATCH LINEUP
                </h3>
                <Link
                  href="/admin/matches"
                  className="text-xs font-mono text-orange hover:underline flex items-center gap-1"
                >
                  <span>MANAGE</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {matches.slice(0, 3).map((m) => (
                  <div
                    key={m.id}
                    className="p-3 bg-surface/60 border border-tactical-border flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-[10px] text-cyan uppercase">{m.stage} • {m.map}</div>
                      <div className="text-white font-bold mt-0.5">
                        {m.teamATag} vs {m.teamBTag}
                      </div>
                    </div>

                    <div className="text-right">
                      {m.status === 'completed' ? (
                        <div className="px-2 py-0.5 bg-surface border border-tactical-border text-emerald-400 font-bold">
                          {m.scoreA} : {m.scoreB}
                        </div>
                      ) : (
                        <span className="text-[10px] text-secondaryText px-2 py-0.5 bg-surface border border-tactical-border">
                          {new Date(m.dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-surface/70 border border-tactical-border p-6">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-3">
                QUICK OPERATIONAL ACTIONS
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <Link
                  href="/admin/matches"
                  className="p-3 bg-card border border-tactical-border hover:border-cyan text-secondaryText hover:text-white transition-colors"
                >
                  + CREATE FIXTURE
                </Link>
                <Link
                  href="/admin/countdown"
                  className="p-3 bg-card border border-tactical-border hover:border-orange text-secondaryText hover:text-white transition-colors"
                >
                  ⏱ CONFIGURE TIMER
                </Link>
                <Link
                  href="/admin/scoreboard"
                  className="p-3 bg-card border border-tactical-border hover:border-cyan text-secondaryText hover:text-white transition-colors"
                >
                  🏆 PUBLISH RESULTS
                </Link>
                <Link
                  href="/admin/teams"
                  className="p-3 bg-card border border-tactical-border hover:border-tactical-borderLight text-secondaryText hover:text-white transition-colors"
                >
                  👥 SQUAD ROSTERS
                </Link>
              </div>
            </div>

            {/* Recent Audit Activities */}
            {activityLogs.length > 0 && (
              <div className="bg-card/90 border border-tactical-border p-5">
                <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-cyan" /> RECENT ADMIN AUDIT LOG
                </h4>
                <div className="space-y-2 text-[11px] font-mono">
                  {activityLogs.slice(0, 4).map((log: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-1 border-b border-tactical-border/40 text-secondaryText">
                      <span className="text-white font-semibold">{log.action}</span>
                      <span className="text-[10px]">{log.adminUsername} • {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </AdminLayout>
  );
}
