import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
    plugins: [
        monkey({
            entry: 'munch.ts', // 指定入口文件为 munch.ts
            userscript: {
                name: 'Munch Ticket Auto',
                namespace: 'https://github.com/erreurist/ticket-dealer',
                match: ['*://*.munch.no/*'],
                grant: ['none'],    // 这个脚本暂时不需要用到 GM_getValue 等本地存储，写 none 更安全
                updateURL: 'https://erreurist.github.io/ticket-dealer/munch.user.js',
                downloadURL: 'https://erreurist.github.io/ticket-dealer/munch.user.js',
            },
            build: {
                fileName: 'munch.user.js', // 打包产物的名称
            }
        }),
    ],
});