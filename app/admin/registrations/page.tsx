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
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gunmetal">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <Badge variant="olive" size="sm">ROSTER VALIDATION</Badge>
              <span className="text-[11px] font-mono text-mutedKhaki">{`// ${teams.length} TOTAL SQUADS`}</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase text-tacticalWhite tracking-wider">
              REGISTRATION MANAGEMENT
            </h1>
            <p className="text-xs font-mono text-mutedKhaki">
              Inspect student eligibility, examine 5-man rosters, and approve or reject squad enlistments.
            </p>
          </div>

          <button
            onClick={() => {
              setLoading(true);
              loadRegistrations().finally(() => setLoading(false));
            }}
            className="px-3.5 py-2 bg-surface border border-gunmetal text-xs font-mono text-sand hover:border-sand transition-colors flex items-center gap-2 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH FROM DATABASE</span>
          </button>
        </div>

        {actionNotice && (
          <div className="p-3 bg-olive/20 border border-olive text-xs font-mono text-sand flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-olive" />
            <span>{actionNotice}</span>
          </div>
        )}

        <div className="bg-card/90 border border-gunmetal p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-mutedKhaki absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search squad, captain, university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-gunmetal pl-10 pr-4 py-2 text-xs font-mono text-tacticalWhite placeholder-mutedKhaki/60 focus:outline-none focus:border-olive"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 text-xs font-mono uppercase font-bold tracking-wider transition-colors border ${
                  statusFilter === filter
                    ? 'bg-olive text-tacticalWhite border-olive'
                    : 'bg-surface text-mutedKhaki border-gunmetal hover:text-tacticalWhite'
                }`}
              >
                {filter} ({filter === 'all' ? teams.length : teams.filter(t => t.status === filter).length})
              </button>
            ))}
          </div>
        </div>

        <div className="bg-card/90 border border-gunmetal overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="bg-surface/80 border-b border-gunmetal text-mutedKhaki text-[10px] uppercase">
                  <th className="py-3 px-4">SQUAD</th>
                  <th className="py-3 px-4">UNIVERSITY</th>
                  <th className="py-3 px-4">CAPTAIN</th>
                  <th className="py-3 px-4">SUBMITTED</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gunmetal/60">
                {filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-surface/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-9 h-9 bg-surface border border-gunmetal shrink-0 overflow-hidden">
                          <Image src={team.logo} alt={team.name} fill className="object-cover" sizes="36px" />
                        </div>
                        <div>
                          <span className="text-[10px] text-sand block font-bold">[{team.tag}]</span>
                          <span className="text-tacticalWhite font-semibold">{team.name}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-mutedKhaki">
                      {team.university}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-tacticalWhite block font-medium">{team.captain.name}</span>
                      <span className="text-[11px] text-mutedKhaki block">{team.captain.email}</span>
                    </td>

                    <td className="py-3.5 px-4 text-mutedKhaki">
                      {new Date(team.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {team.status === 'approved' && (
                        <span className="text-[10px] text-sand font-bold px-2 py-0.5 bg-olive/20 border border-olive">
                          APPROVED
                        </span>
                      )}
                      {team.status === 'pending' && (
                        <span className="text-[10px] text-sand font-bold px-2 py-0.5 bg-sand/10 border border-sand/40">
                          PENDING
                        </span>
                      )}
                      {team.status === 'rejected' && (
                        <span className="text-[10px] text-rose-400 font-bold px-2 py-0.5 bg-rose-500/10 border border-rose-500/30">
                          REJECTED
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedTeam(team)}
                          className="px-2.5 py-1 text-xs font-mono bg-surface border border-gunmetal hover:border-sand text-mutedKhaki hover:text-tacticalWhite transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3 text-sand" /> INSPECT
                        </button>
                        {team.status !== 'approved' && (
                          <button
                            onClick={() => handleStatusChange(team.id, 'approved')}
                            className="px-2.5 py-1 text-xs font-mono bg-olive/30 border border-olive hover:bg-olive hover:text-tacticalWhite text-sand font-bold uppercase transition-colors"
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

      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-military-black/85 backdrop-blur-md">
          <div className="relative bg-card border border-gunmetal max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setSelectedTeam(null)}
              className="absolute top-4 right-4 p-2 text-mutedKhaki hover:text-tacticalWhite border border-gunmetal bg-surface"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-gunmetal pb-6 mb-6">
              <div className="relative w-16 h-16 bg-surface border border-gunmetal shrink-0 overflow-hidden">
                <Image src={selectedTeam.logo} alt={selectedTeam.name} fill className="object-cover" sizes="64px" />
              </div>
              <div>
                <span className="text-xs font-mono text-sand uppercase tracking-widest font-bold">
                  [{selectedTeam.tag}] // STATUS: {selectedTeam.status.toUpperCase()}
                </span>
                <h2 className="font-display font-black text-2xl text-tacticalWhite uppercase tracking-wider">
                  {selectedTeam.name}
                </h2>
                <p className="text-xs font-mono text-mutedKhaki">
                  {selectedTeam.university}
                </p>
              </div>
            </div>

            <div className="bg-surface/80 border border-gunmetal p-4 mb-6 text-xs font-mono">
              <div className="text-sand font-bold uppercase mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-olive" /> SQUAD LEADER
                </span>
                {selectedTeam.captain.whatsappNumber && (
                  <a
                    href={`https://wa.me/${selectedTeam.captain.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-olive/30 text-sand border border-olive hover:bg-olive hover:text-tacticalWhite transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span>CHAT ON WHATSAPP</span>
                  </a>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-mutedKhaki">
                <div>NAME: <span className="text-tacticalWhite font-medium">{selectedTeam.captain.name}</span></div>
                <div>WHATSAPP: <span className="text-sand font-bold">{selectedTeam.captain.whatsappNumber || selectedTeam.captain.phone}</span></div>
                <div>FACULTY: <span className="text-tacticalWhite font-medium">{selectedTeam.captain.faculty || 'Applied Sciences'}</span></div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-display font-bold text-sm text-tacticalWhite uppercase tracking-wider mb-3">
                STARTING 5 OPERATIVES
              </h3>
              <div className="space-y-2">
                {selectedTeam.players.map((p, idx) => (
                  <div
                    key={p.id || idx}
                    className="p-3 bg-surface/50 border border-gunmetal flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-2"
                  >
                    <div>
                      <span className="text-sand font-bold mr-2">0{idx + 1}.</span>
                      <span className="text-tacticalWhite font-bold">{p.name || p.ign}</span>
                      {p.ign && p.ign !== p.name && (
                        <span className="text-mutedKhaki"> ({p.ign})</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-mutedKhaki text-[11px]">
                      <span className="text-sand font-medium">{p.faculty}</span>
                      {p.steamId && (
                        <span>CALLSIGN / ID: <strong className="text-tacticalWhite">{p.steamId}</strong></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gunmetal flex items-center justify-between">
              <div className="text-xs font-mono text-mutedKhaki">
                Update Status:
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleStatusChange(selectedTeam.id, 'approved')}
                  className="px-4 py-2 bg-olive text-tacticalWhite border border-olive hover:bg-olive/90 font-mono text-xs uppercase font-bold transition-colors"
                >
                  ✓ APPROVE SQUAD
                </button>
                <button
                  onClick={() => handleStatusChange(selectedTeam.id, 'rejected')}
                  className="px-4 py-2 bg-rose-950/80 text-rose-300 border border-rose-800 hover:bg-rose-900 font-mono text-xs uppercase font-bold transition-colors"
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
