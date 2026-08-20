// ==========================================
// AMNH Auto Checkout — Simple Edition
// 输入一次，全程自动运行，邮箱序号自动递增
// ==========================================

// ========== 读取已保存的参数 ==========
function getSavedConfig() {
    const loops = sessionStorage.getItem('run_targetLoops');
    const emailStart = sessionStorage.getItem('run_emailStart');
    if (loops && emailStart) {
        return {
            targetLoops: parseInt(loops, 10),
            emailStartNumber: parseInt(emailStart, 10)
        };
    }
    return null;
}

// ========== 首次弹框输入 — 只弹一次 ==========
async function showConfigDialog() {
    const savedLoops = localStorage.getItem('config_targetLoops') || '1';
    const savedEmailNum = localStorage.getItem('config_emailStart') || '1';

    const loopsInput = window.prompt('请输入目标天数 (默认 1)：', savedLoops);
    if (loopsInput === null) return null;

    const emailStartInput = window.prompt('请输入邮箱起始序号\n(邮箱格式: fuxinfengfxf+amnhhN@gmail.com)：', savedEmailNum);
    if (emailStartInput === null) return null;

    const targetLoops = Math.max(1, parseInt(loopsInput.trim(), 10) || 1);
    const emailStart = Math.max(1, parseInt(emailStartInput.trim(), 10) || 1);

    // 存本次会话：页面跳转不丢失
    sessionStorage.setItem('run_targetLoops', String(targetLoops));
    sessionStorage.setItem('run_emailStart', String(emailStart));
    // 存长期默认值
    localStorage.setItem('config_targetLoops', String(targetLoops));
    localStorage.setItem('config_emailStart', String(emailStart));

    return { targetLoops, emailStartNumber: emailStart };
}

// ========== 构建配置 ==========
interface AppConfig {
    targetLoops: number;
    zipCode: string;
    qty: string;
    price: string;
    emailPrefix: string;
    emailSuffix: string;
    emailStartNumber: number;
    firstName: string;
    lastName: string;
    address1: string;
    city: string;
    stateValue: string;
    zipCodeNew: string;
}

function buildConfig(userParams: { targetLoops: number; emailStartNumber: number }): AppConfig {
    return {
        targetLoops: userParams.targetLoops,
        zipCode: '10011',
        qty: '10',
        price: '0.1',
        emailPrefix: 'fuxinfengfxf+amnhh',
        emailSuffix: '@gmail.com',
        emailStartNumber: userParams.emailStartNumber,
        firstName: 'xinfeng',
        lastName: 'fu',
        address1: '623 james street',
        city: 'New York',
        stateValue: '51',
        zipCodeNew: '10011'
    };
}

// ========== 主入口 ==========
window.addEventListener('load', async () => {
    // 已完成就直接退出
    if (sessionStorage.getItem('myScript_completed') === 'true') {
        console.log('✅ 流程已完成，脚本停止运行。');
        return;
    }

    let userParams = getSavedConfig();
    if (!userParams) {
        userParams = await showConfigDialog();
        if (!userParams) {
            console.log('⏹️  未输入参数，脚本退出。');
            return;
        }
    }

    const CONFIG = buildConfig(userParams);

    console.log('='.repeat(60));
    console.log('✅ 使用配置:');
    console.log(`📅 目标天数: ${CONFIG.targetLoops}`);
    console.log(`📧 邮箱起始序号: ${CONFIG.emailStartNumber}`);
    console.log(`📧 首个邮箱: ${CONFIG.emailPrefix}${CONFIG.emailStartNumber}${CONFIG.emailSuffix}`);
    console.log('='.repeat(60));

    // 初始化邮箱计数器
    if (!localStorage.getItem('myScript_emailCounter')) {
        localStorage.setItem('myScript_emailCounter', String(CONFIG.emailStartNumber));
    }

    // 启动主流程
    startMainScript(CONFIG);
});

