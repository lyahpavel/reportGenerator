// Функції для роботи з поданням

// Глобальна змінна для поточного подання
let currentSubmission = null;
let submissionLoaded = false; // Прапорець завершення завантаження

// Зберігання обробників подій для уникнення дублювання
let droneButtonHandler = null;
let bkButtonHandler = null;
let submissionFormHandler = null;
let shareButtonHandler = null;

// Кеш для даних з БД (щоб не завантажувати кожен раз)
let optionsCache = {
    droneTypes: null,
    videoFrequencies: null,
    controlFrequencies: null,
    channels: null,
    modifications: null,
    droneNames: null,
    bkOptions: null,
    operators: null
};

// Флаг для відстеження завантаження кешу
let cacheLoaded = false;
let cachePromise = null;

// Ініціалізація секції подання
async function initSubmission() {
    const submissionForm = document.getElementById('submissionForm');
    const dronesContainer = document.getElementById('dronesContainer');
    const bkContainer = document.getElementById('bkContainer');
    const shareSubmissionBtn = document.getElementById('shareSubmission');
    
    if (!submissionForm) return;
    
    // Почекати поки Supabase буде готовий і користувач авторизується
    let attempts = 0;
    while ((!window.supabaseClient || !window.currentUser) && attempts < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }
    
    if (!window.supabaseClient) {
        console.error('Supabase клієнт не ініціалізовано після очікування');
        return;
    }
    
    if (!window.currentUser) {
        console.warn('Користувач не авторизований, очікуємо авторизації...');
        // Не завантажуємо дані, поки користувач не авторизується
        return;
    }
    
    console.log('✅ Supabase готовий, користувач авторизований, ініціалізуємо подання');
    
    // Спочатку завантажити всі опції в кеш
    await preloadOptionsCache();
    
    // Тепер завантажити операторів з кешу
    await loadCrewMembers();
    
    // Завантажити поточне подання (встановить submissionLoaded всередині)
    await loadCurrentSubmission();
    
    // Видалити старі обробники перед додаванням нових
    if (droneButtonHandler && dronesContainer) {
        dronesContainer.removeEventListener('click', droneButtonHandler);
    }
    if (bkButtonHandler && bkContainer) {
        bkContainer.removeEventListener('click', bkButtonHandler);
    }
    if (submissionFormHandler && submissionForm) {
        submissionForm.removeEventListener('submit', submissionFormHandler);
    }
    if (shareButtonHandler && shareSubmissionBtn) {
        shareSubmissionBtn.removeEventListener('click', shareButtonHandler);
    }
    
    // Створити нові обробники
    droneButtonHandler = (e) => {
        console.log('Клік в dronesContainer:', e.target);
        if (e.target.id === 'addDroneBtn' || e.target.closest('#addDroneBtn')) {
            console.log('Додаємо дрон');
            e.preventDefault();
            e.stopPropagation();
            addResourceRow('drone');
        }
    };
    
    bkButtonHandler = (e) => {
        console.log('Клік в bkContainer:', e.target);
        if (e.target.id === 'addBkBtn' || e.target.closest('#addBkBtn')) {
            console.log('Додаємо БК');
            e.preventDefault();
            e.stopPropagation();
            addResourceRow('bk');
        }
    };
    
    submissionFormHandler = async (e) => {
        e.preventDefault();
        await saveSubmission();
    };
    
    shareButtonHandler = () => shareSubmission();
    
    // Додати обробники подій
    if (dronesContainer) {
        dronesContainer.addEventListener('click', droneButtonHandler);
    }
    
    if (bkContainer) {
        bkContainer.addEventListener('click', bkButtonHandler);
    }
    
    if (submissionForm) {
        submissionForm.addEventListener('submit', submissionFormHandler);
    }
    
    if (shareSubmissionBtn) {
        shareSubmissionBtn.addEventListener('click', shareButtonHandler);
    }
    
    // Встановити дату з сьогодні
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dutyDateFrom').value = today;
}

