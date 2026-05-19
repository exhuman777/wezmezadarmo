'use client';

import { createContext, useContext, useState } from 'react';
import type { AgentMode } from '@/agents/types';

interface AgentModeContextValue {
  mode: AgentMode;
  setMode: (mode: AgentMode) => void;
}

const AgentModeContext = createContext<AgentModeContextValue>({
  mode: 'ogolny',
  setMode: () => {},
});

export function useAgentMode() {
  return useContext(AgentModeContext);
}

export function AgentModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AgentMode>('ogolny');

  return (
    <AgentModeContext value={{ mode, setMode }}>
      {children}
    </AgentModeContext>
  );
}
