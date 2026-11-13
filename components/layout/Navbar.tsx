'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronRight, Crosshair, Radio } from 'lucide-react';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';
import { useLiveMatch } from '@/hooks/useLiveMatch';
import Button from '../ui/Button';

// Manual toggles to show/hide sections from the navbar (set true to re-enable manually)
export const NAV_VISIBILITY = {
  teams: false,
  schedule: false,
  scoreboard: false,
};

export default function Navbar() {
  const { isOpen } = useRegistrationStatus();
  const { hasLiveMatch } = useLiveMatch();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState('');
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [showNavbar, setShowNavbar] = useState(!isHome);

  // Close mobile drawer and update navbar visibility on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    if (pathname !== '/') {
      setShowNavbar(true);
    } else if (typeof window !== 'undefined') {
      setShowNavbar((window.scrollY || 0) > 60);
    }
  }, [pathname]);

  // Sync hash state with current URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentHash(window.location.hash || '');
    }
  }, [pathname]);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash || '');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Scroll handler for background styling (transparent vs backdrop blur) & standoff reveal
  const checkScrollState = useCallback(() => {
    if (typeof window === 'undefined') return;
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    setScrolled(scrollY > 20);

    if (!isHome) {
      setShowNavbar(true);
    } else {
      setShowNavbar(scrollY > 60);
    }
  }, [isHome]);

  useEffect(() => {
    const handleScroll = () => {
      checkScrollState();
    };

    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
      checkScrollState();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    // Initial check on mount
    checkScrollState();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [checkScrollState, mobileMenuOpen]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Prizes', href: '/#prizepool' },
    { name: 'Format', href: '/#format' },
    { name: 'Maps', href: '/#maps' },
    ...(NAV_VISIBILITY.teams ? [{ name: 'Teams', href: '/teams' }] : []),
    ...(NAV_VISIBILITY.schedule ? [{ name: 'Schedule', href: '/schedule' }] : []),
    ...(NAV_VISIBILITY.scoreboard ? [{ name: 'Scoreboard', href: '/scoreboard' }] : []),
  ];

  const handleNavClick = (href: string, e?: React.MouseEvent) => {
    if (href.includes('#')) {
      const hash = href.substring(href.indexOf('#'));
      setCurrentHash(hash);

      if (pathname === '/' && typeof window !== 'undefined') {
        if (e) {
          e.preventDefault();
        }
        const id = hash.replace(/^#/, '');
        const elem = document.getElementById(id);
        if (elem) {
          const yOffset = -80; // Navbar height offset
          const y = elem.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'auto' });
          window.history.pushState(null, '', href);
        }
      } else if (typeof window !== 'undefined') {
        // Navigating from another route (e.g. /about or /register) to /#prizepool
        sessionStorage.setItem('cst_pending_scroll_hash', hash);
      }
    } else {
      setCurrentHash('');
      if (href === '/' && pathname === '/' && typeof window !== 'undefined') {
        if (e) {
          e.preventDefault();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', '/');
      }
    }
  };

  const isActive = (href: string) => {
    if (href.includes('#')) {
      const targetHash = href.substring(href.indexOf('#')).replace(/^#/, '');
      const activeHash = currentHash.replace(/^#/, '');
      return pathname === '/' && activeHash === targetHash;
    }
    if (href === '/') {
      const activeHash = currentHash.replace(/^#/, '');
      return pathname === '/' && !activeHash;
    }
    return Boolean(pathname?.startsWith(href));
  };

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/scoreboard/live')) {
    return null;
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ease-in-out ${
          showNavbar || mobileMenuOpen
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-full opacity-0 pointer-events-none'
        } ${
          scrolled || !isHome || mobileMenuOpen
            ? 'bg-military-black/95 backdrop-blur-md border-b border-gunmetal shadow-[0_4px_25px_rgba(0,0,0,0.85)]'
            : 'bg-gradient-to-b from-military-black/90 via-military-black/60 to-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Left Column: Logo */}
          <div className="flex-1 flex items-center justify-start min-w-0">
            <Link
              href="/"
              onClick={() => handleNavClick('/')}
              className="flex items-center gap-2.5 sm:gap-3 group shrink-0 py-1"
              title="Cyber Strike of Titans 2026 - CST LAN Challenge"
            >
              <div className="relative h-8 sm:h-9 md:h-10 lg:h-11 w-auto aspect-[1024/456] shrink-0 transition-transform duration-200 group-hover:scale-105">
                <Image
                  src="/images/cyber-strike-logo.png"
                  alt="Cyber Strike of Titans 2026"
                  width={130}
                  height={58}
                  priority
                  className="h-8 sm:h-9 md:h-10 lg:h-11 w-auto object-contain filter drop-shadow-[0_2px_10px_rgba(255,208,0,0.25)]"
                />
              </div>
            </Link>
          </div>

          {/* Center Column: Navigation Links (Stably Centered, Zero Layout Shift) */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-2 shrink-0">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(link.href, e)}
                  className={`group relative px-2 xl:px-3 py-1.5 text-xs font-mono font-semibold uppercase tracking-wider transition-colors duration-200 flex items-center shrink-0 whitespace-nowrap ${
                    active ? 'text-sand' : 'text-mutedText hover:text-sand'
                  }`}
                >
                  <span className="relative">
                    {link.name}
                    {link.name === 'Scoreboard' && hasLiveMatch && (
                      <span className="absolute -top-1 -right-2.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                      </span>
                    )}
                  </span>
                  <span
                    className={`absolute bottom-0 left-2 right-2 xl:left-3 xl:right-3 h-0.5 transition-all duration-200 ${
                      active
                        ? 'bg-sand shadow-[0_0_8px_rgba(194,178,138,0.6)] opacity-100 scale-x-100'
                        : 'bg-sand/70 opacity-0 scale-x-75 group-hover:opacity-100 group-hover:scale-x-100 group-hover:shadow-[0_0_8px_rgba(194,178,138,0.4)]'
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right Column: Actions (Live HUD & Register) */}
          <div className="flex-1 flex items-center justify-end gap-1.5 sm:gap-2 xl:gap-3 min-w-0">
            {hasLiveMatch && (
              <Link
                href="/scoreboard/live"
                target="_blank"
                className="px-2 sm:px-2.5 xl:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-mono font-black bg-rose-600/90 hover:bg-rose-600 text-tacticalWhite border border-rose-400/80 transition-all flex items-center gap-1 sm:gap-1.5 clip-tactical shadow-[0_0_15px_rgba(225,29,72,0.4)] shrink-0 whitespace-nowrap"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse text-sand shrink-0" />
                <span className="uppercase tracking-wider">LIVE HUD</span>
              </Link>
            )}

            {isOpen && (
              <>
                <Button
                  href="/register"
                  variant="cyan"
                  size="sm"
                  icon={<Crosshair className="w-3.5 h-3.5 shrink-0" />}
                  className="hidden sm:inline-flex shrink-0 whitespace-nowrap lg:px-3 lg:py-1.5 xl:px-4 xl:py-2"
                >
                  REGISTER TEAM
                </Button>
                <Link
                  href="/register"
                  className="sm:hidden px-2.5 py-1.5 text-[10px] font-mono font-bold bg-cyan/15 text-cyan border border-cyan/40 hover:bg-cyan/25 transition-colors flex items-center gap-1 shrink-0 whitespace-nowrap"
                >
                  <Crosshair className="w-3 h-3 shrink-0" />
                  <span>JOIN</span>
                </Link>
              </>
            )}

            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-mutedText hover:text-tacticalWhite border border-gunmetal bg-surface focus:outline-none focus:ring-1 focus:ring-sand transition-colors shrink-0"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5 text-sand" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-military-black/98 backdrop-blur-2xl pt-20 px-6 pb-8 flex flex-col justify-between border-b border-gunmetal overflow-y-auto overscroll-contain">
          <div className="flex flex-col gap-2.5">
            <div className="border-b border-gunmetal pb-3 flex items-center justify-between">
              <Link
                href="/"
                onClick={() => {
                  handleNavClick('/');
                  setMobileMenuOpen(false);
                }}
                className="relative h-9 sm:h-10 w-auto aspect-[1024/456] block"
              >
                <Image
                  src="/images/cyber-strike-logo.png"
                  alt="Cyber Strike of Titans 2026"
                  width={115}
                  height={51}
                  className="h-9 sm:h-10 w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(255,208,0,0.25)]"
                />
              </Link>
              {hasLiveMatch ? (
                <span className="text-rose-400 font-bold flex items-center gap-1 text-[10px] font-mono">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  STAGE MATCH LIVE
                </span>
              ) : (
                <div className="text-right">
                  <div className="text-[10px] font-mono text-sand font-bold">UWU CST 2026</div>
                  <div className="text-[9px] font-mono text-mutedText">TAC-OPS DIRECTORY</div>
                </div>
              )}
            </div>
            {hasLiveMatch && (
              <Link
                href="/scoreboard/live"
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                className="p-3 bg-rose-950/80 border border-rose-500/80 text-tacticalWhite font-display font-black text-xs uppercase tracking-wider flex items-center justify-between clip-tactical shadow-lg my-1"
              >
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-sand animate-pulse" />
                  <span>AUDITORIUM STAGE PROJECTOR HUD</span>
                </div>
                <ChevronRight className="w-4 h-4 text-rose-300" />
              </Link>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={(e) => {
                  handleNavClick(link.href, e);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between py-2.5 text-base font-display uppercase tracking-wider border-b border-gunmetal/60 ${
                  isActive(link.href) ? 'text-sand font-bold' : 'text-tacticalWhite/80 hover:text-sand'
                }`}
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-mutedText" />
              </Link>
            ))}
          </div>

          <div className="pt-6 border-t border-gunmetal flex flex-col gap-3">
            <div className="text-[11px] font-mono text-mutedText text-center">
              Computer Science and Technology Degree Programme
              <br />
              <span className="text-tacticalWhite">Uva Wellassa University of Sri Lanka</span>
            </div>
            {isOpen && (
              <Button
                href="/register"
                variant="cyan"
                size="md"
                className="w-full text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                REGISTER YOUR TEAM
              </Button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
