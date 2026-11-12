import type { Metadata } from 'next';
import './globals.css';
import SmoothScroll from '@/components/providers/SmoothScroll';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import GlobalParticleBackground from '@/components/ui/GlobalParticleBackground';

const SITE_NAME = 'CST LAN Challenge 2026';
const SITE_URL = 'https://lan.cstuwu.org';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: '%s | CST LAN Challenge 2026',
    default: 'CST LAN Challenge 2026 | Uva Wellassa University',
  },
  description:
    'Official website for CST LAN Challenge 2026, Call of Duty 4 Modern Warfare (PromodLive 2.20 EU) championship organized by the Computer Science and Technology Degree Programme, Uva Wellassa University of Sri Lanka.',
  keywords: [
    'CST LAN Challenge',
    'CST LAN Challenge 2026',
    'Call of Duty 4',
    'CoD4 Modern Warfare',
    'PromodLive 2.20 EU',
    'Uva Wellassa University',
    'UWU',
    'Esports Sri Lanka',
    'University Gaming Tournament',
    'LAN Tournament Sri Lanka',
    'CoD4 Promod',
  ],
  authors: [{ name: 'CST Degree Programme, Uva Wellassa University' }],
  creator: 'CST Degree Programme, Uva Wellassa University of Sri Lanka',
  publisher: 'Uva Wellassa University of Sri Lanka',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'CST LAN Challenge 2026 | Uva Wellassa University',
    description:
      'Official website for CST LAN Challenge 2026, Call of Duty 4 Modern Warfare (PromodLive 2.20 EU) championship organized by the Computer Science and Technology Degree Programme, Uva Wellassa University of Sri Lanka.',
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: 'en_LK',
    type: 'website',
    images: [
      {
        url: '/images/cyber-strike-logo.png',
        width: 1200,
        height: 630,
        alt: 'CST LAN Challenge 2026 - Official Banner',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CST LAN Challenge 2026 | Uva Wellassa University',
    description:
      'Official website for CST LAN Challenge 2026, Call of Duty 4 Modern Warfare (PromodLive 2.20 EU) championship.',
    images: ['/images/cyber-strike-logo.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-primaryText font-sans min-h-screen flex flex-col antialiased selection:bg-cyan selection:text-background">
        <GlobalParticleBackground />
        <SmoothScroll>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
