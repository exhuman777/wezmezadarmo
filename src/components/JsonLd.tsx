/**
 * Schema.org JSON-LD structured data dla SEO.
 * Rich snippets w Google search results.
 */

export function WebSiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'wezmezadarmo.com',
    alternateName: 'wezmezadarmo',
    url: 'https://www.wezmezadarmo.com',
    description: 'Sprawdź co Ci się należy od państwa. Bezpłatne narzędzie do dopasowania świadczeń rządowych, ulg i programów wsparcia.',
    inLanguage: 'pl-PL',
    publisher: {
      '@type': 'Organization',
      name: 'Mooning Charts Research',
      taxID: '7133061369',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://www.wezmezadarmo.com/swiadczenia?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'wezmezadarmo.com',
    legalName: 'Mooning Charts Research Kamil Sobkowicz',
    taxID: '7133061369',
    url: 'https://www.wezmezadarmo.com',
    logo: 'https://www.wezmezadarmo.com/icon',
    description: 'Bezpłatne narzędzie do sprawdzania świadczeń, ulg, dotacji i programów wsparcia dla polskich obywateli i firm.',
    foundingDate: '2026',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      availableLanguage: 'pl',
      url: 'https://www.wezmezadarmo.com/o-projekcie',
    },
    sameAs: [
      'https://www.linkedin.com/in/kamil-sobkowicz',
      'https://github.com/exhuman777/wezmezadarmo',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function GovernmentServiceJsonLd({
  name,
  description,
  url,
  serviceType,
  provider,
}: {
  name: string;
  description: string;
  url?: string;
  serviceType?: string;
  provider?: string;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name,
    description,
    ...(url && { url }),
    ...(serviceType && { serviceType }),
    serviceArea: {
      '@type': 'Country',
      name: 'Poland',
    },
    ...(provider && {
      provider: {
        '@type': 'GovernmentOrganization',
        name: provider,
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function FAQJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
