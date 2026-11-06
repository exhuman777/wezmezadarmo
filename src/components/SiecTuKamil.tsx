import { KONTAKT_SIECI, SIEC_TUKAMIL, TA_STRONA } from '@/lib/siec';

/**
 * Stopka „Sieć tuKamil” (wspólny standard sieci, wariant tekstowy siec-tk--tekst):
 * same nazwy z katalogu src/lib/siec.ts, bez ikon i bez psa, bo piksele są tu tylko
 * w grze i znaku marki (AGENTS.md). Ta strona jako aria-current bez linku.
 * Bez JS i bez animacji; style w globals.css (.siec-tk), kolory z tokenów strony.
 */
export function SiecTuKamil() {
  return (
    <nav className="siec-tk siec-tk--tekst" aria-label="Sieć tuKamil">
      <p className="siec-tk__tytul">Sieć tuKamil</p>
      <ul className="siec-tk__lista">
        {SIEC_TUKAMIL.map(a => (
          <li key={a.id}>
            {a.id === TA_STRONA
              ? <span aria-current="page">{a.nazwa}</span>
              : <a href={a.adres}>{a.nazwa}</a>}
          </li>
        ))}
      </ul>
      <p className="siec-tk__dol">
        <a href="https://tukamil.com/">zrobione przez tuKamil</a>
        <a href={KONTAKT_SIECI}>Kontakt</a>
      </p>
    </nav>
  );
}