// Функція для попереднього завантаження всіх опцій в кеш
async function preloadOptionsCache() {
    // Якщо кеш вже завантажується, повернути існуючий проміс
    if (cachePromise) return cachePromise;
    
    // Якщо кеш вже завантажений, не завантажувати знову
    if (cacheLoaded) return Promise.resolve();
    
    cachePromise = (async () => {
        try {
            const { data: { user } } = await window.supabaseClient.auth.getUser();
            if (!user) return;
            
            console.log('⏳ Завантаження опцій в кеш...');
        
        // Завантажити всі опції паралельно
        const [
            droneTypesData,
            videoFreqData,
            controlFreqData,
            channelsData,
            modificationsData,
            droneNamesData,
            bkOptionsData,
            operatorsData
        ] = await Promise.all([
            window.supabaseClient.from('user_custom_options').select('value, label').eq('option_type', 'cameraType').eq('user_id', user.id).order('label'),
            window.supabaseClient.from('user_custom_options').select('value, label').eq('option_type', 'videoFrequency').eq('user_id', user.id).order('label'),
            window.supabaseClient.from('user_custom_options').select('value, label').eq('option_type', 'controlFrequency').eq('user_id', user.id).order('label'),
            window.supabaseClient.from('user_custom_options').select('value, label').eq('option_type', 'channels').eq('user_id', user.id).order('label'),
            window.supabaseClient.from('user_custom_options').select('value, label').eq('option_type', 'modifications').eq('user_id', user.id).order('label'),
            window.supabaseClient.from('user_custom_options').select('value, label').eq('option_type', 'droneName').eq('user_id', user.id).order('label'),
            window.supabaseClient.from('user_custom_options').select('value, label').eq('option_type', 'bkOptions').eq('user_id', user.id).order('label'),
            window.supabaseClient.from('user_custom_options').select('value, label').eq('option_type', 'operator').eq('user_id', user.id).order('label')
        ]);
        
        // Зберегти в кеш
        optionsCache.droneTypes = droneTypesData.data || [];
        optionsCache.videoFrequencies = videoFreqData.data || [];
        optionsCache.controlFrequencies = controlFreqData.data || [];
        optionsCache.channels = channelsData.data || [];
        optionsCache.modifications = modificationsData.data || [];
        optionsCache.droneNames = droneNamesData.data || [];
        optionsCache.bkOptions = bkOptionsData.data || [];
        optionsCache.operators = operatorsData.data || [];
        
        console.log('✅ Кеш завантажено:', {
            типи: optionsCache.droneTypes.length,
            відео: optionsCache.videoFrequencies.length,
            керування: optionsCache.controlFrequencies.length,
            канали: optionsCache.channels.length,
            модифікації: optionsCache.modifications.length,
            дрони: optionsCache.droneNames.length,
            БК: optionsCache.bkOptions.length,
            оператори: optionsCache.operators.length
        });
        
        cacheLoaded = true;
        
    } catch (error) {
        console.error('❌ Помилка завантаження кешу:', error);
    }
    })();
    
    return cachePromise;
}

// Функція для очікування завантаження кешу
async function waitForCache() {
    if (cacheLoaded) return;
    if (cachePromise) return cachePromise;
    return preloadOptionsCache();
}

// Функція для очікування завершення завантаження подання
async function waitForSubmissionLoad() {
    if (submissionLoaded) return;
    
    let attempts = 0;
    while (!submissionLoaded && attempts < 100) {
        await new Promise(resolve => setTimeout(resolve, 50));
        attempts++;
    }
}

// Завантаження операторів для екіпажу (чекбокси)
// Функція для оновлення відображення старшого екіпажу
function updateCrewLeaderIndication() {
    // Спочатку прибираємо клас від всіх лейблів
    document.querySelectorAll('.crew-name-label').forEach(label => {
        label.classList.remove('crew-leader');
    });
    
    // Додаємо клас до вибраного лідера
    const selectedRadio = document.querySelector('.crew-leader-input:checked');
    if (selectedRadio) {
        const leaderLabel = document.querySelector(`label[for="crew-${selectedRadio.value}"]`);
        if (leaderLabel) {
            leaderLabel.classList.add('crew-leader');
        }
    }
}

async function loadCrewMembers() {
    const crewContainer = document.getElementById('crewMembers');
    if (!crewContainer) return;
    
    try {
        // Використовуємо кеш
        const data = optionsCache.operators || [];
        
        crewContainer.innerHTML = '';
        data.forEach(operator => {
            const crewItem = document.createElement('div');
            crewItem.className = 'crew-member-item';
            
            // Чекбокс для участі в екіпажі
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'crewMember';
            checkbox.value = operator.value;
            checkbox.className = 'crew-checkbox';
            checkbox.id = `crew-${operator.value}`;
            
            const checkboxLabel = document.createElement('label');
            checkboxLabel.htmlFor = `crew-${operator.value}`;
            checkboxLabel.textContent = operator.label;
            checkboxLabel.className = 'crew-name-label';
            
            // Радіобатон для старшого екіпажу
            const radioWrapper = document.createElement('span');
            radioWrapper.className = 'crew-leader-radio';
            
            const radio = document.createElement('input');
            radio.type = 'radio';
            radio.name = 'crewLeader';
            radio.value = operator.value;
            radio.className = 'crew-leader-input';
            radio.disabled = true; // Спочатку заблокований
            
            const radioLabel = document.createElement('label');
            radioLabel.textContent = 'Старший';
            radioLabel.className = 'crew-leader-label';
            
            // Коли чекбокс змінюється, вмикаємо/вимикаємо радіобатон
            checkbox.addEventListener('change', () => {
                radio.disabled = !checkbox.checked;
                if (!checkbox.checked && radio.checked) {
                    radio.checked = false;
                    updateCrewLeaderIndication(); // Оновити відображення старшого
                }
            });
            
            // Коли радіобатон змінюється, оновлюємо відображення старшого
            radio.addEventListener('change', () => {
                updateCrewLeaderIndication();
            });
            
            radioWrapper.appendChild(radio);
            radioWrapper.appendChild(radioLabel);
            
            crewItem.appendChild(checkbox);
            crewItem.appendChild(checkboxLabel);
            crewItem.appendChild(radioWrapper);
            crewContainer.appendChild(crewItem);
        });
        
    } catch (error) {
        console.error('Помилка завантаження операторів:', error);
        crewContainer.innerHTML = '<p class="error-text">Помилка завантаження операторів</p>';
    }
}

