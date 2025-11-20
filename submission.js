// Функції для роботи з поданням

// Глобальна змінна для поточного подання
let currentSubmission = null;

// Ініціалізація секції подання
function initSubmission() {
    const submissionForm = document.getElementById('submissionForm');
    const dronesContainer = document.getElementById('dronesContainer');
    const bkContainer = document.getElementById('bkContainer');
    const shareSubmissionBtn = document.getElementById('shareSubmission');
    
    if (!submissionForm) return;
    
    // Завантажити операторів як чекбокси
    loadCrewMembers();
    
    // Завантажити поточне подання
    loadCurrentSubmission();
    
    // Event delegation для кнопок додавання (працює завжди)
    dronesContainer?.addEventListener('click', (e) => {
        console.log('Клік в dronesContainer:', e.target);
        if (e.target.id === 'addDroneBtn' || e.target.closest('#addDroneBtn')) {
            console.log('Додаємо дрон');
            e.preventDefault();
            e.stopPropagation();
            addResourceRow('drone');
        }
    });
    
    bkContainer?.addEventListener('click', (e) => {
        console.log('Клік в bkContainer:', e.target);
        if (e.target.id === 'addBkBtn' || e.target.closest('#addBkBtn')) {
            console.log('Додаємо БК');
            e.preventDefault();
            e.stopPropagation();
            addResourceRow('bk');
        }
    });
    
    // Збереження подання
    submissionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveSubmission();
    });
    
    // Поділитися поданням
    if (shareSubmissionBtn) {
        shareSubmissionBtn.addEventListener('click', () => shareSubmission());
    }
    
    // Встановити дату з сьогодні
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dutyDateFrom').value = today;
}

// Завантаження операторів для екіпажу (чекбокси)
async function loadCrewMembers() {
    const crewContainer = document.getElementById('crewMembers');
    if (!crewContainer) return;
    
    try {
        // Завантажуємо операторів з user_custom_options
        const { data, error } = await window.supabaseClient
            .from('user_custom_options')
            .select('value, label')
            .eq('option_type', 'operator')
            .order('label');
        
        if (error) throw error;
        
        crewContainer.innerHTML = '';
        data.forEach(operator => {
            const checkboxWrapper = document.createElement('label');
            checkboxWrapper.className = 'checkbox-label';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'crewMember';
            checkbox.value = operator.value;
            checkbox.className = 'crew-checkbox';
            
            const span = document.createElement('span');
            span.textContent = operator.label;
            
            checkboxWrapper.appendChild(checkbox);
            checkboxWrapper.appendChild(span);
            crewContainer.appendChild(checkboxWrapper);
        });
        
    } catch (error) {
        console.error('Помилка завантаження операторів:', error);
        crewContainer.innerHTML = '<p class="error-text">Помилка завантаження операторів</p>';
    }
}

