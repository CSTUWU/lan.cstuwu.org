import React from 'react';
import Hero from '@/components/home/Hero';
import PrizePoolSection from '@/components/home/PrizePoolSection';
import AboutSection from '@/components/home/AboutSection';
import TournamentFormat from '@/components/home/TournamentFormat';
import MapPoolSection from '@/components/home/MapPoolSection';
import TeamsPreview from '@/components/home/TeamsPreview';

export default function HomePage() {
  return (
    <div className="relative w-full">
      {/* 1. Clean Hero with integrated countdown */}
      <Hero />

      {/* 2. Tournament Prize Pool (Champion, 1st Runner-Up, 2nd Runner-Up) */}
      <PrizePoolSection />

      {/* 3. CST UWU Tournament Mission & Rules */}
      <AboutSection />

      {/* 4. Tournament Bracket & Format */}
      <TournamentFormat />

      {/* 5. CS2 Map Pool Lineup */}
      <MapPoolSection />

      {/* 6. Registered Teams Roster Preview */}
      <TeamsPreview />
    </div>
  );
}
