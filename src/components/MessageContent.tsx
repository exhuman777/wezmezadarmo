'use client';

import Link from 'next/link';
import React from 'react';

const INTERNAL_PATHS = [
  'nfz', 'swiadczenia', 'dotacje', 'centrum-obywatela', 'wnioski',
  'aktualnosci', 'agent', 'panel', 'dla-firm', 'blog', 'press',
  'automatyzacje', 'o-projekcie',
];

const URL_RE = new RegExp(
  `(https?:\\/\\/[^\\s)]+)|(\\/(?:${INTERNAL_PATHS.join('|')})(?:\\/[a-zA-Z0-9_\\-\\?=&%]*)?)`,
  'g',
);

const linkStyle: React.CSSProperties = {
  color: 'inherit',
  textDecoration: 'underline',
  textDecorationStyle: 'dotted',
  textDecorationColor: 'currentColor',
  textUnderlineOffset: '2px',
};

export function MessageContent({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let i = 0;

  for (const match of text.matchAll(URL_RE)) {
    const idx = match.index!;
    const matched = match[0];
    if (idx > lastIdx) parts.push(text.slice(lastIdx, idx));

    let clean = matched;
    let trail = '';
    const trailMatch = clean.match(/[.,!?;:)]+$/);
    if (trailMatch) {
      trail = trailMatch[0];
      clean = clean.slice(0, -trail.length);
    }

    if (clean.startsWith('http')) {
      parts.push(
        <a key={`l${i++}`} href={clean} target="_blank" rel="noopener noreferrer" style={linkStyle}>
          {clean}
        </a>,
      );
    } else {
      parts.push(
        <Link key={`l${i++}`} href={clean} style={linkStyle}>
          {clean}
        </Link>,
      );
    }
    if (trail) parts.push(trail);
    lastIdx = idx + matched.length;
  }

  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return <>{parts}</>;
}
