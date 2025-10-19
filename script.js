// Отримання елементів DOM
const reportForm = document.getElementById('reportForm');
const reportOutput = document.getElementById('reportOutput');
const reportContent = document.getElementById('reportContent');
const copyButton = document.getElementById('copyReport');
const downloadButton = document.getElementById('downloadReport');
const newReportButton = document.getElementById('newReport');

// Глобальна змінна для зберігання даних
let appData = null;

// Fallback дані на випадок, якщо JSON не завантажиться
const fallbackData = {
    "subdivisions": [
        {"value": "1-й батальйон", "label": "1-й батальйон"},
        {"value": "2-й батальйон", "label": "2-й батальйон"},
        {"value": "3-й батальйон", "label": "3-й батальйон"},
        {"value": "Розвідувальна рота", "label": "Розвідувальна рота"},
        {"value": "Штабна рота", "label": "Штабна рота"},
        {"value": "Рота забезпечення", "label": "Рота забезпечення"}
    ],
    "droneNames": [
        {"value": "DJI Mavic 3", "label": "DJI Mavic 3"},
        {"value": "DJI Air 2S", "label": "DJI Air 2S"},
        {"value": "Autel EVO II", "label": "Autel EVO II"},
        {"value": "DJI Mini 3 Pro", "label": "DJI Mini 3 Pro"},
        {"value": "Skydio 2+", "label": "Skydio 2+"},
        {"value": "DJI Phantom 4 Pro", "label": "DJI Phantom 4 Pro"},
        {"value": "Parrot Anafi", "label": "Parrot Anafi"},
        {"value": "DJI Matrice 300", "label": "DJI Matrice 300"},
        {"value": "Інший", "label": "Інший"}
    ],
    "droneSizes": [
        {"value": "Мікро", "label": "Мікро (< 250г)"},
        {"value": "Міні", "label": "Міні (250г - 2кг)"},
        {"value": "Малий", "label": "Малий (2кг - 25кг)"},
        {"value": "Середній", "label": "Середній (25кг - 150кг)"},
        {"value": "Великий", "label": "Великий (> 150кг)"}
    ],
    "cameraTypes": [
        {"value": "HD (720p)", "label": "HD (720p)"},
        {"value": "Full HD (1080p)", "label": "Full HD (1080p)"},
        {"value": "4K", "label": "4K"},
        {"value": "4K Pro", "label": "4K Pro"},
        {"value": "Тепловізор", "label": "Тепловізор"},
        {"value": "Мультиспектральна", "label": "Мультиспектральна"},
        {"value": "Ніч/день", "label": "Ніч/день"},
        {"value": "Без камери", "label": "Без камери"}
    ],
    "videoFrequencies": [
        {"value": "2.4 ГГц", "label": "2.4 ГГц", "description": "Стандартна частота відеопередачі"},
        {"value": "5.8 ГГц", "label": "5.8 ГГц", "description": "Висока частота з меншими перешкодами"},
        {"value": "1.2 ГГц", "label": "1.2 ГГц", "description": "Професійна відеопередача"},
        {"value": "900 МГц", "label": "900 МГц", "description": "Дальня відеопередача"},
        {"value": "Аналогова 5.8 ГГц", "label": "Аналогова 5.8 ГГц", "description": "FPV аналогова передача"}
    ],
    "controlFrequencies": [
        {"value": "2.4 ГГц", "label": "2.4 ГГц", "description": "Стандартне керування"},
        {"value": "433 МГц", "label": "433 МГц", "description": "Дальнього радіуса дії"},
        {"value": "868 МГц", "label": "868 МГц", "description": "Європейський стандарт"},
        {"value": "915 МГц", "label": "915 МГц", "description": "Американський стандарт"},
        {"value": "Crossfire (868/915 МГц)", "label": "Crossfire (868/915 МГц)", "description": "Надійне керування"},
        {"value": "ExpressLRS", "label": "ExpressLRS", "description": "Низька затримка"}
    ],
    "missionTypes": [
        {"value": "Розвідка", "label": "Розвідка"},
        {"value": "Патрулювання", "label": "Патрулювання"},
        {"value": "Моніторинг", "label": "Моніторинг"},
        {"value": "Навчання", "label": "Навчання"},
        {"value": "Тестування", "label": "Тестування"},
        {"value": "Інше", "label": "Інше"}
    ]
};

// Завантаження даних з JSON файлу або використання fallback
async function loadData() {
    try {
        // Спроба завантажити дані з JSON файлу
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('Не вдалося завантажити дані з файлу');
        }
        appData = await response.json();
        console.log('Дані успішно завантажено з data.json');
    } catch (error) {
        console.warn('Використовуємо fallback дані:', error.message);
        // Використовуємо fallback дані
        appData = fallbackData;
    }
    
    // В будь-якому випадку заповнюємо селекти
    populateSelects();
}

