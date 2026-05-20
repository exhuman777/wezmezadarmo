'use client';

import { useState, useMemo } from 'react';
import { getAllBenefits } from '@/engine/benefits';
import { Benefit, BenefitCategory } from '@/engine/types';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';

const CATEGORY_LABELS: Record<BenefitCategory, string> = {
  ZDROWIE: 'Zdrowie',
  RODZINA: 'Rodzina',
  PODATKI: 'Podatki i ulgi',
  BIZNES: 'Biznes',
  MIESZKANIE: 'Mieszkanie',
  NIEPELNOSPRAWNOSC: 'Niepełnosprawność',
  ENERGIA: 'Energia',
  ZUS: 'ZUS',
  PRACA: 'Praca',
  EDUKACJA: 'Edukacja',
  SENIOR: 'Seniorzy',
  POMOC_SPOLECZNA: 'Pomoc społeczna',
  EKOLOGIA: 'Ekologia',
};

const CATEGORY_ORDER: BenefitCategory[] = [
  'RODZINA', 'ZDROWIE', 'PRACA', 'ZUS', 'PODATKI', 'SENIOR',
  'POMOC_SPOLECZNA', 'EDUKACJA', 'BIZNES', 'MIESZKANIE',
  'NIEPELNOSPRAWNOSC', 'EKOLOGIA', 'ENERGIA',
];

