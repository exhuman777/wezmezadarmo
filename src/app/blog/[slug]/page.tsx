import type { Metadata } from 'next';
import { OG_IMAGES } from '@/lib/seo';
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
      images: OG_IMAGES,
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
    <main className="prosta">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />

      <section className="prosta-blok">
        <p className="mala" style={{ margin: '0 0 12px' }}><Link href="/blog">← Wszystkie artykuły</Link></p>
        <p className="etykieta">
          <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
          {' · '}{post.readingMinutes} min czytania
        </p>
        <h1>{post.title}</h1>
        <p className="pod">{post.description}</p>
      </section>

      <article className="prosta-blok" style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--tusz)' }}>
        {blocks.map((block, i) => {
          if (block.type === 'h2') {
            return <h2 key={i} style={{ marginTop: 32 }}>{block.content as string}</h2>;
          }
          if (block.type === 'ul') {
            return (
              <ul key={i} className="lista">
                {(block.content as string[]).map((item, j) => <li key={j}>{item}</li>)}
              </ul>
            );
          }
          if (block.type === 'cta') {
            const [label, url] = (block.content as string).split('|');
            return (
              <div key={i} className="przyciski">
                <Link href={url} className="btn btn-lg" style={{ whiteSpace: 'normal', maxWidth: '100%', textAlign: 'center' }}>{label.replace(/\s*→\s*$/, '')} →</Link>
              </div>
            );
          }
          return <p key={i} style={{ margin: '0 0 16px' }}>{block.content as string}</p>;
        })}
      </article>

      <section className="prosta-blok">
        <h2>Sprawdź, co Tobie się należy</h2>
        <p className="pod">Kilka pytań, bez logowania i bez PESEL.</p>
        <div className="przyciski">
          <Link href="/#kalkulator" className="btn btn-rdza btn-lg">Sprawdź za darmo</Link>
        </div>
        <p className="mala" style={{ marginTop: 16 }}>Tematy: {post.tags.join(', ')}</p>
      </section>
    </main>
  );
}
