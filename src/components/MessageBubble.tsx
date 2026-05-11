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

    if (line.trim() === '') {
      elements.push(<div key={i} style={{ height: 8 }} />);
      continue;
    }

    const formatted = formatInline(line);

    // Arrow item with >>> prefix
    if (line.trimStart().startsWith('>>> ')) {
      elements.push(
        <div key={i} style={{ display: 'flex', gap: 10, padding: '4px 0 4px 4px' }}>
          <span style={{ color: 'var(--color-accent)', flexShrink: 0, fontWeight: 500 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </span>
          <span style={{ fontWeight: 500 }}>{formatInline(line.trimStart().slice(4))}</span>
        </div>
      );
      continue;
    }

    // List item with - prefix
    if (line.trimStart().startsWith('- ')) {
      elements.push(
        <div key={i} style={{ display: 'flex', gap: 8, padding: '2px 0 2px 4px' }}>
          <span style={{ color: 'var(--color-accent)', flexShrink: 0 }}>--</span>
          <span>{formatInline(line.trimStart().slice(2))}</span>
        </div>
      );
      continue;
    }

    // Numbered list
    const numberedMatch = line.trimStart().match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      elements.push(
        <div key={i} style={{ display: 'flex', gap: 8, padding: '2px 0 2px 4px' }}>
          <span className="mono" style={{ color: 'var(--color-accent)', flexShrink: 0, fontWeight: 500, minWidth: '1.2em', fontSize: 13 }}>{numberedMatch[1]}.</span>
          <span>{formatInline(numberedMatch[2])}</span>
        </div>
      );
      continue;
    }

    elements.push(<div key={i} style={{ padding: '2px 0' }}>{formatted}</div>);
  }

  return elements;
}

function formatInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
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
        <strong key={key++} style={{ fontWeight: 600, color: 'var(--color-text-1)' }}>
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
          className="link-u"
          style={{ color: 'var(--color-accent)', wordBreak: 'break-all' }}
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
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
      <div style={{
        maxWidth: '85%',
        padding: '14px 18px',
        fontSize: 15,
        lineHeight: 1.6,
        borderRadius: isUser ? '18px 18px 6px 18px' : '18px 18px 18px 6px',
        background: isUser ? 'var(--color-surface-2)' : 'var(--color-surface)',
        border: `1px solid var(--color-border)`,
        color: isUser ? 'var(--color-text-1)' : 'var(--color-text-2)',
        boxShadow: isUser ? 'none' : 'var(--shadow-1)',
      }}>
        {/* AI label */}
        {!isUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, fontSize: 11, color: 'var(--color-text-3)' }}>
            <span className="mono" style={{ fontWeight: 600, letterSpacing: '0.08em', color: 'var(--color-accent)' }}>AI</span>
            <span>Odpowiedź wygenerowana przez model AI</span>
          </div>
        )}
        <div style={{ overflowWrap: 'break-word' }}>
          {isUser ? content : renderMarkdown(content)}
        </div>
        {isStreaming && (
          <span style={{
            display: 'inline-block', width: 6, height: 16,
            background: 'var(--color-accent)',
            borderRadius: 2,
            marginLeft: 2,
            verticalAlign: 'middle',
            animation: 'fade 800ms ease-in-out infinite alternate',
          }} />
        )}
      </div>
    </div>
  );
}
