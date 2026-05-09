interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[85%] px-3.5 py-2.5 rounded-lg text-[12px] leading-relaxed ${
          isUser
            ? 'bg-bg-3 border border-border-light text-text-1'
            : 'bg-bg-2 border border-border text-text-2'
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span className="text-[9px] font-bold tracking-[1px] text-accent uppercase">
              wezmezadarmo
            </span>
          </div>
        )}
        <div className="whitespace-pre-wrap break-words">{content}</div>
        {isStreaming && (
          <span className="inline-block w-1.5 h-3.5 bg-accent animate-pulse ml-0.5" />
        )}
      </div>
    </div>
  );
}
