'use client';

import { useState } from 'react';
import { AgentPanelSidebar } from '@/components/AgentPanelSidebar';
import { AgentModeProvider, useAgentMode } from './AgentModeContext';

function PanelLayoutInner({ children }: { children: React.ReactNode }) {
  const { mode, setMode } = useAgentMode();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="panel-uklad" style={{
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
        className="panel-zwin"
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
          borderRadius: 2,
          cursor: 'pointer',
          fontSize: 10,
          color: 'var(--color-text-3)',
          transition: 'left 200ms',
        }}
        title={sidebarCollapsed ? 'Rozwiń menu' : 'Zwiń menu'}
      >
        {sidebarCollapsed ? '>' : '<'}
      </button>
      <main className="panel-tresc" style={{
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