// Заповнення випадаючих списків даними
function populateSelects() {
    if (!appData) return;
    
    // Заповнення підрозділів
    populateSelect('subdivision', appData.subdivisions);
    
    // Заповнення дронів (три окремі поля)
    populateSelect('droneName', appData.droneNames);
    populateSelect('droneSize', appData.droneSizes);
    populateSelect('cameraType', appData.cameraTypes);
    
    // Заповнення частот (два окремі поля)
    populateSelect('videoFrequency', appData.videoFrequencies);
    populateSelect('controlFrequency', appData.controlFrequencies);
    
    // Заповнення типів місій
    populateSelect('missionType', appData.missionTypes);
}

// Універсальна функція заповнення селекту
function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // Очистити існуючі опції (крім першої)
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }
    
    // Додати нові опції
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.label;
        
        // Додати додаткову інформацію як title (tooltip)
        if (option.description) {
            optionElement.title = option.description;
        } else if (option.range) {
            optionElement.title = option.range;
        }
        
        select.appendChild(optionElement);
    });
}

// Перевірка протоколу та показ інформації
function checkProtocol() {
    if (window.location.protocol === 'file:') {
        console.info('📁 Додаток відкрито через file:// протокол. Використовуються вбудовані дані.');
        console.info('💡 Для використання data.json запустіть HTTP сервер: python3 -m http.server 8000');
    } else {
        console.info('🌐 Додаток працює через HTTP сервер');
    }
}

// Встановлення поточної дати та часу при завантаженні сторінки
document.addEventListener('DOMContentLoaded', function() {
    // Перевірити протокол
    checkProtocol();
    
    // Завантажити дані з JSON або fallback
    loadData();
    
    const now = new Date();
    
    // Встановлення поточної дати
    const today = now.toISOString().split('T')[0];
    document.getElementById('date').value = today;
    
    // Встановлення поточного часу
    const currentTime = now.toTimeString().slice(0, 5);
    document.getElementById('time').value = currentTime;
});

// Обробка відправки форми
reportForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Збір даних з форми
    const formData = {
        subdivision: document.getElementById('subdivision').value,
        droneName: document.getElementById('droneName').value,
        droneSize: document.getElementById('droneSize').value,
        cameraType: document.getElementById('cameraType').value,
        videoFrequency: document.getElementById('videoFrequency').value,
        controlFrequency: document.getElementById('controlFrequency').value,
        fiberOptic: document.getElementById('fiberOptic').checked,
        fiberLength: document.getElementById('fiberLength').value,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
        missionType: document.getElementById('missionType').value,
        mission: document.getElementById('mission').value
    };
    
    // Валідація
    if (!validateForm(formData)) {
        return;
    }
    
    // Генерація звіту
    generateReport(formData);
    
    // Показати блок звіту
    reportOutput.classList.remove('hidden');
    reportOutput.scrollIntoView({ behavior: 'smooth' });
});

// Функція валідації форми
function validateForm(data) {
    const errors = [];
    
    if (!data.subdivision) {
        errors.push('Оберіть підрозділ');
    }
    
    if (!data.droneName) {
        errors.push('Оберіть назву дрону');
    }
    
    if (!data.droneSize) {
        errors.push('Оберіть розмір дрону');
    }
    
    if (!data.cameraType) {
        errors.push('Оберіть тип камери');
    }
    
    // Перевірка частот тільки якщо НЕ оптоволоконний кабель
    if (!data.fiberOptic) {
        if (!data.videoFrequency) {
            errors.push('Оберіть частоту відео');
        }
        
        if (!data.controlFrequency) {
            errors.push('Оберіть частоту керування');
        }
    }
    
    if (data.fiberOptic && !data.fiberLength) {
        errors.push('Вкажіть довжину котушки для оптоволоконного кабелю');
    }
    
    if (!data.date) {
        errors.push('Вкажіть дату');
    }
    
    if (!data.time) {
        errors.push('Вкажіть час');
    }
    
    // Перевірка дати (дозволено сьогодні і минулі дати)
    if (data.date) {
        const selectedDate = new Date(data.date);
        const today = new Date();
        
        // Встановлюємо час на кінець сьогоднішнього дня для порівняння
        today.setHours(23, 59, 59, 999);
        
        if (selectedDate > today) {
            errors.push('Дата не може бути в майбутньому');
        }
    }
    
    if (errors.length > 0) {
        showError(errors.join(', '));
        return false;
    }
    
    return true;
}

