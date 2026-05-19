'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type AgentMode = 'ogolny' | 'swiadczenie' | 'wniosek' | 'nabor' | 'faktura' | 'termin';

interface AgentType {
  id: AgentMode;
  label: string;
  desc: string;
  icon: string;
}

const AGENT_TYPES: AgentType[] = [
  { id: 'ogolny', label: 'Asystent', desc: 'Pytania ogolne', icon: 'M' },
  { id: 'swiadczenie', label: 'Swiadczenie', desc: 'Sprawdz uprawnienia', icon: 'S' },
  { id: 'wniosek', label: 'Wniosek', desc: 'Pomoc z formularzami', icon: 'W' },
  { id: 'nabor', label: 'Nabor', desc: 'Dofinansowania', icon: 'N' },
  { id: 'faktura', label: 'Faktura', desc: 'KSeF i rozliczenia', icon: 'F' },
  { id: 'termin', label: 'Termin', desc: 'Terminy urzedowe', icon: 'T' },
];

const NAV_ITEMS = [
  { href: '/agent/panel', label: 'Panel', exact: true },
  { href: '/agent/panel/chat', label: 'Czat AI', exact: false },
  { href: '/agent/panel/swiadczenia', label: 'Swiadczenia', exact: false },
  { href: '/agent/panel/aktualnosci', label: 'Aktualnosci', exact: false },
  { href: '/agent/panel/powiadomienia', label: 'Powiadomienia', exact: false },
  { href: '/agent/panel/profil', label: 'Profil', exact: false },
];

interface Props {
  activeMode: AgentMode;
  onModeChange: (mode: AgentMode) => void;
  collapsed?: boolean;
}

export function AgentPanelSidebar({ activeMode, onModeChange, collapsed }: Props) {
  const pathname = usePathname();

  return (
    <aside style={{
      width: collapsed ? 60 : 240,
      borderRight: '1px solid var(--color-border)',
      background: 'var(--color-bg-1)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      transition: 'width 200ms',
      overflow: 'hidden',
    }}>
      {/* Agent types */}
      <div style={{ padding: collapsed ? '12px 6px' : '16px 12px', borderBottom: '1px solid var(--color-border)' }}>
        {!collapsed && (
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--color-text-3)', letterSpacing: '0.08em',
            textTransform: 'uppercase', marginBottom: 10, padding: '0 6px',
          }}>
            Tryb agenta
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {AGENT_TYPES.map(agent => {
            const isActive = activeMode === agent.id;
            return (
              <button
                key={agent.id}
                onClick={() => onModeChange(agent.id)}
                title={collapsed ? `${agent.label} - ${agent.desc}` : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: collapsed ? '8px' : '8px 10px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  background: isActive ? 'var(--color-accent)' : 'transparent',
                  color: isActive ? 'var(--color-bg-0)' : 'var(--color-text-2)',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <span style={{
                  width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 6,
                  background: isActive ? 'rgba(0,0,0,0.15)' : 'var(--color-bg-2)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12, fontWeight: 600,
                  flexShrink: 0,
                  color: isActive ? 'var(--color-bg-0)' : 'var(--color-accent)',
                }}>
                  {agent.icon}
                </span>
                {!collapsed && (
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.2 }}>{agent.label}</div>
                    <div style={{ fontSize: 10, opacity: 0.7, lineHeight: 1.2, marginTop: 1 }}>{agent.desc}</div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Nav links */}
      <div style={{ padding: collapsed ? '12px 6px' : '12px', flex: 1 }}>
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
                padding: collapsed ? '8px' : '8px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                fontSize: 13,
                color: isActive ? 'var(--color-text-1)' : 'var(--color-text-3)',
                fontWeight: isActive ? 500 : 400,
                textDecoration: 'none',
                borderRadius: 6,
                background: isActive ? 'var(--color-bg-2)' : 'transparent',
                transition: 'all 150ms',
                marginBottom: 2,
              }}
            >
              {collapsed ? item.label.charAt(0) : item.label}
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div style={{ padding: collapsed ? '12px 6px' : '12px', borderTop: '1px solid var(--color-border)' }}>
        <Link
          href="/agent"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '8px' : '8px 10px',
            fontSize: 12,
            color: 'var(--color-text-3)',
            textDecoration: 'none',
            fontFamily: 'var(--font-mono)',
          }}
        >
          {collapsed ? 'X' : 'Wyloguj'}
        </Link>
      </div>
    </aside>
  );
}
