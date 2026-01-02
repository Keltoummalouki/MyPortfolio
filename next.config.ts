import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

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
        ],
    },
    // Optimize for Three.js
    transpilePackages: ['three'],
};

export default withNextIntl(nextConfig);