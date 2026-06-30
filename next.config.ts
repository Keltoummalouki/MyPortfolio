import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com;
  style-src 'self' 'unsafe-inline';
  font-src 'self';
  img-src 'self' data: https://github-readme-stats.vercel.app https://github-readme-streak-stats.herokuapp.com https://*.supabase.co;
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com;
  frame-src https://challenges.cloudflare.com;
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'github-readme-stats.vercel.app',
            },
            {
                protocol: 'https',
                hostname: 'github-readme-streak-stats.herokuapp.com',
            },
            {
                // Supabase Storage public objects (e.g. project cover images).
                protocol: 'https',
                hostname: '*.supabase.co',
            },
        ],
    },
    transpilePackages: ['three'],
    // Pin the workspace root so Turbopack doesn't infer it from a stray parent lockfile.
    turbopack: {
        root: __dirname,
    },
    // The layout is dynamic (cookie-based locale), so Next streams metadata into <body>
    // for non-bot UAs. Disable streaming metadata so <title>/<meta description>/OG always
    // render in <head> — required for Lighthouse SEO and non-JS social scrapers.
    htmlLimitedBots: /.*/,
    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    {
                        key: 'Content-Security-Policy',
                        value: cspHeader,
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin',
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
        ];
    },
};

export default withNextIntl(nextConfig);
