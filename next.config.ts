import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {
    '/api/pdf': ['./public/forms/**', './public/fonts/**'],
  },
  async redirects() {
    return [
      // Stare ścieżki auth -> nowe zunifikowane
      { source: '/agent/logowanie', destination: '/logowanie', permanent: true },
      { source: '/agent/rejestracja', destination: '/rejestracja', permanent: true },
      { source: '/agent/reset-hasla', destination: '/reset-hasla', permanent: true },
      { source: '/agent/nowe-haslo', destination: '/nowe-haslo', permanent: true },
      { source: '/agent/sprawdz-email', destination: '/sprawdz-email', permanent: true },
      { source: '/dotacje/logowanie', destination: '/logowanie', permanent: true },
      { source: '/dotacje/rejestracja', destination: '/rejestracja', permanent: true },
      // Stare panele -> nowy zunifikowany panel
      { source: '/agent/panel', destination: '/panel', permanent: true },
      { source: '/agent/panel/:path*', destination: '/panel/:path*', permanent: true },
      { source: '/dotacje/panel', destination: '/panel', permanent: true },
      // Usunięta płatna subskrypcja -> kieruj na panel (serwis jest bezpłatny)
      { source: '/dotacje/panel/subskrypcja', destination: '/panel', permanent: true },
      { source: '/panel/subskrypcja', destination: '/panel', permanent: true },
      { source: '/dotacje/panel/:path*', destination: '/panel/:path*', permanent: true },
    ];
  },
};

export default nextConfig;
