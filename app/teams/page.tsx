'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getStoredTeams, getLiveBroadcastChannel } from '@/lib/storage';
import { INITIAL_TEAMS } from '@/lib/mockData';
import { api } from '@/lib/api';
import { transformBackendTeam } from '@/lib/transformers';
import { Team, Player } from '@/lib/types';
import { Search, Filter, Users, CheckCircle2, Clock, XCircle, Shield, X, Mail, Phone, ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

export default function TeamsPage() {
  const { isOpen } = useRegistrationStatus();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  useEffect(() => {
    // Query public teams API directly from database
    api.public
      .getTeams()
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setTeams(res.data.map(transformBackendTeam));
        }
      })
      .catch((err) => {
        console.error('Failed to query public teams:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredTeams = (teams || []).filter((team) => {
    if (!team) return false;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (team.name || '').toLowerCase().includes(q) ||
      (team.tag || '').toLowerCase().includes(q) ||
      (team.university || '').toLowerCase().includes(q) ||
      (team.degreeProgram || '').toLowerCase().includes(q) ||
      (team.captain?.name || '').toLowerCase().includes(q);

    const statusLower = (team.status || 'pending').toLowerCase();
    const matchesStatus = statusFilter === 'all' || statusLower === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pt-28 pb-24 bg-military-black min-h-screen">
      <div className="absolute inset-0 tactical-grid-bg opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex items-center gap-2 text-xs font-mono text-mutedText mb-8">
          <Link href="/" className="hover:text-sand transition-colors">HOME</Link>
          <span>/</span>
          <span className="text-tacticalWhite">DEPLOYED SQUADS</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gunmetal mb-10">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <Badge variant="cyan" size="sm">ROSTER REGISTRY</Badge>
            </div>
            <h1 className="font-display font-black text-4xl sm:text-5xl uppercase text-tacticalWhite tracking-tight">
              REGISTERED <span className="text-sand">SQUADS</span>
            </h1>
            <p className="text-xs sm:text-sm font-mono text-mutedText mt-1">
              Collegiate tactical rosters verified under CST LAN Challenge regulations.
            </p>
          </div>

          {isOpen && (
            <Button href="/register" variant="cyan" size="md">
              REGISTER YOUR SQUAD
            </Button>
          )}
        </div>

        <div className="bg-card/70 border border-gunmetal p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-mutedText absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by team, tag, or university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-gunmetal pl-10 pr-4 py-2 text-xs font-mono text-tacticalWhite placeholder-mutedText/60 focus:outline-none focus:border-sand"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {(['all', 'approved', 'pending', 'rejected'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 text-xs font-mono uppercase font-bold tracking-wider transition-colors border ${
                  statusFilter === filter
                    ? 'bg-olive text-tacticalWhite border-olive-light/60 shadow-sm'
                    : 'bg-surface text-mutedText border-gunmetal hover:text-tacticalWhite'
                }`}
              >
                {filter} {filter === 'all' ? `(${teams.length})` : `(${teams.filter(t => t.status === filter).length})`}
              </button>
            ))}
          </div>
        </div>

        {filteredTeams.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gunmetal bg-surface/30 p-8">
            <Shield className="w-12 h-12 text-mutedText mx-auto mb-3 opacity-40" />
            <h3 className="font-display font-bold text-lg text-tacticalWhite uppercase">
              {searchQuery || statusFilter !== 'all' ? 'No Squads Found' : 'No Squads Registered Yet'}
            </h3>
            <p className="text-xs font-mono text-mutedText mt-1 mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'No registered squads match your search criteria.'
                : 'Official team registrations are open for all Uva Wellassa University faculties.'}
            </p>
            {searchQuery || statusFilter !== 'all' ? (
              <Button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} variant="ghost" size="sm">
                CLEAR FILTERS
              </Button>
            ) : isOpen ? (
              <Button href="/register" variant="cyan" size="sm">
                REGISTER YOUR SQUAD
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <div
                key={team.id}
                onClick={() => setSelectedTeam(team)}
                className="relative bg-card/80 border border-gunmetal p-6 backdrop-blur-md transition-all duration-300 hover:border-sand hover:-translate-y-1 cursor-pointer group"
              >
                <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-sand opacity-40 group-hover:opacity-100" />

                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-14 h-14 bg-surface border border-gunmetal shrink-0 overflow-hidden flex items-center justify-center">
                    {team.logo && !team.logo.includes('team-placeholder.svg') ? (
                      <Image
                        src={team.logo}
                        alt={team.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="56px"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-mono text-xs text-sand font-bold bg-darkGreen/40 border border-olive/30">
                        {team.tag?.slice(0, 3) || 'SQUAD'}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-mono text-sand tracking-wider font-bold">
                      [{team.tag}]
                    </span>
                    <h3 className="font-display font-black text-lg text-tacticalWhite uppercase tracking-wider truncate group-hover:text-sand transition-colors">
                      {team.name}
                    </h3>
                  </div>
                </div>

                <p className="text-xs font-mono text-mutedText line-clamp-1 mb-4">
                  {team.degreeProgram || team.faculty || team.university || 'Uva Wellassa University'}
                </p>

                <div className="grid grid-cols-3 gap-2 py-3 border-y border-gunmetal text-center font-mono text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-mutedText block">MATCHES</span>
                    <span className="font-bold text-tacticalWhite">{team.matchesPlayed || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-mutedText block">W / L</span>
                    <span className="font-bold text-sand">{team.wins || 0} - {team.losses || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-mutedText block">PTS</span>
                    <span className="font-bold text-olive-light">{team.points || 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-mutedText text-[11px]">APPROVAL:</span>
                  {team.status === 'approved' && (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED
                    </span>
                  )}
                  {team.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 text-sand font-semibold">
                      <Clock className="w-3.5 h-3.5" /> PENDING REVIEW
                    </span>
                  )}
                  {team.status === 'rejected' && (
                    <span className="inline-flex items-center gap-1 text-rose-500 font-semibold">
                      <XCircle className="w-3.5 h-3.5" /> REJECTED
                    </span>
                  )}
                </div>

                <div className="mt-3 text-[10px] font-mono text-center text-sand/70 group-hover:text-sand transition-colors">
                  [ CLICK TO VIEW 5-MAN ROSTER ]
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-military-black/85 backdrop-blur-md">
          <div className="relative bg-card border border-gunmetal max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
            <button
              onClick={() => setSelectedTeam(null)}
              className="absolute top-4 right-4 p-2 text-mutedText hover:text-tacticalWhite border border-gunmetal bg-surface"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-gunmetal pb-6 mb-6">
              <div className="relative w-16 h-16 bg-surface border border-olive/50 shrink-0 overflow-hidden">
                <Image
                  src={selectedTeam.logo}
                  alt={selectedTeam.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div>
                <span className="text-xs font-mono text-sand uppercase tracking-widest font-bold">
                  [{selectedTeam.tag}] • {selectedTeam.status.toUpperCase()}
                </span>
                <h2 className="font-display font-black text-2xl text-tacticalWhite uppercase tracking-wider">
                  {selectedTeam.name}
                </h2>
                <p className="text-xs font-mono text-mutedText mt-0.5">
                  {selectedTeam.degreeProgram || selectedTeam.faculty || selectedTeam.university}
                </p>
              </div>
            </div>

            <div className="bg-surface/80 border border-gunmetal p-4 mb-6 text-xs font-mono space-y-2">
              <div className="text-sand font-bold uppercase mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-sand" /> SQUAD LEADER &amp; COHORT DATA
                </span>
                {selectedTeam.captain?.whatsappNumber && (
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-mutedText">
                <div>DEGREE: <span className="text-tacticalWhite font-medium">{selectedTeam.degreeProgram || selectedTeam.faculty || 'Computer Science & Tech'}</span></div>
                <div>INSTITUTION: <span className="text-sand font-bold">{selectedTeam.university || 'Uva Wellassa University'}</span></div>
                <div>LEADER: <span className="text-tacticalWhite font-medium">{selectedTeam.captain?.name || '—'}</span></div>
                <div>WHATSAPP: <span className="text-emerald-400 font-bold">{selectedTeam.captain?.whatsappNumber || selectedTeam.captain?.phone || '—'}</span></div>
                {selectedTeam.enrollmentNumber && (
                  <div>REG NO: <span className="text-sand font-bold">{selectedTeam.enrollmentNumber}</span></div>
                )}
                {selectedTeam.email && (
                  <div>EMAIL: <span className="text-tacticalWhite font-medium">{selectedTeam.email}</span></div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-display font-bold text-sm text-tacticalWhite uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>5 SQUAD OPERATIVES</span>
                <span className="text-xs font-mono text-sand">ACTIVE LINEUP</span>
              </h3>

              <div className="space-y-2">
                {(selectedTeam.players || []).map((player, idx) => {
                  const isLeader = idx === 0 || player.role === 'Team Leader';
                  return (
                    <div
                      key={player.id || idx}
                      className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface/50 border border-gunmetal p-3 text-xs font-mono gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sand font-bold w-4">0{idx + 1}</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-tacticalWhite font-bold">{player.name || player.ign}</span>
                            {isLeader && (
                              <span className="text-[9px] px-1.5 py-0.2 bg-olive/30 border border-olive text-sand uppercase font-bold">
                                LEADER
                              </span>
                            )}
                            <span className="text-[10px] px-1.5 py-0.2 bg-card border border-gunmetal text-sand font-bold">
                              Year {player.year || '1'}
                            </span>
                          </div>
                          <span className="text-sand text-[11px] block mt-0.5">
                            Gaming Name: <strong className="text-tacticalWhite">{player.gamingName || player.ign || '—'}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-mutedText text-[11px]">
                        {player.enrollmentNumber ? (
                          <span className="text-sand font-mono">{player.enrollmentNumber}</span>
                        ) : player.steamId ? (
                          <span>{player.steamId}</span>
                        ) : null}
                        <span className="px-2 py-0.5 bg-card border border-gunmetal text-sand uppercase">
                          {isLeader ? 'Leader' : (player.role || 'Operative')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-gunmetal flex justify-end">
              <Button onClick={() => setSelectedTeam(null)} variant="ghost" size="sm">
                CLOSE DOSSIER
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

