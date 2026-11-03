'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getStoredTeams } from '@/lib/storage';
import { INITIAL_TEAMS } from '@/lib/mockData';
import { Team } from '@/lib/types';
import { Users, ChevronRight, CheckCircle2, Clock, XCircle, Shield } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

export default function TeamsPreview() {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);

  useEffect(() => {
    setTeams(getStoredTeams());
    const handleUpdate = () => setTeams(getStoredTeams());
    window.addEventListener('cst_teams_updated', handleUpdate);
    return () => window.removeEventListener('cst_teams_updated', handleUpdate);
  }, []);

  const displayTeams = teams.slice(0, 4);

  return (
    <section className="relative py-24 bg-[#090D14] border-t border-tactical-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-tactical-border">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <Badge variant="cyan" size="sm">ROSTER ROSTER // SQUADRON WATCH</Badge>
              <span className="text-secondaryText text-xs font-mono">{"// DEMO DATA"}</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase text-white tracking-tight">
              REGISTERED <span className="text-cyan">UNIVERSITY</span> TEAMS
            </h2>
          </div>

          <Link
            href="/teams"
            className="inline-flex items-center gap-2 text-xs font-mono text-cyan hover:text-white uppercase tracking-wider group transition-colors"
          >
            <span>VIEW ALL SQUADS ({teams.length})</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Teams Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {displayTeams.map((team) => (
            <div
              key={team.id}
              className="relative bg-card/80 border border-tactical-border p-5 backdrop-blur-sm transition-all duration-300 hover:border-cyan/50 hover:-translate-y-1 group"
            >
              {/* Corner accent */}
              <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan opacity-40 group-hover:opacity-100" />

              <div className="flex items-center gap-3.5 mb-4">
                <div className="relative w-12 h-12 bg-surface border border-tactical-border/80 overflow-hidden shrink-0">
                  <Image
                    src={team.logo}
                    alt={team.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform"
                    sizes="48px"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-mono text-cyan tracking-wider truncate">
                    [{team.tag}]
                  </div>
                  <h3 className="font-display font-bold text-base text-white tracking-wide truncate group-hover:text-cyan transition-colors">
                    {team.name}
                  </h3>
                </div>
              </div>

              <div className="text-xs font-mono text-secondaryText truncate mb-4">
                {team.university}
              </div>

              <div className="pt-3 border-t border-tactical-border/70 flex items-center justify-between text-xs font-mono">
                <span className="text-secondaryText">STATUS:</span>
                {team.status === 'approved' && (
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED
                  </span>
                )}
                {team.status === 'pending' && (
                  <span className="flex items-center gap-1 text-tactical-gold font-semibold">
                    <Clock className="w-3.5 h-3.5" /> PENDING
                  </span>
                )}
                {team.status === 'rejected' && (
                  <span className="flex items-center gap-1 text-rose-500 font-semibold">
                    <XCircle className="w-3.5 h-3.5" /> REJECTED
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Strip */}
        <div className="bg-surface/60 border border-tactical-border p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h4 className="font-display font-bold text-base text-white uppercase tracking-wider">
              IS YOUR UNIVERSITY READY TO COMPETE?
            </h4>
            <p className="text-xs font-mono text-secondaryText mt-0.5">
              Secure your team slot before registration reaches maximum bracket capacity.
            </p>
          </div>
          <Button href="/register" variant="cyan" size="sm">
            REGISTER YOUR SQUAD
          </Button>
        </div>

      </div>
    </section>
  );
}

