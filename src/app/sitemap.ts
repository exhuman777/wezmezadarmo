import type { MetadataRoute } from 'next';
import { getAllBenefits } from '@/engine/benefits';
import { POSTS } from '@/data/blog-posts';
import { SITE_URL as BASE } from '@/lib/seo';

// Data ostatniej istotnej zmiany treści stron statycznych. Podbij przy zmianie treści,
// zamiast wpisywać "teraz": Google ignoruje lastmod, który zmienia się przy każdym buildzie.
const STATIC_LASTMOD = new Date('2026-11-01');

function latest(dates: string[]): Date {
  const times = dates.map(d => new Date(d).getTime()).filter(t => !Number.isNaN(t));
  return times.length ? new Date(Math.max(...times)) : STATIC_LASTMOD;
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Strony z treścią odświeżaną na żywo (RSS, API) mają lastmod = czas generowania.
  const now = new Date();

  // Świadczenia: lastmod = najnowsza data weryfikacji w bazie. Adresy /swiadczenia?id=
  // nie trafiają do sitemapy, bo canonical wskazuje /swiadczenia (duplikaty).
  const benefitsLastmod = latest(getAllBenefits().map(b => b.dataWeryfikacji));

  const blogUrls: MetadataRoute.Sitemap = POSTS.map(p => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));
  const blogLastmod = latest(POSTS.map(p => p.date));

  return [
    { url: `${BASE}/blog`, lastModified: blogLastmod, changeFrequency: 'weekly', priority: 0.7 },
    ...blogUrls,
    // Core
    { url: BASE, lastModified: benefitsLastmod, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/swiadczenia`, lastModified: benefitsLastmod, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/wnioski`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/aktualnosci`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/o-projekcie`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.6 },

    // Wnioski ZUS
    { url: `${BASE}/wnioski/zus-zas53`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/wnioski/zus-z15a`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/wnioski/zus-z15b`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/wnioski/zus-erpo`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/wnioski/zus-ersu`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/wnioski/zus-pel`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/wnioski/zus-z3`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/wnioski/nlnet`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.6 },

    // NFZ
    { url: `${BASE}/nfz`, lastModified: STATIC_LASTMOD, changeFrequency: 'weekly', priority: 0.9 },

    // Centrum Obywatela (hub i narzędzia)
    { url: `${BASE}/centrum-obywatela`, lastModified: STATIC_LASTMOD, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/centrum-obywatela/kursy`, lastModified: STATIC_LASTMOD, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/centrum-obywatela/powietrze`, lastModified: STATIC_LASTMOD, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/centrum-obywatela/biala-lista`, lastModified: STATIC_LASTMOD, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/centrum-obywatela/pogoda`, lastModified: now, changeFrequency: 'daily', priority: 0.7 },
    { url: `${BASE}/centrum-obywatela/prawo`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/centrum-obywatela/gus`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/centrum-obywatela/dzialki`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/centrum-obywatela/transport`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/centrum-obywatela/polska-cyfrowa`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },

    // B2B
    { url: `${BASE}/dla-firm`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE}/za-darmo-dla-biznesu`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/automatyzacje`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/dotacje`, lastModified: STATIC_LASTMOD, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE}/dotacje/regulamin`, lastModified: STATIC_LASTMOD, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/dotacje/polityka-ai`, lastModified: STATIC_LASTMOD, changeFrequency: 'yearly', priority: 0.3 },

    // Agent
    { url: `${BASE}/agent`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.8 },

    // Statystyki: dashboard GUS/NBP/NFZ
    { url: `${BASE}/statystyki`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },

    // Legal
    { url: `${BASE}/regulamin`, lastModified: STATIC_LASTMOD, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE}/polityka-prywatnosci`, lastModified: STATIC_LASTMOD, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE}/press`, lastModified: STATIC_LASTMOD, changeFrequency: 'monthly', priority: 0.5 },
  ];
}
