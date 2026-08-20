import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
    plugins: [
        monkey({
            entry: 'amnh.ts',
            userscript: {
                name: 'AMNH Auto Checkout',
                namespace: 'https://github.com/erreurist/ticket-dealer',
                match: ['*://tickets.amnh.org/*'], // ✅ 精准匹配 AMNH 域名
                grant: ['none'],
                updateURL: 'https://erreurist.github.io/ticket-dealer/amnh.user.js',
                downloadURL: 'https://erreurist.github.io/ticket-dealer/amnh.user.js',
            },
            build: {
                fileName: 'amnh.user.js',
            }
        }),
    ],
});