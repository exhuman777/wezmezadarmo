import Link from 'next/link';
import { FooterContactForm } from './FooterContactForm';
import { NewsletterSignup } from './NewsletterSignup';
import { PixelMark } from './SiteNav';

// Stopka w stylu strony głównej: jedna wąska kolumna, linki w jednym ciągu,
// newsletter i formularz kontaktowy schowane pod krótkimi nagłówkami.
const LINKI = [
  { href: '/swiadczenia', label: 'Baza 133 świadczeń' },
  { href: '/wnioski', label: 'Wnioski' },
  { href: '/dotacje', label: 'Dotacje dla firm' },
  { href: '/nfz', label: 'Wyszukiwarka NFZ' },
  { href: '/aktualnosci', label: 'Aktualności' },
  { href: '/statystyki', label: 'Polska w liczbach' },
  { href: '/blog', label: 'Blog' },
  { href: '/o-projekcie', label: 'O projekcie' },
  { href: '/press', label: 'Press kit' },
  { href: '/regulamin', label: 'Regulamin' },
  { href: '/polityka-prywatnosci', label: 'Polityka prywatności' },
];

export function SiteFooter() {
  return (
    <footer className="stopka">
      <div className="stopka-in">
        <div className="row-8">
          <PixelMark size={20} />
          <span className="stopka-marka">
            wezmezadarmo<span className="dim">.com</span>
          </span>
        </div>
        <p className="stopka-opis">
          Świadczenia, dotacje i ulgi w jednym miejscu. Za darmo.
        </p>

        <nav aria-label="Stopka" className="stopka-linki">
          {LINKI.map(link => (
            <Link key={link.href} href={link.href}>{link.label}</Link>
          ))}
          <a href="https://pixel-kamil.vercel.app" target="_blank" rel="noopener">Autor: Kamil Sobkowicz</a>
          <a href="https://linkedin.com/in/kamil-sobkowicz" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </nav>

        <details className="stopka-sekcja">
          <summary>Newsletter co tydzień</summary>
          <div className="stopka-sekcja-in">
            <NewsletterSignup />
          </div>
        </details>

        <details className="stopka-sekcja">
          <summary>Napisz do nas</summary>
          <div className="stopka-sekcja-in">
            <FooterContactForm />
          </div>
        </details>

        <p className="stopka-dol">
          &copy; 2026 wezmezadarmo &middot; projekt obywatelski &middot; aktualizacja bazy 1.11.2026
        </p>
      </div>
    </footer>
  );
}
