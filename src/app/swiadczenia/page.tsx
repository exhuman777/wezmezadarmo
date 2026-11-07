'use client';

import { useState, useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { getAllBenefits } from '@/engine/benefits';
import { searchBenefits } from '@/engine/search';
import { Benefit, BenefitCategory } from '@/engine/types';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/engine/kategorie';

function BenefitRow({ benefit, isExpanded, onToggle }: { benefit: Benefit; isExpanded: boolean; onToggle: () => void }) {
  return (
    <div className="benefit-row">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="sw-wiersz"
      >
        <span className="sw-wiersz-tresc">
          <span className="sw-nazwa">{benefit.nazwa}</span>
          <span className="sw-kwota">{benefit.kwota}</span>
          <span className="sw-czestotliwosc">{benefit.czestotliwosc}</span>
        </span>
        <span className="sw-znak" aria-hidden="true">{isExpanded ? '-' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="sw-szczegoly">
          {benefit.opis && <p>{benefit.opis}</p>}

          {benefit.wniosek.terminRealizacji && (
            <p className="sw-mala">Termin: {benefit.wniosek.terminRealizacji}</p>
          )}

          <div className="sw-przyciski">
            <a href={benefit.zrodloUrl} target="_blank" rel="noopener noreferrer" className="btn btn-green btn-sm">
              Pełny przewodnik <span aria-hidden="true">→</span>
            </a>
            <a href="/agent" className="btn btn-ghost btn-sm">Zapytaj AI</a>
          </div>

          {benefit.wniosek.dokumenty.length > 0 && (
            <>
              <p className="etykieta">Co potrzebujesz</p>
              <ol className="sw-lista">
                {benefit.wniosek.dokumenty.map((doc, i) => <li key={i}>{doc}</li>)}
              </ol>
            </>
          )}

          {benefit.wniosek.kroki.length > 0 && (
            <>
              <p className="etykieta">Krok po kroku</p>
              <ol className="sw-lista">
                {benefit.wniosek.kroki.map((krok, i) => <li key={i}>{krok}</li>)}
              </ol>
            </>
          )}

          {benefit.wymagania && Object.keys(benefit.wymagania).length > 0 && (
            <>
              <p className="etykieta">Wymagania</p>
              <div className="sw-wymagania">
                {benefit.wymagania.wiekMin != null && <span className="req-tag">Wiek min. {benefit.wymagania.wiekMin} lat</span>}
                {benefit.wymagania.wiekMax != null && <span className="req-tag">Wiek maks. {benefit.wymagania.wiekMax} lat</span>}
                {benefit.wymagania.dochodMax != null && <span className="req-tag">Dochód maks. {benefit.wymagania.dochodMax} PLN/os.</span>}
                {benefit.wymagania.dzieci && (
                  <span className="req-tag">
                    Dzieci min. {benefit.wymagania.dzieci.min}
                    {benefit.wymagania.dzieci.wiekMax ? ` (do ${benefit.wymagania.dzieci.wiekMax} lat)` : ''}
                  </span>
                )}
                {benefit.wymagania.zatrudnienie && <span className="req-tag">{benefit.wymagania.zatrudnienie.join(' / ')}</span>}
                {benefit.wymagania.niepelnosprawnosc && <span className="req-tag">Niepełnosprawność: {benefit.wymagania.niepelnosprawnosc.join(' / ')}</span>}
                {benefit.wymagania.emeryt && <span className="req-tag">Emeryt/rencista</span>}
                {benefit.wymagania.student && <span className="req-tag">Student</span>}
                {benefit.wymagania.ciaza && <span className="req-tag">Ciąża</span>}
                {benefit.wymagania.rolnik && <span className="req-tag">KRUS</span>}
              </div>
            </>
          )}

          {benefit.wniosek.pulapki.length > 0 && (
            <>
              <p className="etykieta sw-uwaga">Na co uważać</p>
              <ul className="sw-lista sw-uwaga">
                {benefit.wniosek.pulapki.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </>
          )}

          {benefit.wniosek.odwolanie && (
            <>
              <p className="etykieta">Odwołanie</p>
              <p>{benefit.wniosek.odwolanie}</p>
            </>
          )}

          <p className="sw-zrodlo">
            <a href={benefit.zrodloUrl} target="_blank" rel="noopener noreferrer">Źródło: {benefit.zrodloNazwa} →</a>
            <span>Zweryfikowano: {benefit.dataWeryfikacji}</span>
            {benefit.dataWaznosci && <span>Ważne do: {benefit.dataWaznosci}</span>}
          </p>
        </div>
      )}
    </div>
  );
}

// Adres /swiadczenia?q=... (wyszukiwarka z Google, link z asystenta AI) od razu filtruje listę.
// Fraza czytana w przeglądarce, więc serwer dalej renderuje pełną listę (bez useSearchParams i Suspense).
const bezSubskrypcji = () => () => {};
const frazaZAdresu = () => (new URLSearchParams(window.location.search).get('q') ?? '').slice(0, 100);

export default function SwiadczeniaPage() {
  // null = użytkownik jeszcze nic nie wpisał; wtedy obowiązuje fraza z adresu (?q=).
  const [wpisane, setSearch] = useState<string | null>(null);
  const zAdresu = useSyncExternalStore(bezSubskrypcji, frazaZAdresu, () => '');
  const search = wpisane ?? zAdresu;
  const [activeCategory, setActiveCategory] = useState<BenefitCategory | 'ALL'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allBenefits = useMemo(() => getAllBenefits(), []);

  const filtered = useMemo(() => {
    let list = allBenefits;
    if (activeCategory !== 'ALL') {
      list = list.filter(b => b.kategoria === activeCategory);
    }
    // Wyszukiwarka odporna na brak polskich znaków, przeszukuje opis i aliasy,
    // sortuje wg trafności (patrz src/engine/search.ts).
    if (search.trim()) {
      list = searchBenefits(list, search);
    }
    return list;
  }, [allBenefits, activeCategory, search]);

  const groupedByCategory = useMemo(() => {
    const map = new Map<BenefitCategory, Benefit[]>();
    for (const b of filtered) {
      const existing = map.get(b.kategoria) || [];
      existing.push(b);
      map.set(b.kategoria, existing);
    }
    return map;
  }, [filtered]);

  const categoryCounts = useMemo(() => {
    const map = new Map<BenefitCategory, number>();
    for (const b of allBenefits) {
      map.set(b.kategoria, (map.get(b.kategoria) || 0) + 1);
    }
    return map;
  }, [allBenefits]);

  return (
    <main className="sw-prosta">
      {/* Nagłówek */}
      <p className="etykieta">Baza wiedzy</p>
      <h1>Baza świadczeń i programów rządowych</h1>
      <p className="sw-pod">
        {allBenefits.length} świadczeń, ulg i programów w {CATEGORY_ORDER.length} kategoriach. Przy każdym: kwota, dokumenty, kroki i link do źródła.
      </p>

      {/* Wyszukiwarka */}
      <div className="sw-szukaj">
        <label htmlFor="sw-szukaj" className="sr-only">Szukaj świadczenia</label>
        <input
          id="sw-szukaj"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Szukaj świadczenia, np. 800+, becikowe, ulga..."
          className="pole-wejscie"
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} className="przycisk-ikona" aria-label="Wyczyść wyszukiwanie">
            <span aria-hidden="true">✕</span>
          </button>
        )}
      </div>

      <div className="przyciski" style={{ margin: '12px 0 0' }}>
        <Link href="/#kalkulator" className="btn btn-rdza">Sprawdź, co Ci się należy</Link>
      </div>

      {/* Kategorie */}
      <div className="filtry" role="group" aria-label="Kategorie" style={{ marginTop: 24 }}>
        <button
          type="button"
          onClick={() => setActiveCategory('ALL')}
          className="filtr"
          aria-pressed={activeCategory === 'ALL'}
        >
          Wszystkie ({allBenefits.length})
        </button>
        {CATEGORY_ORDER.map(cat => {
          const count = categoryCounts.get(cat) || 0;
          if (count === 0) return null;
          return (
            <button
              type="button"
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? 'ALL' : cat)}
              className="filtr"
              aria-pressed={activeCategory === cat}
            >
              {CATEGORY_LABELS[cat]} ({count})
            </button>
          );
        })}
      </div>

      {search && (
        <p className="sw-mala" style={{ marginTop: 16 }}>
          Znaleziono: {filtered.length} {filtered.length === 1 ? 'świadczenie' : 'świadczeń'}
        </p>
      )}

      {/* Lista */}
      {activeCategory === 'ALL' && !search ? (
        <div>
          {CATEGORY_ORDER.map(cat => {
            const benefits = groupedByCategory.get(cat);
            if (!benefits || benefits.length === 0) return null;
            return (
              <section key={cat} className="sw-kategoria">
                <h2 className="sw-kategoria-tytul">{CATEGORY_LABELS[cat]} ({benefits.length})</h2>
                {benefits.map(b => (
                  <BenefitRow
                    key={b.id}
                    benefit={b}
                    isExpanded={expandedId === b.id}
                    onToggle={() => setExpandedId(expandedId === b.id ? null : b.id)}
                  />
                ))}
              </section>
            );
          })}
        </div>
      ) : (
        <section className="sw-kategoria">
          {filtered.map(b => (
            <BenefitRow
              key={b.id}
              benefit={b}
              isExpanded={expandedId === b.id}
              onToggle={() => setExpandedId(expandedId === b.id ? null : b.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '24px 0' }}>
              <p className="sw-mala" style={{ marginBottom: 12 }}>Nie znaleziono świadczeń.</p>
              <button
                type="button"
                onClick={() => { setSearch(''); setActiveCategory('ALL'); }}
                className="btn btn-ghost btn-sm"
              >
                Wyczyść filtry
              </button>
            </div>
          )}
        </section>
      )}

      {/* Stopka listy */}
      <div className="sw-stopka">
        <p>{allBenefits.length} świadczeń w bazie · aktualizacja: listopad 2026</p>
        <p>Informacje orientacyjne. Zawsze weryfikuj na stronach źródłowych.</p>
        <p>
          <Link href="/">Strona główna</Link>
          {' · '}
          <a href="/regulamin">Regulamin</a>
          {' · '}
          <a href="/polityka-prywatnosci">Polityka prywatności</a>
        </p>
      </div>
    </main>
  );
}