// Додавання рядка ресурсу (дрон або БК)
async function addResourceRow(type) {
    console.log('addResourceRow викликано для:', type);
    
    const container = document.getElementById(type === 'drone' ? 'dronesContainer' : 'bkContainer');
    if (!container) {
        console.error('Контейнер не знайдено:', type);
        return;
    }
    
    const button = container.querySelector('button');
    if (!button) {
        console.error('Кнопка не знайдена в контейнері:', type);
        return;
    }
    
    const resourceItem = document.createElement('div');
    resourceItem.className = 'resource-item';
    resourceItem.dataset.type = type;
    
    const selectId = `${type}_${Date.now()}`;
    
    // Для дронів - розширена структура з додатковими полями
    if (type === 'drone') {
        console.log('Створюємо HTML для дрона');
        resourceItem.innerHTML = `
            <div class="drone-main-row">
                <div class="resource-select">
                    <select id="${selectId}" class="form-control" required>
                        <option value="">Завантаження...</option>
                    </select>
                </div>
                <div class="resource-count">
                    <button type="button" class="count-btn minus">−</button>
                    <input type="number" class="count-input" value="1" min="1" max="999" required>
                    <button type="button" class="count-btn plus">+</button>
                </div>
                <button type="button" class="remove-resource-btn" title="Видалити">✕</button>
            </div>
            <div class="drone-details">
                <div class="drone-field">
                    <label>Тип</label>
                    <select class="drone-type form-control" required>
                        <option value="">Завантаження...</option>
                    </select>
                </div>
                <div class="drone-field">
                    <label>
                        <input type="checkbox" class="drone-fiber-optic-checkbox" style="margin-right: 8px;">
                        Оптоволокно
                    </label>
                </div>
                <div class="drone-field fiber-cable-length-field" style="display: none;">
                    <label>Довжина кабелю (км)</label>
                    <input type="number" class="drone-fiber-cable-length form-control" min="0" step="0.1" placeholder="Введіть довжину">
                </div>
                <div class="drone-field freq-field">
                    <label>Частота відео</label>
                    <select class="drone-video-freq form-control" required>
                        <option value="">Завантаження...</option>
                    </select>
                </div>
                <div class="drone-field freq-field">
                    <label>Частота керування</label>
                    <select class="drone-control-freq form-control" required>
                        <option value="">Завантаження...</option>
                    </select>
                </div>
                <div class="drone-field channel-field">
                    <label>Канал</label>
                    <select class="drone-channel form-control" multiple>
                        <option value="">Завантаження...</option>
                    </select>
                </div>
                <div class="drone-field">
                    <label>Стан</label>
                    <select class="drone-modification-status form-control" required>
                        <option value="">Оберіть стан</option>
                        <option value="factory">Заводський</option>
                        <option value="modified">Модифікований</option>
                    </select>
                </div>
                <div class="drone-field modification-details-field" style="display: none;">
                    <label>Модифікації</label>
                    <select class="drone-modification form-control" multiple>
                        <option value="">Завантаження...</option>
                    </select>
                </div>
            </div>
        `;
        console.log('HTML дрона створено');
        console.log('drone-details елемент:', resourceItem.querySelector('.drone-details'));
        console.log('drone-main-row елемент:', resourceItem.querySelector('.drone-main-row'));
    } else {
        // Для БК - проста структура
        console.log('Створюємо HTML для БК');
        resourceItem.innerHTML = `
            <div class="resource-select">
                <select id="${selectId}" class="form-control" required>
                    <option value="">Завантаження...</option>
                </select>
            </div>
            <div class="resource-count">
                <button type="button" class="count-btn minus">−</button>
                <input type="number" class="count-input" value="1" min="1" max="999" required>
                <button type="button" class="count-btn plus">+</button>
            </div>
            <button type="button" class="remove-resource-btn" title="Видалити">✕</button>
        `;
    }
    
    // Завжди додаємо елемент, а потім переміщуємо кнопку в кінець
    container.appendChild(resourceItem);
    console.log('Елемент додано в DOM');
    
    // Переміщуємо кнопку "Додати" в самий кінець
    if (button && button.parentNode === container) {
        container.appendChild(button);
    }
    
    console.log('Елемент додано, кнопка переміщена в кінець');
    
    // Завантажити опції
    loadResourceOptions(selectId, type);
    
    // Якщо це дрон, завантажити додаткові опції
    if (type === 'drone') {
        // Завантажити всі дані спочатку
        await Promise.all([
            loadDroneTypes(resourceItem),
            loadDroneFrequencies(resourceItem),
            loadDroneChannels(resourceItem),
            loadDroneModifications(resourceItem)
        ]);
        
        // Тепер ініціалізувати мультиселекти після завантаження даних
        setTimeout(() => {
            const channelSelect = resourceItem.querySelector('.drone-channel');
            const modSelect = resourceItem.querySelector('.drone-modification');
            
            console.log('🔍 Перевірка мультиселектів:');
            console.log('  window.initCustomMultiSelect існує?', typeof window.initCustomMultiSelect);
            console.log('  channelSelect:', channelSelect, 'ID:', channelSelect?.id);
            console.log('  modSelect:', modSelect, 'ID:', modSelect?.id);
            
            if (channelSelect && channelSelect.id) {
                if (window.initCustomMultiSelect) {
                    try {
                        window.initCustomMultiSelect(`#${channelSelect.id}`, {
                            multiple: true,
                            placeholder: 'Оберіть канали...'
                        });
                        console.log('✅ Мультиселект каналів ініціалізовано:', channelSelect.id);
                    } catch (e) {
                        console.error('❌ Помилка ініціалізації каналів:', e);
                    }
                } else {
                    console.error('❌ window.initCustomMultiSelect не знайдено!');
                }
            }
            
            if (modSelect && modSelect.id) {
                if (window.initCustomMultiSelect) {
                    try {
                        window.initCustomMultiSelect(`#${modSelect.id}`, {
                            multiple: true,
                            placeholder: 'Оберіть модифікації...'
                        });
                        console.log('✅ Мультиселект модифікацій ініціалізовано:', modSelect.id);
                    } catch (e) {
                        console.error('❌ Помилка ініціалізації модифікацій:', e);
                    }
                } else {
                    console.error('❌ window.initCustomMultiSelect не знайдено!');
                }
            }
        }, 200);
        
        // Показати/сховати поле модифікації залежно від статусу
        const modStatusSelect = resourceItem.querySelector('.drone-modification-status');
        const modDetailsField = resourceItem.querySelector('.modification-details-field');
        
        modStatusSelect.addEventListener('change', () => {
            if (modStatusSelect.value === 'modified') {
                modDetailsField.style.display = 'block';
            } else {
                modDetailsField.style.display = 'none';
            }
        });
        
        // Логіка для оптоволокна
        const fiberCheckbox = resourceItem.querySelector('.drone-fiber-optic-checkbox');
        const fiberCableLengthField = resourceItem.querySelector('.fiber-cable-length-field');
        const freqFields = resourceItem.querySelectorAll('.freq-field');
        const channelField = resourceItem.querySelector('.channel-field');
        const fiberCableLengthInput = resourceItem.querySelector('.drone-fiber-cable-length');
        const videoFreqSelect = resourceItem.querySelector('.drone-video-freq');
        const controlFreqSelect = resourceItem.querySelector('.drone-control-freq');
        const channelSelect = resourceItem.querySelector('.drone-channel');
        
        fiberCheckbox.addEventListener('change', () => {
            if (fiberCheckbox.checked) {
                // Показати поле довжини кабелю
                fiberCableLengthField.style.display = 'block';
                fiberCableLengthInput.required = true;
                
                // Сховати частоти та канал
                freqFields.forEach(field => field.style.display = 'none');
                channelField.style.display = 'none';
                
                // Зняти required з прихованих полів
                videoFreqSelect.required = false;
                controlFreqSelect.required = false;
            } else {
                // Сховати поле довжини кабелю
                fiberCableLengthField.style.display = 'none';
                fiberCableLengthInput.required = false;
                fiberCableLengthInput.value = '';
                
                // Показати частоти та канал
                freqFields.forEach(field => field.style.display = 'block');
                channelField.style.display = 'block';
                
                // Встановити required для частот
                videoFreqSelect.required = true;
                controlFreqSelect.required = true;
            }
        });
    }
    
    // Обробники кнопок
    const minusBtn = resourceItem.querySelector('.minus');
    const plusBtn = resourceItem.querySelector('.plus');
    const countInput = resourceItem.querySelector('.count-input');
    const removeBtn = resourceItem.querySelector('.remove-resource-btn');
    
    minusBtn.addEventListener('click', () => {
        const currentValue = parseInt(countInput.value) || 1;
        if (currentValue > 1) {
            countInput.value = currentValue - 1;
        }
    });
    
    plusBtn.addEventListener('click', () => {
        const currentValue = parseInt(countInput.value) || 1;
        if (currentValue < 999) {
            countInput.value = currentValue + 1;
        }
    });
    
    removeBtn.addEventListener('click', () => {
        resourceItem.remove();
    });
}

