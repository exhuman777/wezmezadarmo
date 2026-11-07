/** Treść wymaganej zgody przy sprawdzeniu firmy po NIP (zapisywana w leady_narzedzia.zgoda_tresc). Pełna lista zgód: src/lib/zgody.ts. */
import { ZGODY } from '@/lib/zgody';

export const ZGODA_TRESC = ZGODY.find(z => z.id === 'email')!.tresc;
