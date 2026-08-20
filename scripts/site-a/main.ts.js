// 本地计数器自增逻辑
let count = GM_getValue('run_count', 0);
count += 1;
GM_setValue('run_count', count);

console.log(`[Site A] 脚本已启动！当前设备累计运行次数：${count}`);
alert(`这是你第 ${count} 次在这个设备运行 Site A 脚本！`);