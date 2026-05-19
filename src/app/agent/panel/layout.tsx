'use client';

import { useState } from 'react';
import { AgentPanelSidebar } from '@/components/AgentPanelSidebar';
import { AgentModeProvider, useAgentMode } from './AgentModeContext';

function PanelLayoutInner({ children }: { children: React.ReactNode }) {
  const { mode, setMode } = useAgentMode();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div style={{
      display: 'flex',
      height: 'calc(100vh - 60px)',
      overflow: 'hidden',
    }}>
      <AgentPanelSidebar
        activeMode={mode}
        onModeChange={setMode}
        collapsed={sidebarCollapsed}
      />
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        style={{
          position: 'absolute',
          left: sidebarCollapsed ? 52 : 232,
          top: 62,
          zIndex: 10,
          width: 20, height: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--color-bg-1)',
          border: '1px solid var(--color-border)',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 10,
          color: 'var(--color-text-3)',
          transition: 'left 200ms',
        }}
        title={sidebarCollapsed ? 'Rozwin sidebar' : 'Zwin sidebar'}
      >
        {sidebarCollapsed ? '>' : '<'}
      </button>
      <main style={{
        flex: 1,
        overflowY: 'auto',
        position: 'relative',
      }}>
        {children}
      </main>
    </div>
  );
}

export default function AgentPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AgentModeProvider>
      <PanelLayoutInner>{children}</PanelLayoutInner>
    </AgentModeProvider>
  );
}
