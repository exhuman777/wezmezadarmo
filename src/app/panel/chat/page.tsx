'use client';

import { AgentModeProvider } from '@/app/agent/panel/AgentModeContext';
import AgentChat from '@/app/agent/panel/chat/page';

export default function PanelChat() {
  return (
    <AgentModeProvider>
      <AgentChat />
    </AgentModeProvider>
  );
}
