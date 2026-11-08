'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getStoredTeams, getLiveBroadcastChannel } from '@/lib/storage';
import { INITIAL_TEAMS } from '@/lib/mockData';
import { api } from '@/lib/api';
import { transformBackendTeam } from '@/lib/transformers';
import { Team } from '@/lib/types';
import { Users, ChevronRight, CheckCircle2, Clock, XCircle, Shield } from 'lucide-react';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

export default function TeamsPreview() {
  const { isOpen } = useRegistrationStatus();
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Instant local render from storage
    const local = getStoredTeams();
    if (local && local.length > 0) {
      setTeams(local);
      setIsLoading(false);
    }

    // 2. Fetch live registered squads from backend API
    api.public
      .getTeams()
      .then((res) => {
        if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
          const transformed = res.data.map(transformBackendTeam);
          setTeams(transformed);

          // Synchronize with localStorage
          const localTeams = getStoredTeams();
          const merged = [...transformed];
          localTeams.forEach((lt) => {
            if (!merged.some((m) => m.id === lt.id || m.name.toLowerCase() === lt.name.toLowerCase())) {
              merged.push(lt);
            }
          });
          if (typeof window !== 'undefined') {
            localStorage.setItem('cst_lan_teams_2026', JSON.stringify(merged));
          }
        }
      })
      .catch((err) => {
        console.warn('TeamsPreview: backend offline, using local teams', err);
      })
      .finally(() => {
        setIsLoading(false);
      });

    // 3. Listen to local and cross-tab update events
    const handleUpdate = () => {
      setTeams(getStoredTeams());
    };

    window.addEventListener('cst_teams_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    const channel = getLiveBroadcastChannel();
    const handleChannelMsg = (event: MessageEvent) => {
      if (event.data?.type === 'CST_TEAMS_UPDATE') {
        handleUpdate();
      }
    };
    channel?.addEventListener('message', handleChannelMsg);

    return () => {
      window.removeEventListener('cst_teams_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      channel?.removeEventListener('message', handleChannelMsg);
    };
  }, []);

  const displayTeams = teams.slice(0, 4);

  return (
    <section className="relative py-24 bg-[#090D14] border-t border-tactical-border overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-tactical-border">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <Badge variant="cyan" size="sm">ROSTER WATCH // OFFICIAL TEAMS</Badge>
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

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 bg-card/60 border border-tactical-border/50 p-5 rounded" />
            ))}
          </div>
        ) : displayTeams.length === 0 ? (
          <div className="border border-dashed border-tactical-border bg-card/40 p-10 text-center mb-12">
            <Users className="w-10 h-10 text-cyan/40 mx-auto mb-3" />
            <h3 className="font-display font-black text-xl text-white uppercase tracking-wider mb-2">
              {isOpen ? 'REGISTRATIONS OPEN // ROSTER STANDBY' : 'REGISTRATIONS CLOSED // ROSTER STANDBY'}
            </h3>
            <p className="text-xs font-mono text-secondaryText max-w-md mx-auto mb-6">
              {isOpen
                ? 'Squad registrations are open for all Uva Wellassa University faculties. Enlist your 5-player squad to enter the official tournament brackets.'
                : 'Squad registrations are currently closed by administration. Stay tuned for official tournament bracket announcements.'}
            </p>
            {isOpen && (
              <Button href="/register" variant="cyan" size="sm">
                BE THE FIRST TO REGISTER
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {displayTeams.map((team) => {
              const hasLogo = Boolean(
                team.logo &&
                typeof team.logo === 'string' &&
                team.logo.trim() !== '' &&
                !team.logo.includes('team-placeholder.svg')
              );
              const statusLower = (team.status || 'pending').toLowerCase();

              return (
                <div
                  key={team.id}
                  className="relative bg-card/80 border border-tactical-border p-5 backdrop-blur-sm transition-all duration-300 hover:border-cyan/50 hover:-translate-y-1 group"
                >
                  {/* Corner accent */}
                  <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan opacity-40 group-hover:opacity-100" />

                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="relative w-12 h-12 bg-surface border border-tactical-border/80 overflow-hidden shrink-0 flex items-center justify-center">
                      {hasLogo ? (
                        <Image
                          src={team.logo}
                          alt={team.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-mono text-xs text-cyan font-bold bg-[#0F172A] border border-cyan/20">
                          {team.tag?.slice(0, 3) || 'CS2'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-mono text-cyan tracking-wider truncate font-bold">
                        [{team.tag || 'SQUAD'}]
                      </div>
                      <h3
                        className="font-display font-bold text-base text-white tracking-wide truncate group-hover:text-cyan transition-colors"
                        title={team.name}
                      >
                        {team.name}
                      </h3>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-secondaryText truncate mb-4">
                    {team.university || 'Uva Wellassa University of Sri Lanka'}
                  </div>

                  <div className="pt-3 border-t border-tactical-border/70 flex items-center justify-between text-xs font-mono">
                    <span className="text-secondaryText">STATUS:</span>
                    {statusLower === 'approved' && (
                      <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> APPROVED
                      </span>
                    )}
                    {statusLower === 'pending' && (
                      <span className="flex items-center gap-1 text-tactical-gold font-semibold">
                        <Clock className="w-3.5 h-3.5" /> PENDING
                      </span>
                    )}
                    {statusLower === 'rejected' && (
                      <span className="flex items-center gap-1 text-rose-500 font-semibold">
                        <XCircle className="w-3.5 h-3.5" /> REJECTED
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isOpen && (
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
        )}

      </div>
    </section>
  );
}

