import React from 'react';
import { GitBranch, Radio, Lock, RotateCcw, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';

interface PlayoffTreeActionsProps {
  isTreePublished: boolean;
  onTogglePublish: () => void | Promise<void>;
  onSeedTree: (action: 'seed' | 'recreate') => void | Promise<void>;
  loading?: boolean;
  teamsCount?: number;
  className?: string;
}

export default function PlayoffTreeActions({
  isTreePublished,
  onTogglePublish,
  onSeedTree,
  loading = false,
  teamsCount,
  className = '',
}: PlayoffTreeActionsProps) {
  return (
    <div
      className={`bg-surface/80 border border-gunmetal p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-olive/20 border border-olive flex items-center justify-center shrink-0 text-sand">
          <GitBranch className="w-4 h-4" />
        </div>
        <div>
          <div className="text-tacticalWhite font-bold flex items-center gap-2">
            <span>TOURNAMENT PLAYOFF ELIMINATION BRACKET</span>
            <span
              className={`text-[9px] px-1.5 py-0.5 border font-bold uppercase ${
                isTreePublished
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                  : 'bg-gunmetal text-mutedKhaki border-gunmetal'
              }`}
            >
              {isTreePublished ? 'PUBLIC: VISIBLE' : 'PUBLIC: HIDDEN'}
            </span>
          </div>
          <p className="text-mutedKhaki text-[11px] mt-0.5">
            Automatic seeding of 16-team bracket matrix and public visibility control.
            {teamsCount !== undefined && ` (${teamsCount} squads loaded)`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={() => onSeedTree('recreate')}
          variant="outline"
          size="sm"
          disabled={loading}
          icon={loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
        >
          RE-SEED BRACKET
        </Button>

        <Button
          onClick={onTogglePublish}
          variant={isTreePublished ? 'outline' : 'olive'}
          size="sm"
          disabled={loading}
          icon={isTreePublished ? <Lock className="w-3.5 h-3.5" /> : <Radio className="w-3.5 h-3.5" />}
        >
          {isTreePublished ? 'UNPUBLISH FROM PUBLIC HUD' : 'PUBLISH BRACKET TO HUD'}
        </Button>
      </div>
    </div>
  );
}
