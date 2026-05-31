'use client';

import { AgentModeProvider } from '@/app/agent/panel/AgentModeContext';
import AgentChat from '@/app/agent/panel/chat/page';

export default function PanelChat() {
  // AgentChat uzywa height:100% -- wymus stabilna wysokosc viewportu, aby rozmowa
  // wypelniala panel i nie wyciekala stopka strony (calc dopasowany do wysokosci SiteNav).
  return (
    <AgentModeProvider>
      <div style={{ height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
        <AgentChat />
      </div>
    </AgentModeProvider>
  );
}
