'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error captured by ErrorBoundary:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 relative font-sans">
      <div className="max-w-md w-full bg-card/95 border border-gunmetal p-6 sm:p-8 text-center relative shadow-2xl backdrop-blur-md">
        <span className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-rose-500" />
        <span className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-rose-500" />
        <span className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-rose-500" />
        <span className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-rose-500" />

        <div className="inline-flex items-center justify-center w-14 h-14 bg-rose-950/40 border border-rose-600/60 text-rose-400 mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="text-[10px] font-mono uppercase tracking-widest text-mutedKhaki mb-1">
          TACTICAL TELEMETRY INTERRUPTION
        </div>
        <h2 className="font-display font-black text-2xl uppercase text-tacticalWhite tracking-wider mb-2">
          SYSTEM FAULT ENCOUNTERED
        </h2>
        <p className="text-xs font-mono text-mutedKhaki mb-6">
          An unexpected transmission error occurred during processing.
        </p>

        {error?.message && (
          <div className="p-3 bg-surface border border-gunmetal text-[11px] font-mono text-rose-400 text-left mb-6 break-words">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="olive"
            onClick={() => reset()}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RETRY TRANSMISSION</span>
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>RETURN HOME</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
