'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { getStoredTeams, updateTeamStatus } from '@/lib/storage';
import { api } from '@/lib/api';
import { transformBackendRegistration } from '@/lib/transformers';
import { Team, ApprovalStatus } from '@/lib/types';
import { Search, CheckCircle2, XCircle, Clock, Eye, X, Mail, Phone, Shield, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function AdminRegistrationsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadRegistrations = async () => {
    // 1. Initial local render
    setTeams(getStoredTeams());

    // 2. Fetch from backend API
    try {
      const res = await api.admin.getRegistrations();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setTeams(res.data.map(transformBackendRegistration));
      }
    } catch (e) {
      // Backend not running: use local storage
    }
  };

  useEffect(() => {
    loadRegistrations();
    const handleUpdate = () => setTeams(getStoredTeams());
    window.addEventListener('cst_teams_updated', handleUpdate);
    return () => window.removeEventListener('cst_teams_updated', handleUpdate);
  }, []);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleStatusChange = async (teamId: string, status: ApprovalStatus) => {
    try {
      if (status === 'approved') {
        await api.admin.approveRegistration(teamId);
        showNotice(`Registration approved! Squad has been added to official tournament teams.`);
      } else if (status === 'rejected') {
        const reason = window.prompt('Specify reason for rejection (optional):', 'Roster requirements or student eligibility criteria not met') || undefined;
        await api.admin.rejectRegistration(teamId, reason);
        showNotice(`Registration rejected.`);
      }
    } catch (err: any) {
      console.warn('Backend API registration call failed, updating local state', err);
      showNotice(`Status updated to ${status.toUpperCase()} locally.`);
    }

    // Synchronize local storage & state
    updateTeamStatus(teamId, status);
    if (selectedTeam && selectedTeam.id === teamId) {
      setSelectedTeam({ ...selectedTeam, status });
    }
    loadRegistrations();
  };

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.captain.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || team.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-tactical-border">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <Badge variant="cyan" size="sm">ROSTER VALIDATION</Badge>
              <span className="text-[11px] font-mono text-secondaryText">{`// ${teams.length} TOTAL SQUADS`}</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase text-white tracking-wider">
              REGISTRATION MANAGEMENT
            </h1>
            <p className="text-xs font-mono text-secondaryText">
              Inspect student eligibility, examine 5-man rosters, and approve or reject squad enlistments.
            </p>
          </div>

          <button
            onClick={() => {
              setLoading(true);
              loadRegistrations().finally(() => setLoading(false));
            }}
            className="px-3.5 py-2 bg-surface border border-tactical-border text-xs font-mono text-cyan hover:border-cyan transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH FROM DATABASE</span>
          </button>
        </div>

        {/* Action Notice */}
        {actionNotice && (
          <div className="p-3 bg-cyan/10 border border-cyan/40 text-xs font-mono text-cyan flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-card/90 border border-tactical-border p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-secondaryText absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search squad, captain, university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-tactical-border pl-10 pr-4 py-2 text-xs font-mono text-white placeholder-secondaryText/60 focus:outline-none focus:border-cyan"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 text-xs font-mono uppercase font-bold tracking-wider transition-colors border ${
                  statusFilter === filter
                    ? 'bg-cyan text-background border-cyan'
                    : 'bg-surface text-secondaryText border-tactical-border hover:text-white'
                }`}
              >
                {filter} ({filter === 'all' ? teams.length : teams.filter(t => t.status === filter).length})
              </button>
            ))}
          </div>
        </div>

        {/* Registrations Table */}
        <div className="bg-card/90 border border-tactical-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="bg-surface/80 border-b border-tactical-border text-secondaryText text-[10px] uppercase">
                  <th className="py-3 px-4">SQUAD</th>
                  <th className="py-3 px-4">UNIVERSITY</th>
                  <th className="py-3 px-4">CAPTAIN</th>
                  <th className="py-3 px-4">SUBMITTED</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tactical-border/60">
                {filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-surface/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 bg-surface border border-tactical-border shrink-0 overflow-hidden">
                          <Image src={team.logo} alt={team.name} fill className="object-cover" sizes="36px" />
                        </div>
                        <div>
                          <span className="text-[10px] text-cyan block font-bold">[{team.tag}]</span>
                          <span className="text-white font-semibold">{team.name}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-secondaryText">
                      {team.university}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-white block font-medium">{team.captain.name}</span>
                      <span className="text-[11px] text-secondaryText block">{team.captain.email}</span>
                    </td>

                    <td className="py-3.5 px-4 text-secondaryText">
                      {new Date(team.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {team.status === 'approved' && (
                        <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30">
                          APPROVED
                        </span>
                      )}
                      {team.status === 'pending' && (
                        <span className="text-[10px] text-tactical-gold font-bold px-2 py-0.5 bg-tactical-gold/10 border border-tactical-gold/30">
                          PENDING
                        </span>
                      )}
                      {team.status === 'rejected' && (
                        <span className="text-[10px] text-rose-500 font-bold px-2 py-0.5 bg-rose-500/10 border border-rose-500/30">
                          REJECTED
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedTeam(team)}
                          className="px-2.5 py-1 text-xs font-mono bg-surface border border-tactical-border hover:border-cyan text-secondaryText hover:text-white transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-cyan" /> INSPECT
                        </button>
                        {team.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusChange(team.id, 'approved')}
                            className="px-2.5 py-1 text-xs font-mono bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500 hover:text-black text-emerald-400 font-bold uppercase transition-colors"
                          >
                            APPROVE
                          </button>
                        )}
                        {team.status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(team.id, 'rejected')}
                            className="px-2.5 py-1 text-xs font-mono bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500 hover:text-white text-rose-400 font-bold uppercase transition-colors"
                          >
                            REJECT
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Roster Inspection Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md">
          <div className="relative bg-card border border-cyan/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setSelectedTeam(null)}
              className="absolute top-4 right-4 p-2 text-secondaryText hover:text-white border border-tactical-border bg-surface"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-4 border-b border-tactical-border pb-6 mb-6">
              <div className="relative w-16 h-16 bg-surface border border-cyan/40 shrink-0 overflow-hidden">
                <Image src={selectedTeam.logo} alt={selectedTeam.name} fill className="object-cover" sizes="64px" />
              </div>
              <div>
                <span className="text-xs font-mono text-cyan uppercase tracking-widest font-bold">
                  [{selectedTeam.tag}] // STATUS: {selectedTeam.status.toUpperCase()}
                </span>
                <h2 className="font-display font-black text-2xl text-white uppercase tracking-wider">
                  {selectedTeam.name}
                </h2>
                <p className="text-xs font-mono text-secondaryText">
                  {selectedTeam.university}
                </p>
              </div>
            </div>

            {/* Captain details */}
            <div className="bg-surface/80 border border-tactical-border p-4 mb-6 text-xs font-mono">
              <div className="text-cyan font-bold uppercase mb-2 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> CAPTAIN LIAISON
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-secondaryText">
                <div>NAME: <span className="text-white font-medium">{selectedTeam.captain.name}</span></div>
                <div>EMAIL: <span className="text-white font-medium">{selectedTeam.captain.email}</span></div>
                <div>PHONE: <span className="text-white font-medium">{selectedTeam.captain.phone}</span></div>
              </div>
            </div>

            {/* 5 Main Players */}
            <div className="mb-6">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-3">
                STARTING 5 PLAYERS (REQUIRED)
              </h3>
              <div className="space-y-2">
                {selectedTeam.players.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="p-3 bg-surface/50 border border-tactical-border flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-2"
                  >
                    <div>
                      <span className="text-cyan font-bold mr-2">0{idx + 1}.</span>
                      <span className="text-white font-bold">{p.ign}</span>{' '}
                      <span className="text-secondaryText">({p.name})</span>
                    </div>
                    <div className="flex items-center gap-4 text-secondaryText text-[11px]">
                      <span>STEAM: <strong className="text-white">{p.steamId}</strong></span>
                      <span>EMAIL: {p.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Substitute */}
            {selectedTeam.substitute && (
              <div className="mb-6">
                <h3 className="font-display font-bold text-sm text-secondaryText uppercase tracking-wider mb-2">
                  DESIGNATED SUBSTITUTE
                </h3>
                <div className="p-3 bg-surface/30 border border-dashed border-tactical-border flex justify-between items-center text-xs font-mono">
                  <div>
                    <span className="text-orange font-bold mr-2">[SUB]</span>
                    <span className="text-white font-bold">{selectedTeam.substitute.ign}</span>{' '}
                    <span className="text-secondaryText">({selectedTeam.substitute.name})</span>
                  </div>
                  <span className="text-[11px] text-secondaryText">{selectedTeam.substitute.steamId}</span>
                </div>
              </div>
            )}

            {/* Approval Controls */}
            <div className="pt-6 border-t border-tactical-border flex items-center justify-between">
              <div className="text-xs font-mono text-secondaryText">
                Update Status:
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleStatusChange(selectedTeam.id, 'approved')}
                  className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-black font-mono text-xs uppercase font-bold transition-colors"
                >
                  ✓ APPROVE SQUAD
                </button>
                <button
                  onClick={() => handleStatusChange(selectedTeam.id, 'rejected')}
                  className="px-4 py-2 bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500 hover:text-white font-mono text-xs uppercase font-bold transition-colors"
                >
                  ✕ REJECT SQUAD
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </AdminLayout>
  );
}
