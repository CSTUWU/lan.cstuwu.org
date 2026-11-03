'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { resetAllData, getStoredTeams, getStoredMatches, getStoredCountdown } from '@/lib/storage';
import { Settings, RotateCcw, Download, CheckCircle2, AlertTriangle, Shield } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function AdminSettingsPage() {
  const [resetDone, setResetDone] = useState(false);

  const handleResetData = () => {
    if (confirm('Are you sure you want to restore default demonstration teams, matches, and countdown settings? Any newly created local registrations will be reset.')) {
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-tactical-border">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <Badge variant="cyan" size="sm">SYSTEM GOVERNANCE</Badge>
              <span className="text-[11px] font-mono text-secondaryText">{"// CONFIGURATION & MAINTENANCE"}</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase text-white tracking-wider">
              TOURNAMENT SETTINGS & STORAGE
            </h1>
            <p className="text-xs font-mono text-secondaryText">
              Manage client-side demonstration storage, restore default presets, or export tournament archives.
            </p>
          </div>
        </div>

        {resetDone && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/50 flex items-center gap-3 text-xs font-mono text-emerald-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Demonstration dataset reset to defaults! All test registries have been refreshed.</span>
          </div>
        )}

        {/* Reset Box */}
        <div className="bg-card/90 border border-tactical-border p-6 sm:p-8 backdrop-blur-md">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-surface border border-tactical-border shrink-0">
              <RotateCcw className="w-6 h-6 text-orange" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white uppercase tracking-wider">
                RESTORE DEMONSTRATION DEFAULTS
              </h3>
              <p className="text-xs font-mono text-secondaryText mt-1 leading-relaxed">
                Re-seeds the application with original collegiate teams (UWU Tactical Vanguard, Moratuwa Titans, Colombo Apex, etc.), official matches, and default countdown schedules.
              </p>
            </div>
          </div>

          <button
            onClick={handleResetData}
            className="px-4 py-2.5 bg-surface border border-orange/50 hover:bg-orange hover:text-black font-mono text-xs text-orange font-bold uppercase transition-colors"
          >
            RESTORE DEFAULT DEMO DATA
          </button>
        </div>

        {/* Export Data */}
        <div className="bg-card/90 border border-tactical-border p-6 sm:p-8 backdrop-blur-md">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-surface border border-tactical-border shrink-0">
              <Download className="w-6 h-6 text-cyan" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white uppercase tracking-wider">
                EXPORT TOURNAMENT DATA JSON
              </h3>
              <p className="text-xs font-mono text-secondaryText mt-1 leading-relaxed">
                Download a complete JSON snapshot containing all registered teams, active rosters, match logs, and chronometer configurations.
              </p>
            </div>
          </div>

          <Button
            onClick={handleExportData}
            variant="cyan"
            size="sm"
            icon={<Download className="w-4 h-4" />}
          >
            EXPORT CURRENT REGISTRY (.JSON)
          </Button>
        </div>

        {/* University Institutional Information */}
        <div className="bg-surface/60 border border-tactical-border p-6 text-xs font-mono text-secondaryText space-y-2">
          <div className="text-white font-bold uppercase flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan" /> OFFICIAL INSTITUTION METADATA
          </div>
          <div>ORGANIZATION: <span className="text-white">Computer Science and Technology Degree Programme</span></div>
          <div>INSTITUTION: <span className="text-white">Uva Wellassa University of Sri Lanka</span></div>
          <div>DISCIPLINE: <span className="text-cyan font-bold">Counter-Strike 2 (5v5 MR12)</span></div>
          <div>MOTTO: <span className="text-orange">&ldquo;POWERED BY COMPETITION. UNITED BY TECHNOLOGY.&rdquo;</span></div>
        </div>

      </div>
    </AdminLayout>
  );
}

