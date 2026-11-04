import { obrazNarzedzia, OG_ROZMIAR } from '../obraz';

export const size = OG_ROZMIAR;
export const contentType = 'image/png';
export const alt = 'Przegląd księgi KPiR, wezmezadarmo.com';

export default function OGImage() {
  return obrazNarzedzia('Przegląd księgi KPiR', 'Wpisy do sprawdzenia, PIT, zdrowotna, formy na 2027');
}
