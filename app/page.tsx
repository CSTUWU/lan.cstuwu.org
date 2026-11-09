import React from 'react';
import Hero from '@/components/home/Hero';
import LiveMatchHomeBanner from '@/components/home/LiveMatchHomeBanner';
import CinematicShowcase from '@/components/home/CinematicShowcase';
import PrizePoolSection from '@/components/home/PrizePoolSection';
import AboutSection from '@/components/home/AboutSection';
import TournamentFormat from '@/components/home/TournamentFormat';
import MapPoolSection from '@/components/home/MapPoolSection';
import TeamsPreview from '@/components/home/TeamsPreview';

export default function HomePage() {
  return (
    <div className="relative w-full">
      <Hero />

      <LiveMatchHomeBanner />

      <CinematicShowcase />

      <PrizePoolSection />

      <AboutSection />

      <TournamentFormat />

      <MapPoolSection />

      <TeamsPreview />
    </div>
  );
}
