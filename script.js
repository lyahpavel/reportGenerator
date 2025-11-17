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
        {"value": "1-й батальйон", "label": "1-й батальйон", "code": "1Б"},
        {"value": "2-й батальйон", "label": "2-й батальйон", "code": "2Б"},
        {"value": "3-й батальйон", "label": "3-й батальйон", "code": "3Б"},
        {"value": "Розвідувальна рота", "label": "Розвідувальна рота", "code": "РР"},
        {"value": "Штабна рота", "label": "Штабна рота", "code": "ШР"},
        {"value": "Рота забезпечення", "label": "Рота забезпечення", "code": "РЗ"}
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
    "initiationBoardOptions": [
        {"value": "КД-8А", "label": "КД-8А"},
        {"value": "КД-8Б", "label": "КД-8Б"},
        {"value": "МСА-Ф", "label": "МСА-Ф"},
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

// Завантаження даних з Supabase або JSON файлу
async function loadData() {
    try {
        // Спробуємо завантажити з Supabase
        if (window.supabaseFunctions && window.supabaseClient) {
            console.log('🔄 Завантаження даних з Supabase...');
            appData = await window.supabaseFunctions.loadDataFromSupabase();
            console.log('✅ Дані завантажено з Supabase');
        } else {
            throw new Error('Supabase не налаштовано');
        }
    } catch (supabaseError) {
        console.warn('⚠️ Не вдалося завантажити з Supabase:', supabaseError.message);
        
        try {
            // Спроба завантажити дані з JSON файлу (fallback)
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error('Не вдалося завантажити дані з файлу');
            }
            appData = await response.json();
            console.log('📄 Дані завантажено з data.json');
        } catch (jsonError) {
            console.warn('⚠️ Використовуємо вбудовані дані:', jsonError.message);
            // Використовуємо fallback дані
            appData = fallbackData;
        }
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
    populateSelect('initiationBoard', appData.initiationBoardOptions);
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
    const bkValue = document.getElementById('bk').value;
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
        bk: bkValue === 'Інший' ? document.getElementById('customBk').value : bkValue,
        initiationBoard: document.getElementById('initiationBoard').value === 'Інший' ? document.getElementById('customInitiationBoard').value : document.getElementById('initiationBoard').value,
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
    
    // Генерація номера звіту
    const reportNumber = generateReportNumber(formData);
    formData.reportNumber = reportNumber;
    
    // Генерація звіту
    generateReport(formData);
    
    // Показати блок звіту
    reportOutput.classList.remove('hidden');
    reportOutput.scrollIntoView({ behavior: 'smooth' });
    
    // Зберегти кастомні опції користувача (якщо авторизований)
    console.log('🔍 Перевірка authFunctions:', window.authFunctions);
    if (window.authFunctions && typeof window.authFunctions.saveCustomOptionsFromForm === 'function') {
        console.log('🚀 Викликаємо saveCustomOptionsFromForm');
        window.authFunctions.saveCustomOptionsFromForm(formData).catch(error => {
            console.error('❌ Помилка збереження кастомних опцій:', error);
        });
    } else {
        console.warn('⚠️ authFunctions.saveCustomOptionsFromForm не знайдено');
    }
    
    // Зберегти звіт у Supabase (асинхронно, не блокуємо UI)
    if (window.supabaseFunctions && window.supabaseClient) {
        window.supabaseFunctions.saveReportToSupabase(formData).catch(error => {
            console.error('Не вдалося зберегти звіт:', error);
            // Не показуємо помилку користувачу, якщо збереження не вдалося
            // Звіт все одно буде доступний локально
        });
    }
    
    // Очистити збережені дані форми після успішної генерації
    if (typeof window.clearSavedFormState === 'function') {
        window.clearSavedFormState();
        console.log('[AutoSave] Збережені дані очищено після генерації звіту');
    }
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
    
    // Перевірка координат для "Інший" населений пункт
    const settlementSelect = document.getElementById('settlement');
    if (settlementSelect.value === 'Інший' && !data.coordinates) {
        errors.push('Для нового населеного пункту обов\'язково вкажіть координати');
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
    const reportNumber = generateReportNumber(data);
    const formattedDate = formatDate(data.date);
    const formattedTime = formatTime(data.time);
    
    const reportHTML = `
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
            <span class="report-value">Оптоволоконний кабель (${data.fiberLength} км)</span>
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
        
        ${data.initiationBoard ? `
        <div class="report-item">
            <span class="report-label">Плата Ініціації:</span>
            <span class="report-value">${data.initiationBoard}</span>
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
    `;
    
    reportContent.innerHTML = reportHTML;
}

// Функція генерації номера звіту на основі коду підрозділу та дати/часу
function generateReportNumber(data) {
    // Отримуємо код підрозділу
    let subdivisionCode = '';
    if (data.subdivision) {
        const subdivisionOption = appData.subdivisions.find(s => s.value === data.subdivision);
        if (subdivisionOption && subdivisionOption.code) {
            subdivisionCode = subdivisionOption.code;
        }
    }
    
    // Якщо немає коду, використовуємо "DR" за замовчуванням
    if (!subdivisionCode) {
        subdivisionCode = 'DR';
    }
    
    // Формуємо дату та час без розділових знаків
    let dateTimeString = '';
    if (data.date) {
        // Дата у форматі YYYY-MM-DD -> DDMMYYYY
        const dateParts = data.date.split('-');
        if (dateParts.length === 3) {
            dateTimeString = dateParts[2] + dateParts[1] + dateParts[0];
        }
    }
    
    if (data.time) {
        // Час у форматі HH:MM -> HHMM
        dateTimeString += data.time.replace(':', '');
    }
    
    // Якщо немає дати/часу, використовуємо поточні
    if (!dateTimeString) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        dateTimeString = day + month + year + hours + minutes;
    }
    
    // Формат: ПРЕФІКС + ДАТА/ЧАС (наприклад: ВБ211020251430)
    return `${subdivisionCode}${dateTimeString}`;
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
    const reportTitle = reportContent.querySelector('h3');
    
    let text = '';
    
    // Додаємо заголовок, якщо він є
    if (reportTitle) {
        text = reportTitle.textContent + '\n' + '='.repeat(reportTitle.textContent.length) + '\n\n';
    }
    
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
    
    // Генеруємо ім'я файлу на основі поточної дати
    const now = new Date();
    const fileName = `Звіт_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.txt`;
    
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
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
    const wrapper = document.getElementById('customSettlement').parentElement;
    const customSettlementInput = document.getElementById('customSettlement');
    const coordinatesInput = document.getElementById('coordinates');
    const coordinatesGroup = document.getElementById('coordinatesGroup');
    const coordinatesRequired = document.getElementById('coordinatesRequired');
    
    if (settlementSelect.value === 'Інший') {
        // Показати поле для введення назви
        wrapper.style.display = 'flex';
        customSettlementInput.required = true;
        
        // Зробити координати обов'язковими і виділити
        coordinatesInput.required = true;
        coordinatesInput.readOnly = false;
        coordinatesInput.value = '';
        coordinatesInput.placeholder = 'Введіть координати для нового населеного пункту...';
        coordinatesInput.style.backgroundColor = '#fffbe6';
        coordinatesInput.style.borderColor = '#ff9800';
        coordinatesRequired.style.display = 'inline';
        coordinatesGroup.style.backgroundColor = '#fffbe6';
        coordinatesGroup.style.padding = '8px';
        coordinatesGroup.style.borderRadius = '4px';
    } else if (settlementSelect.value === '') {
        // Якщо нічого не вибрано
        wrapper.style.display = 'none';
        customSettlementInput.required = false;
        customSettlementInput.value = '';
        customSettlementInput.setAttribute('data-save-option', 'false');
        
        coordinatesInput.required = false;
        coordinatesInput.readOnly = false;
        coordinatesInput.value = '';
        coordinatesInput.placeholder = 'Наприклад: 50.4501, 30.5234';
        coordinatesInput.style.backgroundColor = '';
        coordinatesInput.style.borderColor = '';
        coordinatesRequired.style.display = 'none';
        coordinatesGroup.style.backgroundColor = '';
        coordinatesGroup.style.padding = '';
        coordinatesGroup.style.borderRadius = '';
    } else {
        // Вибрано конкретне місто
        wrapper.style.display = 'none';
        customSettlementInput.required = false;
        customSettlementInput.value = '';
        customSettlementInput.setAttribute('data-save-option', 'false');
        
        // Координати не обов'язкові, але підставляються автоматично
        coordinatesInput.required = false;
        coordinatesRequired.style.display = 'none';
        coordinatesGroup.style.backgroundColor = '';
        coordinatesGroup.style.padding = '';
        coordinatesGroup.style.borderRadius = '';
        
        // Спочатку шукаємо в користувацьких опціях (з data-coordinates)
        const selectedOptionElement = settlementSelect.options[settlementSelect.selectedIndex];
        const customCoordinates = selectedOptionElement.getAttribute('data-coordinates');
        
        if (customCoordinates) {
            // Координати зі збереженої користувацької опції
            coordinatesInput.value = customCoordinates;
            coordinatesInput.readOnly = false;
            coordinatesInput.style.backgroundColor = '#f0f8ff';
            coordinatesInput.style.borderColor = '';
            coordinatesInput.placeholder = 'Координати з вашої збереженої опції (можна редагувати)';
        } else {
            // Автоматично підставити координати з appData (але дозволити редагування)
            const selectedOption = appData.settlementOptions.find(option => option.value === settlementSelect.value);
            if (selectedOption && selectedOption.coordinates) {
                coordinatesInput.value = selectedOption.coordinates;
                coordinatesInput.readOnly = false;
                coordinatesInput.style.backgroundColor = '#f0f8ff';
                coordinatesInput.style.borderColor = '';
                coordinatesInput.placeholder = 'Координати підставлені автоматично (можна редагувати)';
            } else {
                coordinatesInput.readOnly = false;
                coordinatesInput.value = '';
                coordinatesInput.style.backgroundColor = '';
                coordinatesInput.style.borderColor = '';
                coordinatesInput.placeholder = 'Наприклад: 50.4501, 30.5234';
            }
        }
    }
}

// Функція для показу/приховування поля ручного введення назви дрону
function toggleCustomDroneName() {
    const select = document.getElementById('droneName');
    const wrapper = document.getElementById('customDroneName').parentElement;
    const customInput = document.getElementById('customDroneName');
    
    if (select.value === 'Інший') {
        wrapper.style.display = 'flex';
        customInput.required = true;
    } else {
        wrapper.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
        customInput.setAttribute('data-save-option', 'false');
    }
}

// Функція для показу/приховування поля ручного введення розміру дрону
function toggleCustomDroneSize() {
    const select = document.getElementById('droneSize');
    const wrapper = document.getElementById('customDroneSize').parentElement;
    const customInput = document.getElementById('customDroneSize');
    
    if (select.value === 'Інший') {
        wrapper.style.display = 'flex';
        customInput.required = true;
    } else {
        wrapper.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
        customInput.setAttribute('data-save-option', 'false');
    }
}

// Функція для показу/приховування поля ручного введення типу цілі
function toggleCustomTargetType() {
    const select = document.getElementById('targetType');
    const wrapper = document.getElementById('customTargetType').parentElement;
    const customInput = document.getElementById('customTargetType');
    
    if (select.value === 'Інше') {
        wrapper.style.display = 'flex';
        customInput.required = true;
    } else {
        wrapper.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
        customInput.setAttribute('data-save-option', 'false');
    }
}

// Функція для показу/приховування поля ручного введення втрат
function toggleCustomLosses() {
    const select = document.getElementById('losses');
    const wrapper = document.getElementById('customLosses').parentElement;
    const customInput = document.getElementById('customLosses');
    
    if (select.value === 'Інше') {
        wrapper.style.display = 'flex';
        customInput.required = true;
    } else {
        wrapper.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
        customInput.setAttribute('data-save-option', 'false');
    }
}

// Функція для показу/приховування поля ручного введення оператора
function toggleCustomOperator() {
    const select = document.getElementById('operator');
    const wrapper = document.getElementById('customOperator').parentElement;
    const customInput = document.getElementById('customOperator');
    
    if (select.value === 'Інший') {
        wrapper.style.display = 'flex';
        customInput.required = true;
    } else {
        wrapper.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
        customInput.setAttribute('data-save-option', 'false');
    }
}

// Функція для показу/приховування поля ручного введення типу камери
function toggleCustomCameraType() {
    const select = document.getElementById('cameraType');
    const wrapper = document.getElementById('customCameraType').parentElement;
    const customInput = document.getElementById('customCameraType');
    
    if (select.value === 'Інша') {
        wrapper.style.display = 'flex';
        customInput.required = true;
    } else {
        wrapper.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
        customInput.setAttribute('data-save-option', 'false');
    }
}

// Функція для показу/приховування поля ручного введення частоти відео
function toggleCustomVideoFrequency() {
    const select = document.getElementById('videoFrequency');
    const wrapper = document.getElementById('customVideoFrequency').parentElement;
    const customInput = document.getElementById('customVideoFrequency');
    
    if (select.value === 'Інша') {
        wrapper.style.display = 'flex';
        customInput.required = true;
    } else {
        wrapper.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
        customInput.setAttribute('data-save-option', 'false');
    }
}

// Функція для показу/приховування поля ручного введення частоти керування
function toggleCustomControlFrequency() {
    const select = document.getElementById('controlFrequency');
    const wrapper = document.getElementById('customControlFrequency').parentElement;
    const customInput = document.getElementById('customControlFrequency');
    
    if (select.value === 'Інша') {
        wrapper.style.display = 'flex';
        customInput.required = true;
    } else {
        wrapper.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
        customInput.setAttribute('data-save-option', 'false');
    }
}

// Функція для показу/приховування поля ручного введення БК
function toggleCustomBk() {
    const select = document.getElementById('bk');
    const wrapper = document.getElementById('customBk').parentElement;
    const customInput = document.getElementById('customBk');
    
    if (select.value === 'Інший') {
        wrapper.style.display = 'flex';
        customInput.required = true;
    } else {
        wrapper.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
        customInput.setAttribute('data-save-option', 'false');
    }
}

// Функція для показу/приховування поля ручного введення Плати Ініціації
function toggleCustomInitiationBoard() {
    const select = document.getElementById('initiationBoard');
    const wrapper = document.getElementById('customInitiationBoard').parentElement;
    const customInput = document.getElementById('customInitiationBoard');
    
    if (select.value === 'Інший') {
        wrapper.style.display = 'flex';
        customInput.required = true;
    } else {
        wrapper.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
        customInput.setAttribute('data-save-option', 'false');
    }
}

// Функція для показу/приховування поля ручного введення статусу
function toggleCustomStatus() {
    const select = document.getElementById('status');
    const wrapper = document.getElementById('customStatus').parentElement;
    const customInput = document.getElementById('customStatus');
    
    if (select.value === 'Інший') {
        wrapper.style.display = 'flex';
        customInput.required = true;
    } else {
        wrapper.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
        customInput.setAttribute('data-save-option', 'false');
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
    const wrapper = document.getElementById('customReason').parentElement;
    const customInput = document.getElementById('customReason');
    
    if (select.value === 'Інша') {
        wrapper.style.display = 'flex';
        customInput.required = true;
    } else {
        wrapper.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
        customInput.setAttribute('data-save-option', 'false');
    }
}

// Функція для показу/приховування поля ручного введення підрозділу
function toggleCustomSubdivision() {
    const select = document.getElementById('subdivision');
    const wrapper = document.getElementById('customSubdivision').parentElement;
    const customInput = document.getElementById('customSubdivision');
    
    if (select.value === 'Інший') {
        wrapper.style.display = 'flex';
        customInput.required = true;
    } else {
        wrapper.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
        customInput.setAttribute('data-save-option', 'false');
    }
}

// Функція для показу/приховування поля ручного введення сумісно з
function toggleCustomJointWith() {
    const select = document.getElementById('jointWith');
    const wrapper = document.getElementById('customJointWith').parentElement;
    const customInput = document.getElementById('customJointWith');
    
    if (select.value === 'Інший') {
        wrapper.style.display = 'flex';
        customInput.required = false; // Поле не обов'язкове
    } else {
        wrapper.style.display = 'none';
        customInput.required = false;
        customInput.value = '';
        customInput.setAttribute('data-save-option', 'false');
    }
}

// Функція для перемикання збереження кастомної опції
async function toggleSaveOption(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('.save-icon');
    
    const currentValue = input.getAttribute('data-save-option');
    const newValue = currentValue === 'true' ? 'false' : 'true';
    
    // Якщо користувач хоче зберегти - зберігаємо відразу
    if (newValue === 'true') {
        const customValue = input.value.trim();
        
        if (!customValue) {
            alert('⚠️ Спочатку введіть значення');
            return;
        }
        
        // Визначаємо тип опції за ID інпута
        const optionTypeMap = {
            'customSubdivision': { type: 'subdivisions', label: 'Підрозділ' },
            'customJointWith': { type: 'jointWithOptions', label: 'Сумісно з' },
            'customDroneName': { type: 'droneNames', label: 'Назва дрону' },
            'customDroneSize': { type: 'droneSizes', label: 'Розмір дрону' },
            'customCameraType': { type: 'cameraTypes', label: 'Тип камери' },
            'customVideoFrequency': { type: 'videoFrequencies', label: 'Частота відео' },
            'customControlFrequency': { type: 'controlFrequencies', label: 'Частота керування' },
            'customBk': { type: 'bkOptions', label: 'БК' },
            'customInitiationBoard': { type: 'initiationBoardOptions', label: 'Плата ініціації' },
            'customTargetType': { type: 'targetTypeOptions', label: 'Тип цілі' },
            'customSettlement': { type: 'settlementOptions', label: 'Населений пункт' },
            'customStatus': { type: 'statusOptions', label: 'Статус' },
            'customReason': { type: 'reasonOptions', label: 'Причина' },
            'customLosses': { type: 'lossOptions', label: 'Втрати' },
            'customOperator': { type: 'operatorOptions', label: 'Оператор' }
        };
        
        const optionInfo = optionTypeMap[inputId];
        if (!optionInfo) {
            console.error('❌ Невідомий тип опції:', inputId);
            return;
        }
        
        // Для населеного пункту беремо координати
        let coordinates = null;
        if (inputId === 'customSettlement') {
            const coordinatesInput = document.getElementById('coordinates');
            if (coordinatesInput && coordinatesInput.value.trim()) {
                coordinates = coordinatesInput.value.trim();
            } else {
                alert('⚠️ Для нового населеного пункту потрібно вказати координати');
                return;
            }
        }
        
        // Зберігаємо через auth.js
        if (window.authFunctions && window.authFunctions.saveUserCustomOption) {
            button.disabled = true;
            icon.textContent = '⏳';
            
            const success = await window.authFunctions.saveUserCustomOption(
                optionInfo.type, 
                customValue, 
                customValue,
                coordinates
            );
            
            if (success) {
                input.setAttribute('data-save-option', 'true');
                button.classList.add('active');
                icon.textContent = '✅';
                
                // Додати до селекта
                await addSavedOptionToSelect(inputId, customValue, coordinates);
                
                console.log(`✅ Збережено: ${optionInfo.label} = "${customValue}"`);
            } else {
                icon.textContent = '💾';
                alert('❌ Помилка збереження. Перевірте підключення до Supabase.');
            }
            
            button.disabled = false;
        } else {
            alert('⚠️ Для збереження потрібно увійти в систему');
        }
    } else {
        // Скасування збереження
        input.setAttribute('data-save-option', 'false');
        button.classList.remove('active');
        icon.textContent = '💾';
    }
}

// Функція для додавання збереженої опції до селекта
async function addSavedOptionToSelect(inputId, value, coordinates = null) {
    const selectMap = {
        'customSubdivision': 'subdivision',
        'customJointWith': 'jointWith',
        'customDroneName': 'droneName',
        'customDroneSize': 'droneSize',
        'customCameraType': 'cameraType',
        'customVideoFrequency': 'videoFrequency',
        'customControlFrequency': 'controlFrequency',
        'customBk': 'bk',
        'customInitiationBoard': 'initiationBoard',
        'customTargetType': 'targetType',
        'customSettlement': 'settlement',
        'customStatus': 'status',
        'customReason': 'reason',
        'customLosses': 'losses',
        'customOperator': 'operator'
    };
    
    const selectId = selectMap[inputId];
    if (!selectId) return;
    
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // Перевірити чи вже є така опція
    const exists = Array.from(select.options).some(opt => opt.value === value);
    if (exists) return;
    
    // Знайти опцію "Інший" та вставити перед нею
    const otherOption = Array.from(select.options).find(opt => 
        opt.value === 'Інший' || opt.value === 'Інша' || opt.value === 'Інше'
    );
    
    const option = document.createElement('option');
    option.value = value;
    option.setAttribute('data-user-option', 'true');
    option.setAttribute('data-select-id', selectId);
    option.setAttribute('data-label', value);
    
    // Завжди тільки іконка користувача (окрема кнопка для видалення)
    option.textContent = '👤 ' + value;
    
    if (coordinates) {
        option.setAttribute('data-coordinates', coordinates);
    }
    
    if (otherOption) {
        select.insertBefore(option, otherOption);
    } else {
        select.appendChild(option);
    }
    
    // Вибрати нову опцію
    select.value = value;
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

// Розширений режим - показ кнопок видалення та полів "Інше"
document.addEventListener('DOMContentLoaded', function() {
    const advancedModeSwitch = document.getElementById('advancedModeSwitch');
    const appSection = document.getElementById('appSection');
    
    if (advancedModeSwitch && appSection) {
        advancedModeSwitch.addEventListener('change', function() {
            if (this.checked) {
                appSection.classList.add('advanced-mode');
                updateUserOptionsText(true);
                showCustomInputs(true);
            } else {
                appSection.classList.remove('advanced-mode');
                updateUserOptionsText(false);
                showCustomInputs(false);
            }
            // Оновити стан кнопок видалення
            updateDeleteButtons();
        });
        
        // Початково приховати custom inputs якщо режим вимкнений
        if (!advancedModeSwitch.checked) {
            showCustomInputs(false);
        }
    }
    
    // Додати обробники для всіх селектів
    setupDeleteButtons();
});

// Показати/приховати всі поля "Інше" та їх кнопки збереження
function showCustomInputs(show) {
    // Знайти всі custom-input-wrapper (обгортки з полями "Інше" та кнопками 💾)
    const customWrappers = document.querySelectorAll('.custom-input-wrapper');
    customWrappers.forEach(wrapper => {
        wrapper.style.display = show ? 'flex' : 'none';
    });
    
    // Приховати/показати опції "Інший/Інша/Інше" в селектах
    const allSelects = document.querySelectorAll('select');
    allSelects.forEach(select => {
        const options = Array.from(select.options);
        options.forEach(option => {
            if (option.value === 'Інший' || option.value === 'Інша' || option.value === 'Інше') {
                option.style.display = show ? '' : 'none';
                option.disabled = !show;
            }
        });
        
        // Якщо ховаємо і вибрана опція "Інше" - скинути на перший елемент
        if (!show) {
            const selectedOption = select.options[select.selectedIndex];
            if (selectedOption && (selectedOption.value === 'Інший' || selectedOption.value === 'Інша' || selectedOption.value === 'Інше')) {
                select.selectedIndex = 0;
            }
        }
    });
}

// Експортувати для використання з auth.js
window.showCustomInputs = showCustomInputs;

// Оновлення тексту користувацьких опцій (тільки іконка користувача)
function updateUserOptionsText(showDelete) {
    const allSelects = document.querySelectorAll('select');
    allSelects.forEach(select => {
        const userOptions = select.querySelectorAll('option[data-user-option="true"]');
        userOptions.forEach(option => {
            const label = option.getAttribute('data-label');
            if (label) {
                // Завжди тільки 👤, бо окрема кнопка видалення
                option.textContent = '👤 ' + label;
            }
        });
    });
}

// Налаштування кнопок видалення для всіх селектів
function setupDeleteButtons() {
    const selectIds = [
        'subdivision', 'jointWith', 'droneName', 'droneSize', 'cameraType',
        'videoFrequency', 'controlFrequency', 'bk', 'initiationBoard',
        'targetType', 'settlement', 'status', 'reason', 'losses', 'operator'
    ];
    
    selectIds.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        // Перевірити чи вже обгорнутий
        if (select.parentElement.classList.contains('select-with-delete')) {
            return;
        }
        
        // Обгортка для селекта
        const wrapper = document.createElement('div');
        wrapper.className = 'select-with-delete';
        select.parentNode.insertBefore(wrapper, select);
        wrapper.appendChild(select);
        
        // Додати кнопку видалення в обгортку (клац на іконці видаляє, на тексті селект працює як зазвичай)
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-icon';
        deleteBtn.title = 'Видалити збережену опцію';
        deleteBtn.textContent = '🗑️';
        // Прихована за замовчуванням
        deleteBtn.style.display = 'none';
        // Не дозволяти кнопці знімати фокус селекта при кліку
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.border = 'none';
        deleteBtn.style.background = 'transparent';
        deleteBtn.style.padding = '0 6px';
        deleteBtn.style.fontSize = '16px';

        // Клік по іконці - видалити опцію (з підтвердженням)
        deleteBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const selectedOption = select.options[select.selectedIndex];
            if (!selectedOption || selectedOption.getAttribute('data-user-option') !== 'true') return;
            const optionValue = selectedOption.value;
            const optionLabel = selectedOption.getAttribute('data-label') || optionValue;
            if (!confirm(`Видалити збережену опцію "${optionLabel}"?`)) return;
            deleteCustomOption(selectId, optionValue);
            // скинути вибір
            select.selectedIndex = 0;
            // оновити стан кнопки
            updateDeleteBtnVisibility();
        });

        wrapper.appendChild(deleteBtn);

        // Оновлення видимості кнопки видалення
        function updateDeleteBtnVisibility() {
            const advancedMode = document.getElementById('advancedModeSwitch');
            const selectedOption = select.options[select.selectedIndex];
            if (advancedMode && advancedMode.checked && selectedOption && selectedOption.getAttribute('data-user-option') === 'true') {
                deleteBtn.style.display = 'inline-flex';
            } else {
                deleteBtn.style.display = 'none';
            }
        }

        // Початкове оновлення та реакція на зміну
        updateDeleteBtnVisibility();
        select.addEventListener('change', () => setTimeout(updateDeleteBtnVisibility, 0));

        // Додати контекстне меню для швидкого видалення (правий клік - без підтвердження)
        select.addEventListener('contextmenu', (e) => {
            const advancedMode = document.getElementById('advancedModeSwitch');
            if (!advancedMode || !advancedMode.checked) return;

            const selectedOption = select.options[select.selectedIndex];
            if (selectedOption && selectedOption.getAttribute('data-user-option') === 'true') {
                e.preventDefault();
                // Швидке видалення без додаткового підтвердження
                const optionValue = selectedOption.value;
                deleteCustomOption(selectId, optionValue);
                select.selectedIndex = 0;
                updateDeleteBtnVisibility();
            }
        });
    });
}

// Оновлення всіх кнопок видалення (заглушка для сумісності)
function updateDeleteButtons() {
    // Більше не потрібно - іконки відображаються через CSS
}

// Обробка видалення вибраної опції
async function handleDeleteSelectedOption(selectId) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    const selectedOption = select.options[select.selectedIndex];
    if (!selectedOption || selectedOption.getAttribute('data-user-option') !== 'true') {
        return;
    }
    
    const optionLabel = selectedOption.getAttribute('data-label') || selectedOption.value;
    
    // Підтвердження видалення
    if (!confirm(`Видалити збережену опцію "${optionLabel}"?`)) {
        // Якщо користувач скасував - скинути вибір
        select.selectedIndex = 0;
        return;
    }
    
    const optionValue = selectedOption.value;
    await deleteCustomOption(selectId, optionValue);
    
    // Скинути вибір на перший елемент
    select.selectedIndex = 0;
}

// Функція видалення користувацької опції
async function deleteCustomOption(selectId, optionValue) {
    const optionTypeMap = {
        'subdivision': 'subdivisions',
        'jointWith': 'jointWithOptions',
        'droneName': 'droneNames',
        'droneSize': 'droneSizes',
        'cameraType': 'cameraTypes',
        'videoFrequency': 'videoFrequencies',
        'controlFrequency': 'controlFrequencies',
        'bk': 'bkOptions',
        'initiationBoard': 'initiationBoardOptions',
        'targetType': 'targetTypeOptions',
        'settlement': 'settlementOptions',
        'status': 'statusOptions',
        'reason': 'reasonOptions',
        'losses': 'lossOptions',
        'operator': 'operatorOptions'
    };
    
    const optionType = optionTypeMap[selectId];
    if (!optionType) {
        console.error('❌ Невідомий тип опції:', selectId);
        return;
    }
    
    if (window.authFunctions && window.authFunctions.deleteUserCustomOption) {
        const success = await window.authFunctions.deleteUserCustomOption(optionType, optionValue);
        
        if (success) {
            // Видалити опцію з селекта
            const select = document.getElementById(selectId);
            if (select) {
                const option = Array.from(select.options).find(opt => opt.value === optionValue);
                if (option) {
                    option.remove();
                }
            }
            
            console.log(`✅ Видалено опцію: ${optionValue}`);
        } else {
            alert('❌ Помилка видалення опції');
        }
    }
}

// Експорт функцій для використання в auth.js
window.scriptFunctions = {
    setupDeleteButtons,
    updateDeleteButtons
};