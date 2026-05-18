'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CompanyFeed {
  id: string;
  feed_url: string;
  feed_name: string;
  aktywna: boolean;
  kategoria: string | null;
  sprawdzaj_co_godziny: number;
  created_at: string;
}

interface FeedItem {
  id: string;
  title: string;
  link: string;
  source: string;
  sourceId: string;
  pubDate: string | null;
  description: string | null;
  audiences: string[];
}

const KATEGORIE = [
  { id: 'dofinansowania', label: 'Dofinansowania' },
  { id: 'zus', label: 'ZUS' },
  { id: 'podatki', label: 'Podatki' },
  { id: 'prawo', label: 'Prawo' },
  { id: 'inne', label: 'Inne' },
];

function relativeTime(isoStr: string | null): string {
  if (!isoStr) return '';
  const date = new Date(isoStr);
  if (isNaN(date.getTime())) return '';
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'przed chwilą';
  if (diff < 3600) return `${Math.floor(diff / 60)} min temu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} godz. temu`;
  if (diff < 86400 * 2) return 'wczoraj';
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} dni temu`;
  return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function PanelAktualnosciPage() {
  const [feeds, setFeeds] = useState<CompanyFeed[]>([]);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);

  const [formUrl, setFormUrl] = useState('');
  const [formName, setFormName] = useState('');
  const [formKategoria, setFormKategoria] = useState('');
  const [formGodziny, setFormGodziny] = useState(24);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [feedsRes, itemsRes] = await Promise.all([
          fetch('/api/aktualnosci/feeds'),
          fetch('/api/aktualnosci'),
        ]);

        if (feedsRes.ok) {
          const d = await feedsRes.json();
          setFeeds(d.feeds ?? []);
        }

        if (itemsRes.ok) {
          const d = await itemsRes.json();
          setItems(d.items ?? []);
        } else {
          setItemsError('Błąd pobierania aktualności.');
        }
      } catch {
        setItemsError('Błąd połączenia.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function addFeed(e: React.FormEvent) {
    e.preventDefault();
    if (!formUrl.trim() || !formName.trim()) return;

    setSubmitting(true);
    setSubmitMsg(null);

    try {
      const res = await fetch('/api/aktualnosci', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feed_url: formUrl.trim(),
          feed_name: formName.trim(),
          kategoria: formKategoria || null,
          sprawdzaj_co_godziny: formGodziny,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitMsg('Feed dodany.');
        setFormUrl('');
        setFormName('');
        setFormKategoria('');
        setFormGodziny(24);
        const r = await fetch('/api/aktualnosci/feeds');
        if (r.ok) {
          const d = await r.json();
          setFeeds(d.feeds ?? []);
        }
      } else {
        setSubmitMsg((data as { error?: string }).error ?? 'Błąd dodawania feeda.');
      }
    } catch {
      setSubmitMsg('Błąd połączenia. Spróbuj ponownie.');
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteFeed(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch('/api/aktualnosci/feeds', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setFeeds((prev) => prev.filter((f) => f.id !== id));
      }
    } catch {
      // silent
    } finally {
      setDeletingId(null);
    }
  }

  function toggleRead(id: string) {
    setReadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function markAllRead() {
    setReadIds(new Set(items.map((i) => i.id)));
  }

  const unreadCount = items.filter((i) => !readIds.has(i.id)).length;

  const inputStyle: React.CSSProperties = {
    background: 'var(--color-bg-0)',
    border: '1px solid var(--color-border)',
    borderRadius: '4px',
    padding: '9px 13px',
    fontFamily: 'var(--font-mono)',
    fontSize: '14px',
    color: 'var(--color-text-1)',
    width: '100%',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--color-text-3)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    display: 'block',
    marginBottom: '5px',
  };

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '40px 24px 80px' }}>
      {/* Breadcrumb */}
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
        <Link href="/dotacje/panel" style={{ color: 'var(--color-text-3)', textDecoration: 'none' }}>Panel</Link>
        {' / '}
        Aktualności
      </p>
      <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: '20px', fontWeight: 600, color: 'var(--color-text-1)', margin: '0 0 8px' }}>
        Aktualności i monitorowanie RSS
      </h1>
      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-3)', margin: '0 0 32px', lineHeight: 1.6 }}>
        Agent monitoruje wybrane przez Ciebie źródła rządowe i branżowe. Gdy pojawi się nowe
        dofinansowanie lub zmiana prawa, agent sprawdza czy dotyczy Twojej firmy i powiadamia
        wskazaną osobę. Na życzenie agent może przygotować wstępny wniosek do weryfikacji przez
        Ciebie przed złożeniem.
      </p>

      {/* Twoje feedy */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
          Twoje kanały RSS
        </p>

        <div style={{ background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden', marginBottom: '16px' }}>
          {loading ? (
            <div style={{ padding: '16px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-3)', margin: 0 }}>
                Ładowanie feedów...
              </p>
            </div>
          ) : feeds.length === 0 ? (
            <div style={{ padding: '16px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-3)', margin: 0 }}>
                Brak dodanych kanałów. Dodaj pierwszy feed poniżej.
              </p>
            </div>
          ) : (
            <div>
              {/* Header row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px 60px', gap: '8px', padding: '10px 16px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-2)' }}>
                {['Nazwa', 'Kategoria', 'Co (h)', ''].map((h) => (
                  <span key={h} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
                ))}
              </div>
              {feeds.map((feed, idx) => (
                <div
                  key={feed.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 120px 80px 60px',
                    gap: '8px',
                    padding: '12px 16px',
                    alignItems: 'center',
                    borderBottom: idx < feeds.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <div>
                    <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-text-1)', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {feed.feed_name}
                    </p>
                    <a
                      href={feed.feed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-3)', textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block', maxWidth: '100%' }}
                      title={feed.feed_url}
                    >
                      {feed.feed_url.replace(/^https?:\/\//, '').slice(0, 40)}{feed.feed_url.replace(/^https?:\/\//, '').length > 40 ? '...' : ''}
                    </a>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-3)' }}>
                    {feed.kategoria ?? '--'}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-3)' }}>
                    {feed.sprawdzaj_co_godziny}
                  </span>
                  <button
                    onClick={() => deleteFeed(feed.id)}
                    disabled={deletingId === feed.id}
                    style={{
                      background: 'none',
                      border: '1px solid var(--color-border)',
                      borderRadius: '3px',
                      padding: '4px 8px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: deletingId === feed.id ? 'var(--color-text-3)' : 'var(--color-accent)',
                      cursor: deletingId === feed.id ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {deletingId === feed.id ? '...' : 'usuń'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add feed form */}
        <div style={{ background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-2)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
              Dodaj kanał RSS
            </p>
          </div>
          <form onSubmit={addFeed} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Adres URL feeda *</label>
              <input
                type="url"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://przyklad.gov.pl/rss.xml"
                required
                className="input-focus"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Nazwa *</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="np. MF: komunikaty podatkowe"
                required
                className="input-focus"
                style={inputStyle}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Kategoria</label>
                <select
                  value={formKategoria}
                  onChange={(e) => setFormKategoria(e.target.value)}
                  className="input-focus"
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">Bez kategorii</option>
                  {KATEGORIE.map((k) => (
                    <option key={k.id} value={k.id}>{k.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Sprawdzaj co (godz.)</label>
                <input
                  type="number"
                  min={1}
                  max={168}
                  value={formGodziny}
                  onChange={(e) => setFormGodziny(Number(e.target.value))}
                  className="input-focus"
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                type="submit"
                disabled={submitting || !formUrl.trim() || !formName.trim()}
                style={{
                  background: submitting || !formUrl.trim() || !formName.trim() ? 'var(--color-bg-2)' : 'var(--color-accent)',
                  color: submitting || !formUrl.trim() || !formName.trim() ? 'var(--color-text-3)' : 'var(--color-bg-0)',
                  border: '1px solid var(--color-border-light)',
                  borderRadius: '5px',
                  padding: '9px 20px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: submitting || !formUrl.trim() || !formName.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                {submitting ? 'Dodawanie...' : 'Dodaj feed'}
              </button>
              {submitMsg && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: submitMsg === 'Feed dodany.' ? '#4ade80' : 'var(--color-accent)' }}>
                  {submitMsg}
                </span>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Ostatnie powiadomienia */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
            Ostatnie powiadomienia
            {unreadCount > 0 && (
              <span style={{ marginLeft: '8px', color: 'var(--color-accent)', fontWeight: 700 }}>
                ({unreadCount})
              </span>
            )}
          </p>
          {items.length > 0 && unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{
                background: 'none',
                border: '1px solid var(--color-border)',
                borderRadius: '3px',
                padding: '4px 10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--color-text-3)',
                cursor: 'pointer',
              }}
            >
              Oznacz wszystkie jako przeczytane
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '16px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-3)', margin: 0 }}>Ładowanie aktualności...</p>
          </div>
        ) : itemsError ? (
          <div style={{ background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '16px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-accent)', margin: 0 }}>{itemsError}</p>
          </div>
        ) : items.length === 0 ? (
          <div style={{ background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '16px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-3)', margin: 0 }}>
              Brak aktualności. Dodaj kanały RSS, aby zacząć monitorowanie.
            </p>
          </div>
        ) : (
          <div style={{ background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: '6px', overflow: 'hidden' }}>
            {items.slice(0, 15).map((item, idx) => {
              const isRead = readIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className="row-hover"
                  style={{
                    padding: '12px 16px',
                    borderBottom: idx < Math.min(items.length, 15) - 1 ? '1px solid var(--color-border)' : 'none',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    opacity: isRead ? 0.5 : 1,
                    transition: 'opacity 0.15s',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {item.source}
                      </span>
                      {item.pubDate && (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-3)' }}>
                          {relativeTime(item.pubDate)}
                        </span>
                      )}
                    </div>
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: isRead ? 'var(--color-text-3)' : 'var(--color-text-1)', textDecoration: 'none', lineHeight: 1.4, display: 'block' }}
                    >
                      {item.title}
                    </a>
                    {item.description && (
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: 'var(--color-text-3)', margin: '3px 0 0', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {item.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => toggleRead(item.id)}
                    title={isRead ? 'Oznacz jako nieprzeczytane' : 'Oznacz jako przeczytane'}
                    style={{
                      background: 'none',
                      border: '1px solid var(--color-border)',
                      borderRadius: '3px',
                      padding: '3px 8px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '10px',
                      color: 'var(--color-text-3)',
                      cursor: 'pointer',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    {isRead ? 'cofnij' : 'przeczytane'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Konfiguracja agenta */}
      <div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
          Konfiguracja agenta
        </p>
        <div style={{ background: 'var(--color-bg-1)', border: '1px solid var(--color-border)', borderRadius: '6px', padding: '16px 20px' }}>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: 'var(--color-text-2)', margin: '0 0 10px', lineHeight: 1.6 }}>
            Powiadomienia trafiają na adres email przypisany do Twojego konta. Aby zmienić adres kontaktowy, zaktualizuj profil firmy.
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-text-3)', margin: 0 }}>
            Częstotliwość sprawdzania: zgodnie z ustawieniem każdego feeda (domyślnie: co 24 godz.).
          </p>
        </div>
      </div>
    </div>
  );
}
