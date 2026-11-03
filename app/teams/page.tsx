'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getStoredTeams } from '@/lib/storage';
import { INITIAL_TEAMS } from '@/lib/mockData';
import { api } from '@/lib/api';
import { transformBackendTeam } from '@/lib/transformers';
import { Team, Player } from '@/lib/types';
import { Search, Filter, Users, CheckCircle2, Clock, XCircle, Shield, X, Mail, Phone, ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  useEffect(() => {
    setTeams(getStoredTeams());
    
    // Query public teams API
    api.public.getTeams().then((res) => {
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        setTeams(res.data.map(transformBackendTeam));
      }
    }).catch(() => {});

    const handleUpdate = () => setTeams(getStoredTeams());
    window.addEventListener('cst_teams_updated', handleUpdate);
    return () => window.removeEventListener('cst_teams_updated', handleUpdate);
  }, []);

  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.university.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || team.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pt-28 pb-24 bg-[#080B10] min-h-screen">
      <div className="absolute inset-0 tactical-grid-bg opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-secondaryText mb-8">
          <Link href="/" className="hover:text-cyan transition-colors">HOME</Link>
          <span>/</span>
          <span className="text-white">REGISTERED SQUADS</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-tactical-border mb-10">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <Badge variant="cyan" size="sm">ROSTER REGISTRY</Badge>
              <span className="text-xs font-mono text-secondaryText">{"// DEMONSTRATION DATA"}</span>
            </div>
            <h1 className="font-display font-black text-4xl sm:text-5xl uppercase text-white tracking-tight">
              REGISTERED <span className="text-cyan">TEAMS</span>
            </h1>
            <p className="text-xs sm:text-sm font-mono text-secondaryText mt-1">
              Collegiate Counter-Strike 2 rosters verified under CST LAN Challenge regulations.
            </p>
          </div>

          <Button href="/register" variant="cyan" size="md">
            REGISTER YOUR SQUAD
          </Button>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-card/70 border border-tactical-border p-4 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-secondaryText absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by team, tag, or university..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-tactical-border pl-10 pr-4 py-2 text-xs font-mono text-white placeholder-secondaryText/60 focus:outline-none focus:border-cyan"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            {(['all', 'approved', 'pending', 'rejected'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1.5 text-xs font-mono uppercase font-bold tracking-wider transition-colors border ${
                  statusFilter === filter
                    ? 'bg-cyan text-background border-cyan'
                    : 'bg-surface text-secondaryText border-tactical-border hover:text-white'
                }`}
              >
                {filter} {filter === 'all' ? `(${teams.length})` : `(${teams.filter(t => t.status === filter).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Teams Grid */}
        {filteredTeams.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-tactical-border bg-surface/30 p-8">
            <Shield className="w-12 h-12 text-secondaryText mx-auto mb-3 opacity-40" />
            <h3 className="font-display font-bold text-lg text-white uppercase">No Teams Found</h3>
            <p className="text-xs font-mono text-secondaryText mt-1 mb-6">
              No registered squads match your search criteria.
            </p>
            <Button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} variant="ghost" size="sm">
              CLEAR FILTERS
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <div
                key={team.id}
                onClick={() => setSelectedTeam(team)}
                className="relative bg-card/80 border border-tactical-border p-6 backdrop-blur-md transition-all duration-300 hover:border-cyan/60 hover:-translate-y-1 cursor-pointer group"
              >
                {/* Corner indicator */}
                <span className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan opacity-40 group-hover:opacity-100" />

                {/* Team header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-14 h-14 bg-surface border border-tactical-border shrink-0 overflow-hidden">
                    <Image
                      src={team.logo}
                      alt={team.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="56px"
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-mono text-cyan tracking-wider font-bold">
                      [{team.tag}]
                    </span>
                    <h3 className="font-display font-black text-lg text-white uppercase tracking-wider truncate group-hover:text-cyan transition-colors">
                      {team.name}
                    </h3>
                  </div>
                </div>

                {/* University Affiliation */}
                <p className="text-xs font-mono text-secondaryText line-clamp-1 mb-4">
                  {team.university}
                </p>

                {/* Stats / Player mini count */}
                <div className="grid grid-cols-3 gap-2 py-3 border-y border-tactical-border/60 text-center font-mono text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-secondaryText block">MATCHES</span>
                    <span className="font-bold text-white">{team.matchesPlayed || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-secondaryText block">W / L</span>
                    <span className="font-bold text-cyan">{team.wins || 0} - {team.losses || 0}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-secondaryText block">PTS</span>
                    <span className="font-bold text-orange">{team.points || 0}</span>
                  </div>
                </div>

                {/* Footer status */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-secondaryText text-[11px]">APPROVAL:</span>
                  {team.status === 'approved' && (
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED
                    </span>
                  )}
                  {team.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 text-tactical-gold font-semibold">
                      <Clock className="w-3.5 h-3.5" /> PENDING REVIEW
                    </span>
                  )}
                  {team.status === 'rejected' && (
                    <span className="inline-flex items-center gap-1 text-rose-500 font-semibold">
                      <XCircle className="w-3.5 h-3.5" /> REJECTED
                    </span>
                  )}
                </div>

                {/* View Details hint */}
                <div className="mt-3 text-[10px] font-mono text-center text-cyan/70 group-hover:text-cyan transition-colors">
                  [ CLICK TO VIEW 5-MAN ROSTER ]
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Roster Detail Modal */}
      {selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/85 backdrop-blur-md">
          <div className="relative bg-card border border-cyan/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setSelectedTeam(null)}
              className="absolute top-4 right-4 p-2 text-secondaryText hover:text-white border border-tactical-border bg-surface"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 border-b border-tactical-border pb-6 mb-6">
              <div className="relative w-16 h-16 bg-surface border border-cyan/40 shrink-0 overflow-hidden">
                <Image
                  src={selectedTeam.logo}
                  alt={selectedTeam.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div>
                <span className="text-xs font-mono text-cyan uppercase tracking-widest font-bold">
                  [{selectedTeam.tag}] • {selectedTeam.status.toUpperCase()}
                </span>
                <h2 className="font-display font-black text-2xl text-white uppercase tracking-wider">
                  {selectedTeam.name}
                </h2>
                <p className="text-xs font-mono text-secondaryText mt-0.5">
                  {selectedTeam.university}
                </p>
              </div>
            </div>

            {/* Captain Information */}
            <div className="bg-surface/80 border border-tactical-border p-4 mb-6 text-xs font-mono">
              <div className="text-cyan font-bold uppercase mb-2 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> TEAM CAPTAIN
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-secondaryText">
                <div>NAME: <span className="text-white font-medium">{selectedTeam.captain.name}</span></div>
                <div>EMAIL: <span className="text-white font-medium truncate block">{selectedTeam.captain.email}</span></div>
                <div>PHONE: <span className="text-white font-medium">{selectedTeam.captain.phone}</span></div>
              </div>
            </div>

            {/* 5 Main Players */}
            <div className="mb-6">
              <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider mb-3 flex items-center justify-between">
                <span>5 MAIN PLAYERS (REQUIRED)</span>
                <span className="text-xs font-mono text-cyan">ACTIVE STARTING FIVE</span>
              </h3>

              <div className="space-y-2">
                {selectedTeam.players.map((player, idx) => (
                  <div
                    key={player.id || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface/50 border border-tactical-border p-3 text-xs font-mono gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-cyan font-bold w-4">0{idx + 1}</span>
                      <div>
                        <span className="text-white font-bold">{player.ign}</span>{' '}
                        <span className="text-secondaryText">({player.name})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-secondaryText text-[11px]">
                      <span>{player.steamId}</span>
                      {player.role && (
                        <span className="px-2 py-0.5 bg-card border border-tactical-border text-cyan">
                          {player.role}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Substitute */}
            {selectedTeam.substitute && (
              <div className="mb-6">
                <h3 className="font-display font-bold text-sm text-secondaryText uppercase tracking-wider mb-2">
                  DESIGNATED SUBSTITUTE (OPTIONAL)
                </h3>
                <div className="bg-surface/30 border border-dashed border-tactical-border p-3 text-xs font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-orange font-bold mr-2">[SUB]</span>
                    <span className="text-white font-bold">{selectedTeam.substitute.ign}</span>{' '}
                    <span className="text-secondaryText">({selectedTeam.substitute.name})</span>
                  </div>
                  <div className="text-[11px] text-secondaryText">
                    {selectedTeam.substitute.steamId}
                  </div>
                </div>
              </div>
            )}

            {/* Modal Bottom Close */}
            <div className="pt-4 border-t border-tactical-border flex justify-end">
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