// Функція генерації звіту
function generateReport(data) {
    const reportNumber = generateReportNumber();
    const formattedDate = formatDate(data.date);
    const formattedTime = formatTime(data.time);
    
    const reportHTML = `
        <h3>ЗВІТ ПРО ВИКОРИСТАННЯ ДРОНУ №${reportNumber}</h3>
        
        <div class="report-item">
            <span class="report-label">Номер звіту:</span>
            <span class="report-value">${reportNumber}</span>
        </div>
        
        <div class="report-item">
            <span class="report-label">Підрозділ:</span>
            <span class="report-value">${data.subdivision}</span>
        </div>
        
        <div class="report-item">
            <span class="report-label">Назва дрону:</span>
            <span class="report-value">${data.droneName}</span>
        </div>
        
        <div class="report-item">
            <span class="report-label">Розмір дрону:</span>
            <span class="report-value">${data.droneSize}</span>
        </div>
        
        <div class="report-item">
            <span class="report-label">Тип камери:</span>
            <span class="report-value">${data.cameraType}</span>
        </div>
        
        ${data.fiberOptic ? `
        <div class="report-item">
            <span class="report-label">Тип зв'язку:</span>
            <span class="report-value">Оптоволоконний кабель (${data.fiberLength} м)</span>
        </div>
        ` : `
        <div class="report-item">
            <span class="report-label">Частота відео:</span>
            <span class="report-value">${data.videoFrequency}</span>
        </div>
        
        <div class="report-item">
            <span class="report-label">Частота керування:</span>
            <span class="report-value">${data.controlFrequency}</span>
        </div>
        `}
        
        <div class="report-item">
            <span class="report-label">Дата:</span>
            <span class="report-value">${formattedDate}</span>
        </div>
        
        <div class="report-item">
            <span class="report-label">Час:</span>
            <span class="report-value">${formattedTime}</span>
        </div>
        
        ${data.missionType ? `
        <div class="report-item">
            <span class="report-label">Тип місії:</span>
            <span class="report-value">${data.missionType}</span>
        </div>
        ` : ''}
        
        ${data.mission ? `
        <div class="report-item">
            <span class="report-label">Опис місії:</span>
            <span class="report-value">${data.mission}</span>
        </div>
        ` : ''}
        
        <div class="report-item">
            <span class="report-label">Час створення:</span>
            <span class="report-value">${new Date().toLocaleString('uk-UA')}</span>
        </div>
    `;
    
    reportContent.innerHTML = reportHTML;
}

// Функція генерації номера звіту
function generateReportNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `DR-${year}${month}${day}-${hours}${minutes}${seconds}`;
}

// Функція форматування дати
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Функція форматування часу
function formatTime(timeString) {
    return timeString;
}

// Функція показу помилки
function showError(message) {
    // Видалити попередні повідомлення про помилку
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Створити нове повідомлення про помилку
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = `Помилка: ${message}`;
    
    // Вставити повідомлення перед формою
    reportForm.parentNode.insertBefore(errorDiv, reportForm);
    
    // Автоматично видалити повідомлення через 5 секунд
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Функція показу успішного повідомлення
function showSuccess(message) {
    const existingSuccess = document.querySelector('.success-message');
    if (existingSuccess) {
        existingSuccess.remove();
    }
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    
    reportOutput.insertBefore(successDiv, reportContent);
    
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 3000);
}

// Копіювання звіту в буфер обміну
copyButton.addEventListener('click', function() {
    const reportText = getReportAsText();
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(reportText).then(() => {
            showSuccess('Звіт скопійовано в буфер обміну');
        }).catch(() => {
            fallbackCopyTextToClipboard(reportText);
        });
    } else {
        fallbackCopyTextToClipboard(reportText);
    }
});

// Резервний метод копіювання для старих браузерів
function fallbackCopyTextToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showSuccess('Звіт скопійовано в буфер обміну');
        } else {
            showError('Не вдалося скопіювати звіт');
        }
    } catch (err) {
        showError('Не вдалося скопіювати звіт');
    }
    
    document.body.removeChild(textArea);
}

// Отримання тексту звіту
function getReportAsText() {
    const reportItems = reportContent.querySelectorAll('.report-item');
    const reportTitle = reportContent.querySelector('h3').textContent;
    
    let text = reportTitle + '\n' + '='.repeat(reportTitle.length) + '\n\n';
    
    reportItems.forEach(item => {
        const label = item.querySelector('.report-label').textContent;
        const value = item.querySelector('.report-value').textContent;
        text += `${label} ${value}\n`;
    });
    
    return text;
}

// Завантаження звіту як файл
downloadButton.addEventListener('click', function() {
    const reportText = getReportAsText();
    const reportNumber = reportContent.querySelector('.report-value').textContent;
    
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `Звіт_${reportNumber}.txt`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        showSuccess('Звіт завантажено');
    } else {
        showError('Ваш браузер не підтримує завантаження файлів');
    }
});

// Створення нового звіту
newReportButton.addEventListener('click', function() {
    reportForm.reset();
    reportOutput.classList.add('hidden');
    
    // Встановлення поточної дати та часу
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    document.getElementById('date').value = today;
    document.getElementById('time').value = currentTime;
    
    // Видалити повідомлення про помилки або успіх
    const messages = document.querySelectorAll('.error-message, .success-message');
    messages.forEach(message => message.remove());
    
    // Прокрутити до початку форми
    reportForm.scrollIntoView({ behavior: 'smooth' });
});

// Функція для перезавантаження даних (корисно для розробки)
function reloadData() {
    loadData();
    showSuccess('Дані перезавантажено');
}

// Обробка скидання форми
reportForm.addEventListener('reset', function() {
    setTimeout(() => {
        // Встановлення поточної дати та часу після скидання
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentTime = now.toTimeString().slice(0, 5);
        
        document.getElementById('date').value = today;
        document.getElementById('time').value = currentTime;
    }, 10);
});