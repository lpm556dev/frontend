/** @type {import('next').NextConfig} */
const nextConfig = {};

module.exports = {
    async headers() {
        return [{
            source: '/(.*)',
            headers: [{
                key: 'Cache-Control',
                value: 'public, max-age=31536000, immutable'
            }]
        }]
    },
    images: {
        domains: ['fonts.gstatic.com'],
    }
}