import { obrazNarzedzia, OG_ROZMIAR } from '../obraz';

export const size = OG_ROZMIAR;
export const contentType = 'image/png';
export const alt = 'Dofinansowania po NIP, wezmezadarmo.com';

export default function OGImage() {
  return obrazNarzedzia('Dofinansowania po NIP', 'Dane z CEIDG i dopasowane programy');
}
