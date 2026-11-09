import type { Metadata } from 'next';
import './globals.css';
import SmoothScroll from '@/components/providers/SmoothScroll';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import GlobalParticleBackground from '@/components/ui/GlobalParticleBackground';

export const metadata: Metadata = {
  title: 'CST LAN Challenge 2026 | Uva Wellassa University',
  description:
    'Official website for CST LAN Challenge 2026, Call of Duty 4 Modern Warfare (PromodLive 2.20 EU) championship organized by the Computer Science and Technology Degree Programme, Uva Wellassa University of Sri Lanka.',
  keywords: [
    'CST LAN Challenge',
    'Call of Duty 4',
    'CoD4 Modern Warfare',
    'PromodLive 2.20 EU',
    'Uva Wellassa University',
    'UWU',
    'Esports Sri Lanka',
    'University Gaming Tournament',
  ],
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
