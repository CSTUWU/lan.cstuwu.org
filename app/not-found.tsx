import React from 'react';
import Link from 'next/link';
import { ShieldAlert, Home, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 relative font-sans">
      <div className="max-w-md w-full bg-card/95 border border-gunmetal p-6 sm:p-8 text-center relative shadow-2xl backdrop-blur-md">
        <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-sand" />
        <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-sand" />
        <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-sand" />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-sand" />

        <div className="inline-flex items-center justify-center w-14 h-14 bg-surface border border-gunmetal text-sand mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="text-[10px] font-mono uppercase tracking-widest text-mutedKhaki mb-1">
          STATUS 404 // SECTOR NOT FOUND
        </div>
        <h2 className="font-display font-black text-2xl uppercase text-tacticalWhite tracking-wider mb-2">
          TARGET MISSING IN ACTION
        </h2>
        <p className="text-xs font-mono text-mutedKhaki mb-6">
          The requested tactical sector or dossier URL does not exist or has been relocated by tournament command.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="olive"
              className="w-full flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>RETURN TO BASE</span>
            </Button>
          </Link>

          <Link href="/scoreboard" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>LIVE SCOREBOARD</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
