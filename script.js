// Отримання елементів DOM
const reportForm = document.getElementById('reportForm');
const reportOutput = document.getElementById('reportOutput');
const reportContent = document.getElementById('reportContent');
const copyButton = document.getElementById('copyReport');
const downloadButton = document.getElementById('downloadReport');
const newReportButton = document.getElementById('newReport');
const newReportBasedOnButton = document.getElementById('newReportBasedOn');

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
    "jointWithOptions": [
        {"value": "1-й батальйон", "label": "1-й батальйон"},
        {"value": "2-й батальйон", "label": "2-й батальйон"},
        {"value": "3-й батальйон", "label": "3-й батальйон"},
        {"value": "Розвідувальна рота", "label": "Розвідувальна рота"},
        {"value": "Штабна рота", "label": "Штабна рота"},
        {"value": "Рота забезпечення", "label": "Рота забезпечення"},
        {"value": "Інший", "label": "Інший"}
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
        {"value": "Великий", "label": "Великий (> 150кг)"},
        {"value": "Інший", "label": "Інший"}
    ],
    "cameraTypes": [
        {"value": "HD (720p)", "label": "HD (720p)"},
        {"value": "Full HD (1080p)", "label": "Full HD (1080p)"},
        {"value": "4K", "label": "4K"},
        {"value": "4K Pro", "label": "4K Pro"},
        {"value": "Тепловізор", "label": "Тепловізор"},
        {"value": "Мультиспектральна", "label": "Мультиспектральна"},
        {"value": "Ніч/день", "label": "Ніч/день"},
        {"value": "Без камери", "label": "Без камери"},
        {"value": "Інша", "label": "Інша"}
    ],
    "videoFrequencies": [
        {"value": "2.4 ГГц", "label": "2.4 ГГц", "description": "Стандартна частота відеопередачі"},
        {"value": "5.8 ГГц", "label": "5.8 ГГц", "description": "Висока частота з меншими перешкодами"},
        {"value": "1.2 ГГц", "label": "1.2 ГГц", "description": "Професійна відеопередача"},
        {"value": "900 МГц", "label": "900 МГц", "description": "Дальня відеопередача"},
        {"value": "Аналогова 5.8 ГГц", "label": "Аналогова 5.8 ГГц", "description": "FPV аналогова передача"},
        {"value": "Інша", "label": "Інша"}
    ],
    "controlFrequencies": [
        {"value": "2.4 ГГц", "label": "2.4 ГГц", "description": "Стандартне керування"},
        {"value": "433 МГц", "label": "433 МГц", "description": "Дальнього радіуса дії"},
        {"value": "868 МГц", "label": "868 МГц", "description": "Європейський стандарт"},
        {"value": "915 МГц", "label": "915 МГц", "description": "Американський стандарт"},
        {"value": "Crossfire (868/915 МГц)", "label": "Crossfire (868/915 МГц)", "description": "Надійне керування"},
        {"value": "ExpressLRS", "label": "ExpressLRS", "description": "Низька затримка"},
        {"value": "Інша", "label": "Інша"}
    ],
    "targetTypeOptions": [
        {"value": "Військовий об'єкт", "label": "Військовий об'єкт"},
        {"value": "Техніка", "label": "Техніка"},
        {"value": "Особовий склад", "label": "Особовий склад"},
        {"value": "Інфраструктура", "label": "Інфраструктура"},
        {"value": "Склад", "label": "Склад"},
        {"value": "Блокпост", "label": "Блокпост"},
        {"value": "Позиція", "label": "Позиція"},
        {"value": "Інше", "label": "Інше"}
    ],
    "settlementOptions": [
        {"value": "Київ", "label": "Київ", "coordinates": "50.4501, 30.5234"},
        {"value": "Харків", "label": "Харків", "coordinates": "49.9935, 36.2304"},
        {"value": "Одеса", "label": "Одеса", "coordinates": "46.4825, 30.7233"},
        {"value": "Дніпро", "label": "Дніпро", "coordinates": "48.4647, 35.0462"},
        {"value": "Донецьк", "label": "Донецьк", "coordinates": "48.0159, 37.8028"},
        {"value": "Запоріжжя", "label": "Запоріжжя", "coordinates": "47.8388, 35.1396"},
        {"value": "Львів", "label": "Львів", "coordinates": "49.8397, 24.0297"},
        {"value": "Маріуполь", "label": "Маріуполь", "coordinates": "47.0951, 37.5494"},
        {"value": "Інший", "label": "Інший", "coordinates": null}
    ],
    "bkOptions": [
        {"value": "БК-1", "label": "БК-1"},
        {"value": "БК-2", "label": "БК-2"},
        {"value": "БК-3", "label": "БК-3"},
        {"value": "БК-4", "label": "БК-4"},
        {"value": "БК-5", "label": "БК-5"},
        {"value": "Немає", "label": "Немає"},
        {"value": "Інший", "label": "Інший"}
    ],
    "statusOptions": [
        {"value": "Уражено", "label": "Уражено"},
        {"value": "Пошкоджено", "label": "Пошкоджено"},
        {"value": "Не уражено", "label": "Не уражено"},
        {"value": "Інший", "label": "Інший"}
    ],
    "reasonOptions": [
        {"value": "Цель недоступна", "label": "Цель недоступна"},
        {"value": "Погодні умови", "label": "Погодні умови"},
        {"value": "Технічні проблеми", "label": "Технічні проблеми"},
        {"value": "Втрата зв'язку", "label": "Втрата зв'язку"},
        {"value": "Батарея розрядилась", "label": "Батарея розрядилась"},
        {"value": "РЕБ", "label": "РЕБ"},
        {"value": "Ціль переміщена", "label": "Ціль переміщена"},
        {"value": "Інша", "label": "Інша"}
    ],
    "lossOptions": [
        {"value": "Немає", "label": "Немає"},
        {"value": "Збито", "label": "Збито"},
        {"value": "Технічна несправність", "label": "Технічна несправність"},
        {"value": "Втрата зв'язку", "label": "Втрата зв'язку"},
        {"value": "Розряд батареї", "label": "Розряд батареї"},
        {"value": "РЕБ", "label": "РЕБ"},
        {"value": "Погодні умови", "label": "Погодні умови"},
        {"value": "Інше", "label": "Інше"}
    ],
    "operatorOptions": [
        {"value": "Оператор-1", "label": "Оператор-1"},
        {"value": "Оператор-2", "label": "Оператор-2"},
        {"value": "Оператор-3", "label": "Оператор-3"},
        {"value": "Оператор-4", "label": "Оператор-4"},
        {"value": "Оператор-5", "label": "Оператор-5"},
        {"value": "Інший", "label": "Інший"}
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
    populateSelect('jointWith', appData.jointWithOptions || appData.subdivisions);
    
    // Заповнення дронів (три окремі поля)
    populateSelect('droneName', appData.droneNames);
    populateSelect('droneSize', appData.droneSizes);
    populateSelect('cameraType', appData.cameraTypes);
    
    // Заповнення частот (два окремі поля)
    populateSelect('videoFrequency', appData.videoFrequencies);
    populateSelect('controlFrequency', appData.controlFrequencies);
    
    // Поле 'Тип місії' видалено
    
    // Заповнення нових полів
    populateSelect('bk', appData.bkOptions);
    populateSelect('targetType', appData.targetTypeOptions);
    populateSelect('settlement', appData.settlementOptions);
    populateSelect('status', appData.statusOptions);
    populateSelect('reason', appData.reasonOptions);
    populateSelect('losses', appData.lossOptions);
    populateSelect('operator', appData.operatorOptions);
    
    // Встановлення підрозділу за замовчуванням
    const subdivisionSelect = document.getElementById('subdivision');
    if (subdivisionSelect && subdivisionSelect.value === '') {
        subdivisionSelect.value = 'ВБпАК 1б ТрО 101 обр ТрО';
    }
    
        // Додаємо фільтрацію для БК
        const bkFilterInput = document.getElementById('bkFilter');
        if (bkFilterInput) {
            bkFilterInput.addEventListener('input', function() {
                const filterValue = bkFilterInput.value.toLowerCase();
                const filteredOptions = appData.bkOptions.filter(opt => opt.label.toLowerCase().includes(filterValue));
                populateSelect('bk', filteredOptions);
            });
        }
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
    
    // Ініціалізація стану полів населеного пункту та координат
    setTimeout(() => {
        toggleCustomSettlement();
    }, 100);
});

