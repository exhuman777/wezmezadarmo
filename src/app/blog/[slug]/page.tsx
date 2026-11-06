import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AUTOR, DOPISEK_MARKI, LD_ID, OBRAZ_OG, OG_IMAGES, SITE_NAME, SITE_URL, adres, jsonLd } from '@/lib/seo';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { POSTS, getPostBySlug } from '@/data/blog-posts';
import { bezLinkow, bloki, fragmenty, sciezkaWpisu } from '@/lib/blog';

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

  const url = adres(sciezkaWpisu(post.slug));
  // Dopisek marki tylko wtedy, gdy tytuł z nim mieści się w ok. 60 znakach.
  const krotki = post.tytulSeo ?? post.title;
  const tytul = krotki.length + DOPISEK_MARKI.length <= 62 ? `${krotki}${DOPISEK_MARKI}` : krotki;
  return {
    title: { absolute: tytul },
    description: post.description,
    keywords: post.tags,
    alternates: { canonical: url, types: { 'text/markdown': `${url}.md` } },
    openGraph: {
      images: OG_IMAGES,
      title: post.title,
      description: post.description,
      url,
      siteName: SITE_NAME,
      locale: 'pl_PL',
      type: 'article',
      publishedTime: post.date,
      modifiedTime: post.zmiana ?? post.date,
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

/** Tekst z linkami [tekst](adres): wewnętrzne przez Link, zewnętrzne w nowej karcie. */
function ZLinkami({ tekst }: { tekst: string }): ReactNode {
  return fragmenty(tekst).map((f, i) => {
    if (!f.href) return <span key={i}>{f.tekst}</span>;
    if (f.href.startsWith('/')) return <Link key={i} href={f.href}>{f.tekst}</Link>;
    return <a key={i} href={f.href} target="_blank" rel="noopener">{f.tekst}</a>;
  });
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const url = adres(sciezkaWpisu(post.slug));
  const graf: object[] = [
    {
      '@type': 'Article',
      '@id': `${url}#artykul`,
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      dateModified: post.zmiana ?? post.date,
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
  ];
  // FAQPage tylko z pytań widocznych niżej na stronie.
  if (post.faq?.length) {
    graf.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: post.faq.map(f => ({
        '@type': 'Question',
        name: f.pytanie,
        acceptedAnswer: { '@type': 'Answer', text: bezLinkow(f.odpowiedz) },
      })),
    });
  }

  const data = (d: string) => new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <main className="prosta">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ '@context': 'https://schema.org', '@graph': graf }) }} />

      <section className="prosta-blok">
        <p className="mala" style={{ margin: '0 0 12px' }}><Link href="/blog">← Wszystkie artykuły</Link></p>
        <p className="etykieta">
          <time dateTime={post.date}>{data(post.date)}</time>
          {' · '}{post.readingMinutes} min czytania
        </p>
        <h1>{post.title}</h1>
        <p className="pod">{post.description}</p>
      </section>

      <article className="prosta-blok wpis" style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--tusz)' }}>
        {bloki(post.content).map((b, i) => {
          if (b.typ === 'h2') return <h2 key={i} style={{ marginTop: 32 }}>{b.tekst}</h2>;
          if (b.typ === 'h3') return <h3 key={i} style={{ marginTop: 24 }}>{b.tekst}</h3>;
          if (b.typ === 'ul') {
            return (
              <ul key={i} className="lista">
                {b.punkty.map((item, j) => <li key={j}><ZLinkami tekst={item} /></li>)}
              </ul>
            );
          }
          if (b.typ === 'cta') {
            return (
              <div key={i} className="przyciski">
                <Link href={b.href} className="btn btn-lg" style={{ whiteSpace: 'normal', maxWidth: '100%', textAlign: 'center' }}>{b.tekst.replace(/\s*→\s*$/, '')} →</Link>
              </div>
            );
          }
          return <p key={i} style={{ margin: '0 0 16px' }}><ZLinkami tekst={b.tekst} /></p>;
        })}
      </article>

      {post.faq?.length ? (
        <section className="prosta-blok" id="faq">
          <h2>Najczęstsze pytania</h2>
          <ul className="lista">
            {post.faq.map(f => (
              <li key={f.pytanie}>
                <h3 style={{ fontSize: 18, margin: '0 0 6px' }}>{f.pytanie}</h3>
                <p style={{ margin: 0 }}><ZLinkami tekst={f.odpowiedz} /></p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {post.dlaFirm ? (
        <section className="prosta-blok">
          <h2>Sprawdź dotacje dla swojej firmy</h2>
          <p className="pod">Wyszukiwarka działa bez konta. E-mail podajesz tylko przy sprawdzeniu firmy po NIP.</p>
          <div className="przyciski">
            <Link href="/dotacje#wyszukiwarka" className="btn btn-rdza btn-lg">Szukaj programu</Link>
            <Link href="/dla-firm/narzedzia/dofinansowania" className="btn btn-lg">Sprawdź firmę po NIP</Link>
          </div>
          <p className="mala" style={{ marginTop: 16 }}>Sprawdzono {data(post.zmiana ?? post.date)}. Tematy: {post.tags.join(', ')}. <a href={`${sciezkaWpisu(post.slug)}.md`}>Wersja Markdown</a>.</p>
        </section>
      ) : (
        <section className="prosta-blok">
          <h2>Sprawdź, co Tobie się należy</h2>
          <p className="pod">Kilka pytań, bez logowania i bez PESEL.</p>
          <div className="przyciski">
            <Link href="/#kalkulator" className="btn btn-rdza btn-lg">Sprawdź za darmo</Link>
          </div>
          <p className="mala" style={{ marginTop: 16 }}>Tematy: {post.tags.join(', ')}</p>
        </section>
      )}
    </main>
  );
}
