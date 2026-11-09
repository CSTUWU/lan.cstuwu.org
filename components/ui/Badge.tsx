'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'orange' | 'olive' | 'sand' | 'green' | 'red' | 'neutral';
  size?: 'sm' | 'md';
  pulse?: boolean;
  className?: string;
}

export default function Badge({
  children,
  variant = 'cyan',
  size = 'md',
  pulse = false,
  className = '',
}: BadgeProps) {
  const styles = {
    cyan: 'bg-olive/20 text-sand border-olive/50',
    olive: 'bg-olive/20 text-sand border-olive/50',
    orange: 'bg-sand/15 text-sand border-sand/40',
    sand: 'bg-sand/15 text-sand border-sand/40',
    green: 'bg-emerald-900/30 text-emerald-300 border-emerald-700/50',
    red: 'bg-rose-950/40 text-rose-300 border-rose-800/50',
    neutral: 'bg-surface text-mutedText border-gunmetal',
  }[variant];

  const dotStyles = {
    cyan: 'bg-olive-light',
    olive: 'bg-olive-light',
    orange: 'bg-sand',
    sand: 'bg-sand',
    green: 'bg-emerald-400',
    red: 'bg-rose-400',
    neutral: 'bg-khaki',
  }[variant];

  const sizeClass = size === 'sm' ? 'text-[10px] px-2.5 py-0.5' : 'text-xs px-3.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono uppercase tracking-wider font-semibold border clip-badge ${styles} ${sizeClass} ${className}`}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotStyles}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotStyles}`} />
        </span>
      )}
      {children}
    </span>
  );
}

