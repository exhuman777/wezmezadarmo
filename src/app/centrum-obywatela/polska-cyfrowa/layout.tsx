import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Polska cyfrowa - e-zdrowie, ElevenLabs, dane | wezmezadarmo',
  description: 'Twarde dane: 2,3 mld e-recept, 20 mln kont IKP, ElevenLabs (polski jednorożec AI), centralna e-rejestracja z asystentem AI. Plus wykresy: dostępność mieszkań i wzrost e-usług. Wszystko ze źródeł oficjalnych.',
  openGraph: {
    title: 'Polska cyfrowa - dowody na cyfryzację',
    description: 'e-zdrowie na poziomie światowym, ElevenLabs, e-administracja. Dane GUS, CeZ, NFZ, MC.',
    locale: 'pl_PL', type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