// Завантаження опцій для ресурсів
async function loadResourceOptions(selectId, type) {
    const select = document.getElementById(selectId);
    if (!select) return;

    try {
        // Використовуємо кеш
        const data = type === 'drone' ? (optionsCache.droneNames || []) : (optionsCache.bkOptions || []);

        select.innerHTML = '<option value="">Оберіть...</option>';
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value;
            option.textContent = item.label;
            select.appendChild(option);
        });

        console.log(`Опції завантажені з кешу (${type}):`, data.length);

        // Додаємо обробник зміни для дронів
        if (type === 'drone') {
            select.addEventListener('change', () => {
                autoFillDroneFields(select);
            });
        }

    } catch (error) {
        console.error(`Помилка завантаження опцій (${type}):`, error);
        select.innerHTML = '<option value="">Помилка завантаження</option>';
    }
}// Автозаповнення полів дрона при виборі
function autoFillDroneFields(select) {
    const selectedValue = select.value;
    if (!selectedValue || !currentSubmission || !currentSubmission.drones) return;

    const resourceItem = select.closest('.resource-item');
    if (!resourceItem) return;

    // Знаходимо вибраний дрон в поточному поданні
    const selectedDrone = currentSubmission.drones.find(drone => (drone.name || drone.label) === selectedValue);
    if (!selectedDrone) return;

    // Заповнюємо поля
    const typeSelect = resourceItem.querySelector('.drone-type');
    const fiberCheckbox = resourceItem.querySelector('.drone-fiber-optic-checkbox');
    const fiberCableLengthInput = resourceItem.querySelector('.drone-fiber-cable-length');
    const videoFreqSelect = resourceItem.querySelector('.drone-video-freq');
    const controlFreqSelect = resourceItem.querySelector('.drone-control-freq');
    const channelSelect = resourceItem.querySelector('.drone-channel');
    const statusSelect = resourceItem.querySelector('.drone-modification-status');
    const modificationSelect = resourceItem.querySelector('.drone-modification');

    if (typeSelect && selectedDrone.type) {
        typeSelect.value = selectedDrone.type;
    }

    // Встановлюємо статус оптоволокна
    if (fiberCheckbox && selectedDrone.hasFiberOptic) {
        fiberCheckbox.checked = true;
        // Trigger change event to update visibility
        fiberCheckbox.dispatchEvent(new Event('change'));
        
        if (fiberCableLengthInput && selectedDrone.fiberCableLength) {
            fiberCableLengthInput.value = selectedDrone.fiberCableLength;
        }
    } else if (fiberCheckbox) {
        fiberCheckbox.checked = false;
        fiberCheckbox.dispatchEvent(new Event('change'));
    }

    // Заповнюємо частоти та канал тільки якщо не оптоволокно
    if (!selectedDrone.hasFiberOptic) {
        if (videoFreqSelect && selectedDrone.videoFrequency) {
            // Спробуємо знайти відповідну опцію
            const option = Array.from(videoFreqSelect.options).find(opt => opt.value === selectedDrone.videoFrequency);
            if (option) {
                videoFreqSelect.value = selectedDrone.videoFrequency;
            }
        }

        if (controlFreqSelect && selectedDrone.controlFrequency) {
            const option = Array.from(controlFreqSelect.options).find(opt => opt.value === selectedDrone.controlFrequency);
            if (option) {
                controlFreqSelect.value = selectedDrone.controlFrequency;
            }
        }

        if (channelSelect && selectedDrone.channel) {
            // Для мультиселекту каналів
            if (window.customMultiSelects && window.customMultiSelects[channelSelect.id]) {
                window.customMultiSelects[channelSelect.id].setValue([selectedDrone.channel]);
            }
        }
    }

    if (statusSelect && selectedDrone.modificationStatus) {
        statusSelect.value = selectedDrone.modificationStatus;

        // Показуємо/ховаємо поле модифікацій
        const modificationField = resourceItem.querySelector('.modification-details-field');
        if (modificationField) {
            modificationField.style.display = selectedDrone.modificationStatus === 'modified' ? 'block' : 'none';
        }
    }

    if (modificationSelect && selectedDrone.modification) {
        // Для мультиселекту модифікацій
        if (window.customMultiSelects && window.customMultiSelects[modificationSelect.id]) {
            window.customMultiSelects[modificationSelect.id].setValue([selectedDrone.modification]);
        }
    }

    console.log('✅ Поля дрона автозаповнено:', selectedDrone);
}

