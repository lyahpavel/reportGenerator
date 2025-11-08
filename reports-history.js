// Функції для роботи з історією звітів

let currentPage = 1;
const reportsPerPage = 10;
let allReports = [];
let filteredReports = [];

// Ініціалізація історії звітів
function initReportsHistory() {
    const historySection = document.getElementById('reportsHistory');
    const toggleButton = document.getElementById('toggleHistory');
    const refreshButton = document.getElementById('refreshHistory');
    const historyContent = document.getElementById('historyContent');
    const searchInput = document.getElementById('searchReports');
    const filterSelect = document.getElementById('filterBySubdivision');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');

    // Показати секцію історії тільки якщо є Supabase
    if (window.supabaseClient) {
        historySection.style.display = 'block';
    }

    // Toggle історії
    toggleButton.addEventListener('click', async function() {
        if (historyContent.style.display === 'none') {
            historyContent.style.display = 'block';
            refreshButton.style.display = 'inline-block';
            toggleButton.textContent = 'Сховати історію';
            await loadAndDisplayReports();
        } else {
            historyContent.style.display = 'none';
            refreshButton.style.display = 'none';
            toggleButton.textContent = 'Показати історію';
        }
    });

    // Оновлення історії
    refreshButton.addEventListener('click', async function() {
        await loadAndDisplayReports();
    });

    // Пошук
    searchInput.addEventListener('input', function() {
        filterReports();
    });

    // Фільтр по підрозділу
    filterSelect.addEventListener('change', function() {
        filterReports();
    });

    // Пагінація
    prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            displayReports();
        }
    });

    nextPageBtn.addEventListener('click', function() {
        const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayReports();
        }
    });
}

// Завантаження та відображення звітів
async function loadAndDisplayReports() {
    const reportsList = document.getElementById('reportsList');
    
    // Показати loading
    reportsList.innerHTML = '<div class="loading-state"><div class="loading-spinner"></div><p>Завантаження звітів...</p></div>';

    try {
        const { reports, totalCount } = await window.supabaseFunctions.loadReportsFromSupabase(100, 0);
        allReports = reports;
        filteredReports = reports;
        
        // Заповнити фільтр підрозділів
        populateSubdivisionFilter();
        
        // Відобразити звіти
        currentPage = 1;
        displayReports();
        
    } catch (error) {
        console.error('Помилка завантаження звітів:', error);
        reportsList.innerHTML = '<div class="empty-state"><p>❌ Не вдалося завантажити звіти</p></div>';
    }
}

// Заповнення фільтру підрозділів
function populateSubdivisionFilter() {
    const filterSelect = document.getElementById('filterBySubdivision');
    const subdivisions = [...new Set(allReports.map(r => r.subdivision))].sort();
    
    // Очистити існуючі опції (крім першої)
    while (filterSelect.children.length > 1) {
        filterSelect.removeChild(filterSelect.lastChild);
    }
    
    // Додати підрозділи
    subdivisions.forEach(subdivision => {
        const option = document.createElement('option');
        option.value = subdivision;
        option.textContent = subdivision;
        filterSelect.appendChild(option);
    });
}

// Фільтрація звітів
function filterReports() {
    const searchTerm = document.getElementById('searchReports').value.toLowerCase();
    const selectedSubdivision = document.getElementById('filterBySubdivision').value;
    
    filteredReports = allReports.filter(report => {
        const matchesSearch = !searchTerm || 
            report.report_number.toLowerCase().includes(searchTerm) ||
            report.subdivision.toLowerCase().includes(searchTerm) ||
            (report.operator && report.operator.toLowerCase().includes(searchTerm));
            
        const matchesSubdivision = !selectedSubdivision || 
            report.subdivision === selectedSubdivision;
            
        return matchesSearch && matchesSubdivision;
    });
    
    currentPage = 1;
    displayReports();
}

// Відображення звітів
function displayReports() {
    const reportsList = document.getElementById('reportsList');
    const pageInfo = document.getElementById('pageInfo');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    
    if (filteredReports.length === 0) {
        reportsList.innerHTML = '<div class="empty-state"><p>📭 Звітів не знайдено</p></div>';
        pageInfo.textContent = 'Сторінка 0 з 0';
        prevPageBtn.disabled = true;
        nextPageBtn.disabled = true;
        return;
    }
    
    const totalPages = Math.ceil(filteredReports.length / reportsPerPage);
    const startIndex = (currentPage - 1) * reportsPerPage;
    const endIndex = Math.min(startIndex + reportsPerPage, filteredReports.length);
    const reportsToShow = filteredReports.slice(startIndex, endIndex);
    
    // Відобразити звіти
    reportsList.innerHTML = reportsToShow.map(report => createReportCard(report)).join('');
    
    // Оновити пагінацію
    pageInfo.textContent = `Сторінка ${currentPage} з ${totalPages} (всього: ${filteredReports.length})`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    
    // Додати обробники подій до карток
    attachReportCardHandlers();
}

