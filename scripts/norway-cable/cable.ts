// ==========================================
// 挪威缆车票种自动替换 — 精简面板版
// ==========================================

const Actions = {
    replaceChildToAdult: function() {
        let count = 0;
        document.querySelectorAll('*').forEach(el => {
            if (el.childNodes) {
                el.childNodes.forEach(node => {
                    if (node.nodeType === Node.TEXT_NODE && node.textContent) {
                        const text = node.textContent.trim();
                        if (text.includes('Child') && text.includes('3-15')) {
                            node.textContent = text.replace(/Child.*3-15.*yr?/gi, 'Adult');
                            count++;
                        }
                    }
                });
            }
        });
        console.log(`[Child→Adult] 完成，共修改 ${count} 处`);
    },

    replaceToRoundTrip: function() {
        let count = 0;
        const targets = ['1 day pass', '2 day pass', '1-day pass', '2-day pass'];
        document.querySelectorAll('*').forEach(el => {
            targets.forEach(passText => {
                if (el.textContent?.toLowerCase().includes(passText)) {
                    el.childNodes.forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE && node.textContent) {
                            if (node.textContent.toLowerCase().includes(passText)) {
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

    replaceToOneWay: function() {
        let count = 0;
        const targets = ['1 day pass', '2 day pass', '1-day pass', '2-day pass'];
        document.querySelectorAll('*').forEach(el => {
            targets.forEach(passText => {
                if (el.textContent?.toLowerCase().includes(passText)) {
                    el.childNodes.forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE && node.textContent) {
                            if (node.textContent.toLowerCase().includes(passText)) {
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

class UIManager {
    title: string;
    controls: Array<{type: string; text: string; onClick: () => void}>;

    constructor(title: string) {
        this.title = title;
        this.controls = [];
    }

    addButton(text: string, onClick: () => void) {
        this.controls.push({ type: 'button', text, onClick });
    }

    render() {
        if (document.getElementById('cable-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'cable-panel';
        panel.style.cssText = `
            position: fixed; bottom: 12px; right: 12px; z-index: 999999;
            background: rgba(15, 23, 42, 0.85); color: #f8fafc;
            padding: 10px 12px; border-radius: 8px; font-family: sans-serif;
            box-shadow: 0 6px 18px rgba(0,0,0,0.25); backdrop-filter: blur(6px);
            min-width: 140px; font-size: 13px;
        `;

        let html = `<div style="font-weight: bold; margin-bottom: 8px; font-size: 13px; text-align: center;">${this.title}</div>`;

        this.controls.forEach((ctrl, index) => {
            html += `<button id="cable-btn-${index}" style="
                width: 100%; margin-bottom: 6px; padding: 7px 8px;
                background: #3b82f6; color: white; border: none;
                border-radius: 5px; cursor: pointer; font-size: 13px;
            ">${ctrl.text}</button>`;
        });

        panel.innerHTML = html;
        document.body.appendChild(panel);

        this.controls.forEach((ctrl, index) => {
            document.getElementById(`cable-btn-${index}`)?.addEventListener('click', ctrl.onClick);
        });
    }
}

function initRouter() {
    const currentUrl = window.location.href;
    if (currentUrl.startsWith('https://t.iticket.com/')) {
        const ui = new UIManager('🚠 缆车助手');
        ui.addButton('Child→Adult', () => {
            Actions.replaceChildToAdult();
            alert('✅ 已替换');
        });
        ui.addButton('Round Trip', () => {
            Actions.replaceChildToAdult();
            Actions.replaceToRoundTrip();
            alert('✅ 已替换为 Round Trip');
        });
        ui.addButton('One Way', () => {
            Actions.replaceChildToAdult();
            Actions.replaceToOneWay();
            alert('✅ 已替换为 One Way');
        });
        ui.render();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRouter);
} else {
    initRouter();
}