// Завантаження типів дронів (камер) з БД
async function loadDroneTypes(resourceItem) {
    const typeSelect = resourceItem.querySelector('.drone-type');
    if (!typeSelect) return;
    
    try {
        // Використовуємо кеш замість запиту до БД
        const data = optionsCache.droneTypes || [];
        
        typeSelect.innerHTML = '<option value="">Оберіть тип</option>';
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value;
            option.textContent = item.label;
            typeSelect.appendChild(option);
        });
        
        console.log('Типи дронів завантажені з кешу:', data.length);
        
    } catch (error) {
        console.error('Помилка завантаження типів дронів:', error);
        typeSelect.innerHTML = '<option value="">Помилка завантаження</option>';
    }
}

// Завантаження частот для дронів з БД
async function loadDroneFrequencies(resourceItem) {
    console.log('loadDroneFrequencies викликано');
    const videoFreqSelect = resourceItem.querySelector('.drone-video-freq');
    const controlFreqSelect = resourceItem.querySelector('.drone-control-freq');
    
    if (!videoFreqSelect || !controlFreqSelect) {
        console.error('Селекти частот не знайдені!');
        return;
    }
    
    try {
        // Використовуємо кеш замість запитів до БД
        const videoData = optionsCache.videoFrequencies || [];
        const controlData = optionsCache.controlFrequencies || [];
        
        videoFreqSelect.innerHTML = '<option value="">Оберіть частоту відео</option>';
        videoData.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value;
            option.textContent = item.label;
            videoFreqSelect.appendChild(option);
        });
        
        controlFreqSelect.innerHTML = '<option value="">Оберіть частоту керування</option>';
        controlData.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value;
            option.textContent = item.label;
            controlFreqSelect.appendChild(option);
        });
        
        console.log('Частоти завантажені з кешу, відео:', videoData.length, 'керування:', controlData.length);
        
    } catch (error) {
        console.error('Помилка завантаження частот:', error);
        videoFreqSelect.innerHTML = '<option value="">Помилка завантаження</option>';
        controlFreqSelect.innerHTML = '<option value="">Помилка завантаження</option>';
    }
}

