import { CheckCircle2, AlertCircle, AlertTriangle, X } from 'lucide-react';
import React from 'react';

type NoticeVariant = 'success' | 'error' | 'warning' | 'info';

interface NoticeAlertProps {
  message: string | null;
  variant?: NoticeVariant;
  onClose?: () => void;
  className?: string;
}

const variantConfig: Record<NoticeVariant, { icon: React.ReactNode; className: string }> = {
  success: {
    icon: <CheckCircle2 className="w-4 h-4 shrink-0 text-olive" />,
    className: 'bg-olive/20 border-olive text-sand',
  },
  error: {
    icon: <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />,
    className: 'bg-rose-500/10 border-rose-500/40 text-rose-400',
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />,
    className: 'bg-amber-500/10 border-amber-500/40 text-amber-400',
  },
  info: {
    icon: <AlertCircle className="w-4 h-4 shrink-0 text-cyan-400" />,
    className: 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400',
  },
};

export default function NoticeAlert({ message, variant = 'success', onClose, className = '' }: NoticeAlertProps) {
  if (!message) return null;
  const config = variantConfig[variant];

  return (
    <div className={`p-3 border text-xs font-mono flex items-center gap-2 ${config.className} ${className}`}>
      {config.icon}
      <span className="flex-1">{message}</span>
      {onClose && (
        <button type="button" onClick={onClose} className="ml-auto hover:opacity-70 transition-opacity">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

