import type { Metadata } from 'next';
import { OG_IMAGES } from '@/lib/seo';
import Link from 'next/link';
import { POSTS } from '@/data/blog-posts';

export const metadata: Metadata = {
  title: 'Blog - świadczenia, ulgi, dofinansowania | wezmezadarmo',
  description: 'Praktyczne poradniki o świadczeniach, ulgach podatkowych i programach wsparcia w Polsce. Aktualizowane na 2026.',
  alternates: { canonical: 'https://www.wezmezadarmo.com/blog' },
  openGraph: {
    images: OG_IMAGES,
    title: 'Blog wezmezadarmo - poradniki o świadczeniach',
    description: 'Co Ci się należy w 2026? Analizy, kalkulacje, instrukcje krok po kroku.',
    url: 'https://www.wezmezadarmo.com/blog',
    locale: 'pl_PL',
    type: 'website',
  },
};

export default function BlogIndex() {
  const sorted = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="prosta">
      <section className="prosta-blok">
        <p className="etykieta">Blog</p>
        <h1>Poradniki o świadczeniach</h1>
        <p className="pod">Co Ci się należy, jak złożyć wniosek i ile to warte. Prostym językiem.</p>
      </section>

      <section className="prosta-blok">
        <ul className="lista">
          {sorted.map(post => (
            <li key={post.slug}>
              <p className="mala" style={{ margin: '0 0 4px' }}>
                <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
                {' · '}{post.readingMinutes} min czytania
              </p>
              <h2 style={{ fontSize: 20, margin: '0 0 6px' }}>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="pod" style={{ margin: 0, fontSize: 16 }}>{post.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