// Завантаження каналів
async function loadDroneChannels(resourceItem) {
    const channelSelect = resourceItem.querySelector('.drone-channel');
    if (!channelSelect) return;
    
    try {
        // Використовуємо кеш
        const data = optionsCache.channels || [];
        
        channelSelect.innerHTML = '<option value="">Оберіть канал...</option>';
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value;
            option.textContent = item.label;
            channelSelect.appendChild(option);
        });
        
        // Встановити унікальний ID для подальшої ініціалізації мультиселекту
        const uniqueId = `drone-channel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        channelSelect.id = uniqueId;
        
        console.log('Канали завантажені з кешу:', data.length, 'ID:', uniqueId);
        
    } catch (error) {
        console.error('Помилка завантаження каналів:', error);
        channelSelect.innerHTML = '<option value="">Помилка завантаження</option>';
    }
}

// Завантаження модифікацій
async function loadDroneModifications(resourceItem) {
    const modSelect = resourceItem.querySelector('.drone-modification');
    if (!modSelect) return;
    
    try {
        // Використовуємо кеш
        const data = optionsCache.modifications || [];
        
        modSelect.innerHTML = '<option value="">Оберіть модифікації...</option>';
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value;
            option.textContent = item.label;
            modSelect.appendChild(option);
        });
        
        // Встановити унікальний ID для подальшої ініціалізації мультиселекту
        const uniqueId = `drone-mod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        modSelect.id = uniqueId;
        
        console.log('Модифікації завантажені з кешу:', data.length, 'ID:', uniqueId);
        
    } catch (error) {
        console.error('Помилка завантаження модифікацій:', error);
        modSelect.innerHTML = '<option value="">Помилка завантаження</option>';
    }
}



