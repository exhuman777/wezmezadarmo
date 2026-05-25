'use client';

import { createContext, useContext, useState } from 'react';
import type { AgentId } from '@/agents/types';

interface AgentModeContextValue {
  mode: AgentId;
  setMode: (mode: AgentId) => void;
}

const AgentModeContext = createContext<AgentModeContextValue>({
  mode: 'konsjerz',
  setMode: () => {},
});

export function useAgentMode() {
  return useContext(AgentModeContext);
}

export function AgentModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<AgentId>('konsjerz');

  return (
    <AgentModeContext value={{ mode, setMode }}>
      {children}
    </AgentModeContext>
  );
}
