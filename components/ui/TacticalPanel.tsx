'use client';

import React from 'react';

interface TacticalPanelProps {
  children: React.ReactNode;
  accent?: 'cyan' | 'orange' | 'neutral';
  title?: string;
  badge?: string;
  className?: string;
  showCorners?: boolean;
}

export default function TacticalPanel({
  children,
  accent = 'neutral',
  title,
  badge,
  className = '',
  showCorners = true,
}: TacticalPanelProps) {
  const accentBorder = {
    cyan: 'border-cyan/30 hover:border-cyan/60 hover:shadow-[0_0_25px_rgba(0,213,255,0.15)]',
    orange: 'border-orange/30 hover:border-orange/60 hover:shadow-[0_0_25px_rgba(255,116,56,0.15)]',
    neutral: 'border-tactical-border hover:border-tactical-borderLight',
  }[accent];

  const cornerColor = {
    cyan: 'border-cyan',
    orange: 'border-orange',
    neutral: 'border-secondaryText/50',
  }[accent];

  return (
    <div
      className={`relative bg-card/85 backdrop-blur-md border ${accentBorder} transition-all duration-300 p-6 ${className}`}
    >
      {/* Corner crosshair accents */}
      {showCorners && (
        <>
          <span className={`absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 ${cornerColor}`} />
          <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 ${cornerColor}`} />
          <span className={`absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 ${cornerColor}`} />
          <span className={`absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 ${cornerColor}`} />
        </>
      )}

      {/* Header bar if title or badge exists */}
      {(title || badge) && (
        <div className="flex items-center justify-between border-b border-tactical-border pb-3 mb-4">
          {title && (
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-3.5 ${accent === 'cyan' ? 'bg-cyan' : accent === 'orange' ? 'bg-orange' : 'bg-primaryText'}`} />
              <h3 className="font-display font-bold tracking-wider uppercase text-sm text-primaryText">
                {title}
              </h3>
            </div>
          )}
          {badge && (
            <span className="text-[10px] font-mono tracking-widest text-secondaryText uppercase px-2 py-0.5 bg-surface border border-tactical-border">
              {badge}
            </span>
          )}
        </div>
      )}

      {children}
    </div>
  );
}

