import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { POSTS, getPostBySlug } from '@/data/blog-posts';

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return POSTS.map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Nie znaleziono | wezmezadarmo' };

  const url = `https://www.wezmezadarmo.com/blog/${post.slug}`;
  return {
    title: `${post.title} | wezmezadarmo Blog`,
    description: post.description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: 'wezmezadarmo',
      locale: 'pl_PL',
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
    },
  };
}

/** Prosty parser markdown-like: ## headers, paragraphs, bullety " • " jako <li> */
function renderContent(content: string) {
  const lines = content.split('\n');
  const blocks: Array<{ type: 'h2' | 'p' | 'ul' | 'cta'; content: string | string[] }> = [];
  let buffer: string[] = [];

  function flushBuffer() {
    if (buffer.length === 0) return;
    const text = buffer.join(' ').trim();
    if (!text) { buffer = []; return; }
    // Buletted list?
    if (text.startsWith(' • ') || text.includes('\n • ')) {
      const items = text.split(/\s•\s+/).filter(Boolean);
      blocks.push({ type: 'ul', content: items });
    } else {
      blocks.push({ type: 'p', content: text });
    }
    buffer = [];
  }

  for (const line of lines) {
    if (line.startsWith('## ')) {
      flushBuffer();
      blocks.push({ type: 'h2', content: line.slice(3).trim() });
    } else if (line.startsWith('[') && line.includes('](')) {
      flushBuffer();
      // Markdown link [text](url) -> CTA box
      const m = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (m) blocks.push({ type: 'cta', content: `${m[1]}|${m[2]}` });
    } else if (line.startsWith(' • ')) {
      buffer.push(line);
    } else if (line.trim() === '') {
      flushBuffer();
    } else {
      buffer.push(line);
    }
  }
  flushBuffer();

  return blocks;
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const blocks = renderContent(post.content);

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Organization', name: post.author },
    publisher: {
      '@type': 'Organization',
      name: 'wezmezadarmo.com',
      logo: { '@type': 'ImageObject', url: 'https://www.wezmezadarmo.com/icon' },
    },
    mainEntityOfPage: `https://www.wezmezadarmo.com/blog/${post.slug}`,
  };

  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 60px' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />

      <Link href="/blog" style={{ fontSize: 13, color: '#22A06B', textDecoration: 'none', marginBottom: 20, display: 'inline-block' }}>
        ← Wszystkie artykuły
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22A06B' }} />
        <time style={{ fontFamily: 'var(--f-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-500)' }}>
          {new Date(post.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
        </time>
        <span style={{ fontSize: 11, color: 'var(--ink-400)' }}>·</span>
        <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-500)' }}>{post.readingMinutes} min</span>
      </div>

      <h1 style={{ fontSize: 'clamp(26px, 4.5vw, 38px)', fontWeight: 700, marginBottom: 16, color: 'var(--ink-900)', lineHeight: 1.2 }}>
        {post.title}
      </h1>

      <p style={{ fontSize: 17, color: 'var(--ink-700)', lineHeight: 1.6, marginBottom: 28, paddingLeft: 14, borderLeft: '2px solid var(--green-200)' }}>
        {post.description}
      </p>

      <article style={{ fontSize: 16, lineHeight: 1.75, color: 'var(--ink-800)' }}>
        {blocks.map((block, i) => {
          if (block.type === 'h2') {
            return (
              <h2 key={i} style={{
                fontSize: 22, fontWeight: 700, marginTop: 36, marginBottom: 14,
                color: 'var(--ink-900)', letterSpacing: '-0.01em',
              }}>{block.content as string}</h2>
            );
          }
          if (block.type === 'ul') {
            return (
              <ul key={i} style={{ marginTop: 12, marginBottom: 20, paddingLeft: 0, listStyle: 'none' }}>
                {(block.content as string[]).map((item, j) => (
                  <li key={j} style={{ paddingLeft: 22, position: 'relative', marginBottom: 8 }}>
                    <span style={{ position: 'absolute', left: 4, color: '#22A06B', fontWeight: 700 }}>•</span>
                    {item}
                  </li>
                ))}
              </ul>
            );
          }
          if (block.type === 'cta') {
            const [label, url] = (block.content as string).split('|');
            return (
              <div key={i} style={{ margin: '24px 0', padding: '16px 20px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 10 }}>
                <Link href={url} style={{ color: '#22A06B', fontWeight: 600, textDecoration: 'none', fontSize: 15 }}>
                  {label} →
                </Link>
              </div>
            );
          }
          return (
            <p key={i} style={{ marginBottom: 16 }}>{block.content as string}</p>
          );
        })}
      </article>

      <div style={{ marginTop: 48, padding: '20px 24px', background: 'var(--green-50)', border: '1px solid var(--green-200)', borderRadius: 14, textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--f-mono)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Sprawdź teraz
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--ink-900)' }}>
          Co Tobie się należy z 118 świadczeń?
        </h3>
        <p style={{ fontSize: 13, color: 'var(--ink-600)', marginBottom: 16, lineHeight: 1.5 }}>
          10 pytań, 2 minuty, bez logowania, bez PESEL.
        </p>
        <Link href="/" style={{
          display: 'inline-block', padding: '12px 28px', borderRadius: 12,
          background: 'linear-gradient(135deg, #22A06B, #1d9060)',
          color: '#fff', fontSize: 14, fontWeight: 600, textDecoration: 'none',
          boxShadow: '0 4px 14px rgba(34,160,107,0.3)',
        }}>
          Sprawdź za darmo →
        </Link>
      </div>

      <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid var(--line)', fontSize: 12, color: 'var(--ink-500)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <span>Tags:</span>
        {post.tags.map(t => (
          <span key={t} style={{ fontFamily: 'var(--f-mono)' }}>#{t}</span>
        ))}
      </div>
    </main>
  );
}
