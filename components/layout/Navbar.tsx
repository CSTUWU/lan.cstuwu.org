'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X, ChevronRight, Crosshair, Radio } from 'lucide-react';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';
import { api } from '@/lib/api';
import { getStoredMatches, syncDatabaseMatchesToStorage } from '@/lib/storage';
import { transformBackendMatch } from '@/lib/transformers';
import Button from '../ui/Button';

export default function Navbar() {
  const { isOpen } = useRegistrationStatus();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hasLiveMatch, setHasLiveMatch] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  // Always visible on non-home pages or mobile. Controlled on desktop home.
  const [showNavbar, setShowNavbar] = useState(true);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

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

  // Robust scroll & visibility handler
  const checkScrollState = useCallback(() => {
    if (typeof window === 'undefined') return;
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const isMobile = window.innerWidth < 1024;

    // Detect scrolled state across all pages
    setScrolled(scrollY > 20);

    // On mobile viewports or non-home routes, navbar is always visible
    if (!isHome || isMobile) {
      setShowNavbar(true);
      return;
    }

    // On desktop home: smooth standoff reveal
    if (scrollY > 100) {
      setShowNavbar(true);
    } else if (scrollY < 30) {
      setShowNavbar(false);
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

    const handleTextVisible = (e: Event) => {
      if (!isHome || window.innerWidth < 1024) return;
      try {
        const customEvent = e as CustomEvent<{ visible?: boolean }>;
        if (customEvent?.detail && typeof customEvent.detail.visible === 'boolean') {
          const scrollY = window.scrollY || 0;
          if (scrollY > 100) {
            setShowNavbar(true);
          } else {
            setShowNavbar(customEvent.detail.visible);
          }
        }
      } catch (err) {
        // Fallback gracefully
        setShowNavbar(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('cst_hero_text_visible', handleTextVisible);

    // Initial check on mount
    checkScrollState();

    const checkLiveMatch = () => {
      try {
        const stored = getStoredMatches();
        const localLive = stored.some((m) => m.status === 'live');
        if (localLive) {
          setHasLiveMatch(true);
        }
        api.public.getMatches({ status: 'LIVE' }).then((res) => {
          if (res?.success && Array.isArray(res.data)) {
            const isLive = res.data.length > 0;
            setHasLiveMatch(isLive);
            if (isLive) {
              syncDatabaseMatchesToStorage(res.data.map(transformBackendMatch));
            }
          }
        }).catch(() => { });
      } catch (e) { }
    };

    checkLiveMatch();
    const liveInterval = setInterval(checkLiveMatch, 4000);
    window.addEventListener('cst_matches_updated', checkLiveMatch);

    return () => {
      clearInterval(liveInterval);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('cst_hero_text_visible', handleTextVisible);
      window.removeEventListener('cst_matches_updated', checkLiveMatch);
    };
  }, [checkScrollState, isHome, mobileMenuOpen]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Prizes', href: '/#prizepool' },
    { name: 'Format', href: '/#format' },
    { name: 'Maps', href: '/#maps' },
    { name: 'Teams', href: '/teams' },
    { name: 'Schedule', href: '/schedule' },
    { name: 'Scoreboard', href: '/scoreboard' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href) && href !== '/#format' && href !== '/#maps' && href !== '/#prizepool';
  };

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/scoreboard/live')) {
    return null;
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ease-in-out max-lg:translate-y-0 max-lg:opacity-100 max-lg:pointer-events-auto max-lg:bg-military-black/95 max-lg:backdrop-blur-md max-lg:border-b max-lg:border-gunmetal max-lg:shadow-[0_4px_25px_rgba(0,0,0,0.85)] ${showNavbar
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-full opacity-0 pointer-events-none'
          } ${scrolled || !isHome || mobileMenuOpen
            ? 'bg-military-black/95 backdrop-blur-md border-b border-gunmetal shadow-[0_4px_25px_rgba(0,0,0,0.85)]'
            : 'bg-gradient-to-b from-military-black/90 via-military-black/60 to-transparent border-b border-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-2">
          <Link
            href="/"
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
            {/*<div className="hidden xl:flex flex-col justify-center border-l border-gunmetal/80 pl-2.5 py-0.5">
              <span className="text-[9px] font-mono font-bold text-olive uppercase tracking-wider">COD4 MW</span>
              <span className="text-[9px] font-mono text-mutedText tracking-tight uppercase">UWU CST</span>
            </div>*/}
          </Link>

          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors duration-200 flex items-center gap-1.5 ${isActive(link.href)
                    ? 'text-sand font-bold'
                    : 'text-mutedText hover:text-tacticalWhite'
                  }`}
              >
                <span>{link.name}</span>
                {link.name === 'Scoreboard' && hasLiveMatch && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                )}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-sand shadow-[0_0_8px_rgba(194,178,138,0.6)]" />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {hasLiveMatch && (
              <Link
                href="/scoreboard/live"
                target="_blank"
                className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-mono font-black bg-rose-600/90 hover:bg-rose-600 text-tacticalWhite border border-rose-400/80 transition-all flex items-center gap-1.5 clip-tactical shadow-[0_0_15px_rgba(225,29,72,0.4)]"
              >
                <Radio className="w-3.5 h-3.5 animate-pulse text-sand" />
                <span className="uppercase tracking-wider">LIVE HUD</span>
              </Link>
            )}

            {isOpen && (
              <>
                <Button
                  href="/register"
                  variant="cyan"
                  size="sm"
                  icon={<Crosshair className="w-3.5 h-3.5" />}
                  className="hidden sm:inline-flex"
                >
                  REGISTER TEAM
                </Button>
                <Link
                  href="/register"
                  className="sm:hidden px-2.5 py-1.5 text-[10px] font-mono font-bold bg-cyan/15 text-cyan border border-cyan/40 hover:bg-cyan/25 transition-colors flex items-center gap-1 shrink-0"
                >
                  <Crosshair className="w-3 h-3" />
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
              <div className="relative h-9 sm:h-10 w-auto aspect-[1024/456]">
                <Image
                  src="/images/cyber-strike-logo.png"
                  alt="Cyber Strike of Titans 2026"
                  width={115}
                  height={51}
                  className="h-9 sm:h-10 w-auto object-contain filter drop-shadow-[0_2px_8px_rgba(255,208,0,0.25)]"
                />
              </div>
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
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between py-2.5 text-base font-display uppercase tracking-wider border-b border-gunmetal/60 ${isActive(link.href) ? 'text-sand font-bold' : 'text-tacticalWhite/80 hover:text-sand'
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
