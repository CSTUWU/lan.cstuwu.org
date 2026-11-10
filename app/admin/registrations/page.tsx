'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/admin/AdminLayout';
import { getStoredTeams, setStoredTeams, updateTeamStatus } from '@/lib/storage';
import { api } from '@/lib/api';
import { transformBackendRegistration } from '@/lib/transformers';
import { Team, ApprovalStatus } from '@/lib/types';
import { extractDegreeFromEnrollment, validateSquadEnrollmentDegrees } from '@/lib/degreeUtils';
import { Search, CheckCircle2, XCircle, Clock, Eye, X, Mail, Phone, Shield, RefreshCw, GraduationCap, Calendar, Hash, UserCheck, FileSpreadsheet, Download, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { downloadTeamWiseExcel, downloadAllMembersExcel } from '@/lib/exportExcel';

export default function AdminRegistrationsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const res = await api.admin.getRegistrations();
      if (res?.success && Array.isArray(res.data)) {
        const transformed = res.data.map(transformBackendRegistration);
        setTeams(transformed);
      }
    } catch (e: any) {
      console.error('Failed to load registrations from database:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRegistrations();
  }, []);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleStatusChange = async (teamId: string, status: ApprovalStatus) => {
    try {
      if (status === 'approved') {
        await api.admin.approveRegistration(teamId);
        showNotice(`Squad approved! Added to official tournament roster in database.`);
      } else if (status === 'rejected') {
        const reason =
          window.prompt(
            'Specify reason for rejection (optional):',
            'Roster requirements or student eligibility criteria not met'
          ) || undefined;
        await api.admin.rejectRegistration(teamId, reason);
        showNotice(`Registration rejected in database.`);
      }
      await loadRegistrations();
      if (selectedTeam && selectedTeam.id === teamId) {
        setSelectedTeam({ ...selectedTeam, status });
      }
    } catch (err: any) {
      console.error('Backend API registration call failed:', err);
      showNotice(err.message || `Failed to update status on database.`);
    }
  };

  const filteredTeams = (teams || []).filter((team) => {
    if (!team) return false;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (team.name || '').toLowerCase().includes(q) ||
      (team.tag || '').toLowerCase().includes(q) ||
      (team.university || '').toLowerCase().includes(q) ||
      (team.degreeProgram || '').toLowerCase().includes(q) ||
      (team.captain?.name || '').toLowerCase().includes(q);

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

          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => downloadTeamWiseExcel(filteredTeams)}
              className="px-3.5 py-2 bg-surface border border-gunmetal hover:border-olive text-xs font-mono text-tacticalWhite hover:text-sand transition-colors flex items-center gap-2"
              title="Download Team-Wise Roster Excel Spreadsheet (.csv / .xlsx compatible)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>EXPORT EXCEL (TEAM-WISE)</span>
            </button>

            <button
              onClick={() => downloadAllMembersExcel(filteredTeams)}
              className="px-3.5 py-2 bg-surface border border-gunmetal hover:border-olive text-xs font-mono text-tacticalWhite hover:text-sand transition-colors flex items-center gap-2"
              title="Download Master All Members List Excel Spreadsheet (.csv / .xlsx compatible)"
            >
              <Download className="w-4 h-4 text-sand" />
              <span>EXPORT EXCEL (ALL MEMBERS)</span>
            </button>

            <button
              onClick={() => {
                setLoading(true);
                loadRegistrations().finally(() => setLoading(false));
              }}
              className="px-3.5 py-2 bg-surface border border-gunmetal text-xs font-mono text-sand hover:border-sand transition-colors flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>REFRESH</span>
            </button>
          </div>
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
                    ? 'bg-olive text-black font-bold border-olive'
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
                  <th className="py-3 px-4">DEGREE PROGRAMME</th>
                  <th className="py-3 px-4">LEADER CONTACT</th>
                  <th className="py-3 px-4">ENROLLMENT NO</th>
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
                      <span className="text-tacticalWhite block font-medium truncate max-w-[180px]">
                        {team.degreeProgram || team.faculty || 'Computer Science & Tech'}
                      </span>
                      {(() => {
                        const enrollments = (team.players || []).map((p) => p.enrollmentNumber || '');
                        const check = validateSquadEnrollmentDegrees(enrollments, team.degreeProgram);
                        if (check.isValid && check.degreeCode) {
                          return (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 bg-olive/20 text-sand border border-olive/40 mt-1 font-bold">
                              ✓ SAME DEGREE ({check.degreeCode})
                            </span>
                          );
                        } else if (enrollments.some(Boolean)) {
                          return (
                            <span className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.2 bg-rose-500/10 text-rose-400 border border-rose-500/30 mt-1 font-bold">
                              ⚠ DEGREE MISMATCH
                            </span>
                          );
                        }
                        return <span className="text-[10px] text-mutedKhaki block">5 Registered Operatives</span>;
                      })()}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-tacticalWhite block font-medium">{team.captain.name}</span>
                      <span className="text-[11px] text-emerald-400 block font-bold">
                        {team.captain.whatsappNumber || team.captain.phone}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-sand font-bold">
                      {team.enrollmentNumber || team.column1 || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-mutedKhaki text-[11px]">
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
                            className="px-2.5 py-1 text-xs font-mono bg-olive/30 border border-olive hover:bg-olive hover:text-black text-sand font-bold uppercase transition-colors"
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
              title="Close Dossier"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-gunmetal pb-6 mb-6">
              <div className="relative w-16 h-16 bg-surface border border-gunmetal shrink-0 overflow-hidden">
                <Image src={selectedTeam.logo} alt={selectedTeam.name} fill className="object-cover" sizes="64px" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono text-sand uppercase tracking-widest font-bold">
                    [{selectedTeam.tag}]
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 border border-gunmetal bg-surface text-mutedKhaki">
                    STATUS: {selectedTeam.status.toUpperCase()}
                  </span>
                </div>
                <h2 className="font-display font-black text-2xl text-tacticalWhite uppercase tracking-wider truncate">
                  {selectedTeam.name}
                </h2>
                <p className="text-xs font-mono text-mutedKhaki">
                  {selectedTeam.university || 'Uva Wellassa University of Sri Lanka'}
                </p>
              </div>
            </div>

            {/* Enlistment & Academic Cohort Dossier */}
            <div className="bg-surface/80 border border-gunmetal p-4 mb-6 text-xs font-mono space-y-3">
              <div className="text-sand font-bold uppercase flex items-center justify-between border-b border-gunmetal/60 pb-2">
                <span className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-olive" /> SQUAD DOSSIER &amp; COHORT DATA
                </span>
                {selectedTeam.captain?.whatsappNumber && (
                  <a
                    href={`https://wa.me/${selectedTeam.captain.whatsappNumber.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-olive/30 text-sand border border-olive hover:bg-olive hover:text-black transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    <span>CHAT ON WHATSAPP</span>
                  </a>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-mutedKhaki">
                <div>
                  <span className="text-[10px] uppercase text-mutedKhaki/70 block">Degree Programme</span>
                  <span className="text-tacticalWhite font-medium">
                    {selectedTeam.degreeProgram || selectedTeam.faculty || 'Computer Science & Technology (CST)'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-mutedKhaki/70 block">Institution</span>
                  <span className="text-sand font-bold">
                    {selectedTeam.university || 'Uva Wellassa University of Sri Lanka'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-mutedKhaki/70 block">Enrollment No (Column1)</span>
                  <span className="text-sand font-mono font-bold">
                    {selectedTeam.enrollmentNumber || selectedTeam.column1 || '—'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-mutedKhaki/70 block">Timestamp</span>
                  <span className="text-tacticalWhite">
                    {selectedTeam.createdAt
                      ? new Date(selectedTeam.createdAt).toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })
                      : '—'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-mutedKhaki/70 block">Contact Email</span>
                  <span className="text-tacticalWhite break-all">
                    {selectedTeam.email || selectedTeam.captain.email || '—'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-mutedKhaki/70 block">WhatsApp Contact</span>
                  <span className="text-emerald-400 font-bold">
                    {selectedTeam.captain.whatsappNumber || selectedTeam.captain.phone || '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Degree Verification Audit Banner */}
            {(() => {
              const enrollments = (selectedTeam.players || []).map((p) => p.enrollmentNumber || '');
              const check = validateSquadEnrollmentDegrees(enrollments, selectedTeam.degreeProgram);
              return (
                <div
                  className={`p-3.5 border mb-6 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    check.isValid ? 'bg-olive/20 border-olive text-sand' : 'bg-rose-950/40 border-rose-800 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {check.isValid ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <span className="text-[10px] text-mutedKhaki uppercase block">DEGREE ELIGIBILITY AUDIT:</span>
                      <span className="font-bold text-tacticalWhite">{check.degreeName || selectedTeam.degreeProgram || 'Unknown Degree'}</span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2.5 py-1 border font-bold shrink-0 ${
                      check.isValid ? 'bg-surface border-emerald-500/40 text-emerald-400' : 'bg-surface border-rose-500/40 text-rose-400'
                    }`}
                  >
                    {check.isValid ? '✓ 5/5 MEMBERS SAME DEGREE' : '⚠ DEGREE MISMATCH DETECTED'}
                  </span>
                </div>
              );
            })()}

            {/* Starting 5 Operatives Lineup */}
            <div className="mb-6">
              <h3 className="font-display font-bold text-sm text-tacticalWhite uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>STARTING 5 OPERATIVES</span>
                <span className="text-[11px] font-mono text-sand">SHARED DEGREE • MEMBER YEARS</span>
              </h3>

              <div className="space-y-2">
                {selectedTeam.players.map((p, idx) => {
                  const isLeader = idx === 0 || p.role === 'Team Leader';
                  const degInfo = extractDegreeFromEnrollment(p.enrollmentNumber);
                  return (
                    <div
                      key={p.id || idx}
                      className="p-3 bg-surface/50 border border-gunmetal flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sand font-bold">0{idx + 1}.</span>
                          <span className="text-tacticalWhite font-bold">{p.name || p.ign}</span>
                          {isLeader && (
                            <span className="text-[9px] px-1.5 py-0.5 bg-olive/30 border border-olive text-sand uppercase font-bold">
                              TEAM LEADER
                            </span>
                          )}
                          <span className="text-[10px] px-1.5 py-0.2 bg-surface border border-gunmetal text-sand font-bold">
                            Year {p.year || '1'}
                          </span>
                          {degInfo && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-olive/20 border border-olive text-sand font-bold">
                              DEGREE: {degInfo.code}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-mutedKhaki mt-0.5 pl-6">
                          In Game Name: <strong className="text-sand">{p.gamingName || p.ign || '—'}</strong>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-mutedKhaki text-[11px] pl-6 sm:pl-0">
                        {p.enrollmentNumber && (
                          <span>ENROLLMENT: <strong className="text-sand">{p.enrollmentNumber}</strong></span>
                        )}
                        {p.steamId && p.steamId !== p.ign && (
                          <span>ID: <strong className="text-tacticalWhite">{p.steamId}</strong></span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-gunmetal flex items-center justify-between">
              <div className="text-xs font-mono text-mutedKhaki">
                Update Status:
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleStatusChange(selectedTeam.id, 'approved')}
                  className="px-4 py-2 bg-olive text-black font-bold border border-olive hover:bg-olive/90 font-mono text-xs uppercase font-bold transition-colors"
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
