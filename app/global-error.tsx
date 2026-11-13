'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0b0e0c] text-[#f4f7f4] min-h-screen flex items-center justify-center p-4 font-mono">
        <div className="max-w-md w-full bg-[#121714] border border-[#232c25] p-8 text-center shadow-2xl">
          <h2 className="text-xl font-bold uppercase tracking-wider text-amber-400 mb-2">
            CRITICAL APPLICATION FAULT
          </h2>
          <p className="text-xs text-[#8c9e8f] mb-6">
            A critical system fault occurred in the root hierarchy.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 bg-[#435940] hover:bg-[#526d4e] text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            REBOOT SYSTEM
          </button>
        </div>
      </body>
    </html>
  );
}

