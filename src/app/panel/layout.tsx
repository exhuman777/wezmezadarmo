'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const NAV_ITEMS = [
  { href: '/panel', label: 'Panel', icon: 'P', exact: true },
  { href: '/panel/swiadczenia', label: 'Świadczenia', icon: 'S', exact: false },
  { href: '/panel/dotacje', label: 'Dotacje', icon: 'D', exact: false },
  { href: '/panel/chat', label: 'Czat AI', icon: 'C', exact: false },
  { href: '/panel/aktualnosci', label: 'Aktualności', icon: 'A', exact: false },
  { href: '/panel/wnioski', label: 'Wnioski', icon: 'W', exact: false },
  { href: '/panel/powiadomienia', label: 'Powiadomienia', icon: 'N', exact: false },
  { href: '/panel/profil', label: 'Profil', icon: 'U', exact: false },
];

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch('/api/auth/signout', { method: 'POST' });
    router.push('/logowanie');
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 60 : 240,
        borderRight: '1px solid var(--line)',
        background: 'var(--white)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'width 200ms',
        overflow: 'hidden',
      }}>
        {/* Nav links */}
        <div style={{ padding: collapsed ? '16px 8px' : '16px 12px', flex: 1 }}>
          {!collapsed && (
            <div style={{
              fontFamily: 'var(--f-mono)', fontSize: 10,
              color: 'var(--ink-400)', letterSpacing: '0.08em',
              textTransform: 'uppercase', marginBottom: 12, padding: '0 8px',
            }}>
              Menu
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {NAV_ITEMS.map(item => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: collapsed ? '10px' : '9px 12px',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    fontSize: 13,
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? 'var(--ink-900)' : 'var(--ink-600)',
                    textDecoration: 'none',
                    borderRadius: 'var(--r-sm)',
                    background: isActive ? 'var(--green-50)' : 'transparent',
                    transition: 'all 150ms',
                  }}
                >
                  <span style={{
                    width: 28, height: 28,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 'var(--r-sm)',
                    background: isActive ? 'var(--green-800)' : 'var(--green-50)',
                    color: isActive ? 'var(--white)' : 'var(--green-800)',
                    fontFamily: 'var(--f-mono)',
                    fontSize: 11, fontWeight: 600,
                    flexShrink: 0,
                  }}>
                    {item.icon}
                  </span>
                  {!collapsed && item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Logout */}
        <div style={{ padding: collapsed ? '12px 8px' : '12px', borderTop: '1px solid var(--line)' }}>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              justifyContent: collapsed ? 'center' : 'flex-start',
              padding: collapsed ? '10px' : '9px 12px',
              width: '100%',
              fontSize: 12,
              color: 'var(--ink-400)',
              fontFamily: 'var(--f-mono)',
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--r-sm)',
              cursor: 'pointer',
              transition: 'color 150ms',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 14H3.33A1.33 1.33 0 0 1 2 12.67V3.33A1.33 1.33 0 0 1 3.33 2H6" />
              <polyline points="10.67 11.33 14 8 10.67 4.67" />
              <line x1="14" y1="8" x2="6" y2="8" />
            </svg>
            {!collapsed && (loggingOut ? 'Wylogowywanie...' : 'Wyloguj')}
          </button>
        </div>
      </aside>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute',
          left: collapsed ? 52 : 232,
          top: 62,
          zIndex: 10,
          width: 20, height: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--white)',
          border: '1px solid var(--line)',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 10,
          color: 'var(--ink-400)',
          transition: 'left 200ms',
        }}
        title={collapsed ? 'Rozwiń' : 'Zwiń'}
      >
        {collapsed ? '>' : '<'}
      </button>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {children}
      </main>
    </div>
  );
}
