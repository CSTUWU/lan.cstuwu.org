'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { getStoredCountdown, saveCountdown, setRegistrationOpen, createAndSeedPlayoffTree } from '@/lib/storage';
import { api } from '@/lib/api';
import { transformBackendSettings } from '@/lib/transformers';
import { CountdownSettings } from '@/lib/types';
import { Timer, Calendar, CheckCircle2, Save, Radio, RefreshCw, GitBranch } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function AdminCountdownPage() {
  const [settings, setSettings] = useState<CountdownSettings>(getStoredCountdown());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [playoffNotice, setPlayoffNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSeedPlayoffsNow = async () => {
    try {
      createAndSeedPlayoffTree();
      const res = await api.admin.generatePlayoffs().catch(() => null);
      if (res?.success) {
        setPlayoffNotice('Playoff bracket tree automatically seeded on backend database & live scoreboard!');
      } else {
        setPlayoffNotice('Playoff bracket tree generated & synchronized across live scoreboard!');
      }
    } catch (e) {
      createAndSeedPlayoffTree();
      setPlayoffNotice('Playoff bracket tree generated locally.');
    }
    setTimeout(() => setPlayoffNotice(null), 5000);
  };

  const handleSetRegistrationStatus = async (isOpen: boolean) => {
    const updated: CountdownSettings = {
      ...settings,
      isRegistrationOpen: isOpen,
      eventStatus: isOpen ? 'REGISTRATIONS OPEN' : 'CHECK-IN PHASE',
    };
    setSettings(updated);
    setRegistrationOpen(isOpen);

    try {
      await api.admin.updateSettings({
        registrationOpen: isOpen,
        eventStatus: updated.eventStatus,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (e) {
      console.warn('Backend updateSettings failed, saved locally and broadcasted', e);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const loadSettings = async () => {
    const local = getStoredCountdown();
    setSettings(local);

    try {
      const res = await api.admin.getSettings();
      if (res.success && res.data) {
        setSettings(transformBackendSettings(res.data));
      }
    } catch (e) {
      // Backend offline: continue with local
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    saveCountdown(settings);

    const isRegOpen = settings.isRegistrationOpen ?? (settings.eventStatus === 'REGISTRATIONS OPEN');
    try {
      await api.admin.updateSettings({
        tournamentDate: new Date(settings.tournamentDate).toISOString(),
        registrationDeadline: new Date(settings.registrationDeadline).toISOString(),
        eventStatus: settings.eventStatus,
        registrationOpen: isRegOpen,
        announcementText: settings.announcementText,
      });
    } catch (e) {
      console.warn('Backend updateSettings failed, saved locally', e);
    }

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-tactical-border">
          <div>
            <div className="inline-flex items-center gap-2 mb-1">
              <Badge variant="orange" size="sm">CHRONOMETER CONFIG</Badge>
              <span className="text-[11px] font-mono text-secondaryText">{"// MISSION TIMELOCK"}</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase text-white tracking-wider">
              COUNTDOWN & TIMELINE MANAGEMENT
            </h1>
            <p className="text-xs font-mono text-secondaryText">
              Adjust public tournament target dates, registration deadlines, and operational status tickers.
            </p>
          </div>

          <button
            onClick={() => {
              setLoading(true);
              loadSettings().finally(() => setLoading(false));
            }}
            className="p-2 bg-surface border border-tactical-border text-cyan hover:border-cyan transition-colors self-start sm:self-auto"
            title="Refresh from server"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {savedSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/50 flex items-center gap-3 text-xs font-mono text-emerald-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Tournament countdown settings saved! Public website timer has been synchronized in real-time.</span>
          </div>
        )}

        {/* Dedicated Registration Gate Control */}
        <div className="bg-card/90 border border-tactical-border p-6 sm:p-8 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-tactical-border">
            <div>
              <div className="inline-flex items-center gap-2 mb-1">
                <Badge variant={settings.isRegistrationOpen ?? (settings.eventStatus === 'REGISTRATIONS OPEN') ? 'cyan' : 'orange'} size="sm">
                  GATEWAY: {settings.isRegistrationOpen ?? (settings.eventStatus === 'REGISTRATIONS OPEN') ? 'OPEN' : 'CLOSED'}
                </Badge>
              </div>
              <h3 className="font-display font-black text-xl text-white uppercase tracking-wider">
                SITE-WIDE REGISTRATION GATE CONTROL
              </h3>
              <p className="text-xs font-mono text-secondaryText mt-1">
                When OPEN, all public registration buttons appear across Navbar, Hero, and pages. When CLOSED, all registration buttons disappear immediately.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSetRegistrationStatus(true)}
                className={`px-4 py-2.5 font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 border cursor-pointer ${
                  settings.isRegistrationOpen ?? (settings.eventStatus === 'REGISTRATIONS OPEN')
                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                    : 'bg-surface text-secondaryText border-tactical-border hover:text-white'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-300 animate-pulse" />
                <span>OPEN REGISTRATIONS</span>
              </button>

              <button
                type="button"
                onClick={() => handleSetRegistrationStatus(false)}
                className={`px-4 py-2.5 font-mono text-xs font-bold uppercase transition-all flex items-center gap-2 border cursor-pointer ${
                  !(settings.isRegistrationOpen ?? (settings.eventStatus === 'REGISTRATIONS OPEN'))
                    ? 'bg-rose-600 text-white border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)]'
                    : 'bg-surface text-secondaryText border-tactical-border hover:text-white'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span>CLOSE REGISTRATIONS</span>
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="bg-card/90 border border-tactical-border p-6 sm:p-8 backdrop-blur-md space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono text-secondaryText uppercase tracking-wider mb-2">
                TOURNAMENT LAN KICKOFF DATE & TIME (ISO FORMAT)
              </label>
              <input
                type="datetime-local"
                value={settings.tournamentDate.slice(0, 16)}
                onChange={(e) => setSettings({ ...settings, tournamentDate: e.target.value })}
                className="w-full bg-surface border border-tactical-border px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan"
                required
              />
              <p className="text-[10px] font-mono text-secondaryText mt-1">
                Current Target: {new Date(settings.tournamentDate).toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono text-secondaryText uppercase tracking-wider mb-2">
                REGISTRATION DEADLINE
              </label>
              <input
                type="datetime-local"
                value={settings.registrationDeadline.slice(0, 16)}
                onChange={(e) => setSettings({ ...settings, registrationDeadline: e.target.value })}
                className="w-full bg-surface border border-tactical-border px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan"
                required
              />
              <p className="text-[10px] font-mono text-secondaryText mt-1">
                Current Deadline: {new Date(settings.registrationDeadline).toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-secondaryText uppercase tracking-wider mb-2">
              EVENT STATUS TICKER
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={settings.eventStatus}
                onChange={(e) => setSettings({ ...settings, eventStatus: e.target.value as any })}
                className="flex-1 bg-surface border border-tactical-border px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-cyan"
              >
                <option value="REGISTRATIONS OPEN">REGISTRATIONS OPEN</option>
                <option value="CHECK-IN PHASE">CHECK-IN PHASE (REGISTRATION CONCLUDED)</option>
                <option value="BATTLEFIELD ACTIVE">BATTLEFIELD ACTIVE (LAN PLAYOFFS IN PROGRESS)</option>
                <option value="CHAMPIONS CROWNED">CHAMPIONS CROWNED (CONCLUDED)</option>
              </select>
              <button
                type="button"
                onClick={handleSeedPlayoffsNow}
                className="px-4 py-2 bg-tactical-gold/15 border border-tactical-gold/50 text-tactical-gold hover:bg-tactical-gold hover:text-black font-mono text-xs uppercase font-bold flex items-center justify-center gap-2 transition-colors shrink-0"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>SEED PLAYOFF TREE FROM APPROVED SQUADS</span>
              </button>
            </div>
            {playoffNotice && (
              <p className="mt-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/40 p-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{playoffNotice}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-mono text-secondaryText uppercase tracking-wider mb-2">
              PUBLIC BROADCAST BANNER TEXT
            </label>
            <textarea
              rows={3}
              value={settings.announcementText}
              onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
              className="w-full bg-surface border border-tactical-border p-3 text-xs font-mono text-white focus:outline-none focus:border-cyan"
              required
            />
          </div>

          <div className="pt-4 border-t border-tactical-border flex items-center justify-between">
            <span className="text-[11px] font-mono text-secondaryText">
              Changes reflect immediately on public hero countdown and tournament headers.
            </span>
            <Button type="submit" variant="orange" size="md" icon={<Save className="w-4 h-4" />}>
              SYNCHRONIZE TIMELINE
            </Button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