function BenefitRow({ benefit, isExpanded, onToggle }: { benefit: Benefit; isExpanded: boolean; onToggle: () => void }) {
  return (
    <div
      className="border border-border rounded-xl overflow-hidden transition-all"
      style={{ background: 'var(--color-bg-1)' }}
    >
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 cursor-pointer bg-transparent border-none flex items-start gap-3"
      >
        <span className="text-accent font-bold text-[14px] mt-0.5 shrink-0">{'\u2192'}</span>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[14px] sm:text-[15px] font-semibold text-text-1 break-words">{benefit.nazwa}</span>
            <span className="text-[13px] sm:text-[14px] font-bold text-accent">{benefit.kwota}</span>
          </div>
          <div className="text-[12px] text-text-3 mt-0.5">{benefit.czestotliwosc}</div>
        </div>
        <span className="text-text-3 text-[14px] shrink-0 mt-1 transition-transform" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          {'\u25B6'}
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-3 pt-0 border-t border-border overflow-hidden" style={{ animation: 'fadeIn 0.3s ease', wordBreak: 'break-word' }}>
          {/* Wymagania */}
          {benefit.wymagania && Object.keys(benefit.wymagania).length > 0 && (
            <div className="mt-3">
              <div className="text-[11px] font-bold tracking-wider text-text-3 uppercase mb-1.5">Wymagania</div>
              <div className="space-y-1">
                {benefit.wymagania.wiekMin != null && (
                  <div className="text-[13px] text-text-2">Wiek minimum: {benefit.wymagania.wiekMin} lat</div>
                )}
                {benefit.wymagania.wiekMax != null && (
                  <div className="text-[13px] text-text-2">Wiek maksymalny: {benefit.wymagania.wiekMax} lat</div>
                )}
                {benefit.wymagania.dochodMax != null && (
                  <div className="text-[13px] text-text-2">Dochód maksymalny: {benefit.wymagania.dochodMax} PLN na osobę</div>
                )}
                {benefit.wymagania.dzieci && (
                  <div className="text-[13px] text-text-2">
                    Dzieci: min. {benefit.wymagania.dzieci.min}
                    {benefit.wymagania.dzieci.wiekMax ? ` (do ${benefit.wymagania.dzieci.wiekMax} lat)` : ''}
                  </div>
                )}
                {benefit.wymagania.zatrudnienie && (
                  <div className="text-[13px] text-text-2">Zatrudnienie: {benefit.wymagania.zatrudnienie.join(', ')}</div>
                )}
                {benefit.wymagania.niepelnosprawnosc && (
                  <div className="text-[13px] text-text-2">Niepełnosprawność: {benefit.wymagania.niepelnosprawnosc.join(', ')}</div>
                )}
                {benefit.wymagania.emeryt && (
                  <div className="text-[13px] text-text-2">Wymagany status emeryta/rencisty</div>
                )}
                {benefit.wymagania.student && (
                  <div className="text-[13px] text-text-2">Wymagany status studenta</div>
                )}
                {benefit.wymagania.ciaza && (
                  <div className="text-[13px] text-text-2">Wymagana ciąża</div>
                )}
                {benefit.wymagania.rolnik && (
                  <div className="text-[13px] text-text-2">Wymagane ubezpieczenie KRUS</div>
                )}
              </div>
            </div>
          )}

          {/* Jak zlozyc */}
          <div className="mt-3">
            <div className="text-[11px] font-bold tracking-wider text-text-3 uppercase mb-1.5">Jak złożyć wniosek</div>
            <div className="space-y-1">
              {benefit.wniosek.kroki.map((krok, i) => (
                <div key={i} className="text-[13px] text-text-2 flex gap-2">
                  <span className="text-accent font-bold shrink-0">{i + 1}.</span>
                  <span>{krok}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dokumenty */}
          {benefit.wniosek.dokumenty.length > 0 && (
            <div className="mt-3">
              <div className="text-[11px] font-bold tracking-wider text-text-3 uppercase mb-1.5">Dokumenty</div>
              <div className="space-y-0.5">
                {benefit.wniosek.dokumenty.map((doc, i) => (
                  <div key={i} className="text-[13px] text-text-2">{'\u2022'} {doc}</div>
                ))}
              </div>
            </div>
          )}

          {/* Pulapki */}
          {benefit.wniosek.pulapki.length > 0 && (
            <div className="mt-3">
              <div className="text-[11px] font-bold tracking-wider text-text-3 uppercase mb-1.5">Na co uważać</div>
              <div className="space-y-0.5">
                {benefit.wniosek.pulapki.map((p, i) => (
                  <div key={i} className="text-[13px] text-text-2" style={{ color: 'var(--color-red)' }}>! {p}</div>
                ))}
              </div>
            </div>
          )}

          {/* Zrodlo */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <a
              href={benefit.zrodloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-accent hover:underline"
            >
              Źródło: {benefit.zrodloNazwa} {'\u2192'}
            </a>
            <span className="text-[11px] text-text-3">
              Zweryfikowano: {benefit.dataWeryfikacji}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SwiadczeniaPage() {
  const { theme, toggle: toggleTheme } = useTheme();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<BenefitCategory | 'ALL'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const allBenefits = useMemo(() => getAllBenefits(), []);

  const filtered = useMemo(() => {
    let list = allBenefits;

    if (activeCategory !== 'ALL') {
      list = list.filter(b => b.kategoria === activeCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(b =>
        b.nazwa.toLowerCase().includes(q) ||
        b.kwota.toLowerCase().includes(q) ||
        b.kategoria.toLowerCase().includes(q) ||
        b.wniosek.kroki.some(k => k.toLowerCase().includes(q)) ||
        b.wniosek.dokumenty.some(d => d.toLowerCase().includes(q))
      );
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
    <div className="min-h-screen">
      {/* Top bar */}
      <div
        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-3 border-b border-border sticky top-0 z-50"
        style={{
          background: 'rgba(240,246,241,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <a href="/" className="flex items-center gap-2 no-underline hover:no-underline">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full shrink-0" style={{ background: 'var(--color-green)', boxShadow: '0 0 6px var(--color-green-border)' }} />
          <span className="text-[12px] sm:text-[14px] font-extrabold tracking-[1.5px] sm:tracking-[2px] text-text-1">
            wezmezadarmo
          </span>
        </a>
        <span className="flex-1" />
        <a href="/" className="text-[12px] sm:text-[13px] text-accent font-semibold no-underline hover:underline">
          Sprawdź swoje
        </a>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      {/* Hero */}
      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-3xl mx-auto">
        <h1 className="text-[22px] sm:text-[28px] font-bold text-text-1 mb-2 leading-tight">
          Baza świadczeń i programów rządowych
        </h1>
        <p className="text-[14px] sm:text-[15px] text-text-2 mb-1">
          {allBenefits.length} świadczeń w {CATEGORY_ORDER.length} kategoriach. Zasiłki, ulgi podatkowe, dotacje, darmowe badania, programy wsparcia.
        </p>
        <p className="text-[13px] sm:text-[14px] text-text-3 mb-5">
          Każde świadczenie zawiera instrukcję krok po kroku, wymagane dokumenty, pułapki i link do źródła.
        </p>

        {/* Search */}
        <div className="relative mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj świadczenia, np. 800+, becikowe, ulga..."
            className="w-full px-4 py-3 rounded-xl text-[14px] sm:text-[15px] border border-border bg-bg-1 text-text-1 outline-none transition-all focus:border-accent"
            style={{ caretColor: 'var(--color-green)' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-1 bg-transparent border-none cursor-pointer text-[16px]"
            >
              {'\u2715'}
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-semibold border cursor-pointer transition-all ${
              activeCategory === 'ALL' ? 'border-green text-green' : 'border-border text-text-3 hover:text-text-1'
            }`}
            style={{
              background: activeCategory === 'ALL' ? 'var(--color-green-bg)' : 'var(--color-bg-2)',
            }}
          >
            Wszystkie ({allBenefits.length})
          </button>
          {CATEGORY_ORDER.map(cat => {
            const count = categoryCounts.get(cat) || 0;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === activeCategory ? 'ALL' : cat)}
                className={`px-3 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-semibold border cursor-pointer transition-all ${
                  activeCategory === cat ? 'border-green text-green' : 'border-border text-text-3 hover:text-text-1'
                }`}
                style={{
                  background: activeCategory === cat ? 'var(--color-green-bg)' : 'var(--color-bg-2)',
                }}
              >
                {CATEGORY_LABELS[cat]} ({count})
              </button>
            );
          })}
        </div>

        {/* Results count */}
        {search && (
          <div className="text-[13px] text-text-3 mb-4">
            Znaleziono: {filtered.length} {filtered.length === 1 ? 'świadczenie' : 'świadczeń'}
          </div>
        )}

        {/* Benefits list */}
        {activeCategory === 'ALL' && !search ? (
          // Grouped by category
          <div className="space-y-4">
            {CATEGORY_ORDER.map(cat => {
              const benefits = groupedByCategory.get(cat);
              if (!benefits || benefits.length === 0) return null;
              return (
                <div key={cat}>
                  <div className="text-[11px] sm:text-[12px] font-bold tracking-wider text-accent uppercase mb-1.5">
                    {CATEGORY_LABELS[cat]} ({benefits.length})
                  </div>
                  <div className="space-y-1.5">
                    {benefits.map(b => (
                      <BenefitRow
                        key={b.id}
                        benefit={b}
                        isExpanded={expandedId === b.id}
                        onToggle={() => setExpandedId(expandedId === b.id ? null : b.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Flat list (filtered or single category)
          <div className="space-y-1.5">
            {filtered.map(b => (
              <BenefitRow
                key={b.id}
                benefit={b}
                isExpanded={expandedId === b.id}
                onToggle={() => setExpandedId(expandedId === b.id ? null : b.id)}
              />
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-8">
                <div className="text-[15px] text-text-3 mb-2">Nie znaleziono świadczeń</div>
                <button
                  onClick={() => { setSearch(''); setActiveCategory('ALL'); }}
                  className="text-[14px] text-accent hover:underline bg-transparent border-none cursor-pointer"
                >
                  Wyczyść filtry
                </button>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-border text-center space-y-2">
          <div className="text-[12px] sm:text-[13px] text-text-3">
            Baza: {allBenefits.length} świadczeń | Ostatnia aktualizacja: maj 2026
          </div>
          <div className="text-[11px] sm:text-[12px] text-text-3">
            Informacje orientacyjne. Zawsze weryfikuj na stronach źródłowych.
          </div>
          <div className="text-[12px] sm:text-[13px]">
            <a href="/" className="text-accent hover:underline">Strona główna</a>
            <span className="mx-1.5 text-text-3">|</span>
            <a href="/regulamin" className="text-accent hover:underline">Regulamin</a>
            <span className="mx-1.5 text-text-3">|</span>
            <a href="/polityka-prywatnosci" className="text-accent hover:underline">Polityka prywatności</a>
          </div>
        </div>
      </div>
    </div>
  );
}
