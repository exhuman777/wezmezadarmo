import { odpowiedzMd } from '@/lib/llms';

// Wersja Markdown strony /centrum-obywatela dla modeli językowych i agentów (treść: src/lib/llms.ts).
export const dynamic = 'force-static';

export function GET(): Response {
  return odpowiedzMd('/centrum-obywatela');
}
