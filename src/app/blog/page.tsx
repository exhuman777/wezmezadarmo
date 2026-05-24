import type { Metadata } from 'next';
import Link from 'next/link';
import { POSTS } from '@/data/blog-posts';

export const metadata: Metadata = {
  title: 'Blog - świadczenia, ulgi, dofinansowania | wezmezadarmo',
  description: 'Praktyczne poradniki o świadczeniach, ulgach podatkowych i programach wsparcia w Polsce. Aktualizowane na 2026.',
  alternates: { canonical: 'https://www.wezmezadarmo.com/blog' },
  openGraph: {
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
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px 60px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22A06B', boxShadow: '0 0 7px rgba(34,160,107,0.55)' }} />
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          Blog
        </span>
      </div>

      <h1 style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 700, marginBottom: 12, color: 'var(--ink-900)' }}>
        Praktyczne poradniki o świadczeniach
      </h1>
      <p style={{ fontSize: 15, color: 'var(--ink-500)', marginBottom: 36, lineHeight: 1.6 }}>
        Co Ci się należy, jak złożyć wniosek, ile to warte. Bez urzędniczego żargonu.
        Aktualizowane na bieżąco z bazy 118 świadczeń.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sorted.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            style={{
              display: 'block', padding: 24, borderRadius: 14,
              background: 'var(--white)', border: '1px solid var(--line)',
              textDecoration: 'none', color: 'inherit',
              transition: 'transform 150ms, box-shadow 150ms',
            }}
            className="card-hover"
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
              <time style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--f-mono)' }}>
                {new Date(post.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
              </time>
              <span style={{ fontSize: 11, color: 'var(--ink-400)' }}>·</span>
              <span style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--f-mono)' }}>
                {post.readingMinutes} min czytania
              </span>
            </div>
            <h2 style={{ fontSize: 19, fontWeight: 600, marginBottom: 8, color: 'var(--ink-900)', lineHeight: 1.3 }}>
              {post.title}
            </h2>
            <p style={{ fontSize: 14, color: 'var(--ink-500)', lineHeight: 1.6, margin: '0 0 12px' }}>
              {post.description}
            </p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {post.tags.slice(0, 4).map(tag => (
                <span key={tag} style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 4,
                  background: 'var(--green-50)', color: 'var(--green-800)',
                  fontFamily: 'var(--f-mono)', letterSpacing: '0.04em', textTransform: 'uppercase',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      {sorted.length === 1 && (
        <div style={{ marginTop: 32, padding: 18, background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 10, fontSize: 13, color: 'var(--green-900)', lineHeight: 1.6 }}>
          To dopiero początek bloga. Kolejne artykuły wkrótce: KSeF dla JDG, Czyste Powietrze krok po kroku, renta wdowia i więcej.
        </div>
      )}
    </main>
  );
}
