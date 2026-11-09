'use client';

import React, { useState, useEffect } from 'react';
import { getStoredCountdown, saveCountdown } from '@/lib/storage';
import { CountdownSettings } from '@/lib/types';
import { INITIAL_COUNTDOWN } from '@/lib/mockData';
import { api } from '@/lib/api';
import { transformBackendSettings } from '@/lib/transformers';
import { Timer, Radio, AlertCircle, Calendar, Clock, MapPin } from 'lucide-react';
import Button from '../ui/Button';
import { useRegistrationStatus } from '@/hooks/useRegistrationStatus';

export default function CountdownSection() {
  const { isOpen } = useRegistrationStatus();
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<CountdownSettings>(INITIAL_COUNTDOWN);
  const [timeLeft, setTimeLeft] = useState({
    days: 17,
    hours: 8,
    minutes: 45,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    setMounted(true);
    setSettings(getStoredCountdown());

    // Fetch live settings directly from backend API / database
    api.public.getSettings().then((res) => {
      if (res?.success && res.data) {
        const transformed = transformBackendSettings(res.data);
        setSettings(transformed);
        saveCountdown(transformed);
      }
    }).catch(() => {});

    // Listen for updates from admin
    const handleUpdate = () => {
      setSettings(getStoredCountdown());
    };
    window.addEventListener('cst_countdown_updated', handleUpdate);

    // Countdown tick interval
    const updateCountdown = () => {
      const activeSettings = getStoredCountdown();
      const target = new Date(activeSettings.tournamentDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('cst_countdown_updated', handleUpdate);
    };
  }, []);

  const timeBlocks = [
    { label: 'DAYS', value: timeLeft.days, color: 'text-cyan' },
    { label: 'HOURS', value: timeLeft.hours, color: 'text-cyan' },
    { label: 'MINUTES', value: timeLeft.minutes, color: 'text-orange' },
    { label: 'SECONDS', value: timeLeft.seconds, color: 'text-orange' },
  ];

  return (
    <section className="relative py-16 sm:py-20 bg-surface/80 border-t border-b border-tactical-border overflow-hidden">
      <div className="absolute inset-0 tactical-grid-bg opacity-15 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[250px] bg-cyan/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="relative bg-[#080B10]/90 border border-tactical-border/80 backdrop-blur-xl p-5 sm:p-8 md:p-10 shadow-2xl">
          <span className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-cyan" />
          <span className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-orange" />
          <span className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-cyan" />
          <span className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-orange" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 sm:pb-6 mb-6 sm:mb-8 border-b border-tactical-border/70 gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan" />
              </span>
              <div>
                <span className="text-xs font-mono font-bold tracking-widest uppercase text-white">
                  TACTICAL MISSION TIMELINE
                </span>
                <span className="hidden sm:inline-block mx-2 text-tactical-border">|</span>
                <span className="text-[11px] font-mono text-cyan tracking-wider">
                  STATUS: {mounted ? settings.eventStatus : 'REGISTRATIONS OPEN'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-secondaryText">
              <Calendar className="w-3.5 h-3.5 text-orange" />
              <span>
                LAN EVENT: {mounted ? new Date(settings.tournamentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Nov 20, 2026'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            {timeBlocks.map((block) => (
              <div
                key={block.label}
                className="relative bg-card/70 border border-tactical-border/70 p-4 sm:p-6 text-center group hover:border-cyan/40 transition-colors"
              >
                <div className="text-[9px] font-mono text-secondaryText/60 tracking-widest text-left mb-1">
                  SYS_CLOCK //{block.label}
                </div>

                <div className="font-display font-black text-4xl sm:text-6xl md:text-7xl tracking-tighter text-white my-1">
                  {String(block.value).padStart(2, '0')}
                </div>

                <div className={`text-xs font-mono font-bold uppercase tracking-widest ${block.color}`}>
                  {block.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between pt-5 sm:pt-6 border-t border-tactical-border/70 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
              <div className="text-xs font-mono text-secondaryText">
                <span className="text-white font-medium">VENUE:</span> Main Auditorium, Uva Wellassa University, Badulla, Sri Lanka.
                <p className="text-[11px] text-cyan/90 mt-0.5">
                  {mounted ? settings.announcementText : 'LAN Finals at Uva Wellassa University Main Auditorium. 5v5 Competitive CS2 Ruleset.'}
                </p>
              </div>
            </div>

            {isOpen && (
              <div className="flex items-center gap-3 self-end md:self-center">
                <Button href="/register" variant="cyan" size="sm">
                  ENLIST NOW
                </Button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
