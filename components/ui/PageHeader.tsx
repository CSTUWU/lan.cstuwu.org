import React from 'react';
import Badge from '@/components/ui/Badge';

type BadgeVariant = 'cyan' | 'orange' | 'olive' | 'sand' | 'green' | 'red' | 'neutral';

interface PageHeaderProps {
  badge: string;
  badgeLabel?: string;
  badgeVariant?: BadgeVariant;
  titleStart: string;
  titleHighlight: string;
  description?: string;
  className?: string;
}

export default function PageHeader({
  badge,
  badgeLabel,
  badgeVariant = 'olive',
  titleStart,
  titleHighlight,
  description,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`mb-8 sm:mb-10 ${className}`}>
      <div className="inline-flex items-center gap-2 mb-3">
        <Badge variant={badgeVariant} size="sm">
          {badge}
        </Badge>
        {badgeLabel && (
          <span className="text-[11px] font-mono text-mutedKhaki">{'// '}{badgeLabel}</span>
        )}
      </div>
      <h1 className="font-display font-black text-3xl sm:text-4xl md:text-5xl uppercase text-tacticalWhite tracking-widest leading-none">
        {titleStart} <span className="text-sand">{titleHighlight}</span>
      </h1>
      {description && (
        <p className="text-xs sm:text-sm font-mono text-mutedKhaki mt-2">{description}</p>
      )}
    </div>
  );
}
