'use client';

import React, { useEffect, useState } from 'react';
import Hero from '@/components/home/Hero';
import CinematicShowcase from '@/components/home/CinematicShowcase';
import LiveMatchHomeBanner from '@/components/home/LiveMatchHomeBanner';
import PrizePoolSection from '@/components/home/PrizePoolSection';
import AboutSection from '@/components/home/AboutSection';
import TournamentFormat from '@/components/home/TournamentFormat';
import MapPoolSection from '@/components/home/MapPoolSection';
import TeamsPreview from '@/components/home/TeamsPreview';

export default function HomePage() {
  const [isReadyToDisplay, setIsReadyToDisplay] = useState(true);

  useEffect(() => {
    const hasHash = Boolean(
      window.location.hash || sessionStorage.getItem('cst_pending_scroll_hash')
    );

    if (hasHash) {
      // If navigating with a hash (e.g. #prizepool), briefly hide until scrolled into place to prevent jumping
      setIsReadyToDisplay(false);
      const timer = setTimeout(() => {
        setIsReadyToDisplay(true);
      }, 180);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div
      style={{
        opacity: isReadyToDisplay ? 1 : 0,
        transition: 'opacity 0.15s ease-out',
      }}
      className="relative w-full"
    >
      <Hero />

      <CinematicShowcase />

      <LiveMatchHomeBanner />

      <PrizePoolSection />
      <AboutSection />
      <TournamentFormat />
      <MapPoolSection />
      <TeamsPreview />
    </div>
  );
}
