import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs/promises';
import svgr from '@svgr/rollup';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
        base: env.VITE_BASE_PATH || '/',
        resolve: {
            alias: {
                src: resolve(__dirname, 'src'),
            },
        },
        esbuild: {
            loader: 'tsx',
            include: /src\/.*\.tsx?$/,
            exclude: [],
        },
        optimizeDeps: {
            esbuildOptions: {
                plugins: [
                    {
                        name: 'load-js-files-as-tsx',
                        setup(build) {
                            build.onLoad(
                                { filter: /src\\.*\.js$/ },
                                async (args) => ({
                                    loader: 'tsx',
                                    contents: await fs.readFile(args.path, 'utf8'),
                                })
                            );
                        },
                    },
                ],
            },
        },
        build: {
            outDir: 'dist', // ✅ this is required for Netlify
        },
        plugins: [svgr(), react()],
    };
});
