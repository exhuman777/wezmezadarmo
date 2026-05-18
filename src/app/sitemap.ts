import type { MetadataRoute } from 'next';

const BASE = 'https://www.wezmezadarmo.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date('2026-05-18');

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/wnioski`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/wnioski/zus-zas53`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/wnioski/zus-z15a`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/wnioski/zus-z15b`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/wnioski/zus-erpo`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/wnioski/zus-ersu`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/wnioski/zus-pel`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/wnioski/zus-z3`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/aktualnosci`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/automatyzacje`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/dla-firm`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/swiadczenia`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/o-projekcie`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/regulamin`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/polityka-prywatnosci`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/dotacje`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/dotacje/regulamin`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/dotacje/polityka-ai`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  return staticPages;
}
