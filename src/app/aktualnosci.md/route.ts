import { odpowiedzMd } from '@/lib/llms';

// Wersja Markdown strony /aktualnosci dla modeli językowych i agentów (treść: src/lib/llms.ts).
export const dynamic = 'force-static';

export function GET(): Response {
  return odpowiedzMd('/aktualnosci');
}
