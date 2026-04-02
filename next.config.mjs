import webpack from "webpack";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,

    // Security Headers
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'X-DNS-Prefetch-Control', value: 'on' },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()',
                    },
                ],
            },
        ];
    },

    webpack: (config) => {
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
            child_process: false,
            path: false,
            os: false,
            stream: require.resolve("stream-browserify"),
            buffer: require.resolve("buffer/"),
            util: require.resolve("util/"),
            process: require.resolve("process/browser"),
        };

        config.plugins.push(
            new webpack.ProvidePlugin({
                Buffer: ['buffer', 'Buffer'],
                process: 'process/browser',
            })
        );

        config.externals.push({
            'utf-8-validate': 'commonjs utf-8-validate',
            'bufferutil': 'commonjs bufferutil',
        });

        return config;
    },
};

export default nextConfig;
