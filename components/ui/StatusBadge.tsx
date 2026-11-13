type StatusValue = 'approved' | 'pending' | 'rejected' | 'live' | 'completed' | 'upcoming' | 'open' | string;

interface StatusBadgeProps {
  status: StatusValue;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  approved:  { label: 'APPROVED',  className: 'text-sand bg-olive/20 border-olive' },
  pending:   { label: 'PENDING',   className: 'text-mutedKhaki bg-gunmetal border-gunmetal' },
  rejected:  { label: 'REJECTED',  className: 'text-rose-400 bg-rose-500/10 border-rose-500/40' },
  live:      { label: 'LIVE',      className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40' },
  completed: { label: 'COMPLETED', className: 'text-mutedKhaki bg-gunmetal border-gunmetal' },
  upcoming:  { label: 'UPCOMING',  className: 'text-sand bg-olive/10 border-olive/40' },
  open:      { label: 'OPEN',      className: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/40' },
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const normalized = (status || '').toLowerCase();
  const config = statusConfig[normalized] ?? {
    label: (status || 'UNKNOWN').toUpperCase(),
    className: 'text-mutedKhaki bg-gunmetal border-gunmetal',
  };

  return (
    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${config.className} ${className}`}>
      {config.label}
    </span>
  );
}

