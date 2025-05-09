import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Redirection vers le backend Python pour des endpoints spécifiques
      {
        source: '/api/extract-text-from-pdf',
        destination: 'http://localhost:8000/extract-pdf-text',
      },
      {
        source: '/api/process-text-for-v3',
        destination: 'http://localhost:8000/process-text-for-v3',
      },
      {
        source: '/api/extract-placeholders',
        destination: 'http://localhost:8000/extract-placeholders',
      },
      {
        source: '/api/analyze-template-advanced',
        destination: 'http://localhost:8000/analyze-template-advanced',
      },
      // Redirige les autres appels API externes via un préfixe
      {
        source: '/external-api/:path*',
        destination: 'http://localhost:8000/:path*',
      },
    ];
  },
};

export default nextConfig;
