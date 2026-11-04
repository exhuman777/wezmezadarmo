/**
 * Bezpieczna ścieżka powrotu po logowaniu (parametr `next`).
 * Przepuszcza tylko ścieżki wewnętrzne: zaczynają się od jednego „/”, bez „//”, „\”,
 * znaków sterujących i bez zmiany hosta (np. `@evil.com` albo `.evil.com` doklejone
 * do `origin` dałyby przekierowanie na obcą domenę).
 */
export function bezpiecznaSciezkaPowrotu(n: string | null | undefined, domyslna: string): string {
  if (typeof n !== 'string' || n.length === 0 || n.length > 300) return domyslna;
  if (!n.startsWith('/') || n.startsWith('//') || n.includes('\\') || /[\u0000-\u001f\s]/.test(n)) return domyslna;
  try {
    const baza = 'https://wewnetrzny.invalid';
    const u = new URL(n, baza);
    if (u.origin !== baza) return domyslna;
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    return domyslna;
  }
}
