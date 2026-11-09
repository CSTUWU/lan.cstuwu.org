'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { resetAllData, getStoredTeams, getStoredMatches, getStoredCountdown, isPlayoffTreePublished, setPlayoffTreePublished } from '@/lib/storage';
import { api } from '@/lib/api';
import { Settings, RotateCcw, Download, CheckCircle2, AlertTriangle, Shield, Radio, Lock, Trophy } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function AdminSettingsPage() {
  const [resetDone, setResetDone] = useState(false);
  const [isTreePublished, setIsTreePublished] = useState<boolean>(() => isPlayoffTreePublished());
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  useEffect(() => {
    setIsTreePublished(isPlayoffTreePublished());

    api.public.getSettings().then((res) => {
      if (res?.data?.playoffTreePublished !== undefined) {
        setIsTreePublished(res.data.playoffTreePublished);
        setPlayoffTreePublished(res.data.playoffTreePublished);
      }
    }).catch(() => {});

    const handlePubChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ published: boolean }>;
      if (typeof customEvent.detail?.published === 'boolean') {
        setIsTreePublished(customEvent.detail.published);
      } else {
        setIsTreePublished(isPlayoffTreePublished());
      }
    };
    window.addEventListener('cst_playoff_published_changed', handlePubChange);
    return () => window.removeEventListener('cst_playoff_published_changed', handlePubChange);
  }, []);

  const handleTogglePublish = async () => {
    const nextState = !isTreePublished;
    setIsTreePublished(nextState);
    setPlayoffTreePublished(nextState);
    try {
      await api.admin.updateSettings({ playoffTreePublished: nextState });
    } catch (e) {}
    setStatusNotice(
      nextState
        ? '✓ Playoff Championship Tree PUBLISHED to live public scoreboard!'
        : '✓ Playoff Tree UNPUBLISHED. Public scoreboard is now in Standby mode.'
    );
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleResetData = () => {
    if (confirm('Are you sure you want to purge local tournament storage and initialize a clean production state?')) {
      resetAllData();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 3000);
    }
  };

  const handleExportData = () => {
    const backup = {
      teams: getStoredTeams(),
      matches: getStoredMatches(),
      countdown: getStoredCountdown(),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cst_lan_challenge_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gunmetal">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <Badge variant="olive" size="sm">SYSTEM GOVERNANCE</Badge>
              <span className="text-[11px] font-mono text-mutedKhaki">{"// CONFIGURATION & MAINTENANCE"}</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase text-tacticalWhite tracking-wider">
              TOURNAMENT SETTINGS & STORAGE
            </h1>
            <p className="text-xs font-mono text-mutedKhaki">
              Manage client-side demonstration storage, restore default presets, or export tournament archives.
            </p>
          </div>
        </div>

        {resetDone && (
          <div className="p-4 bg-olive/20 border border-olive flex items-center gap-3 text-xs font-mono text-sand">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-olive" />
            <span>Local tournament dataset purged and initialized to clean production state!</span>
          </div>
        )}

        {statusNotice && (
          <div className="p-4 bg-olive/20 border border-olive flex items-center gap-3 text-xs font-mono text-sand">
            <Radio className="w-5 h-5 shrink-0 text-sand animate-pulse" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Playoff Tree Publication Governance */}
        <div className="bg-card/90 border border-gunmetal p-6 sm:p-8 backdrop-blur-md">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-surface border border-gunmetal shrink-0">
              <Trophy className="w-6 h-6 text-sand" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`w-2.5 h-2.5 rounded-full ${isTreePublished ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <Badge variant={isTreePublished ? 'green' : 'orange'} size="sm">
                  {isTreePublished ? 'LIVE & PUBLISHED' : 'DISABLED (STANDBY)'}
                </Badge>
              </div>
              <h3 className="font-display font-bold text-base text-tacticalWhite uppercase tracking-wider">
                PLAYOFF CHAMPIONSHIP TREE PUBLICATION GATE
              </h3>
              <p className="text-xs font-mono text-mutedKhaki mt-1 leading-relaxed">
                Controls the public visibility of the championship playoff tree. When disabled, public spectators visiting the Scoreboard see the pre-tournament standby frequency. When published, the live symmetrical bracket tree is revealed.
              </p>
            </div>
          </div>

          <button
            onClick={handleTogglePublish}
            className={`px-5 py-3 font-mono text-xs uppercase font-black tracking-wider flex items-center gap-2 clip-tactical shadow-lg transition-all ${
              isTreePublished
                ? 'bg-rose-950/80 border border-rose-700 text-rose-300 hover:bg-rose-900'
                : 'bg-emerald-600 hover:bg-emerald-500 text-tacticalWhite border border-emerald-500 shadow-[0_2px_14px_rgba(16,185,129,0.4)]'
            }`}
          >
            {isTreePublished ? (
              <>
                <Lock className="w-4 h-4 text-rose-300" />
                <span>DISABLE / UNPUBLISH PLAYOFF TREE</span>
              </>
            ) : (
              <>
                <Radio className="w-4 h-4 animate-pulse" />
                <span>PUBLISH PLAYOFF TREE TO PUBLIC</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-card/90 border border-gunmetal p-6 sm:p-8 backdrop-blur-md">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-surface border border-gunmetal shrink-0">
              <RotateCcw className="w-6 h-6 text-sand" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-tacticalWhite uppercase tracking-wider">
                PURGE LOCAL STORAGE & INITIALIZE CLEAN STATE
              </h3>
              <p className="text-xs font-mono text-mutedKhaki mt-1 leading-relaxed">
                Clears all client-side cached registrations, matches, and restores clean production database synchronization for live university publishing.
              </p>
            </div>
          </div>

          <button
            onClick={handleResetData}
            className="px-4 py-2.5 bg-surface border border-rose-800 hover:bg-rose-900 hover:text-white font-mono text-xs text-rose-300 font-bold uppercase transition-colors"
          >
            RESET TO CLEAN PRODUCTION STATE
          </button>
        </div>

        <div className="bg-card/90 border border-gunmetal p-6 sm:p-8 backdrop-blur-md">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-surface border border-gunmetal shrink-0">
              <Download className="w-6 h-6 text-olive" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-tacticalWhite uppercase tracking-wider">
                EXPORT TOURNAMENT DATA JSON
              </h3>
              <p className="text-xs font-mono text-mutedKhaki mt-1 leading-relaxed">
                Download a complete JSON snapshot containing all registered teams, active rosters, match logs, and chronometer configurations.
              </p>
            </div>
          </div>

          <Button
            onClick={handleExportData}
            variant="sand"
            size="sm"
            icon={<Download className="w-4 h-4 text-military-black" />}
          >
            EXPORT CURRENT REGISTRY (.JSON)
          </Button>
        </div>

        <div className="bg-surface/60 border border-gunmetal p-6 text-xs font-mono text-mutedKhaki space-y-2">
          <div className="text-tacticalWhite font-bold uppercase flex items-center gap-2">
            <Shield className="w-4 h-4 text-olive" /> OFFICIAL INSTITUTION METADATA
          </div>
          <div>ORGANIZATION: <span className="text-tacticalWhite">Computer Science and Technology Degree Programme</span></div>
          <div>INSTITUTION: <span className="text-tacticalWhite">Uva Wellassa University of Sri Lanka</span></div>
          <div>DISCIPLINE: <span className="text-sand font-bold">Call of Duty 4: Modern Warfare (5v5 Search & Destroy)</span></div>
          <div>MOTTO: <span className="text-sand">&ldquo;POWERED BY COMPETITION. UNITED BY TECHNOLOGY.&rdquo;</span></div>
        </div>

      </div>
    </AdminLayout>
  );
}
