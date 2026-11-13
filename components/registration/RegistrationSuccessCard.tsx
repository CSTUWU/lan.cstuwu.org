import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import TeamLogoAvatar from '@/components/ui/TeamLogoAvatar';
import { Team } from '@/lib/types';

interface RegistrationSuccessCardProps {
  createdTeam: Team;
  submissionTimestamp?: string;
  onReset: () => void;
  className?: string;
}

export default function RegistrationSuccessCard({
  createdTeam,
  submissionTimestamp,
  onReset,
  className = '',
}: RegistrationSuccessCardProps) {
  return (
    <div className={`bg-card border border-gunmetal p-8 sm:p-12 text-center shadow-2xl ${className}`}>
      <div className="w-16 h-16 bg-olive/20 border border-olive rounded-full flex items-center justify-center mx-auto mb-6 text-sand">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <Badge variant="olive" size="md" className="mb-4">
        ENLISTMENT RECORDED IN TOURNAMENT REGISTRY
      </Badge>

      <h2 className="font-display font-black text-3xl sm:text-4xl uppercase text-tacticalWhite tracking-wider mb-2">
        SQUAD ENLISTMENT SUCCESSFUL
      </h2>

      <p className="text-xs sm:text-sm font-mono text-mutedKhaki max-w-lg mx-auto mb-8">
        Your registration for <strong className="text-tacticalWhite">{createdTeam.name} [{createdTeam.tag}]</strong> has been recorded under reference code: <span className="text-sand font-bold">{createdTeam.id}</span>. Status: <span className="text-sand font-bold">PENDING ADMINISTRATIVE APPROVAL</span>.
      </p>

      <div className="bg-surface/80 border border-gunmetal p-6 max-w-xl mx-auto text-left font-mono text-xs mb-8">
        <div className="flex items-center gap-4 border-b border-gunmetal pb-4 mb-4">
          <TeamLogoAvatar src={createdTeam.logo} name={createdTeam.name} size="lg" />
          <div>
            <div className="text-sand font-bold text-base">{createdTeam.name} [{createdTeam.tag}]</div>
            <div className="text-tacticalWhite">{createdTeam.degreeProgram}</div>
            <div className="text-mutedKhaki text-[11px]">Uva Wellassa University of Sri Lanka</div>
          </div>
        </div>

        <div className="space-y-2.5 text-mutedKhaki">
          <div className="flex items-center gap-2 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-sand" />
            <span>TIMESTAMP: <strong className="text-tacticalWhite">{new Date(submissionTimestamp || createdTeam.createdAt).toLocaleString()}</strong></span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-gunmetal">
            <div>
              <span className="text-sand font-bold block">EMAIL ADDRESS:</span>
              <span className="text-tacticalWhite">{createdTeam.email || createdTeam.captain.email}</span>
            </div>
            <div>
              <span className="text-sand font-bold block">WHATSAPP NUMBER:</span>
              <span className="text-emerald-400 font-bold">{createdTeam.captain.whatsappNumber}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-sand font-bold block">DEGREE PROGRAMME (SHARED BY SQUAD):</span>
              <span className="text-tacticalWhite font-bold">{createdTeam.degreeProgram}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-gunmetal">
            <span className="text-sand font-bold block mb-2 uppercase">5-MEMBER SQUAD ROSTER (INDIVIDUAL ENROLLMENT NUMBERS):</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {createdTeam.players.map((p, idx) => (
                <div key={idx} className="p-2.5 bg-card border border-gunmetal text-[11px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sand font-bold">
                      {idx === 0 ? 'Member 1 (Leader)' : `Member ${idx + 1}`}
                    </span>
                    <span className="text-[10px] text-mutedKhaki bg-surface px-1.5 py-0.2 border border-gunmetal">
                      IGN: <strong className="text-sand">{p.ign || p.gamingName || '—'}</strong>
                    </span>
                  </div>
                  <div className="text-tacticalWhite font-medium truncate">{p.name}</div>
                  <div className="text-[10px] text-mutedKhaki font-mono mt-1.5 flex items-center justify-between border-t border-gunmetal/50 pt-1">
                    <span>Year: <strong className="text-sand">Year {p.year || '1'}</strong></span>
                    <span>ENROLLMENT: <strong className="text-tacticalWhite">{p.enrollmentNumber || '—'}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button href="/teams" variant="olive" size="md">
          VIEW REGISTERED SQUADS
        </Button>
        <Button onClick={onReset} variant="outline" size="md">
          ENLIST ANOTHER SQUAD
        </Button>
      </div>
    </div>
  );
}

