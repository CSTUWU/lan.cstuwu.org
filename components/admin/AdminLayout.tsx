'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { checkAdminAuth, setAdminAuth, isRegistrationOpen, setRegistrationOpen } from '@/lib/storage';
import { api } from '@/lib/api';
import {
  Shield,
  LayoutDashboard,
  ClipboardList,
  Users,
  UserCheck,
  Timer,
  Swords,
  Trophy,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Lock,
  Unlock,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRegOpen, setIsRegOpen] = useState<boolean>(true);
  const [regToggling, setRegToggling] = useState(false);

  useEffect(() => {
    setIsRegOpen(isRegistrationOpen());
    const handleUpdate = () => setIsRegOpen(isRegistrationOpen());
    window.addEventListener('cst_countdown_updated', handleUpdate);
    window.addEventListener('cst_registration_status_changed', handleUpdate);

    // Sync from server if available
    api.public.getSettings().then((res) => {
      if (res?.success && res.data && typeof res.data.registrationOpen === 'boolean') {
        setIsRegOpen(res.data.registrationOpen);
      }
    }).catch(() => {});

    return () => {
      window.removeEventListener('cst_countdown_updated', handleUpdate);
      window.removeEventListener('cst_registration_status_changed', handleUpdate);
    };
  }, []);

  const handleToggleRegistration = async () => {
    const nextState = !isRegOpen;
    setRegToggling(true);
    setRegistrationOpen(nextState);
    setIsRegOpen(nextState);

    // Sync with backend API
    try {
      await api.admin.updateSettings({
        registrationOpen: nextState,
        eventStatus: nextState ? 'REGISTRATIONS OPEN' : 'CHECK-IN PHASE',
      });
    } catch (e) {
      console.warn('Backend updateSettings failed, saved locally', e);
    } finally {
      setRegToggling(false);
    }
  };

  useEffect(() => {
    // Check auth on mount: redirect to /admin if not authenticated
    if (!checkAdminAuth() && pathname !== '/admin' && pathname !== '/admin/login') {
      window.location.href = '/admin';
    }
  }, [pathname]);

  const navItems = [
    { name: 'Overview', href: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { name: 'Registrations', href: '/admin/registrations', icon: <ClipboardList className="w-4 h-4" /> },
    { name: 'Teams', href: '/admin/teams', icon: <Users className="w-4 h-4" /> },
    { name: 'Players', href: '/admin/players', icon: <UserCheck className="w-4 h-4" /> },
    { name: 'Countdown', href: '/admin/countdown', icon: <Timer className="w-4 h-4" /> },
    { name: 'Matches', href: '/admin/matches', icon: <Swords className="w-4 h-4" /> },
    { name: 'Scoreboard', href: '/admin/scoreboard', icon: <Trophy className="w-4 h-4" /> },
    { name: 'Settings', href: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleLogout = () => {
    setAdminAuth(false);
    window.location.href = '/admin';
  };

  return (
    <div className="min-h-screen bg-[#070A0F] text-primaryText flex flex-col font-sans">
      
      <header className="h-16 bg-[#0B1017] border-b border-tactical-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-secondaryText hover:text-white border border-tactical-border bg-surface"
            aria-label="Toggle Navigation"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-cyan" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-surface border border-cyan/40 flex items-center justify-center text-cyan clip-tactical shadow-[0_0_10px_rgba(0,213,255,0.3)]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="font-display font-black text-sm tracking-wider text-white">
                CST LAN 2026 <span className="text-cyan">{"// ADMIN CONSOLE"}</span>
              </div>
              <div className="text-[10px] font-mono text-secondaryText tracking-tight hidden sm:block">
                Computer Science & Technology • Uva Wellassa University of Sri Lanka
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleToggleRegistration}
            disabled={regToggling}
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5 sm:gap-2 border transition-all cursor-pointer ${
              isRegOpen
                ? 'bg-emerald-950/50 border-emerald-500/80 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-rose-950/50 border-rose-500/80 text-rose-400 hover:bg-rose-900/60 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
            }`}
            title={isRegOpen ? 'Click to CLOSE registration across entire site' : 'Click to OPEN registration across entire site'}
          >
            {isRegOpen ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-rose-400" />}
            <span className="hidden md:inline">REGISTRATION:</span>
            <span>{isRegOpen ? 'OPEN' : 'CLOSED'}</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-cyan hover:text-white px-3 py-1.5 bg-surface border border-tactical-border hover:border-cyan transition-colors"
          >
            <span>PUBLIC SITE</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-mono text-rose-400 hover:text-white px-3 py-1.5 bg-surface border border-tactical-border hover:border-rose-500 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">LOGOUT</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        <aside
          className={`fixed lg:static top-16 bottom-0 lg:top-0 left-0 z-30 w-64 bg-[#090D14] border-r border-tactical-border flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          <div className="p-4 space-y-1">
            <div className="text-[10px] font-mono text-secondaryText uppercase tracking-widest px-3 py-2">
              ADMINISTRATION DIRECTORY
            </div>

            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-xs font-mono uppercase tracking-wider transition-colors border-l-2 ${
                    active
                      ? 'bg-surface border-cyan text-cyan font-bold shadow-[inset_0_0_10px_rgba(0,213,255,0.1)]'
                      : 'border-transparent text-secondaryText hover:text-white hover:bg-surface/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t border-tactical-border text-[10px] font-mono text-secondaryText space-y-1">
            <div className="flex items-center gap-1.5 text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SYSTEM: ONLINE (LIVE)</span>
            </div>
            <div>VER: 2026.1.0-CS2</div>
            <div className="text-secondaryText/70">Uva Wellassa University</div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm"
          />
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#080B10]">
          {children}
        </main>

      </div>
    </div>
  );
}
