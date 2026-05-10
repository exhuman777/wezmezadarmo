interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3 sm:mb-4`}>
      <div
        className={`max-w-[90%] sm:max-w-[85%] px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-[14px] sm:text-[15px] leading-relaxed ${
          isUser
            ? 'bg-bg-3 border border-border text-text-1'
            : 'bg-bg-1 border border-border text-text-2'
        }`}
        style={!isUser ? { boxShadow: '0 1px 4px rgba(0,0,0,0.06)' } : undefined}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-[11px] sm:text-[12px] font-bold tracking-[1.5px] text-accent uppercase">
              wezmezadarmo
            </span>
          </div>
        )}
        <div className="whitespace-pre-wrap break-words">{content}</div>
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-accent animate-pulse ml-0.5" />
        )}
      </div>
    </div>
  );
}
