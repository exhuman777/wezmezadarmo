interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[85%] px-4 py-3 rounded-xl text-[15px] leading-relaxed ${
          isUser
            ? 'bg-bg-3 border border-border text-text-1'
            : 'bg-bg-1 border border-border text-text-2'
        }`}
        style={!isUser ? { boxShadow: '0 1px 4px rgba(0,0,0,0.06)' } : undefined}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full" style={{ background: '#e6993a' }} />
            <span className="text-[12px] font-bold tracking-[1.5px] uppercase" style={{ color: '#b87a1e' }}>
              wezmezadarmo
            </span>
          </div>
        )}
        <div className="whitespace-pre-wrap break-words">{content}</div>
        {isStreaming && (
          <span className="inline-block w-2 h-4 animate-pulse ml-0.5" style={{ background: '#e6993a' }} />
        )}
      </div>
    </div>
  );
}
