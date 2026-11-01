import type { Metadata } from 'next';
import { NOINDEX } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Nowe hasło | wezmezadarmo',
  robots: NOINDEX,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
