import type { Metadata } from 'next';
import { AUTOR, DOPISEK_MARKI, LD_ID, OBRAZ_OG, OG_IMAGES, SITE_NAME, SITE_URL, adres, jsonLd } from '@/lib/seo';
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

  const url = adres(`/blog/${post.slug}`);
  // Dopisek marki tylko wtedy, gdy tytuł z nim mieści się w ok. 60 znakach.
  const krotki = post.tytulSeo ?? post.title;
  const tytul = krotki.length + DOPISEK_MARKI.length <= 62 ? `${krotki}${DOPISEK_MARKI}` : krotki;
  return {
    title: { absolute: tytul },
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: url },
    openGraph: {
      images: OG_IMAGES,
      title: post.title,
      description: post.description,
      url,
      siteName: SITE_NAME,
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

  const url = adres(`/blog/${post.slug}`);
  const articleLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `${url}#artykul`,
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date,
        inLanguage: 'pl-PL',
        keywords: post.tags.join(', '),
        image: `${SITE_URL}${OBRAZ_OG}`,
        author: { '@type': 'Organization', name: post.author, url: SITE_URL },
        publisher: { '@type': 'Organization', '@id': LD_ID.autor, name: AUTOR.name, url: AUTOR.url },
        isPartOf: { '@id': LD_ID.website },
        mainEntityOfPage: url,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: adres('/blog') },
          { '@type': 'ListItem', position: 3, name: post.title, item: url },
        ],
      },
    ],
  };

  return (
    <main className="prosta">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(articleLd) }} />

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
