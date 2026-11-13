import React from 'react';
import { Lock, Users, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';

interface RegistrationClosedCardProps {
  className?: string;
}

export default function RegistrationClosedCard({ className = '' }: RegistrationClosedCardProps) {
  return (
    <div
      className={`relative bg-card/95 border-2 border-rose-800/60 p-8 sm:p-12 text-center backdrop-blur-2xl shadow-[0_4px_40px_rgba(0,0,0,0.85)] ${className}`}
    >
      <span className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-rose-500" />
      <span className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-rose-500" />
      <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-rose-500" />
      <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-rose-500" />

      <div className="w-16 h-16 rounded-full bg-rose-950/40 border border-rose-700/50 flex items-center justify-center mx-auto mb-6 text-rose-400">
        <Lock className="w-8 h-8 animate-pulse" />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-950/40 border border-rose-700/50 text-rose-300 text-xs font-mono uppercase tracking-widest font-bold mb-4">
        <span>ADMINISTRATIVE GATE // CLOSED</span>
      </div>

      <h1 className="font-display font-black text-3xl sm:text-4xl uppercase text-tacticalWhite tracking-tight mb-3">
        REGISTRATIONS ARE CURRENTLY <span className="text-rose-400">CLOSED</span>
      </h1>

      <p className="text-xs sm:text-sm font-mono text-mutedKhaki leading-relaxed max-w-lg mx-auto mb-8">
        Official squad submissions for CST LAN Challenge 2026 have concluded. The tournament brackets and live stage fixtures are now active.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button href="/teams" variant="olive" size="md" icon={<Users className="w-4 h-4" />}>
          VIEW REGISTERED SQUADS
        </Button>
        <Button href="/schedule" variant="outline" size="md" icon={<Calendar className="w-4 h-4" />}>
          VIEW MATCH SCHEDULE
        </Button>
      </div>
    </div>
  );
}

