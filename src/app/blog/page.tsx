import type { Metadata } from 'next';
import { StronaJsonLd } from '@/components/JsonLd';
import { metadaneStrony } from '@/lib/strony';
import Link from 'next/link';
import { POSTS } from '@/data/blog-posts';

export const metadata: Metadata = metadaneStrony('/blog');

export default function BlogIndex() {
  const sorted = [...POSTS].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="prosta">
      <StronaJsonLd sciezka="/blog" />
      <section className="prosta-blok">
        <p className="etykieta">Blog</p>
        <h1>Poradniki o świadczeniach</h1>
        <p className="pod">Co Ci się należy, jak złożyć wniosek i ile to warte. Prostym językiem.</p>
      </section>

      <section aria-label="Wpisy">
        <ul className="lista" style={{ marginTop: 0 }}>
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
