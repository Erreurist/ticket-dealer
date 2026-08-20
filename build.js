import { build } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scriptsDir = path.join(__dirname, 'scripts');

async function buildAll() {
    if (!fs.existsSync(scriptsDir)) {
        console.log('未找到 scripts 目录');
        return;
    }

    const targets = fs.readdirSync(scriptsDir).filter(f =>
        fs.statSync(path.join(scriptsDir, f)).isDirectory()
    );

    for (const target of targets) {
        console.log(`\n🚀 正在构建网站脚本: ${target}`);

        // 获取当前网站脚本的具体目录 (例如 scripts/site-a)
        const targetDir = path.join(scriptsDir, target);

        await build({
            configFile: path.join(targetDir, 'vite.config.ts'),
            root: targetDir,   // 🔑 关键修复：指定 Vite 的运行根目录为子文件夹
            build: {
                outDir: path.join(__dirname, 'dist'), // 打包产物依然统一放在最外层的 dist
                emptyOutDir: false, // 防止覆盖其他脚本的产物
            }
        });
    }
    console.log('\n✅ 所有脚本构建完成！产物已存放在 dist/ 目录');
}

buildAll();