// Обробка відправки форми
reportForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Збір даних з форми
    const formData = {
        subdivision: document.getElementById('subdivision').value === 'Інший' ? document.getElementById('customSubdivision').value : document.getElementById('subdivision').value,
        jointWith: document.getElementById('jointWith').value === 'Інший' ? document.getElementById('customJointWith').value : document.getElementById('jointWith').value,
        droneName: document.getElementById('droneName').value === 'Інший' ? document.getElementById('customDroneName').value : document.getElementById('droneName').value,
        droneSize: document.getElementById('droneSize').value === 'Інший' ? document.getElementById('customDroneSize').value : document.getElementById('droneSize').value,
        cameraType: document.getElementById('cameraType').value === 'Інша' ? document.getElementById('customCameraType').value : document.getElementById('cameraType').value,
        videoFrequency: document.getElementById('videoFrequency').value === 'Інша' ? document.getElementById('customVideoFrequency').value : document.getElementById('videoFrequency').value,
        controlFrequency: document.getElementById('controlFrequency').value === 'Інша' ? document.getElementById('customControlFrequency').value : document.getElementById('controlFrequency').value,
        fiberOptic: document.getElementById('fiberOptic').checked,
        fiberLength: document.getElementById('fiberLength').value,
        bk: document.getElementById('bk').value === 'Інший' ? document.getElementById('customBk').value : document.getElementById('bk').value,
        targetType: document.getElementById('targetType').value === 'Інше' ? document.getElementById('customTargetType').value : document.getElementById('targetType').value,
        settlement: document.getElementById('settlement').value === 'Інший' ? document.getElementById('customSettlement').value : document.getElementById('settlement').value,
        coordinates: document.getElementById('coordinates').value,
        status: document.getElementById('status').value === 'Інший' ? document.getElementById('customStatus').value : document.getElementById('status').value,
        reason: document.getElementById('reason').value === 'Інша' ? document.getElementById('customReason').value : document.getElementById('reason').value,
        losses: document.getElementById('losses').value === 'Інше' ? document.getElementById('customLosses').value : document.getElementById('losses').value,
        operator: document.getElementById('operator').value === 'Інший' ? document.getElementById('customOperator').value : document.getElementById('operator').value,
        stream: document.getElementById('stream').checked,
        date: document.getElementById('date').value,
        time: document.getElementById('time').value,
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
        
        ${data.jointWith && data.jointWith !== '' && data.jointWith !== '—' ? `
        <div class="report-item">
            <span class="report-label">Сумісно з:</span>
            <span class="report-value">${data.jointWith}</span>
        </div>
        ` : ''}
        
        <div class="report-item">
            <span class="report-label">Дрон:</span>
            <span class="report-value">${data.droneName} | ${data.droneSize} | ${data.cameraType}</span>
        </div>
        
        ${data.fiberOptic ? `
        <div class="report-item">
            <span class="report-label">Тип зв'язку:</span>
            <span class="report-value">Оптоволоконний кабель (${data.fiberLength} м)</span>
        </div>
        ` : `
        <div class="report-item">
            <span class="report-label">Частоти:</span>
            <span class="report-value">Відео: ${data.videoFrequency} | Керування: ${data.controlFrequency}</span>
        </div>
        `}
        
        <div class="report-item">
            <span class="report-label">Дата та час:</span>
            <span class="report-value">${formattedDate} о ${formattedTime}</span>
        </div>
        
        ${data.bk ? `
        <div class="report-item">
            <span class="report-label">БК:</span>
            <span class="report-value">${data.bk}</span>
        </div>
        ` : ''}
        
        ${(data.targetType || data.settlement || data.coordinates) ? `
        <div class="report-item">
            <span class="report-label">Ціль:</span>
            <span class="report-value">${[
                data.targetType || '',
                data.settlement || '', 
                data.coordinates ? `(${data.coordinates})` : ''
            ].filter(item => item !== '').join(' | ')}</span>
        </div>
        ` : ''}
        
        ${data.status ? `
        <div class="report-item">
            <span class="report-label">Статус:</span>
            <span class="report-value">${data.status}</span>
        </div>
        ` : ''}
        
        ${data.reason && data.status === 'Не уражено' ? `
        <div class="report-item">
            <span class="report-label">Причина:</span>
            <span class="report-value">${data.reason}</span>
        </div>
        ` : ''}
        
        ${data.losses ? `
        <div class="report-item">
            <span class="report-label">Втрати:</span>
            <span class="report-value">${data.losses}</span>
        </div>
        ` : ''}
        
        ${data.operator ? `
        <div class="report-item">
            <span class="report-label">Оператор:</span>
            <span class="report-value">${data.operator}</span>
        </div>
        ` : ''}
        
        ${data.stream ? `
        <div class="report-item">
            <span class="report-label">Стрім:</span>
            <span class="report-value">Так</span>
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

// Створення нового звіту на основі поточного
newReportBasedOnButton.addEventListener('click', function() {
    reportOutput.classList.add('hidden');
    
    // Зберігаємо поточні дані форми
    const currentFormData = {
        subdivision: document.getElementById('subdivision').value,
        droneName: document.getElementById('droneName').value,
        droneSize: document.getElementById('droneSize').value,
        cameraType: document.getElementById('cameraType').value,
        videoFrequency: document.getElementById('videoFrequency').value,
        controlFrequency: document.getElementById('controlFrequency').value,
        fiberOptic: document.getElementById('fiberOptic').checked,
        fiberLength: document.getElementById('fiberLength').value,
        bk: document.getElementById('bk').value,
        targetType: document.getElementById('targetType').value,
        settlement: document.getElementById('settlement').value,
        customSettlement: document.getElementById('customSettlement').value,
        coordinates: document.getElementById('coordinates').value,
        status: document.getElementById('status').value,
        reason: document.getElementById('reason').value,
        customReason: document.getElementById('customReason').value,
        losses: document.getElementById('losses').value,
        operator: document.getElementById('operator').value,
        stream: document.getElementById('stream').checked,
        mission: document.getElementById('mission').value
    };
    
    // Оновлюємо тільки дату та час на поточні
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    document.getElementById('date').value = today;
    document.getElementById('time').value = currentTime;
    
    // Видалити повідомлення про помилки або успіх
    const messages = document.querySelectorAll('.error-message, .success-message');
    messages.forEach(message => message.remove());
    
    // Показати повідомлення про успішне копіювання
    showSuccess('Форма підготовлена для нового звіту. Змініть потрібні поля та згенеруйте новий звіт.');
    
    // Прокрутити до початку форми
    reportForm.scrollIntoView({ behavior: 'smooth' });
});

// Функція для перезавантаження даних (корисно для розробки)
function reloadData() {
    loadData();
    showSuccess('Дані перезавантажено');
}

// Функція для показу/приховування поля ручного введення населеного пункту та керування координатами
function toggleCustomSettlement() {
    const settlementSelect = document.getElementById('settlement');
    const customSettlementInput = document.getElementById('customSettlement');
    const coordinatesInput = document.getElementById('coordinates');
    
    if (settlementSelect.value === 'Інший') {
        // Показати поле для введення назви
        customSettlementInput.style.display = 'block';
        customSettlementInput.required = true;
        
        // Дозволити ручне введення координат
        coordinatesInput.readOnly = false;
        coordinatesInput.value = '';
        coordinatesInput.placeholder = 'Введіть координати вручну...';
        coordinatesInput.style.backgroundColor = '#fff';
    } else if (settlementSelect.value === '') {
        // Якщо нічого не вибрано
        customSettlementInput.style.display = 'none';
        customSettlementInput.required = false;
        customSettlementInput.value = '';
        
        coordinatesInput.readOnly = false;
        coordinatesInput.value = '';
        coordinatesInput.placeholder = 'Наприклад: 50.4501, 30.5234';
        coordinatesInput.style.backgroundColor = '#fff';
    } else {
        // Вибрано конкретне місто
        customSettlementInput.style.display = 'none';
        customSettlementInput.required = false;
        customSettlementInput.value = '';
        
        // Автоматично підставити координати та заблокувати поле
        const selectedOption = appData.settlementOptions.find(option => option.value === settlementSelect.value);
        if (selectedOption && selectedOption.coordinates) {
            coordinatesInput.value = selectedOption.coordinates;
            coordinatesInput.readOnly = true;
            coordinatesInput.style.backgroundColor = '#f8f9fa';
            coordinatesInput.placeholder = 'Координати підставлені автоматично';
        }
    }
}

// Функція для показу/приховування поля ручного введення назви дрону
function toggleCustomDroneName() {
    const select = document.getElementById('droneName');
    const customInput = document.getElementById('customDroneName');
    
    if (select.value === 'Інший') {
        customInput.style.display = 'block';
        customInput.required = true;
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
    }
}

// Функція для показу/приховування поля ручного введення розміру дрону
function toggleCustomDroneSize() {
    const select = document.getElementById('droneSize');
    const customInput = document.getElementById('customDroneSize');
    
    if (select.value === 'Інший') {
        customInput.style.display = 'block';
        customInput.required = true;
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
    }
}

// Функція для показу/приховування поля ручного введення типу цілі
function toggleCustomTargetType() {
    const select = document.getElementById('targetType');
    const customInput = document.getElementById('customTargetType');
    
    if (select.value === 'Інше') {
        customInput.style.display = 'block';
        customInput.required = true;
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
    }
}

// Функція для показу/приховування поля ручного введення втрат
function toggleCustomLosses() {
    const select = document.getElementById('losses');
    const customInput = document.getElementById('customLosses');
    
    if (select.value === 'Інше') {
        customInput.style.display = 'block';
        customInput.required = true;
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
    }
}

// Функція для показу/приховування поля ручного введення оператора
function toggleCustomOperator() {
    const select = document.getElementById('operator');
    const customInput = document.getElementById('customOperator');
    
    if (select.value === 'Інший') {
        customInput.style.display = 'block';
        customInput.required = true;
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
    }
}

// Функція для показу/приховування поля ручного введення типу камери
function toggleCustomCameraType() {
    const select = document.getElementById('cameraType');
    const customInput = document.getElementById('customCameraType');
    
    if (select.value === 'Інша') {
        customInput.style.display = 'block';
        customInput.required = true;
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
    }
}

// Функція для показу/приховування поля ручного введення частоти відео
function toggleCustomVideoFrequency() {
    const select = document.getElementById('videoFrequency');
    const customInput = document.getElementById('customVideoFrequency');
    
    if (select.value === 'Інша') {
        customInput.style.display = 'block';
        customInput.required = true;
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
    }
}

// Функція для показу/приховування поля ручного введення частоти керування
function toggleCustomControlFrequency() {
    const select = document.getElementById('controlFrequency');
    const customInput = document.getElementById('customControlFrequency');
    
    if (select.value === 'Інша') {
        customInput.style.display = 'block';
        customInput.required = true;
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
    }
}

// Функція для показу/приховування поля ручного введення БК
function toggleCustomBk() {
    const select = document.getElementById('bk');
    const customInput = document.getElementById('customBk');
    
    if (select.value === 'Інший') {
        customInput.style.display = 'block';
        customInput.required = true;
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
    }
}

// Функція для показу/приховування поля ручного введення статусу
function toggleCustomStatus() {
    const select = document.getElementById('status');
    const customInput = document.getElementById('customStatus');
    
    if (select.value === 'Інший') {
        customInput.style.display = 'block';
        customInput.required = true;
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
    }
}

// Функція для показу/приховування поля "Причина" при виборі "Не уражено"
function toggleReasonField() {
    const statusSelect = document.getElementById('status');
    const reasonGroup = document.getElementById('reasonGroup');
    
    if (statusSelect.value === 'Не уражено') {
        reasonGroup.style.display = 'block';
    } else {
        reasonGroup.style.display = 'none';
        // Скидання полів причини при приховуванні
        const reasonSelect = document.getElementById('reason');
        const customReason = document.getElementById('customReason');
        reasonSelect.value = '';
        customReason.style.display = 'none';
        customReason.required = false;
        customReason.value = '';
    }
}

// Функція для показу/приховування поля ручного введення причини
function toggleCustomReason() {
    const select = document.getElementById('reason');
    const customInput = document.getElementById('customReason');
    
    if (select.value === 'Інша') {
        customInput.style.display = 'block';
        customInput.required = true;
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
    }
}

// Функція для показу/приховування поля ручного введення сумісно з
function toggleCustomJointWith() {
    const select = document.getElementById('jointWith');
    const customInput = document.getElementById('customJointWith');
    
    if (select.value === 'Інший') {
        customInput.style.display = 'block';
        customInput.required = false; // Поле не обов'язкове
    } else {
        customInput.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
    }
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
        
        // Встановлення підрозділу за замовчуванням після скидання
        document.getElementById('subdivision').value = 'ВБпАК 1б ТрО 101 обр ТрО';
    }, 10);
});