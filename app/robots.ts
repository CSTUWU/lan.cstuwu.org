import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/schedule',
          '/teams',
          '/register',
          '/scoreboard',
          '/scoreboard/live',
        ],
        disallow: [
          '/admin/',
          '/admin/login',
          '/admin/dashboard',
          '/admin/matches',
          '/admin/countdown',
          '/admin/scoreboard',
          '/admin/registrations',
          '/admin/settings',
          '/admin/teams',
          '/admin/players',
          '/api/',
          '/_next/',
          '/frames/',
          '/uploads/',
        ],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sitemap.xml`,
  };
}
