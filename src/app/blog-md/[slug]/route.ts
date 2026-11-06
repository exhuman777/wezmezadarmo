import { POSTS, getPostBySlug } from '@/data/blog-posts';
import { wpisMd, sciezkaWpisu } from '@/lib/blog';
import { odpowiedzTekst } from '@/lib/llms';
import { adres } from '@/lib/seo';

// Wersja Markdown wpisu bloga. Publiczny adres /blog/<slug>.md (rewrite w next.config.ts), canonical w nagłówku Link.
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map(p => ({ slug: p.slug }));
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }): Promise<Response> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return new Response('Nie ma takiego wpisu.', { status: 404 });
  return odpowiedzTekst(`${wpisMd(post)}\n`, 'text/markdown', adres(sciezkaWpisu(post.slug)));
}
