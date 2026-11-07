import { StronaJsonLd } from '@/components/JsonLd';
import { metadaneStrony } from '@/lib/strony';
import Home from './strona-glowna';
import { BENEFITS } from '@/engine/benefits';
import { PROGRAMS } from '@/data/programs-b2b';

// Rotator „Należy Ci się: …”: nazwy z bazy świadczeń (bez dopisku w nawiasie), tylko działające programy.
const ROTATOR_ID = ['800-plus', '13-emerytura', 'dobry-start', 'ulga-na-start', 'czyste-powietrze', 'karta-duzej-rodziny', 'bon-na-zasiedlenie', 'nieodplatna-pomoc-prawna', 'ulga-termomodernizacyjna', 'becikowe'];
const ROTATOR = ROTATOR_ID
  .map(id => BENEFITS.find(b => b.id === id))
  .filter((b): b is (typeof BENEFITS)[number] => Boolean(b) && !b?.zakonczony)
  .map(b => b.nazwa.replace(/\s*\(.*\)\s*$/, ''));

// Strona główna jest komponentem klienta (strona-glowna.tsx), więc metadane i JSON-LD są tutaj.
export const metadata = metadaneStrony('/');

export default function Page() {
  return (
    <>
      <StronaJsonLd sciezka="/" />
      <Home liczbaSwiadczen={BENEFITS.length} liczbaProgramow={PROGRAMS.length} rotator={ROTATOR} />
    </>
  );
}
