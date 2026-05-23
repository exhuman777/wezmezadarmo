'use client';

import { useState, useMemo } from 'react';
import { getAllBenefits } from '@/engine/benefits';
import { Benefit, BenefitCategory } from '@/engine/types';

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
      className="benefit-row border border-border rounded-xl overflow-hidden transition-all"
      style={{ background: 'var(--color-bg-1)' }}
    >
      <button
        onClick={onToggle}
        className="w-full text-left px-4 py-3 cursor-pointer bg-transparent border-none flex items-start gap-3"
      >
        <span
          className="shrink-0 mt-0.5"
          style={{
            width: 20, height: 20, borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(34,160,107,0.18) 0%, rgba(34,160,107,0.08) 100%)',
            border: '1px solid rgba(34,160,107,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--color-accent)', fontSize: 11, fontWeight: 700, flexShrink: 0,
          }}
        >
          {'→'}
        </span>
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[14px] sm:text-[15px] font-semibold text-text-1 break-words">{benefit.nazwa}</span>
            <span
              className="text-[13px] sm:text-[14px] font-bold"
              style={{
                background: 'linear-gradient(135deg, #22A06B, #1d9060)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {benefit.kwota}
            </span>
          </div>
          <div className="text-[12px] text-text-3 mt-0.5">{benefit.czestotliwosc}</div>
        </div>
        <span
          className="text-text-3 text-[12px] shrink-0 mt-1.5"
          style={{
            width: 18, height: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: '50%',
            background: isExpanded ? 'rgba(34,160,107,0.12)' : 'rgba(0,0,0,0.04)',
            border: `1px solid ${isExpanded ? 'rgba(34,160,107,0.25)' : 'var(--color-border)'}`,
            color: isExpanded ? 'var(--color-accent)' : 'var(--color-text-3)',
            transition: 'transform 0.2s ease, background 0.2s, border-color 0.2s',
            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            fontSize: 9,
          }}
        >
          {'▶'}
        </span>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0 border-t border-border overflow-hidden" style={{ animation: 'fadeIn 0.3s ease', wordBreak: 'break-word' }}>
          {/* Description */}
          {benefit.opis && (
            <p style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--color-text-2)', margin: '12px 0', paddingLeft: 12, borderLeft: '2px solid rgba(34,160,107,0.3)' }}>
              {benefit.opis}
            </p>
          )}

          {/* Timeline */}
          {benefit.wniosek.terminRealizacji && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: 'var(--color-text-3)', fontStyle: 'italic', marginBottom: 14, marginTop: benefit.opis ? 0 : 12 }}>
              <span style={{ fontSize: 11 }}>&#x25F7;</span>
              {benefit.wniosek.terminRealizacji}
            </div>
          )}

          {/* CTAs */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12, marginBottom: 16, flexWrap: 'wrap' }}>
            <a
              href={benefit.zrodloUrl}
              target="_blank" rel="noopener noreferrer"
              className="br-btn-guide"
            >
              Pełny przewodnik <span style={{ fontSize: 12 }}>→</span>
            </a>
            <a
              href="/panel/chat"
              className="br-btn-ask"
            >
              <svg width="12" height="12" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
                <path d="M1 1h13v9H8.5L4 14v-4H1z" />
              </svg>
              Zapytaj AI
            </a>
          </div>

          {/* CO POTRZEBUJESZ + KROK PO KROKU */}
          {(benefit.wniosek.dokumenty.length > 0 || benefit.wniosek.kroki.length > 0) && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))', gap: 10, marginBottom: 12 }}>
              {benefit.wniosek.dokumenty.length > 0 && (
                <div style={{ background: 'var(--color-bg-0)', border: '1px solid var(--color-border)', borderTop: '2px solid rgba(34,160,107,0.4)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-accent)', flexShrink: 0 }} />
                    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-3)' }}>
                      Co potrzebujesz
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {benefit.wniosek.dokumenty.map((doc, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{
                          width: 17, height: 17, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: 4, background: 'rgba(34,160,107,0.1)',
                          fontSize: 9, fontWeight: 700, color: 'var(--color-accent)',
                          fontFamily: 'var(--font-mono)', marginTop: 1,
                        }}>
                          {i + 1}
                        </span>
                        <span className="text-[12px] text-text-2" style={{ lineHeight: 1.5 }}>{doc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {benefit.wniosek.kroki.length > 0 && (
                <div style={{ background: 'var(--color-bg-0)', border: '1px solid var(--color-border)', borderTop: '2px solid rgba(34,160,107,0.4)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-accent)', flexShrink: 0 }} />
                    <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-3)' }}>
                      Krok po kroku
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {benefit.wniosek.kroki.map((krok, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{
                          width: 19, height: 19, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #22A06B, #1d9060)',
                          fontSize: 9, fontWeight: 700, color: '#fff',
                          fontFamily: 'var(--font-mono)',
                          boxShadow: '0 2px 5px rgba(34,160,107,0.25)',
                        }}>
                          {i + 1}
                        </span>
                        <span className="text-[12px] text-text-2" style={{ lineHeight: 1.55, paddingTop: 2 }}>{krok}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Wymagania */}
          {benefit.wymagania && Object.keys(benefit.wymagania).length > 0 && (
            <div style={{ marginBottom: 10, padding: '10px 12px', background: 'rgba(0,0,0,0.025)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8, fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-3)' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-accent)', opacity: 0.5, flexShrink: 0 }} />
                Wymagania
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {benefit.wymagania.wiekMin != null && (
                  <span className="req-tag">Wiek min. {benefit.wymagania.wiekMin} lat</span>
                )}
                {benefit.wymagania.wiekMax != null && (
                  <span className="req-tag">Wiek maks. {benefit.wymagania.wiekMax} lat</span>
                )}
                {benefit.wymagania.dochodMax != null && (
                  <span className="req-tag">Dochód maks. {benefit.wymagania.dochodMax} PLN/os.</span>
                )}
                {benefit.wymagania.dzieci && (
                  <span className="req-tag">
                    Dzieci min. {benefit.wymagania.dzieci.min}
                    {benefit.wymagania.dzieci.wiekMax ? ` (do ${benefit.wymagania.dzieci.wiekMax} lat)` : ''}
                  </span>
                )}
                {benefit.wymagania.zatrudnienie && (
                  <span className="req-tag">{benefit.wymagania.zatrudnienie.join(' / ')}</span>
                )}
                {benefit.wymagania.niepelnosprawnosc && (
                  <span className="req-tag">Niepełnosprawność: {benefit.wymagania.niepelnosprawnosc.join(' / ')}</span>
                )}
                {benefit.wymagania.emeryt && <span className="req-tag">Emeryt/rencista</span>}
                {benefit.wymagania.student && <span className="req-tag">Student</span>}
                {benefit.wymagania.ciaza && <span className="req-tag">Ciąża</span>}
                {benefit.wymagania.rolnik && <span className="req-tag">KRUS</span>}
              </div>
            </div>
          )}

          {/* Na co uważać */}
          {benefit.wniosek.pulapki.length > 0 && (
            <div style={{ marginBottom: 10, padding: '10px 12px', background: 'rgba(220,80,80,0.04)', border: '1px solid rgba(220,80,80,0.18)', borderRadius: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7, fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#e05c5c' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#e05c5c', flexShrink: 0 }} />
                Na co uważać
              </div>
              {benefit.wniosek.pulapki.map((p, i) => (
                <div key={i} style={{ fontSize: 12, color: '#c05555', lineHeight: 1.6, marginBottom: 2, display: 'flex', gap: 6 }}>
                  <span style={{ flexShrink: 0 }}>!</span><span>{p}</span>
                </div>
              ))}
            </div>
          )}

          {/* Odwołanie */}
          {benefit.wniosek.odwolanie && (
            <div style={{ marginBottom: 10, padding: '10px 12px', background: 'rgba(0,0,0,0.02)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
              <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-3)', marginBottom: 5 }}>
                Odwołanie
              </div>
              <div style={{ fontSize: 12, color: 'var(--color-text-2)', lineHeight: 1.6 }}>{benefit.wniosek.odwolanie}</div>
            </div>
          )}

          {/* Source + date */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, paddingTop: 10, borderTop: '1px solid var(--color-border)', marginTop: 4 }}>
            <a href={benefit.zrodloUrl} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 12, color: 'var(--color-accent)', textDecoration: 'none' }}>
              Źródło: {benefit.zrodloNazwa} →
            </a>
            <span className="text-[11px] text-text-3">Zweryfikowano: {benefit.dataWeryfikacji}</span>
            {benefit.dataWaznosci && <span className="text-[11px] text-text-3">Ważne do: {benefit.dataWaznosci}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SwiadczeniaPage() {
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
      <style>{`
        @keyframes shimmer {
          0%   { transform: translateX(-120%) skewX(-12deg); }
          100% { transform: translateX(220%)  skewX(-12deg); }
        }

        .benefit-row {
          position: relative;
          transition: box-shadow 0.2s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .benefit-row::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          border-radius: 12px 12px 0 0;
          background: linear-gradient(90deg, transparent 0%, #22A06B 30%, #8EEAAD 60%, #22A06B 80%, transparent 100%);
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }
        .benefit-row:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(34,160,107,0.06);
        }
        .benefit-row:hover::after { opacity: 1; }

        .category-pill {
          position: relative; overflow: hidden;
          transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.15s ease, background 0.15s;
        }
        .category-pill:hover {
          transform: translateY(-1px);
          box-shadow: 0 3px 8px rgba(0,0,0,0.08);
        }
        .category-pill:active { transform: translateY(0) scale(0.97); }
        .category-pill-active {
          background: linear-gradient(135deg, rgba(34,160,107,0.14) 0%, rgba(34,160,107,0.08) 100%) !important;
          box-shadow: 0 2px 8px rgba(34,160,107,0.2), inset 0 1px 0 rgba(255,255,255,0.3);
        }
        .category-pill-active::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          transform: translateX(-120%) skewX(-12deg);
          animation: shimmer 0.6s ease-out;
        }

        .btn-nav-shimmer {
          position: relative; overflow: hidden;
          transition: transform 0.15s cubic-bezier(0.34,1.56,0.64,1), color 0.15s;
        }
        .btn-nav-shimmer::before {
          content: '';
          position: absolute; top: 0; left: 0;
          width: 55%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(34,160,107,0.12), transparent);
          transform: translateX(-120%) skewX(-12deg);
        }
        .btn-nav-shimmer:hover::before { animation: shimmer 0.5s ease-out; }
        .btn-nav-shimmer:hover { transform: translateY(-1px); }

        .search-input:focus {
          border-color: rgba(34,160,107,0.5) !important;
          box-shadow: 0 0 0 3px rgba(34,160,107,0.1), 0 1px 4px rgba(0,0,0,0.06) !important;
          outline: none;
        }

        .category-header {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-accent);
          margin-bottom: 6px;
        }
        .category-header-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--color-accent);
          box-shadow: 0 0 7px rgba(34,160,107,0.55);
          flex-shrink: 0;
        }

        @media (min-width: 640px) {
          .category-header { font-size: 12px; }
        }

        .br-btn-guide {
          display: inline-flex; align-items: center; gap: 7;
          padding: 8px 16px; border-radius: 9px;
          background: linear-gradient(135deg, #22A06B, #1d9060);
          color: #fff; font-size: 13px; font-weight: 600;
          text-decoration: none; position: relative; overflow: hidden;
          box-shadow: 0 3px 10px rgba(34,160,107,0.28);
          transition: transform 150ms, box-shadow 150ms;
        }
        .br-btn-guide:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(34,160,107,0.38); }
        .br-btn-guide::after {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 55%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transform: skewX(-12deg); transition: left 0.4s;
        }
        .br-btn-guide:hover::after { left: 160%; }

        .br-btn-ask {
          display: inline-flex; align-items: center; gap: 6;
          padding: 8px 14px; border-radius: 9px;
          background: transparent; color: var(--color-text-2);
          font-size: 13px; font-weight: 500;
          border: 1px solid var(--color-border); text-decoration: none;
          transition: border-color 150ms, color 150ms;
        }
        .br-btn-ask:hover { border-color: rgba(34,160,107,0.4); color: #22A06B; }

        .req-tag {
          font-size: 11px; padding: 2px 8px; border-radius: 4px;
          background: rgba(0,0,0,0.04); border: 1px solid var(--color-border);
          color: var(--color-text-2);
        }
      `}</style>

      {/* Hero */}
      <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-3xl mx-auto">
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            background: '#22A06B',
            boxShadow: '0 0 8px rgba(34,160,107,0.6)',
          }} />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11,
            letterSpacing: '0.08em', textTransform: 'uppercase' as const,
            color: 'var(--color-text-3)',
          }}>
            Baza wiedzy
          </span>
        </div>
        <h1 className="text-[22px] sm:text-[28px] font-bold text-text-1 mb-4 leading-tight">
          Baza świadczeń i programów rządowych
        </h1>

        {/* Subtitle boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: 10, marginBottom: 20 }}>
          <div style={{
            padding: '12px 16px',
            background: 'rgba(34,160,107,0.06)',
            border: '1px solid rgba(34,160,107,0.14)',
            borderLeft: '2px solid #22A06B',
            borderRadius: 10,
            backdropFilter: 'blur(4px)',
          }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#22A06B', fontFamily: 'var(--font-mono)', display: 'block', marginBottom: 4 }}>
              {allBenefits.length}
            </span>
            <span className="text-[13px] text-text-2">
              świadczeń w {CATEGORY_ORDER.length} kategoriach. Zasiłki, ulgi podatkowe, dotacje, darmowe badania, programy wsparcia.
            </span>
          </div>
          <div style={{
            padding: '12px 16px',
            background: 'rgba(0,0,0,0.03)',
            border: '1px solid var(--color-border)',
            borderRadius: 10,
            backdropFilter: 'blur(4px)',
          }}>
            <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--color-text-3)', display: 'block', marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: '0.06em' }}>
              Każde świadczenie
            </span>
            <span className="text-[13px] text-text-2">
              Instrukcja krok po kroku, wymagane dokumenty, pułapki i link do źródła.
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Szukaj świadczenia, np. 800+, becikowe, ulga..."
            className="search-input w-full px-4 py-3 rounded-xl text-[14px] sm:text-[15px] border border-border bg-bg-1 text-text-1 outline-none"
            style={{
              caretColor: 'var(--color-green)',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-3 hover:text-text-1 bg-transparent border-none cursor-pointer text-[16px]"
            >
              {'✕'}
            </button>
          )}
        </div>

        {/* Sprawdź swoje CTA */}
        <a
          href="/"
          className="btn-nav-shimmer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', marginBottom: 16,
            background: 'rgba(34,160,107,0.08)',
            border: '1px solid rgba(34,160,107,0.2)',
            borderRadius: 10,
            fontSize: 14, fontWeight: 600,
            color: '#22A06B',
            textDecoration: 'none',
          }}
        >
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#22A06B',
            boxShadow: '0 0 6px rgba(34,160,107,0.7)',
            flexShrink: 0,
          }} />
          Sprawdź swoje świadczenia
          <span style={{ fontSize: 13, opacity: 0.7 }}>→</span>
        </a>

        {/* Category pills */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`category-pill px-3 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-semibold border cursor-pointer ${
              activeCategory === 'ALL' ? 'category-pill-active border-green text-green' : 'border-border text-text-3 hover:text-text-1'
            }`}
            style={{
              background: activeCategory === 'ALL' ? undefined : 'var(--color-bg-2)',
            }}
          >
            Wszystkie ({allBenefits.length})
          </button>
          {CATEGORY_ORDER.map(cat => {
            const count = categoryCounts.get(cat) || 0;
            if (count === 0) return null;
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat === activeCategory ? 'ALL' : cat)}
                className={`category-pill px-3 py-1.5 rounded-lg text-[12px] sm:text-[13px] font-semibold border cursor-pointer ${
                  isActive ? 'category-pill-active border-green text-green' : 'border-border text-text-3 hover:text-text-1'
                }`}
                style={{
                  background: isActive ? undefined : 'var(--color-bg-2)',
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
          <div className="space-y-4">
            {CATEGORY_ORDER.map(cat => {
              const benefits = groupedByCategory.get(cat);
              if (!benefits || benefits.length === 0) return null;
              return (
                <div key={cat}>
                  <div className="category-header">
                    <span className="category-header-dot" />
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
