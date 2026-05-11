interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

function renderMarkdown(text: string): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Empty line = paragraph break
    if (line.trim() === '') {
      elements.push(<div key={i} className="h-2" />);
      continue;
    }

    // Process inline formatting
    const formatted = formatInline(line);

    // Arrow item with >>> prefix
    if (line.trimStart().startsWith('>>> ')) {
      elements.push(
        <div key={i} className="flex gap-2 py-1 pl-1">
          <span className="text-accent shrink-0 font-bold text-[14px]">{'\u2192'}</span>
          <span className="font-medium">{formatInline(line.trimStart().slice(4))}</span>
        </div>
      );
      continue;
    }

    // List item with - prefix
    if (line.trimStart().startsWith('- ')) {
      elements.push(
        <div key={i} className="flex gap-2 py-0.5 pl-1">
          <span className="text-accent shrink-0 font-medium">{'\u2022'}</span>
          <span>{formatInline(line.trimStart().slice(2))}</span>
        </div>
      );
      continue;
    }

    // Numbered list
    const numberedMatch = line.trimStart().match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      elements.push(
        <div key={i} className="flex gap-2 py-0.5 pl-1">
          <span className="text-accent shrink-0 font-semibold min-w-[1.2em]">{numberedMatch[1]}.</span>
          <span>{formatInline(numberedMatch[2])}</span>
        </div>
      );
      continue;
    }

    // Regular line
    elements.push(<div key={i} className="py-0.5">{formatted}</div>);
  }

  return elements;
}

function formatInline(text: string): React.ReactNode {
  // Process **bold** and URLs
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // URL
    const urlMatch = remaining.match(/(https?:\/\/[^\s,)]+)/);

    if (!boldMatch && !urlMatch) {
      parts.push(remaining);
      break;
    }

    const boldIndex = boldMatch ? remaining.indexOf(boldMatch[0]) : Infinity;
    const urlIndex = urlMatch ? remaining.indexOf(urlMatch[0]) : Infinity;

    if (boldIndex <= urlIndex && boldMatch) {
      if (boldIndex > 0) parts.push(remaining.slice(0, boldIndex));
      parts.push(
        <strong key={key++} className="font-semibold text-text-1">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldIndex + boldMatch[0].length);
    } else if (urlMatch) {
      if (urlIndex > 0) parts.push(remaining.slice(0, urlIndex));
      parts.push(
        <a
          key={key++}
          href={urlMatch[1]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline underline-offset-2 break-all"
        >
          {urlMatch[1].replace(/^https?:\/\/(www\.)?/, '').split('/').slice(0, 2).join('/')}
        </a>
      );
      remaining = remaining.slice(urlIndex + urlMatch[0].length);
    }
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>;
}

export function MessageBubble({ role, content, isStreaming }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div
        className={`max-w-[92%] sm:max-w-[85%] px-4 py-3 text-[15px] leading-[1.6] ${
          isUser
            ? 'bg-bg-2 border border-border rounded-2xl rounded-br-md text-text-1'
            : 'text-text-2 rounded-2xl rounded-bl-md'
        }`}
        style={!isUser ? {
          background: 'var(--color-bg-1)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        } : undefined}
      >
        <div className="break-words">
          {isUser ? content : renderMarkdown(content)}
        </div>
        {isStreaming && (
          <span className="inline-block w-1.5 h-4 bg-accent rounded-sm animate-pulse ml-0.5 align-middle" />
        )}
      </div>
    </div>
  );
}
