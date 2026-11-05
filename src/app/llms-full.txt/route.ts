import { llmsFullTxt, odpowiedzTekst } from '@/lib/llms';

// /llms-full.txt według llmstxt.org, składany z rejestru stron i danych serwisu (src/lib/llms.ts).
export const dynamic = 'force-static';

export function GET(): Response {
  return odpowiedzTekst(llmsFullTxt(), 'text/plain');
}
