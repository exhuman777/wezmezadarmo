import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'wezmezadarmo - Sprawdź co Ci się należy',
    short_name: 'wezmezadarmo',
    description: 'Bezpłatne narzędzie do sprawdzania świadczeń, ulg i dotacji rządowych. 133 świadczenia w 13 kategoriach.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f0e4',
    theme_color: '#f6f0e4',
    orientation: 'portrait',
    lang: 'pl',
    categories: ['government', 'finance', 'lifestyle', 'productivity'],
    icons: [
      { src: '/icon.png', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
      { src: '/ikona-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
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
