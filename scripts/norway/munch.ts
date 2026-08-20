// ==========================================
// 1. 业务逻辑层 (Action Modules)
// ==========================================

const Actions = {
    // 功能1：修改票种
    changeTicketType: function(targetClass: string, targetText: string) {
        const tickets = document.querySelectorAll('.MemberTicket');
        let count = 0;
        tickets.forEach(ticket => {
            ticket.className = `MemberTicket ${targetClass}`;
            const nameEl = ticket.querySelector('.MemberTicket__name');
            if (nameEl) {
                nameEl.textContent = targetText;
            }
            count++;
        });
        console.log(`[TicketType] 修改了 ${count} 个票种为 ${targetText}`);
    },

    // 功能2：修改时间 (自动 +30 分钟)
    changeTime: function(startTime: string) {
        if (!startTime) return;

        // 解析时间并加上 30 分钟
        let [hours, mins] = startTime.split(':').map(Number);
        mins += 30;
        if (mins >= 60) {
            hours += Math.floor(mins / 60);
            mins = mins % 60;
        }
        hours = hours % 24;

        // 格式化补零
        const format = (n: number) => n.toString().padStart(2, '0');
        const endTime = `${format(hours)}:${format(mins)}`;
        const timeString = `${startTime} - ${endTime}`;

        const timeNodes = document.querySelectorAll('.MemberTicket__item-value');
        let count = 0;
        timeNodes.forEach(node => {
            if (node.textContent && (node.textContent.includes(':') || node.textContent.includes('-'))) {
                node.textContent = timeString;
                count++;
            }
        });
        console.log(`[Time] 修改了 ${count} 个时间节点为 ${timeString}`);
    }
};

// ==========================================
// 2. 界面渲染层 (UI Builder)
// ==========================================

class UIManager {
    title: string;
    controls: any[];

    constructor(title: string) {
        this.title = title;
        this.controls = []; // 存储当前页面需要的控件
    }

    addButton(text: string, onClick: () => void) {
        this.controls.push({ type: 'button', text, onClick });
    }

    addTimeInput(id: string, buttonText: string, onClick: (val: string) => void) {
        this.controls.push({ type: 'time-input', id, buttonText, onClick });
    }

    render() {
        if (document.getElementById('ticket-monorepo-panel')) return;

        const panel = document.createElement('div');
        panel.id = 'ticket-monorepo-panel';
        panel.style.cssText = `
            position: fixed; bottom: 20px; right: 20px; z-index: 999999;
            background: rgba(15, 23, 42, 0.9); color: #f8fafc;
            padding: 15px; border-radius: 10px; font-family: sans-serif;
            box-shadow: 0 10px 25px rgba(0,0,0,0.3); backdrop-filter: blur(5px);
            min-width: 180px;
        `;

        let html = `<div style="font-weight: bold; margin-bottom: 10px; font-size: 14px; text-align: center;">${this.title}</div>`;

        // 渲染各个控件
        this.controls.forEach((ctrl, index) => {
            if (ctrl.type === 'button') {
                html += `<button id="ctrl-btn-${index}" style="width: 100%; margin-bottom: 8px; padding: 8px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">${ctrl.text}</button>`;
            } else if (ctrl.type === 'time-input') {
                html += `
                    <div style="display: flex; gap: 5px; margin-bottom: 8px;">
                        <input type="time" id="${ctrl.id}" style="flex: 1; padding: 6px; border-radius: 5px; border: 1px solid #475569; background: #1e293b; color: white;">
                        <button id="ctrl-btn-${index}" style="padding: 6px 10px; background: #10b981; color: white; border: none; border-radius: 5px; cursor: pointer;">${ctrl.buttonText}</button>
                    </div>
                `;
            }
        });

        panel.innerHTML = html;
        document.body.appendChild(panel);

        // 绑定事件
        this.controls.forEach((ctrl, index) => {
            if (ctrl.type === 'button') {
                document.getElementById(`ctrl-btn-${index}`)?.addEventListener('click', ctrl.onClick);
            } else if (ctrl.type === 'time-input') {
                document.getElementById(`ctrl-btn-${index}`)?.addEventListener('click', () => {
                    const inputEl = document.getElementById(ctrl.id) as HTMLInputElement;
                    ctrl.onClick(inputEl.value);
                });
            }
        });
    }
}

// ==========================================
// 3. 路由层 (Router)
// ==========================================

function initRouter() {
    const currentUrl = window.location.href;

    if (currentUrl.includes('test') || currentUrl.includes('localhost') || true) {
        const ui = new UIManager("🎟️ Munch 票务操作台");

        ui.addButton("改为 ADULT", () => Actions.changeTicketType('MemberTicket--adult', 'ADULT'));
        ui.addButton("改为 UNDER 25", () => Actions.changeTicketType('MemberTicket--youngAdult', 'UNDER 25'));

        ui.addTimeInput("custom-time-input", "设定时间", (timeVal) => {
            if (timeVal) {
                Actions.changeTime(timeVal);
            } else {
                alert("请先选择时间！");
            }
        });

        ui.render();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRouter);
} else {
    initRouter();
}