'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'orange' | 'green' | 'red' | 'neutral';
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
    cyan: 'bg-cyan/10 text-cyan border-cyan/40',
    orange: 'bg-orange/10 text-orange border-orange/40',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40',
    red: 'bg-rose-500/10 text-rose-400 border-rose-500/40',
    neutral: 'bg-tactical-surface2 text-secondaryText border-tactical-border',
  }[variant];

  const dotStyles = {
    cyan: 'bg-cyan',
    orange: 'bg-orange',
    green: 'bg-emerald-400',
    red: 'bg-rose-400',
    neutral: 'bg-secondaryText',
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

