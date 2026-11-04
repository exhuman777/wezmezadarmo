import { obrazNarzedzia, OG_ROZMIAR } from '../obraz';

export const size = OG_ROZMIAR;
export const contentType = 'image/png';
export const alt = 'Przegląd JPK_V7 przed 2027, wezmezadarmo.com';

export default function OGImage() {
  return obrazNarzedzia('Przegląd JPK_V7 przed 2027', 'Pozycje do wyjaśnienia i kalendarz zmian do 2028');
}
