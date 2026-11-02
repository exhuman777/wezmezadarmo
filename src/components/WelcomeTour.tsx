'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { PROGRAMS } from '@/data/programs-b2b';

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
        nextBtnText: 'Dalej',
        prevBtnText: 'Wstecz',
        doneBtnText: 'Gotowe',
        overlayColor: 'rgba(43, 36, 32, 0.35)',
        popoverClass: 'wycieczka',
        steps: [
          {
            element: '[data-tour="profile"]',
            popover: {
              title: 'Najpierw uzupełnij profil',
              description: 'Wiek, dochód, dzieci i województwo. Na tej podstawie dopasujemy świadczenia i dotacje.',
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '[data-tour="swiadczenia"]',
            popover: {
              title: 'Zobacz dopasowane świadczenia',
              description: 'Sprawdzimy 133 świadczenia (ZUS, NFZ, PFRON, KRUS, MOPS) i pokażemy, co Ci przysługuje, a co warto sprawdzić.',
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '[data-tour="dotacje"]',
            popover: {
              title: 'Dotacje dla Twojej firmy',
              description: `Wpisz NIP, a pobierzemy PKD z CEIDG i sprawdzimy ${PROGRAMS.length} programów dotacyjnych (KFS, PUP, PFRON, KPO, ARiMR).`,
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '[data-tour="chat"]',
            popover: {
              title: 'Czat z asystentem AI',
              description: 'Pytaj o świadczenia, ulgi, terminy, kursy walut, NIP firmy albo kolejki NFZ. Asystent korzysta z bazy serwisu i danych urzędów.',
              side: 'bottom',
              align: 'start',
            },
          },
          {
            element: '[data-tour="aktualnosci"]',
            popover: {
              title: 'Aktualności RSS + powiadomienia',
              description: 'Zmiany w przepisach i komunikaty urzędów w jednym miejscu.',
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