// Додавання рядка ресурсу (дрон або БК)
function addResourceRow(type) {
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
                        <option value="">Оберіть тип</option>
                        <option value="day">Денний</option>
                        <option value="night">Нічний</option>
                        <option value="day-night">Денний/Нічний</option>
                    </select>
                </div>
                <div class="drone-field">
                    <label>Частота відео</label>
                    <select class="drone-video-freq form-control" required>
                        <option value="">Завантаження...</option>
                    </select>
                </div>
                <div class="drone-field">
                    <label>Частота керування</label>
                    <select class="drone-control-freq form-control" required>
                        <option value="">Завантаження...</option>
                    </select>
                </div>
                <div class="drone-field">
                    <label>Канал</label>
                    <select class="drone-channel form-control" required>
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
                    <label>Модифікації (через кому)</label>
                    <input type="text" class="drone-modification form-control" placeholder="5.8 GHz, FPV антена...">
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
        loadDroneFrequencies(resourceItem);
        loadDroneChannels(resourceItem);
        
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
    
    const optionType = type === 'drone' ? 'droneName' : 'bkOptions';
    
    try {
        const { data, error } = await window.supabaseClient
            .from('user_custom_options')
            .select('value, label')
            .eq('option_type', optionType)
            .order('label');
        
        if (error) throw error;
        
        select.innerHTML = '<option value="">Оберіть...</option>';
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value;
            option.textContent = item.label;
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error(`Помилка завантаження опцій (${type}):`, error);
        select.innerHTML = '<option value="">Помилка завантаження</option>';
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
        // Завантажити частоти відео
        const { data: videoData, error: videoError } = await window.supabaseClient
            .from('user_custom_options')
            .select('value, label')
            .eq('option_type', 'videoFrequencies')
            .order('label');
        
        if (videoError) throw videoError;
        
        videoFreqSelect.innerHTML = '<option value="">Оберіть частоту відео</option>';
        videoData.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value;
            option.textContent = item.label;
            videoFreqSelect.appendChild(option);
        });
        
        // Завантажити частоти керування
        const { data: controlData, error: controlError } = await window.supabaseClient
            .from('user_custom_options')
            .select('value, label')
            .eq('option_type', 'controlFrequencies')
            .order('label');
        
        if (controlError) throw controlError;
        
        controlFreqSelect.innerHTML = '<option value="">Оберіть частоту керування</option>';
        controlData.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value;
            option.textContent = item.label;
            controlFreqSelect.appendChild(option);
        });
        
        console.log('Частоти завантажені, відео:', videoData.length, 'керування:', controlData.length);
        
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
        const { data, error } = await window.supabaseClient
            .from('user_custom_options')
            .select('value, label')
            .eq('option_type', 'channels')
            .order('label');
        
        if (error) throw error;
        
        channelSelect.innerHTML = '<option value="">Оберіть канал</option>';
        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.value;
            option.textContent = item.label;
            channelSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Помилка завантаження каналів:', error);
        channelSelect.innerHTML = '<option value="">Помилка завантаження</option>';
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
        
        // Збір дронів з усіма полями
        const droneItems = document.querySelectorAll('.resource-item[data-type="drone"]');
        console.log('Знайдено рядків дронів:', droneItems.length);
        const drones = Array.from(droneItems).map(item => {
            const select = item.querySelector('select');
            const count = parseInt(item.querySelector('.count-input').value) || 0;
            
            // Додаткові поля для дрона
            const type = item.querySelector('.drone-type')?.value || '';
            const videoFreq = item.querySelector('.drone-video-freq')?.value || '';
            const controlFreq = item.querySelector('.drone-control-freq')?.value || '';
            const channel = item.querySelector('.drone-channel')?.value || '';
            const modStatus = item.querySelector('.drone-modification-status')?.value || '';
            const modification = modStatus === 'modified' 
                ? (item.querySelector('.drone-modification')?.value || '') 
                : '';
            
            const droneData = {
                name: select.value,
                label: select.options[select.selectedIndex]?.text || select.value,
                count: count,
                type: type,
                videoFrequency: videoFreq,
                controlFrequency: controlFreq,
                channel: channel,
                modificationStatus: modStatus,
                modification: modification
            };
            console.log('Дрон:', droneData);
            return droneData;
        }).filter(d => d.name && d.count > 0 && d.type && d.videoFrequency && d.controlFrequency && d.channel && d.modificationStatus);
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
            .single();
        
        console.log('Існуюче подання:', existing, 'Помилка:', existingError);
        
        let result;
        if (existing) {
            // Оновити існуюче
            console.log('Оновлюємо існуюче подання:', existing.id);
            result = await window.supabaseClient
                .from('submissions')
                .update(submissionData)
                .eq('id', existing.id);
        } else {
            // Створити нове
            console.log('Створюємо нове подання');
            result = await window.supabaseClient
                .from('submissions')
                .insert([submissionData]);
        }
        
        console.log('Результат збереження:', result);
        
        if (result.error) {
            console.error('Помилка від Supabase:', result.error);
            throw result.error;
        }
        
        currentSubmission = submissionData;
        displayCurrentSubmission();
        showSuccess('Подання збережено успішно! 📋');
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
            .single();
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
        
        if (data) {
            currentSubmission = data;
            displayCurrentSubmission();
        }
        
    } catch (error) {
        console.error('Помилка завантаження подання:', error);
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
            <span class="info-value">${currentSubmission.crew_members.join(', ')}</span>
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
                            <span>Тип: ${d.type === 'day' ? 'Денний' : d.type === 'night' ? 'Нічний' : 'Денний/Нічний'}</span>
                            <span>Відео: ${d.videoFrequency}</span>
                            <span>Керування: ${d.controlFrequency}</span>
                            <span>Канал: ${d.channel}</span>
                            <span>Стан: ${d.modificationStatus === 'factory' ? 'Заводський' : `Модифікований (${d.modification})`}</span>
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
    
    let text = `📋 ПОДАННЯ НА ЧЕРГУВАННЯ\n\n`;
    text += `📅 Період: ${formatDate(currentSubmission.date_from)} - ${formatDate(currentSubmission.date_to)}\n\n`;
    text += `👥 Склад екіпажу:\n`;
    currentSubmission.crew_members.forEach((member, i) => {
        text += `${i + 1}. ${member}\n`;
    });
    
    if (currentSubmission.drones && currentSubmission.drones.length > 0) {
        text += `\n🚁 Засоби (Дрони):\n`;
        currentSubmission.drones.forEach(drone => {
            text += `• ${drone.label}: ${drone.count} шт\n`;
        });
    }
    
    if (currentSubmission.bk && currentSubmission.bk.length > 0) {
        text += `\n💥 Боєкомплект:\n`;
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

// Отримати поточне подання (для використання в генераторі)
function getCurrentSubmission() {
    return currentSubmission;
}

// Експорт функцій
window.submissionFunctions = {
    initSubmission,
    getCurrentSubmission,
    loadCurrentSubmission
};
