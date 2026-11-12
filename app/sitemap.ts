import { MetadataRoute } from 'next';

const BASE_URL = 'https://lan.cstuwu.org';

const PUBLIC_ROUTES: Array<{
  url: string;
  lastModified?: string | Date;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}> = [
  {
    url: '/',
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 1.0,
  },
  {
    url: '/about',
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  {
    url: '/schedule',
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    url: '/teams',
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 0.85,
  },
  {
    url: '/register',
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: 0.7,
  },
  {
    url: '/scoreboard',
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    url: '/scoreboard/live',
    lastModified: new Date().toISOString(),
    changeFrequency: 'hourly',
    priority: 0.85,
  },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.url}`,
    lastModified: route.lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
