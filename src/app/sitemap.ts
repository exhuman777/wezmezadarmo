import type { MetadataRoute } from 'next';
import { getAllBenefits } from '@/engine/benefits';
import { POSTS } from '@/data/blog-posts';

const BASE = 'https://www.wezmezadarmo.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Deep links dla 133 swiadczen (per ID, indeksowane w Google jako rich snippets)
  const benefitUrls: MetadataRoute.Sitemap = getAllBenefits().map(b => ({
    url: `${BASE}/swiadczenia?id=${b.id}`,
    lastModified: new Date(b.dataWeryfikacji),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Blog posts
  const blogUrls: MetadataRoute.Sitemap = POSTS.map(p => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    ...blogUrls,
    ...benefitUrls,
    // Core
    { url: BASE, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/swiadczenia`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/wnioski`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/aktualnosci`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/o-projekcie`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },

    // Wnioski ZUS
    { url: `${BASE}/wnioski/zus-zas53`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/wnioski/zus-z15a`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/wnioski/zus-z15b`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/wnioski/zus-erpo`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/wnioski/zus-ersu`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/wnioski/zus-pel`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/wnioski/zus-z3`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/wnioski/nlnet`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },

    // NFZ (NEW)
    { url: `${BASE}/nfz`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },

    // Centrum Obywatela (NEW - hub + 8 narzędzi)
    { url: `${BASE}/centrum-obywatela`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/centrum-obywatela/kursy`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/centrum-obywatela/powietrze`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/centrum-obywatela/biala-lista`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/centrum-obywatela/pogoda`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE}/centrum-obywatela/prawo`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/centrum-obywatela/gus`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/centrum-obywatela/dzialki`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/centrum-obywatela/transport`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },

    // B2B
    { url: `${BASE}/dla-firm`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/za-darmo-dla-biznesu`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/automatyzacje`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/dotacje`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/dotacje/regulamin`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/dotacje/polityka-ai`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },

    // Agent
    { url: `${BASE}/agent`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },

    // Statystyki -- dashboard GUS/NBP/NFZ
    { url: `${BASE}/statystyki`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },

    // Legal
    { url: `${BASE}/regulamin`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE}/polityka-prywatnosci`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE}/press`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
