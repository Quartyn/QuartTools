import { defineConfig } from "vite";
import { resolve } from 'path';
import { viteStaticCopy } from "vite-plugin-static-copy";
import manifestBuilder from "./build/manifest";

export default defineConfig({
    build: {
        minify: false,
        cssMinify: true,

        rollupOptions: {
            treeshake: false,
            input: {
                'components/notifications': resolve(__dirname, 'src/components/notifications.js'),
                init: resolve(__dirname, 'src/init.js'),
                app: resolve(__dirname, 'src/app.js'),
                design: resolve(__dirname, 'src/design.js'),
                content: resolve(__dirname, 'src/content.js'),
                background: resolve(__dirname, 'src/background.js'),

                // ui
                overlay: resolve(__dirname, 'ui/overlay.html'),
                login: resolve(__dirname, 'ui/login.html'),
                popup: resolve(__dirname, 'ui/popup.html'),

                'styles/fonts': resolve(__dirname, 'styles/fonts.css'),
                'styles/overlay': resolve(__dirname, 'styles/overlay.css'),
                'styles/notifications': resolve(__dirname, 'styles/notifications.css'),

                // Web scripts
                'scripts/youtube': resolve(__dirname, 'src/scripts/youtube.v2.js'),

            },
            output: {
                dir: 'dist/',
                name: "QuartTools",
                entryFileNames: 'src/[name].js',
                chunkFileNames: 'src/[name].js',
                assetFileNames: '[name][extname]',
            }
        },
        emptyOutDir: true
    },
    plugins: [
        viteStaticCopy({
            targets: [
                { src: '_locales', dest: '' },
                { src: 'fonts', dest: '' },
                { src: 'images', dest: '' },
                { src: 'src/translations.json', dest: 'src' }
            ]
        }),
        manifestBuilder({ browser: process.env.BROWSER || 'firefox' })
    ]
});