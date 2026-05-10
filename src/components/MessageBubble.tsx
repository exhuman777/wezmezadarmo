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
            ? 'bg-bg-3 border border-border-light text-text-1'
            : 'bg-bg-2 border border-border text-text-2'
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-[12px] font-bold tracking-[1.5px] text-accent uppercase">
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
