import React from 'react';
import Hero from '@/components/home/Hero';
import CinematicShowcase from '@/components/home/CinematicShowcase';
import PrizePoolSection from '@/components/home/PrizePoolSection';
import AboutSection from '@/components/home/AboutSection';
import TournamentFormat from '@/components/home/TournamentFormat';
import MapPoolSection from '@/components/home/MapPoolSection';
import TeamsPreview from '@/components/home/TeamsPreview';

export default function HomePage() {
  return (
    <div className="relative w-full">
      {/* 1. Cinematic Hero with initial standoff & text reveal */}
      <Hero />

      {/* 2. Pinned Video Scroll Showcase (Left Card -> Right Card -> Center Showdown) */}
      <CinematicShowcase />

      {/* 3. Tournament Prize Pool (Champion, 1st Runner-Up, 2nd Runner-Up) */}
      <PrizePoolSection />

      {/* 4. CST UWU Tournament Mission & Rules */}
      <AboutSection />

      {/* 5. Tournament Bracket & Format */}
      <TournamentFormat />

      {/* 6. CS2 Map Pool Lineup */}
      <MapPoolSection />

      {/* 7. Registered Teams Roster Preview */}
      <TeamsPreview />
    </div>
  );
}
