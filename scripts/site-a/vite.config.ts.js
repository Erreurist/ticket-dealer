import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
    plugins: [
        monkey({
            entry: 'main.ts',
            userscript: {
                name: 'Ticket Dealer - Site A',
                namespace: 'https://github.com/erreurist/ticket-dealer',
                match: ['*://*.example.com/*'], // 替换成你要匹配的真实网站域名
                grant: ['GM_getValue', 'GM_setValue'],
                // 这里填入你未来的 GitHub Pages 链接，实现自动更新
                updateURL: 'https://erreurist.github.io/ticket-dealer/site-a.user.js',
                downloadURL: 'https://erreurist.github.io/ticket-dealer/site-a.user.js',
            },
            build: {
                fileName: 'site-a.user.js',
            }
        }),
    ],
});