// Створення картки звіту
function createReportCard(report) {
    const date = new Date(report.created_at);
    const formattedDate = date.toLocaleDateString('uk-UA');
    const formattedTime = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
    
    return `
        <div class="report-item-card" data-report-id="${report.id}">
            <h3>📋 ${report.report_number}</h3>
            <div class="report-meta">
                <span>📍 ${report.subdivision}</span>
                <span>🎯 ${report.target_type || 'Не вказано'}</span>
                <span>👤 ${report.operator || 'Не вказано'}</span>
                <span>📅 ${formattedDate} ${formattedTime}</span>
            </div>
            <div class="report-meta">
                <span>🚁 ${report.drone_name || 'Не вказано'}</span>
                <span>💥 ${report.bk || 'Не вказано'}</span>
                <span>✅ ${report.status || 'Не вказано'}</span>
            </div>
            <div class="report-actions-inline">
                <button class="btn btn-outline btn-small view-report-btn" data-report-id="${report.id}">Переглянути</button>
                <button class="btn btn-secondary btn-small copy-report-btn" data-report-id="${report.id}">Копіювати</button>
                <button class="btn btn-outline btn-small delete-report-btn" data-report-id="${report.id}">Видалити</button>
            </div>
        </div>
    `;
}

// Додавання обробників подій до карток
function attachReportCardHandlers() {
    // Перегляд звіту
    document.querySelectorAll('.view-report-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const reportId = parseInt(this.dataset.reportId);
            viewReport(reportId);
        });
    });
    
    // Копіювання звіту
    document.querySelectorAll('.copy-report-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const reportId = parseInt(this.dataset.reportId);
            copyReportFromHistory(reportId);
        });
    });
    
    // Видалення звіту
    document.querySelectorAll('.delete-report-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const reportId = parseInt(this.dataset.reportId);
            deleteReport(reportId);
        });
    });
}

// Перегляд звіту
function viewReport(reportId) {
    const report = allReports.find(r => r.id === reportId);
    if (!report) return;
    
    // Конвертуємо дані з бази у формат для generateReport
    const reportData = {
        subdivision: report.subdivision,
        jointWith: report.joint_with,
        droneName: report.drone_name,
        droneSize: report.drone_size,
        cameraType: report.camera_type,
        videoFrequency: report.video_frequency,
        controlFrequency: report.control_frequency,
        fiberOptic: report.fiber_optic,
        fiberLength: report.fiber_length,
        bk: report.bk,
        initiationBoard: report.initiation_board,
        targetType: report.target_type,
        settlement: report.settlement,
        coordinates: report.coordinates,
        status: report.status,
        reason: report.reason,
        losses: report.losses,
        operator: report.operator,
        stream: report.stream,
        date: report.mission_date,
        time: report.mission_time,
        mission: report.mission_description
    };
    
    // Генеруємо звіт
    generateReport(reportData);
    
    // Показуємо секцію звіту
    const reportOutput = document.getElementById('reportOutput');
    reportOutput.classList.remove('hidden');
    reportOutput.scrollIntoView({ behavior: 'smooth' });
}

// Копіювання звіту з історії
function copyReportFromHistory(reportId) {
    const report = allReports.find(r => r.id === reportId);
    if (!report) return;
    
    // Конвертуємо в текст
    const reportText = formatReportAsText(report);
    
    // Копіюємо в буфер обміну
    if (navigator.clipboard) {
        navigator.clipboard.writeText(reportText).then(() => {
            showSuccess('Звіт скопійовано в буфер обміну');
        }).catch(() => {
            fallbackCopyTextToClipboard(reportText);
        });
    } else {
        fallbackCopyTextToClipboard(reportText);
    }
}

// Форматування звіту як текст
function formatReportAsText(report) {
    const date = new Date(report.mission_date);
    const formattedDate = date.toLocaleDateString('uk-UA');
    
    let text = `Підрозділ: ${report.subdivision}\n`;
    
    if (report.joint_with) {
        text += `Сумісно з: ${report.joint_with}\n`;
    }
    
    text += `Дрон: ${report.drone_name} | ${report.drone_size} | ${report.camera_type}\n`;
    
    if (report.fiber_optic) {
        text += `Тип зв'язку: Оптоволоконний кабель (${report.fiber_length} км)\n`;
    } else {
        text += `Частоти: Відео: ${report.video_frequency} | Керування: ${report.control_frequency}\n`;
    }
    
    text += `Дата та час: ${formattedDate} о ${report.mission_time}\n`;
    
    if (report.bk) text += `БК: ${report.bk}\n`;
    if (report.initiation_board) text += `Плата Ініціації: ${report.initiation_board}\n`;
    if (report.target_type) text += `Ціль: ${report.target_type}`;
    if (report.settlement) text += ` | ${report.settlement}`;
    if (report.coordinates) text += ` (${report.coordinates})`;
    if (report.target_type) text += `\n`;
    if (report.status) text += `Статус: ${report.status}\n`;
    if (report.reason) text += `Причина: ${report.reason}\n`;
    if (report.losses) text += `Втрати: ${report.losses}\n`;
    if (report.operator) text += `Оператор: ${report.operator}\n`;
    if (report.stream) text += `Стрім: Так\n`;
    if (report.mission_description) text += `Опис місії: ${report.mission_description}\n`;
    
    return text;
}

// Видалення звіту
async function deleteReport(reportId) {
    if (!confirm('Ви впевнені, що хочете видалити цей звіт?')) {
        return;
    }
    
    try {
        await window.supabaseFunctions.deleteReportFromSupabase(reportId);
        
        // Оновити список
        allReports = allReports.filter(r => r.id !== reportId);
        filterReports();
        
        showSuccess('Звіт видалено');
    } catch (error) {
        console.error('Помилка видалення звіту:', error);
        showError('Не вдалося видалити звіт');
    }
}

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', function() {
    // Затримка для того, щоб інші скрипти встигли завантажитись
    setTimeout(() => {
        if (window.supabaseClient) {
            initReportsHistory();
        }
    }, 500);
});
