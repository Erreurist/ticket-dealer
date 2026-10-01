// ==========================================
// 挪威缆车票种自动替换 — 基于 ticket-dealer 框架
// 固定：Child 3-15 yr → Adult
// 选择：Round Trip / One Way → 对应替换 1/2 day pass
// 适用：https://t.iticket.com/*
// ==========================================

// ==========================================
// 1. 业务逻辑层 (Actions)
// ==========================================

const Actions = {
    // ✅ 固定替换：Child 3-15 yr → Adult
    replaceChildToAdult: function() {
        let count = 0;

        // 匹配包含 Child 3-15 yr 的元素（多种写法都覆盖）
        const allTexts = document.querySelectorAll('*');
        allTexts.forEach(el => {
            if (!el.childNodes) return;
            el.childNodes.forEach(node => {
                if (node.nodeType === Node.TEXT_NODE && node.textContent) {
                    const text = node.textContent.trim();
                    if (text.includes('Child') && text.includes('3-15')) {
                        node.textContent = text.replace(/Child.*3-15.*yr?/gi, 'Adult');
                        count++;
                    }
                }
            });
        });

        // 备选：直接遍历所有可见元素精确匹配
        document.querySelectorAll('button, .ticket-item, .product, tr, .item, div[class*="ticket"], span[class*="name"]').forEach(el => {
            const text = el.textContent?.trim() || '';
            if (text.includes('Child') && text.includes('3-15')) {
                // 找到内部文本节点替换
                el.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
                        if (node.textContent.includes('Child')) {
                            node.textContent = node.textContent.replace(/Child.*3-15.*yr?/gi, 'Adult');
                        }
                    }
                });
                count++;
            }
        });

        console.log(`[Child→Adult] 完成，共修改 ${count} 处`);
    },

    // ✅ 替换为 Round Trip
    replaceToRoundTrip: function() {
        let count = 0;
        const targets = ['1 day pass', '2 day pass', '1-day pass', '2-day pass'];

        document.querySelectorAll('*').forEach(el => {
            targets.forEach(passText => {
                if (el.textContent?.toLowerCase().includes(passText)) {
                    el.childNodes.forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE && node.textContent) {
                            const t = node.textContent.toLowerCase();
                            if (t.includes(passText)) {
                                node.textContent = node.textContent.replace(new RegExp(passText, 'gi'), 'Round Trip');
                                count++;
                            }
                        }
                    });
                }
            });
        });

        console.log(`[→Round Trip] 完成，共修改 ${count} 处`);
    },

    // ✅ 替换为 One Way
    replaceToOneWay: function() {
        let count = 0;
        const targets = ['1 day pass', '2 day pass', '1-day pass', '2-day pass'];

        document.querySelectorAll('*').forEach(el => {
            targets.forEach(passText => {
                if (el.textContent?.toLowerCase().includes(passText)) {
                    el.childNodes.forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE && node.textContent) {
                            const t = node.textContent.toLowerCase();
                            if (t.includes(passText)) {
                                node.textContent = node.textContent.replace(new RegExp(passText, 'gi'), 'One Way');
                                count++;
                            }
                        }
                    });
                }
            });
        });

        console.log(`[→One Way] 完成，共修改 ${count} 处`);
    }
};

// ==========================================
// 2. 界面渲染层 (UI Manager)
// ==========================================

class UIManager {
    title: string;
    controls: Array<{
        type: string;
        text: string;
        onClick: () => void;
    }>;

    constructor(title: string) {
        this.title = title;
        this.controls = [];
    }

    addButton(text: string, onClick: () => void) {
        this.controls.push({ type: 'button', text, onClick });
    }

    render() {
        if (document.getElementById('cable-panel') !== null) return;

        const panel = document.createElement('div');
        panel.id = 'cable-panel';
        panel.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; z-index: 999999;
            background: rgba(15, 23, 42, 0.9); color: #f8fafc;
            padding: 15px; border-radius: 10px; font-family: sans-serif;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3); backdrop-filter: blur(5px);
            min-width: 200px;
        `;

        let html = `<div style="font-weight: bold; margin-bottom: 12px; font-size: 14px; text-align: center;">${this.title}</div>`;

        this.controls.forEach((_, index) => {
            html += `<button id="cable-btn-${index}" style="
                width: 100%; margin-bottom: 8px; padding: 10px;
                background: #3b82f6; color: white; border: none;
                border-radius: 6px; cursor: pointer; font-size: 14px;
            "></button>`;
        });

        panel.innerHTML = html;
        document.body.appendChild(panel);

        // 绑定文字和事件
        this.controls.forEach((ctrl, index) => {
            const btn = document.getElementById(`cable-btn-${index}`);
            if (btn) {
                btn.textContent = ctrl.text;
                btn.addEventListener('click', ctrl.onClick);
            }
        });
    }
}

// ==========================================
// 3. 路由层 (Router)
// ==========================================

function initRouter() {
    const currentUrl = window.location.href;

    // 只在目标网站生效
    if (currentUrl.startsWith('https://t.iticket.com/')) {
        const ui = new UIManager('🚠 挪威缆车助手');

        ui.addButton('Child → Adult (固定)', () => {
            Actions.replaceChildToAdult();
            alert('✅ 已将所有 Child 3-15 yr 替换为 Adult');
        });

        ui.addButton('替换为 Round Trip', () => {
            Actions.replaceChildToAdult(); // 先执行固定替换
            Actions.replaceToRoundTrip();
            alert('✅ 已替换：Child→Adult + 1/2 day pass→Round Trip');
        });

        ui.addButton('替换为 One Way', () => {
            Actions.replaceChildToAdult(); // 先执行固定替换
            Actions.replaceToOneWay();
            alert('✅ 已替换：Child→Adult + 1/2 day pass→One Way');
        });

        ui.render();
    }
}

// 启动
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRouter);
} else {
    initRouter();
}