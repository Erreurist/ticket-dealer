import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
    plugins: [
        monkey({
            entry: 'cable.ts',
            userscript: {
                name: 'Norway Cable Car — Ticket Auto',
                namespace: 'https://github.com/erreurist/ticket-dealer',
                match: ['https://t.iticket.com/*'], // ✅ 精准匹配目标网址
                grant: ['none'],
                updateURL: 'https://erreurist.github.io/ticket-dealer/norway-cable.user.js',
                downloadURL: 'https://erreurist.github.io/ticket-dealer/norway-cable.user.js',
            },
            build: {
                fileName: 'norway-cable.user.js',
            }
        }),
    ],
});