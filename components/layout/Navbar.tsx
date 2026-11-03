'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Menu, X, ChevronRight, Crosshair } from 'lucide-react';
import Button from '../ui/Button';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-md border-b border-tactical-border py-2.5 shadow-2xl'
            : 'bg-gradient-to-b from-background/90 via-background/40 to-transparent py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* CST Brand & University Affiliation */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center w-10 h-10 bg-surface border border-cyan/40 clip-tactical group-hover:border-cyan transition-colors shadow-[0_0_15px_rgba(0,213,255,0.2)]">
                <Shield className="w-5 h-5 text-cyan group-hover:scale-110 transition-transform" />
                <span className="absolute -bottom-1 -right-1 w-1.5 h-1.5 bg-orange" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-lg sm:text-xl tracking-wider text-white">
                    CST <span className="text-cyan">LAN</span> <span className="text-orange">2026</span>
                  </span>
                  <span className="hidden sm:inline-block text-[9px] font-mono font-semibold px-1.5 py-0.5 bg-cyan/10 text-cyan border border-cyan/30 rounded-none">
                    CS2
                  </span>
                </div>
                <p className="text-[10px] text-secondaryText tracking-tight font-mono hidden md:block">
                  UWU • CST DEGREE PROGRAMME
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-colors duration-200 ${
                    isActive(link.href)
                      ? 'text-cyan font-bold'
                      : 'text-secondaryText hover:text-white'
                  }`}
                >
                  {link.name}
                  {isActive(link.href) && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-cyan shadow-[0_0_8px_#00D5FF]" />
                  )}
                </Link>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button
                href="/register"
                variant="cyan"
                size="sm"
                icon={<Crosshair className="w-3.5 h-3.5" />}
              >
                REGISTER TEAM
              </Button>

              {/* Mobile Menu Toggle */}
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-secondaryText hover:text-white border border-tactical-border bg-surface"
                  aria-label="Toggle Navigation"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5 text-cyan" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-background/98 backdrop-blur-2xl pt-20 px-6 pb-8 flex flex-col justify-between border-b border-tactical-border overflow-y-auto">
          <div className="flex flex-col gap-2.5">
            <div className="text-[10px] font-mono text-secondaryText uppercase tracking-widest border-b border-tactical-border pb-2">
              Tactical Navigation
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between py-2.5 text-base font-display uppercase tracking-wider border-b border-tactical-border/50 ${
                  isActive(link.href) ? 'text-cyan font-bold' : 'text-white/80 hover:text-cyan'
                }`}
              >
                <span>{link.name}</span>
                <ChevronRight className="w-4 h-4 text-secondaryText" />
              </Link>
            ))}
          </div>

          <div className="pt-6 border-t border-tactical-border flex flex-col gap-3">
            <div className="text-[11px] font-mono text-secondaryText text-center">
              Computer Science and Technology Degree Programme
              <br />
              <span className="text-white">Uva Wellassa University of Sri Lanka</span>
            </div>
            <Button
              href="/register"
              variant="cyan"
              size="md"
              className="w-full text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              REGISTER YOUR TEAM
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
