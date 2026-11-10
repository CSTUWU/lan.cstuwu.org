'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { checkAdminAuth, setAdminAuth, isRegistrationOpen, setRegistrationOpen, isPlayoffTreePublished, setPlayoffTreePublished } from '@/lib/storage';
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
  const [isPlayoffTreePub, setIsPlayoffTreePub] = useState<boolean>(() => isPlayoffTreePublished());
  const [treeToggling, setTreeToggling] = useState(false);

  useEffect(() => {
    setIsRegOpen(isRegistrationOpen());
    setIsPlayoffTreePub(isPlayoffTreePublished());

    const handleUpdate = () => setIsRegOpen(isRegistrationOpen());
    const handleTreeUpdate = (e?: Event) => {
      const customEvent = e as CustomEvent<{ published: boolean }>;
      if (typeof customEvent?.detail?.published === 'boolean') {
        setIsPlayoffTreePub(customEvent.detail.published);
      } else {
        setIsPlayoffTreePub(isPlayoffTreePublished());
      }
    };

    window.addEventListener('cst_countdown_updated', handleUpdate);
    window.addEventListener('cst_registration_status_changed', handleUpdate);
    window.addEventListener('cst_playoff_published_changed', handleTreeUpdate);

    // Sync from server if available
    api.public.getSettings().then((res) => {
      if (res?.success && res.data) {
        if (typeof res.data.registrationOpen === 'boolean') {
          setIsRegOpen(res.data.registrationOpen);
        }
        if (typeof res.data.playoffTreePublished === 'boolean') {
          setIsPlayoffTreePub(res.data.playoffTreePublished);
          setPlayoffTreePublished(res.data.playoffTreePublished);
        }
      }
    }).catch(() => {});

    return () => {
      window.removeEventListener('cst_countdown_updated', handleUpdate);
      window.removeEventListener('cst_registration_status_changed', handleUpdate);
      window.removeEventListener('cst_playoff_published_changed', handleTreeUpdate);
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

  const handleTogglePlayoffTree = async () => {
    const nextState = !isPlayoffTreePub;
    setTreeToggling(true);
    setPlayoffTreePublished(nextState);
    setIsPlayoffTreePub(nextState);

    try {
      await api.admin.updateSettings({
        playoffTreePublished: nextState,
      });
    } catch (e) {
      console.warn('Backend update playoffTreePublished failed, saved locally', e);
    } finally {
      setTreeToggling(false);
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
    <div className="min-h-screen bg-military-black text-tacticalWhite flex flex-col font-sans">
      
      <header className="h-16 bg-surface border-b border-gunmetal px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 text-mutedText hover:text-tacticalWhite border border-gunmetal bg-card"
            aria-label="Toggle Navigation"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-sand" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-card border border-olive/50 flex items-center justify-center text-sand clip-tactical shadow-[0_2px_8px_rgba(24,30,24,0.6)]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <div className="font-display font-black text-sm tracking-wider text-tacticalWhite">
                CST LAN 2026 <span className="text-sand">{"// TAC-OPS COMMAND"}</span>
              </div>
              <div className="text-[10px] font-mono text-mutedText tracking-tight hidden sm:block">
                Computer Science &amp; Technology • Uva Wellassa University of Sri Lanka
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
                ? 'bg-emerald-950/60 border-emerald-600/80 text-emerald-400 hover:bg-emerald-900/60 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-rose-950/60 border-rose-600/80 text-rose-400 hover:bg-rose-900/60 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
            }`}
            title={isRegOpen ? 'Click to CLOSE registration across entire site' : 'Click to OPEN registration across entire site'}
          >
            {isRegOpen ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-rose-400" />}
            <span className="hidden md:inline">REGISTRATION:</span>
            <span>{isRegOpen ? 'OPEN' : 'CLOSED'}</span>
          </button>

          <button
            type="button"
            onClick={handleTogglePlayoffTree}
            disabled={treeToggling}
            className={`px-2.5 sm:px-3 py-1.5 text-xs font-mono font-bold flex items-center gap-1.5 sm:gap-2 border transition-all cursor-pointer ${
              isPlayoffTreePub
                ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-400 hover:bg-rose-950/80 hover:border-rose-600 hover:text-rose-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-surface border-gunmetal text-mutedText hover:bg-emerald-950/60 hover:border-emerald-600 hover:text-emerald-400'
            }`}
            title={
              isPlayoffTreePub
                ? 'Playoff tree is currently DISPLAYED on public site. Click to DISABLE / HIDE it.'
                : 'Playoff tree is currently DISABLED / HIDDEN. Click to DISPLAY / PUBLISH it on public site.'
            }
          >
            <Trophy className={`w-3.5 h-3.5 ${isPlayoffTreePub ? 'text-sand' : 'text-mutedText'}`} />
            <span className="hidden lg:inline">PLAYOFF TREE:</span>
            <span>{isPlayoffTreePub ? 'ACTIVE (DISABLE)' : 'DISABLED'}</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-sand hover:text-tacticalWhite px-3 py-1.5 bg-card border border-gunmetal hover:border-sand transition-colors"
          >
            <span>PUBLIC SITE</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-mono text-rose-400 hover:text-tacticalWhite px-3 py-1.5 bg-card border border-gunmetal hover:border-rose-500 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">LOGOUT</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        
        <aside
          className={`fixed lg:static top-16 bottom-0 lg:top-0 left-0 z-30 w-64 bg-surface border-r border-gunmetal flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
          }`}
        >
          <div className="p-4 space-y-1">
            <div className="text-[10px] font-mono text-mutedText uppercase tracking-widest px-3 py-2">
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
                      ? 'bg-olive/20 border-olive text-sand font-bold shadow-[inset_0_0_10px_rgba(89,99,74,0.3)]'
                      : 'border-transparent text-mutedText hover:text-tacticalWhite hover:bg-card/50'
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t border-gunmetal text-[10px] font-mono text-mutedText space-y-1">
            <div className="flex items-center gap-1.5 text-tacticalWhite">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>TAC-NET: ONLINE (SECURE)</span>
            </div>
            <div>SECTOR: COD4.1.0-UWU</div>
            <div className="text-mutedText/70">Uva Wellassa University</div>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 z-20 lg:hidden backdrop-blur-sm"
          />
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-military-black">
          {children}
        </main>

      </div>
    </div>
  );
}
