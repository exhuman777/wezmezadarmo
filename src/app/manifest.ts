import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'wezmezadarmo - Sprawdź co Ci się należy',
    short_name: 'wezmezadarmo',
    description: 'Bezpłatne narzędzie do sprawdzania świadczeń, ulg i dotacji rządowych. 118 świadczeń w 15 kategoriach.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f0f6f1',
    theme_color: '#0d2b1c',
    orientation: 'portrait',
    lang: 'pl',
    categories: ['government', 'finance', 'lifestyle', 'productivity'],
    icons: [
      {
        src: '/icon',
        sizes: 'any',
        type: 'image/png',
      },
    ],
    shortcuts: [
      {
        name: 'Kalkulator świadczeń',
        short_name: 'Kalkulator',
        description: 'Sprawdź co Ci się należy w 2 minuty',
        url: '/',
      },
      {
        name: 'Wyszukiwarka NFZ',
        short_name: 'NFZ',
        description: 'Kolejki, lekarze, świadczeniodawcy NFZ',
        url: '/nfz',
      },
      {
        name: 'Centrum Obywatela',
        short_name: 'Centrum',
        description: '11 publicznych narzędzi państwowych',
        url: '/centrum-obywatela',
      },
      {
        name: 'Aktualności urzędowe',
        short_name: 'Aktualności',
        description: 'RSS z 8 instytucji rządowych',
        url: '/aktualnosci',
      },
    ],
  };
}
