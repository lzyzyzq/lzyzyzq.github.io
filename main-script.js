let workLogs = JSON.parse(localStorage.getItem('workLogs')) || [];
let lastWage = parseFloat(localStorage.getItem('lastWage')) || 0;
let lastHours = parseFloat(localStorage.getItem('lastHours')) || 0;
const monthColors = Array.from({length:12}, (_,i) => 
    `hsl(${(i * 30)}, 60%, 90%)`);

// 设置默认日期为当天
function setDefaultDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    document.getElementById('date-input').value = `${year}-${month}-${day}`;
}

// 渲染工时记录表格
function renderTable() {
    const tbody = document.getElementById('worklog').getElementsByTagName('tbody')[0];
    tbody.innerHTML = '';
    workLogs.forEach((log, index) => {
        const row = document.createElement('tr');
        const month = new Date(log.date).getMonth();
        row.style.backgroundColor = monthColors[month];
        
        row.innerHTML = `
            <td>${formatDate(log.date)}</td>
            <td>
                ${log.content ? 
                    `<span class="content-button" onclick="showContent(${index})">详情</span>` 
                    : ''}
            </td>
            <td>${log.hours}</td>
            <td>${(log.hours * log.wage).toFixed(2)}</td>
            <td>
                <span class="delete-button" onclick="deleteLog(${index})">删除</span>
            </td>
        `;
        tbody.appendChild(row);
    });
    updateTotalHours();
}

// 格式化日期显示
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// 添加工时记录
function addWorkLog() {
    const date = document.getElementById('date-input').value;
    const content = document.getElementById('content-input').value.trim();
    const hours = parseFloat(document.getElementById('hours-input').value);
    const wage = parseFloat(document.getElementById('wage-input').value);
    
    if (workLogs.some(log => log.date === date)) {
        alert("该日期已存在，请勿重复添加！");
        return;
    }
    if (hours < 0 || isNaN(hours)) {
        alert('请输入有效的工时数值（≥0）');
        return;
    }
    if (wage < 0 || isNaN(wage)) {
        alert('请输入有效的工资数值（≥0）');
        return;
    }
    
    lastHours = hours;
    lastWage = wage;
    localStorage.setItem('lastHours', hours);
    localStorage.setItem('lastWage', wage);
    workLogs.push({ date, content, hours, wage });
    localStorage.setItem('workLogs', JSON.stringify(workLogs));
    
    renderTable();
    clearForm();
}

// 清空表单
function clearForm() {
    setDefaultDate();
    document.getElementById('content-input').value = '';
    document.getElementById('hours-input').value = lastHours;
    document.getElementById('wage-input').value = lastWage;
}

// 删除工时记录
function deleteLog(index) {
    if (confirm('确定要删除这条记录吗？')) {
        workLogs.splice(index, 1);
        localStorage.setItem('workLogs', JSON.stringify(workLogs));
        renderTable();
    }
}

// 显示工作内容详情
function showContent(index) {
    const content = workLogs[index].content;
    if (!content) return;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.onclick = () => overlay.remove();
    const modal = document.createElement('div');
    modal.className = 'modal-content';
    modal.innerHTML = `
        <h3>${formatDate(workLogs[index].date)} 工作内容详情</h3>
        <div>
            ${content.replace(/\n/g, '<br>')}
        </div>
        <span onclick="this.parentElement.parentElement.remove()">
            关闭
        </span>
    `;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

// 更新工时和工资统计
function updateTotalHours() {
    const totalHours = workLogs.reduce((sum, log) => sum + log.hours, 0);
    const totalWage = workLogs.reduce((sum, log) => sum + (log.hours * log.wage), 0);
    
    const monthlyData = {};
    workLogs.forEach(log => {
        const month = new Date(log.date).toLocaleString('zh-CN', { 
            year: 'numeric', 
            month: '2-digit' 
        });
        if (!monthlyData[month]) {
            monthlyData[month] = { hours: 0, wage: 0 };
        }
        monthlyData[month].hours += log.hours;
        monthlyData[month].wage += log.hours * log.wage;
    });
    
    document.getElementById('total-hours').innerHTML = `
        总工时：${totalHours.toFixed(1)} 天<br>
        总工资：${totalWage.toFixed(2)} 元
    `;
    
    const monthlyHtml = Object.entries(monthlyData)
        .map(([month, data]) => `
            ${month}：
            工时 ${data.hours.toFixed(1)} 天 / 
            工资 ${data.wage.toFixed(2)} 元
        `)
        .join('<br>');
    document.getElementById('monthly-hours').innerHTML = `
        月度统计：<br>
        ${monthlyHtml}
    `;
}

// 滚动到顶部/底部切换
function toggleScroll() {
    const scrollButton = document.getElementById('scroll-button');
    const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 50;
    if (isAtBottom) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        scrollButton.textContent = '↓';
    } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        scrollButton.textContent = '↑';
    }
}

// 页面加载初始化
window.onload = () => {
    setDefaultDate();
    
    const initNumberInput = (elem, storedValue) => {
        elem.value = storedValue > 0 ? storedValue : '';
        elem.dataset.originalPlaceholder = elem.placeholder;
        
        elem.onfocus = () => { 
            if(elem.value === '') elem.placeholder = '请输入数值'; 
        }
        elem.onblur = () => { 
            if(elem.value === '') elem.placeholder = elem.dataset.originalPlaceholder;
        }
    }
    
    initNumberInput(document.getElementById('hours-input'), lastHours);
    initNumberInput(document.getElementById('wage-input'), lastWage);
    renderTable();
};

// 窗口获得焦点时更新日期
window.addEventListener('focus', setDefaultDate);