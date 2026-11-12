import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tournament Scoreboard',
  description:
    'CST LAN Challenge 2026 live tournament scoreboard, standings, and results. Real-time collegiate squad rankings, round differentials, and match history for CoD4 MW PromodLive 2.20 EU.',
  openGraph: {
    title: 'CST LAN Challenge 2026 - Tournament Scoreboard',
    description:
      'Live scoreboard and standings for CST LAN Challenge 2026.',
    type: 'website',
    images: [
      {
        url: '/images/cyber-strike-logo.png',
        width: 1200,
        height: 630,
        alt: 'CST LAN Challenge 2026 Scoreboard',
      },
    ],
  },
};
