import type { Metadata } from 'next';
import { NOINDEX } from '@/lib/seo';

export const metadata: Metadata = {
  title: 'Sprawdź skrzynkę e-mail | wezmezadarmo',
  robots: NOINDEX,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
