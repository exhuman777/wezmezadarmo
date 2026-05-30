'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import { createBrowserClient } from '@supabase/ssr';

const NAV_ITEMS = [
  { href: '/', label: 'Start', exact: true },
  { href: '/swiadczenia', label: 'Świadczenia', prefixes: ['/swiadczenia'] },
  { href: '/centrum-obywatela', label: 'Centrum Obywatela', prefixes: ['/centrum-obywatela', '/nfz'] },
  { href: '/dla-firm', label: 'Dla firm', prefixes: ['/dla-firm', '/dotacje'] },
  { href: '/wnioski', label: 'Wnioski', prefixes: ['/wnioski'] },
  { href: '/agent', label: 'Asystent AI', prefixes: ['/agent'] },
  { href: '/statystyki', label: 'Statystyki', prefixes: ['/statystyki'] },
  { href: '/o-projekcie', label: 'O projekcie', prefixes: ['/o-projekcie'] },
];

export function SiteNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);

  function isActive(item: typeof NAV_ITEMS[number]) {
    if (item.exact) return pathname === item.href;
    if (item.prefixes) return item.prefixes.some(p => pathname === p || pathname.startsWith(p + '/'));
    return pathname === item.href || pathname.startsWith(item.href + '/');
  }

  return (
    <header className="topnav">
      <div className="topnav-inner">
        {/* Logo */}
        <Link href="/" className="logo">
          <span className="logo-dot" />
          wezmezadarmo<span className="dim">.com</span>
        </Link>

        {/* Center nav -- hidden on mobile via CSS */}
        <nav className="navlinks">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`navlink${isActive(item) ? ' active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="row-8">
          {/* Mobile hamburger */}
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              {mobileOpen ? (
                <>
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="17" y2="6" />
                  <line x1="3" y1="10" x2="17" y2="10" />
                  <line x1="3" y1="14" x2="17" y2="14" />
                </>
              )}
            </svg>
          </button>
          {loggedIn ? (
            <Link href="/panel" className="btn btn-primary btn-sm hide-on-mobile">
              Panel
            </Link>
          ) : (
            <>
              <Link href="/logowanie" className="btn btn-ghost btn-sm hide-on-mobile">
                Zaloguj
              </Link>
              <Link href="/" className="btn btn-primary btn-sm hide-on-mobile">
                Sprawdź za darmo
              </Link>
            </>
          )}
          <ThemeToggle theme={theme} onToggle={toggle} />
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="mobile-nav-dropdown">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`mobile-navlink${isActive(item) ? ' active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="mobile-nav-actions">
            {loggedIn ? (
              <Link href="/panel" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>
                Panel
              </Link>
            ) : (
              <>
                <Link href="/logowanie" className="btn btn-ghost btn-sm" onClick={() => setMobileOpen(false)}>
                  Zaloguj
                </Link>
                <Link href="/" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>
                  Sprawdź za darmo
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