// Збереження подання
async function saveSubmission() {
    try {
        const dateFrom = document.getElementById('dutyDateFrom').value;
        const dateTo = document.getElementById('dutyDateTo').value;
        
        // Збір екіпажу (чекбокси)
        const crewCheckboxes = document.querySelectorAll('.crew-checkbox:checked');
        const crewMembers = Array.from(crewCheckboxes).map(cb => cb.value);
        console.log('Екіпаж зібрано:', crewMembers);
        
        // Збір старшого екіпажу (радіобатон)
        const crewLeaderRadio = document.querySelector('.crew-leader-input:checked');
        const crewLeader = crewLeaderRadio ? crewLeaderRadio.value : null;
        console.log('Старший екіпажу:', crewLeader);
        
        // Збір дронів з усіма полями
        const droneItems = document.querySelectorAll('.resource-item[data-type="drone"]');
        console.log('Знайдено рядків дронів:', droneItems.length);
        const drones = Array.from(droneItems).map(item => {
            const select = item.querySelector('select');
            const count = parseInt(item.querySelector('.count-input').value) || 0;
            
            // Додаткові поля для дрона
            const type = item.querySelector('.drone-type')?.value || '';
            const fiberOpticCheckbox = item.querySelector('.drone-fiber-optic-checkbox');
            const hasFiberOptic = fiberOpticCheckbox ? fiberOpticCheckbox.checked : false;
            const fiberCableLength = hasFiberOptic ? (item.querySelector('.drone-fiber-cable-length')?.value || '') : '';
            
            let videoFreq = '';
            let controlFreq = '';
            let channel = '';
            
            if (!hasFiberOptic) {
                // Якщо не оптоволокно, збираємо частоти та канал
                videoFreq = item.querySelector('.drone-video-freq')?.value || '';
                controlFreq = item.querySelector('.drone-control-freq')?.value || '';
                
                // Канали - збираємо масив вибраних значень з мультиселекту
                const channelSelect = item.querySelector('.drone-channel');
                channel = channelSelect 
                    ? Array.from(channelSelect.selectedOptions).map(opt => opt.value).join(', ')
                    : '';
            }
            
            const modStatus = item.querySelector('.drone-modification-status')?.value || '';
            
            // Модифікації - збираємо масив вибраних значень з мультиселекту
            let modification = '';
            if (modStatus === 'modified') {
                const modSelect = item.querySelector('.drone-modification');
                if (modSelect) {
                    const selectedOptions = Array.from(modSelect.selectedOptions).map(opt => opt.value);
                    modification = selectedOptions.join(', ');
                }
            }
            
            const droneData = {
                name: select.value,
                label: select.options[select.selectedIndex]?.text || select.value,
                count: count,
                type: type,
                hasFiberOptic: hasFiberOptic,
                fiberCableLength: fiberCableLength,
                videoFrequency: videoFreq,
                controlFrequency: controlFreq,
                channel: channel,
                modificationStatus: modStatus,
                modification: modification
            };
            console.log('Дрон:', droneData);
            return droneData;
        }).filter(d => {
            // Базові перевірки
            if (!d.name || d.count <= 0 || !d.type || !d.modificationStatus) return false;
            
            // Якщо оптоволокно, перевіряємо довжину кабелю
            if (d.hasFiberOptic) {
                return d.fiberCableLength && d.fiberCableLength.length > 0;
            }
            
            // Якщо не оптоволокно, перевіряємо частоти та канал
            return d.videoFrequency && d.controlFrequency && d.channel;
        });
        console.log('Дрони після фільтру:', drones);
        
        // Збір БК
        const bkItems = document.querySelectorAll('.resource-item[data-type="bk"]');
        console.log('Знайдено рядків БК:', bkItems.length);
        const bk = Array.from(bkItems).map(item => {
            const select = item.querySelector('select');
            const count = parseInt(item.querySelector('.count-input').value) || 0;
            const bkData = {
                name: select.value,
                label: select.options[select.selectedIndex]?.text || select.value,
                count: count
            };
            console.log('БК:', bkData);
            return bkData;
        }).filter(b => b.name && b.count > 0);
        console.log('БК після фільтру:', bk);
        
        if (crewMembers.length === 0) {
            showError('Оберіть хоча б одного оператора');
            return;
        }
        
        if (drones.length === 0 && bk.length === 0) {
            showError('Додайте хоча б один дрон або БК');
            return;
        }
        
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        console.log('User ID:', user.id);
        
        const submissionData = {
            user_id: user.id,
            date_from: dateFrom,
            date_to: dateTo,
            crew_members: crewMembers,
            crew_leader: crewLeader,
            drones: drones,
            bk: bk,
            updated_at: new Date().toISOString()
        };
        console.log('Дані для збереження:', submissionData);
        
        // Перевірити чи є вже подання
        const { data: existing, error: existingError } = await window.supabaseClient
            .from('submissions')
            .select('id')
            .eq('user_id', user.id)
            .maybeSingle(); // maybeSingle() замість single() - не викидає помилку якщо немає запису
        
        console.log('Існуюче подання:', existing, 'Помилка:', existingError);
        
        let result;
        if (existing && !existingError) {
            // Оновити існуюче
            console.log('Оновлюємо існуюче подання:', existing.id);
            result = await window.supabaseClient
                .from('submissions')
                .update(submissionData)
                .eq('id', existing.id)
                .select()
                .single();
        } else {
            // Створити нове
            console.log('Створюємо нове подання');
            result = await window.supabaseClient
                .from('submissions')
                .insert([submissionData])
                .select()
                .single();
        }
        
        console.log('Результат збереження:', result);
        
        if (result.error) {
            console.error('Помилка від Supabase:', result.error);
            throw result.error;
        }
        
        // Зберегти повні дані з БД (включно з id)
        currentSubmission = result.data;
        displayCurrentSubmission();
        
        // Оновити списки дронів/БК в генераторі звітів
        if (window.populateSelects) {
            window.populateSelects();
        }
        
        showSuccess('Подання збережено успішно!');
        console.log('✅ Подання збережено в БД');
        
    } catch (error) {
        console.error('Помилка збереження подання:', error);
        showError('Не вдалося зберегти подання');
    }
}

// Завантаження поточного подання
async function loadCurrentSubmission() {
    try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        
        const { data, error } = await window.supabaseClient
            .from('submissions')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle(); // maybeSingle() замість single() - не викидає помилку якщо немає запису
        
        if (error) {
            console.error('Помилка завантаження подання:', error);
            throw error;
        }
        
        if (data) {
            currentSubmission = data;
            displayCurrentSubmission();
            
            // Відновити вибір екіпажу
            restoreCrewSelection(data);
        } else {
            console.log('Подання не знайдено (нормально після видалення)');
            currentSubmission = null; // Явно встановити null
        }
        
        // Позначити що завантаження завершене ПЕРЕД викликом populateSelects
        submissionLoaded = true;
        
        // Тепер можна оновити селекти
        if (window.populateSelects) {
            window.populateSelects();
        }
        
    } catch (error) {
        console.error('Помилка завантаження подання:', error);
        currentSubmission = null; // При помилці теж null
        submissionLoaded = true; // Все одно позначити як завершене
    }
}

