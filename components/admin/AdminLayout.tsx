'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { checkAdminAuth, setAdminAuth } from '@/lib/storage';
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
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      
      {/* Top Admin Bar */}
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

        <div className="flex items-center gap-3">
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
        
        {/* Sidebar Desktop */}
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

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-tactical-border text-[10px] font-mono text-secondaryText space-y-1">
            <div className="flex items-center gap-1.5 text-white">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SYSTEM: ONLINE (DEMO)</span>
            </div>
            <div>VER: 2026.1.0-CS2</div>
            <div className="text-secondaryText/70">Uva Wellassa University</div>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm"
          />
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#080B10]">
          {children}
        </main>

      </div>
    </div>
  );
}
