import { llmsTxt, odpowiedzTekst } from '@/lib/llms';

// /llms.txt według llmstxt.org, składany z rejestru stron i danych serwisu (src/lib/llms.ts).
export const dynamic = 'force-static';

export function GET(): Response {
  return odpowiedzTekst(llmsTxt(), 'text/plain');
}
