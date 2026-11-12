import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Match Schedule',
  description:
    'CST LAN Challenge 2026 match schedule and mission timetable. CoD4 MW PromodLive 2.20 EU fixtures, theater assignments, and auditorium stage timelines (UTC+5:30 Sri Lanka).',
  openGraph: {
    title: 'CST LAN Challenge 2026 - Match Schedule',
    description:
      'Official tournament schedule and fixtures for CST LAN Challenge 2026.',
    type: 'website',
    images: [
      {
        url: '/images/cyber-strike-logo.png',
        width: 1200,
        height: 630,
        alt: 'CST LAN Challenge 2026 Schedule',
      },
    ],
  },
};
