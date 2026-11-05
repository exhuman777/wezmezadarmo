/**
 * Dane strukturalne schema.org (JSON-LD). Przeglądarka ich nie wykonuje, więc
 * działają przy CSP bez dodatkowych wyjątków. Serwis jest projektem prywatnym:
 * nigdy GovernmentService ani GovernmentOrganization. FAQPage tylko na stronie,
 * na której te same pytania i odpowiedzi są widoczne.
 */
import { AUTOR, LD_ID, SITE_NAME, SITE_URL, adres, jsonLd } from '@/lib/seo';
import { okruszki, strona } from '@/lib/strony';

function Skrypt({ dane }: { dane: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(dane) }} />;
}

/** Serwis: WebSite z wyszukiwarką świadczeń, marka wezmezadarmo i wydawca tuKamil. Raz, w root layout. */
export function SerwisJsonLd() {
  return (
    <Skrypt
      dane={{
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebSite',
            '@id': LD_ID.website,
            name: SITE_NAME,
            alternateName: 'wezmezadarmo.com',
            url: SITE_URL,
            description: 'Sprawdź, jakie świadczenia, ulgi i dotacje mogą Ci przysługiwać. Kalkulator, baza świadczeń ze źródłami, wnioski ZUS z pomocą AI i narzędzia dla firm. Za darmo.',
            inLanguage: 'pl-PL',
            publisher: { '@id': LD_ID.autor },
            // Wyszukiwarka na /swiadczenia czyta parametr q (src/app/swiadczenia/page.tsx).
            potentialAction: {
              '@type': 'SearchAction',
              target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/swiadczenia?q={search_term_string}` },
              'query-input': 'required name=search_term_string',
            },
          },
          {
            '@type': 'Organization',
            '@id': LD_ID.organizacja,
            name: SITE_NAME,
            alternateName: 'wezmezadarmo.com',
            url: SITE_URL,
            logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon`, width: 32, height: 32 },
            description: 'Prywatny, niekomercyjny projekt obywatelski: baza świadczeń, ulg i dotacji ze źródłami urzędowymi, wnioski ZUS z pomocą AI i darmowe narzędzia dla firm.',
            foundingDate: '2026',
            areaServed: { '@type': 'Country', name: 'Polska' },
            knowsLanguage: 'pl',
            founder: { '@id': LD_ID.autor },
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer support',
              availableLanguage: 'pl',
              url: `${SITE_URL}/o-projekcie`,
            },
            sameAs: ['https://github.com/exhuman777/wezmezadarmo'],
          },
          {
            '@type': 'Organization',
            '@id': LD_ID.autor,
            name: AUTOR.name,
            url: AUTOR.url,
          },
        ],
      }}
    />
  );
}

/**
 * Strona z rejestru (src/lib/strony.ts): WebPage (albo CollectionPage/AboutPage),
 * BreadcrumbList i WebApplication dla narzędzi. Opisy te same co w metadanych.
 */
export function StronaJsonLd({ sciezka }: { sciezka: string }) {
  const s = strona(sciezka);
  const url = adres(s.sciezka);
  const lancuch = okruszki(s.sciezka);
  const maOkruszki = lancuch.length > 1;

  const graf: object[] = [
    {
      '@type': s.typ ?? 'WebPage',
      '@id': `${url}#strona`,
      url,
      name: s.tytul,
      description: s.opis,
      inLanguage: 'pl-PL',
      keywords: s.slowa.join(', '),
      isPartOf: { '@id': LD_ID.website },
      publisher: { '@id': LD_ID.autor },
      ...(maOkruszki && { breadcrumb: { '@id': `${url}#okruszki` } }),
      ...(s.aplikacja && { mainEntity: { '@id': `${url}#aplikacja` } }),
    },
  ];

  if (maOkruszki) {
    graf.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#okruszki`,
      itemListElement: lancuch.map((o, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: o.sciezka === '/' ? SITE_NAME : o.nazwa,
        item: adres(o.sciezka),
      })),
    });
  }

  if (s.aplikacja) {
    graf.push({
      '@type': 'WebApplication',
      '@id': `${url}#aplikacja`,
      name: s.nazwa,
      url,
      description: s.opis,
      applicationCategory: s.aplikacja,
      operatingSystem: 'Przeglądarka internetowa',
      inLanguage: 'pl-PL',
      isAccessibleForFree: true,
      // Strona mówi wprost „za darmo”, więc cena 0 zł jest na stronie.
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'PLN' },
      publisher: { '@id': LD_ID.autor },
    });
  }

  return <Skrypt dane={{ '@context': 'https://schema.org', '@graph': graf }} />;
}

/** FAQPage: wyłącznie z pytaniami, które są widoczne na tej samej stronie. */
export function FAQJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <Skrypt
      dane={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }}
    />
  );
}
