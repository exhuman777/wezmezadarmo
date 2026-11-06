import type { MetadataRoute } from 'next';
import { getAllBenefits } from '@/engine/benefits';
import { POSTS } from '@/data/blog-posts';
import { adres } from '@/lib/seo';
import { STRONY } from '@/lib/strony';

// Data ostatniej istotnej zmiany treści stron statycznych (narzędzia bez formularza, dotacje, blog: 6.11.2026). Podbij przy zmianie treści,
// zamiast wpisywać "teraz": Google ignoruje lastmod, który zmienia się przy każdym buildzie.
const STATIC_LASTMOD = new Date('2026-11-06');

function latest(dates: string[]): Date {
  const times = dates.map(d => new Date(d).getTime()).filter(t => !Number.isNaN(t));
  return times.length ? new Date(Math.max(...times)) : STATIC_LASTMOD;
}

/**
 * Wszystkie publiczne strony z rejestru src/lib/strony.ts plus wpisy bloga. Bez paneli, API,
 * logowania i /narzedzia (aplikacje statyczne, opis i canonical na /dla-firm/narzedzia/*). Adresy /swiadczenia?id= i ?q= nie trafiają tu,
 * bo canonical wskazuje /swiadczenia.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  // Strony z treścią odświeżaną na żywo (RSS, API) mają lastmod = czas generowania.
  const now = new Date();
  // Świadczenia: lastmod = najnowsza data weryfikacji w bazie albo data zmiany strony, co późniejsze.
  const benefitsLastmod = latest([...getAllBenefits().map(b => b.dataWeryfikacji), STATIC_LASTMOD.toISOString()]);

  const strony: MetadataRoute.Sitemap = STRONY.map(s => ({
    url: adres(s.sciezka),
    lastModified: s.lastmod === 'teraz' ? now : s.lastmod === 'swiadczenia' ? benefitsLastmod : STATIC_LASTMOD,
    changeFrequency: s.zmiana,
    priority: s.priorytet,
  }));

  const blog: MetadataRoute.Sitemap = POSTS.map(p => ({
    url: adres(`/blog/${p.slug}`),
    lastModified: new Date(p.zmiana ?? p.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...strony, ...blog];
}
