// 时间显示脚本
function startTime() {
    const today = new Date();
    let hours = today.getHours();
    const minutes = today.getMinutes();
    const seconds = today.getSeconds();
    
    let period;
    if (hours >= 0 && hours <= 5) period = '凌晨';
    else if (hours >= 6 && hours <= 11) period = '上午';
    else if (hours === 12) period = '中午';
    else if (hours >= 13 && hours <= 18) period = '下午';
    else period = '晚上';
    
    let displayHours = hours % 12;
    displayHours = displayHours === 0 ? 12 : displayHours;
    const displayMinutes = minutes < 10 ? '0' + minutes : minutes;
    const displaySeconds = seconds < 10 ? '0' + seconds : seconds;
    
    document.getElementById('time-display').innerHTML = 
        `${period} ${displayHours}:${displayMinutes}:${displaySeconds}`;
    // 每500毫秒重复执行一次，实现自动更新
    setTimeout(startTime, 500);
}

// 页面加载完成后立即启动时间显示
window.addEventListener('load', startTime);