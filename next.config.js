/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true,
    async headers() {
        return [{
            source: '/(.*)',
            headers: [{
                    key: 'Content-Security-Policy',
                    value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' https://api.siapguna.org;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' data: https://fonts.gstatic.com;
              font-src 'self' https://fonts.gstatic.com;
              connect-src 'self' https://api.siapguna.org;
              frame-src 'none';
              object-src 'none';
              base-uri 'self';
              form-action 'self';
            `.replace(/\s{2,}/g, ' ').trim()
                },
                {
                    key: 'Cache-Control',
                    value: 'public, max-age=31536000, immutable'
                },
                {
                    key: 'X-Content-Type-Options',
                    value: 'nosniff'
                },
                {
                    key: 'X-Frame-Options',
                    value: 'DENY'
                },
                {
                    key: 'X-XSS-Protection',
                    value: '1; mode=block'
                },
                {
                    key: 'Referrer-Policy',
                    value: 'strict-origin-when-cross-origin'
                }
            ]
        }];
    },
    images: {
        domains: [
            'fonts.gstatic.com',
            'api.siapguna.org'
        ],
        minimumCacheTTL: 60,
        formats: ['image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
    },
    // Enable compression
    compress: true,
    // Enable production browser source maps
    productionBrowserSourceMaps: false,
    // Optimize font loading
    optimizeFonts: true
};

module.exports = nextConfig;