// Відображення поточного подання
function displayCurrentSubmission() {
    const container = document.getElementById('currentSubmission');
    const display = document.getElementById('submissionDisplay');
    
    if (!currentSubmission || !container || !display) return;
    
    container.classList.remove('hidden');
    
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('uk-UA');
    };
    
    let html = `
        <div class="info-row">
            <span class="info-label">Період:</span>
            <span class="info-value">${formatDate(currentSubmission.date_from)} - ${formatDate(currentSubmission.date_to)}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Екіпаж:</span>
            <span class="info-value">
                ${currentSubmission.crew_members.map(member => 
                    member === currentSubmission.crew_leader ? `<strong>${member} (старший)</strong>` : member
                ).join(', ')}
            </span>
        </div>
    `;
    
    if (currentSubmission.drones && currentSubmission.drones.length > 0) {
        html += `<div class="info-section">
            <span class="info-label">Дрони:</span>
            <div class="drones-list">
                ${currentSubmission.drones.map(d => `
                    <div class="drone-info-card">
                        <div class="drone-info-header">${d.label} <span class="badge">${d.count} шт</span></div>
                        <div class="drone-info-details">
                            <span><strong>Тип:</strong> ${d.type || 'Не вказано'}</span>
                            ${d.hasFiberOptic 
                                ? `<span><strong>🔌 Оптоволокно:</strong> ${d.fiberCableLength} км</span>`
                                : `
                                    <span><strong>Відео:</strong> ${d.videoFrequency}</span>
                                    <span><strong>Керування:</strong> ${d.controlFrequency}</span>
                                    <span><strong>Канал:</strong> ${d.channel || 'Не вказано'}</span>
                                `
                            }
                            <span><strong>Стан:</strong> ${d.modificationStatus === 'factory' ? 'Заводський' : `Модифікований (${d.modification || 'деталі не вказані'})`}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>`;
    }
    
    if (currentSubmission.bk && currentSubmission.bk.length > 0) {
        html += `<div class="info-row">
            <span class="info-label">БК:</span>
            <span class="info-value">
                ${currentSubmission.bk.map(b => `${b.label}: ${b.count} шт`).join(', ')}
            </span>
        </div>`;
    }
    
    display.innerHTML = html;
}

// Поділитися поданням
function shareSubmission() {
    if (!currentSubmission) {
        showError('Спочатку збережіть подання');
        return;
    }
    
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('uk-UA');
    
    let text = `ПОДАННЯ НА ЧЕРГУВАННЯ\n\n`;
    text += `Період: ${formatDate(currentSubmission.date_from)} - ${formatDate(currentSubmission.date_to)}\n\n`;
    text += `Склад екіпажу:\n`;
    currentSubmission.crew_members.forEach((member, i) => {
        const leaderMark = member === currentSubmission.crew_leader ? ' (старший)' : '';
        text += `${i + 1}. ${member}${leaderMark}\n`;
    });
    
    if (currentSubmission.drones && currentSubmission.drones.length > 0) {
        text += `\nЗасоби (Дрони):\n`;
        currentSubmission.drones.forEach(drone => {
            const statusText = drone.modificationStatus === 'factory' ? 'Заводський' : `Модифікований (${drone.modification || 'деталі не вказані'})`;
            
            text += `• ${drone.label}: ${drone.count} шт\n`;
            text += `  - Тип: ${drone.type || 'Не вказано'}\n`;
            
            if (drone.hasFiberOptic) {
                text += `  - Оптоволокно: ${drone.fiberCableLength} км\n`;
            } else {
                text += `  - Частота відео: ${drone.videoFrequency}\n`;
                text += `  - Частота керування: ${drone.controlFrequency}\n`;
                text += `  - Канал: ${drone.channel || 'Не вказано'}\n`;
            }
            
            text += `  - Стан: ${statusText}\n\n`;
        });
    }
    
    if (currentSubmission.bk && currentSubmission.bk.length > 0) {
        text += `\nБоєкомплект:\n`;
        currentSubmission.bk.forEach(item => {
            text += `• ${item.label}: ${item.count} шт\n`;
        });
    }
    
    if (navigator.share) {
        navigator.share({
            title: 'Подання на чергування',
            text: text
        }).then(() => {
            showSuccess('Подання надіслано');
        }).catch(err => {
            if (err.name !== 'AbortError') {
                fallbackCopyTextToClipboard(text);
            }
        });
    } else {
        fallbackCopyTextToClipboard(text);
    }
}

// Відновлення вибору екіпажу при завантаженні подання
function restoreCrewSelection(submissionData) {
    if (!submissionData) return;
    
    // Відновити чекбокси екіпажу
    if (submissionData.crew_members && Array.isArray(submissionData.crew_members)) {
        submissionData.crew_members.forEach(member => {
            const checkbox = document.querySelector(`.crew-checkbox[value="${member}"]`);
            if (checkbox) {
                checkbox.checked = true;
                // Вмикаємо відповідний радіобатон
                const radio = document.querySelector(`.crew-leader-input[value="${member}"]`);
                if (radio) {
                    radio.disabled = false;
                }
            }
        });
    }
    
    // Відновити старшого екіпажу
    if (submissionData.crew_leader) {
        const radio = document.querySelector(`.crew-leader-input[value="${submissionData.crew_leader}"]`);
        if (radio) {
            radio.checked = true;
        }
    }
    
    // Оновити відображення старшого екіпажу
    updateCrewLeaderIndication();
}

// Отримати поточне подання (для використання в генераторі)
function getCurrentSubmission() {
    return currentSubmission;
}

// Очищення поточного подання (викликається при закритті)
function clearSubmission() {
    console.log('🧹 Очищення currentSubmission');
    currentSubmission = null;
    submissionLoaded = false; // Скинути прапорець
}

// Експорт функцій
window.submissionFunctions = {
    initSubmission,
    getCurrentSubmission,
    loadCurrentSubmission,
    clearSubmission,
    waitForCache,
    waitForSubmissionLoad
};
