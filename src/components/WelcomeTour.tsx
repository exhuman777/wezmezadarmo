'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const TOUR_KEY = 'welcome_tour_v1_completed';

/**
 * Welcome tour po pierwszym wejsciu do panelu.
 * Pokazuje 4 dymki tooltips wskazujace gdzie co kliknac.
 * Zapisuje stan w localStorage - pokazuje tylko raz na browser.
 */
export default function WelcomeTour() {
  const pathname = usePathname();

  useEffect(() => {
    // Pokaz tylko na /panel (dashboard po pierwszym logowaniu)
    if (pathname !== '/panel') return;

    // Sprawdz czy juz widzial
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(TOUR_KEY) === '1') return;

    // Lazy import driver.js zeby nie blokowac bundle dla wszystkich
    Promise.all([
      import('driver.js'),
      // CSS lazy-loaded jako <link> (Next nie pozwala dynamic CSS import w client)
      (async () => {
        if (document.getElementById('driver-css')) return;
        const link = document.createElement('link');
        link.id = 'driver-css';
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/driver.js@1.4.0/dist/driver.css';
        document.head.appendChild(link);
      })(),
    ]).then(([{ driver }]) => {
      const tour = driver({
        showProgress: true,
        progressText: 'Krok {{current}} z {{total}}',
        nextBtnText: 'Dalej →',
        prevBtnText: '← Wstecz',
        doneBtnText: 'Zaczynamy',
        overlayColor: 'rgba(12, 23, 20, 0.55)',
        steps: [
          {
            element: '[data-tour="profile"]',
            popover: {
              title: 'Najpierw uzupełnij profil',
              description: 'Wiek, dochód, dzieci, województwo, NIP firmy (jeśli masz). Agent dopasuje świadczenia i dotacje do Twojej sytuacji. Zajmie 2 minuty.',
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '[data-tour="swiadczenia"]',
            popover: {
              title: 'Zobacz dopasowane świadczenia',
              description: 'Po wypełnieniu profilu silnik przeliczy 133 świadczeń (ZUS, NFZ, PFRON, KRUS, MOPS) i pokaże co Ci pewnie przysługuje (PRZYSŁUGUJE) oraz co możliwe (MOŻLIWE).',
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '[data-tour="dotacje"]',
            popover: {
              title: 'Dotacje dla Twojej firmy',
              description: 'Wpisz NIP, pobierzemy PKD z CEIDG i dopasujemy 23 programy dotacyjne (KFS, PARP, NCBR, KPO, ARiMR). Także dla osób prywatnych prowadzących działalność.',
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '[data-tour="chat"]',
            popover: {
              title: 'Czat z asystentem AI',
              description: 'Pytaj o cokolwiek: świadczenia, ulgi, terminy, kursy walut, sprawdzenie NIP, kolejki NFZ. Agent ma pełną wiedzę o systemie + dostęp do live API rządowych.',
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '[data-tour="aktualnosci"]',
            popover: {
              title: 'Aktualności RSS + powiadomienia',
              description: 'Śledź zmiany z 8 instytucji rządowych. Ustaw subskrypcję e-mail, aby dostawać tylko to, co Cię interesuje (najwyżej 1 e-mail dziennie i tylko gdy pojawi się coś nowego, bez spamu).',
              side: 'bottom',
              align: 'start',
            },
          },
        ],
        onDestroyStarted: () => {
          localStorage.setItem(TOUR_KEY, '1');
          tour.destroy();
        },
      });

      // Maly delay zeby DOM byl gotowy
      setTimeout(() => tour.drive(), 600);
    });
  }, [pathname]);

  return null;
}