// ========== 主脚本逻辑 ==========
function startMainScript(CONFIG: AppConfig) {
    let clickedDates: string[] = JSON.parse(sessionStorage.getItem('myScript_clickedDates') || '[]');
    let emailCounter = parseInt(localStorage.getItem('myScript_emailCounter') || '1');

    sessionStorage.removeItem('myScript_submittingEmail');
    setTimeout(autoDetectStep, 1200);

    function autoDetectStep() {
        console.log('🕵️ 侦测页面状态...');
        const startTime = Date.now();
        const timer = setInterval(() => {
            const submitBtn = document.querySelector('button[type="submit"]#ace-checkout');
            const paywCheckbox = document.querySelector('#check_PAYW');
            const zipInput = document.querySelector('#zip_tristate');
            const dateBtn = document.querySelector('button.rdp-day:not([disabled])');
            const guestBtn = findButtonByText('Continue as Guest');

            if (document.querySelector('#firstname-new') || submitBtn) {
                clearInterval(timer);
                console.log('📍 [状态 E] 填写地址并提交');
                handleBillingAddressPage();
            } else if (paywCheckbox || zipInput) {
                clearInterval(timer);
                console.log('📍 [状态 A] 起始表单');
                executeZipFlow();
            } else if (guestBtn) {
                clearInterval(timer);
                console.log('📍 [状态 D] 访客登录');
                handleGuestLogin();
            } else if (dateBtn && !zipInput && !paywCheckbox) {
                clearInterval(timer);
                console.log('📍 [状态 B] 选择日期');
                handleDateSelection();
            } else if (findButtonByText('CHECKOUT') || findButtonByText('Get Tickets')) {
                clearInterval(timer);
                console.log('📍 [状态 C] 购物车判断');
                handleCheckoutOrLoop();
            } else if (Date.now() - startTime > 15000) {
                clearInterval(timer);
                console.log('⏰ 侦测超时');
            }
        }, 600);
    }

    function handleBillingAddressPage() {
        const timer = setInterval(() => {
            const firstname = document.querySelector<HTMLInputElement>('#firstname-new');
            const lastname = document.querySelector<HTMLInputElement>('#lastname-new');
            const address1 = document.querySelector<HTMLInputElement>('#address1-new');
            const city = document.querySelector<HTMLInputElement>('#city-new');
            const state = document.querySelector<HTMLSelectElement>('#State');
            const zipCode = document.querySelector<HTMLInputElement>('#zipCode-new');
            const optIn = document.querySelector<HTMLInputElement>('#OptInNewsletter');
            const submitBtn = document.querySelector<HTMLButtonElement>('button[type="submit"]#ace-checkout');

            if (firstname && lastname && address1 && city && state && zipCode) {
                clearInterval(timer);
                console.log('📝 填写收货信息...');

                setInputValue(firstname, CONFIG.firstName);
                setInputValue(lastname, CONFIG.lastName);
                setInputValue(address1, CONFIG.address1);
                setInputValue(city, CONFIG.city);

                state.value = CONFIG.stateValue;
                state.dispatchEvent(new Event('change', { bubbles: true }));
                console.log('🗺️  已选州: New York');

                setInputValue(zipCode, CONFIG.zipCodeNew);

                if (optIn && optIn.checked) {
                    optIn.checked = false;
                    optIn.dispatchEvent(new Event('change', { bubbles: true }));
                    console.log('☑️  已取消邮件订阅');
                }

                setTimeout(() => {
                    if (submitBtn) {
                        console.log('🚀 提交！全流程完成 ✅');
                        // 全部完成：清除临时数据
                        sessionStorage.setItem('myScript_completed', 'true');
                        sessionStorage.removeItem('myScript_clickedDates');
                        sessionStorage.removeItem('run_targetLoops');
                        sessionStorage.removeItem('run_emailStart');
                        simulateRealClick(submitBtn);
                    }
                }, 800);
            }
        }, 400);
    }

    function handleCheckoutOrLoop() {
        const timer = setInterval(() => {
            const getTicketsBtn = findButtonByText('Get Tickets');
            const checkoutBtn = findButtonByText('CHECKOUT');

            if (getTicketsBtn || checkoutBtn) {
                clearInterval(timer);

                if (clickedDates.length >= CONFIG.targetLoops) {
                    console.log(`🎉 已选 ${clickedDates.length}/${CONFIG.targetLoops} 天 → 结账`);
                    sessionStorage.removeItem('myScript_clickedDates');
                    checkoutBtn && simulateRealClick(checkoutBtn);
                } else {
                    console.log(`🔄 已选 ${clickedDates.length}/${CONFIG.targetLoops} 天 → 继续`);
                    if (getTicketsBtn) {
                        simulateRealClick(getTicketsBtn);
                        setTimeout(autoDetectStep, 3000);
                    }
                }
            }
        }, 500);
    }

    function executeZipFlow() {
        const checkbox = document.querySelector<HTMLInputElement>('#check_PAYW');
        if (checkbox && !checkbox.checked) checkbox.click();
        setTimeout(() => {
            const zipInput = document.querySelector<HTMLInputElement>('#zip_tristate');
            if (zipInput) {
                setInputValue(zipInput, CONFIG.zipCode);
                waitForElementAndClick('label[for="choosePayw"]', 10000);
            }
        }, 800);
    }

    function waitForElementAndClick(selector: string, timeout: number) {
        const startTime = Date.now();
        const timer = setInterval(() => {
            const el = document.querySelector(selector);
            if (el) {
                clearInterval(timer);
                setTimeout(() => {
                    const input = document.querySelector<HTMLInputElement>('#choosePayw');
                    if (input) simulateRealClick(input);
                    simulateRealClick(el);
                    setTimeout(handlePayWhatAndConfirm, 600);
                }, 300);
            } else if (Date.now() - startTime > timeout) {
                clearInterval(timer);
            }
        }, 300);
    }

    function handlePayWhatAndConfirm() {
        const timer = setInterval(() => {
            const radio = document.querySelector<HTMLInputElement>('#pwyw-radio');
            if (radio) {
                clearInterval(timer);
                simulateRealClick(radio);
                waitForConfirmButton(10000);
            }
        }, 300);
    }

    function waitForConfirmButton(timeout: number) {
        const timer = setInterval(() => {
            const btn = document.querySelector<HTMLButtonElement>('#confirm-button');
            if (btn && !btn.disabled) {
                clearInterval(timer);
                setTimeout(() => {
                    simulateRealClick(btn);
                    setTimeout(handleQtyInput, 1000);
                }, 300);
            }
        }, 300);
    }

    function handleQtyInput() {
        const timer = setInterval(() => {
            const qtyInput = (document.querySelector('#qtyInput-585') || document.querySelector('input.stepper-input')) as HTMLInputElement;
            if (qtyInput) {
                clearInterval(timer);
                setInputValue(qtyInput, CONFIG.qty);
                setTimeout(() => clickGenericContinueButton(handleDateSelection, 'Continue'), 800);
            }
        }, 300);
    }

    function handleDateSelection() {
        console.log('📅 选择日期...');
        const timer = setInterval(() => {
            const days = Array.from(document.querySelectorAll('button.rdp-day:not([disabled]):not(.rdp-day_outside)'));
            if (days.length > 0) {
                let target = days.find(btn => !clickedDates.includes(btn.textContent?.trim() || ''));
                if (!target) {
                    const nextMonth = document.querySelector('button[name="next-month"]') || document.querySelector('.rdp-nav_button_next');
                    if (nextMonth && !(nextMonth as HTMLButtonElement).disabled) {
                        simulateRealClick(nextMonth);
                        return;
                    }
                    target = days[0];
                }
                clearInterval(timer);
                const dayText = target.textContent?.trim() || '';
                console.log(`👉 选中: ${dayText}`);
                clickedDates.push(dayText);
                sessionStorage.setItem('myScript_clickedDates', JSON.stringify(clickedDates));
                simulateRealClick(target);
                setTimeout(() => clickGenericContinueButton(handlePriceInput, 'Continue'), 1000);
            }
        }, 500);
    }

    function handlePriceInput() {
        const timer = setInterval(() => {
            const priceInput = document.querySelector<HTMLInputElement>('#selectYourPriceInput');
            if (priceInput) {
                clearInterval(timer);
                setInputValue(priceInput, CONFIG.price);
                setTimeout(() => clickGenericContinueButton(handleCheckoutOrLoop, 'Continue'), 800);
            }
        }, 300);
    }

    function handleGuestLogin() {
        if (sessionStorage.getItem('myScript_submittingEmail') === 'true') return;
        const timer = setInterval(() => {
            const guestBtn = findButtonByText('Continue as Guest');
            if (guestBtn) {
                const form = guestBtn.closest('form') || guestBtn.closest('div');
                const emailInput = Array.from(
                    (form || document).querySelectorAll('input[type="email"], input[name*="Email"], #GuestLoginRequest_Email')
                ).find(el => (el as HTMLElement).offsetParent !== null) as HTMLInputElement;

                if (emailInput) {
                    clearInterval(timer);
                    const email = `${CONFIG.emailPrefix}${emailCounter}${CONFIG.emailSuffix}`;
                    console.log(`📧 填入邮箱: ${email}`);
                    sessionStorage.setItem('myScript_submittingEmail', 'true');
                    setInputValue(emailInput, email);
                    emailCounter++;
                    localStorage.setItem('myScript_emailCounter', String(emailCounter));
                    setTimeout(() => {
                        sessionStorage.setItem('myScript_submittingEmail', 'false');
                        simulateRealClick(guestBtn);
                    }, 1200);
                }
            }
        }, 500);
    }

    function clickGenericContinueButton(next: () => void, name: string) {
        const btn = Array.from(document.querySelectorAll('button.btn.btn-full-width'))
            .find(b => b.textContent?.trim().includes('Continue') && (b as HTMLElement).offsetParent !== null);
        if (btn) {
            console.log(`✅ 点击 ${name}`);
            simulateRealClick(btn);
            if (next) setTimeout(next, 1200);
        }
    }

    function findButtonByText(text: string) {
        return Array.from(document.querySelectorAll('a, button, input[type="submit"]'))
            .find(el => el.textContent?.trim().includes(text) && (el as HTMLElement).offsetParent !== null);
    }

    function simulateRealClick(el: Element) {
        el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
        if ((el as HTMLElement).tagName === 'A') (el as HTMLAnchorElement).click();
    }

    function setInputValue(input: HTMLInputElement, value: string) {
        input.focus();
        input.dispatchEvent(new Event('focus', { bubbles: true }));
        const desc = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        if (desc && desc.set) desc.set.call(input, value);
        else input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('blur', { bubbles: true }));
    }
}