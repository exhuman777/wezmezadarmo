import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {
    '/api/pdf': ['./public/forms/**', './public/fonts/**'],
  },
  async headers() {
    return [
      // Przewodniki dla agentów AI w public/ (llms.txt i pozostałe .md mają route handlery z własnym Content-Type).
      { source: '/:plik(llm|agents).md', headers: [{ key: 'Content-Type', value: 'text/markdown; charset=utf-8' }] },
    ];
  },
  async rewrites() {
    return [
      // Wersja Markdown wpisu bloga: /blog/<slug>.md -> route handler src/app/blog-md/[slug]/route.ts.
      { source: '/blog/:slug.md', destination: '/blog-md/:slug' },
    ];
  },
  async redirects() {
    // Od 6.11.2026 wezmezadarmo działa bez kont: logowanie, rejestracja i panele są wyłączone.
    // 308 na najbliższą stronę publiczną. Kod paneli i tabele w bazie zostają, ale są nieosiągalne.
    const naStrone = (source: string, destination: string) => ({ source, destination, permanent: true });
    return [
      // Logowanie, rejestracja, hasła i callback Supabase
      ...['/logowanie', '/rejestracja', '/reset-hasla', '/nowe-haslo', '/sprawdz-email', '/blad-konfiguracji', '/auth/:path*'].map(s => naStrone(s, '/')),
      ...['/agent/logowanie', '/agent/rejestracja', '/agent/reset-hasla', '/agent/nowe-haslo', '/agent/sprawdz-email', '/agent/auth/:path*'].map(s => naStrone(s, '/agent')),
      ...['/dotacje/logowanie', '/dotacje/rejestracja'].map(s => naStrone(s, '/dotacje')),
      // Panel obywatela
      naStrone('/panel/swiadczenia/:path*', '/swiadczenia'),
      naStrone('/panel/dotacje/:path*', '/dotacje'),
      naStrone('/panel/chat/:path*', '/agent'),
      naStrone('/panel/aktualnosci/:path*', '/aktualnosci'),
      naStrone('/panel/wnioski/:path*', '/wnioski'),
      naStrone('/panel', '/'),
      naStrone('/panel/:path*', '/'),
      // Stary panel agenta
      naStrone('/agent/panel/swiadczenia/:path*', '/swiadczenia'),
      naStrone('/agent/panel/aktualnosci/:path*', '/aktualnosci'),
      naStrone('/agent/panel', '/agent'),
      naStrone('/agent/panel/:path*', '/agent'),
      // Panel firmowy
      naStrone('/dotacje/panel/aktualnosci/:path*', '/aktualnosci'),
      naStrone('/dotacje/panel', '/dotacje'),
      naStrone('/dotacje/panel/:path*', '/dotacje'),
    ];
  },
};

export default nextConfig;
