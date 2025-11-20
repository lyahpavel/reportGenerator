// Функції для роботи з поданням

// Глобальна змінна для поточного подання
let currentSubmission = null;

// Ініціалізація секції подання
function initSubmission() {
    const submissionForm = document.getElementById('submissionForm');
    const addDroneBtn = document.getElementById('addDroneBtn');
    const addBkBtn = document.getElementById('addBkBtn');
    const shareSubmissionBtn = document.getElementById('shareSubmission');
    
    if (!submissionForm) return;
    
    // Завантажити операторів як чекбокси
    loadCrewMembers();
    
    // Завантажити поточне подання
    loadCurrentSubmission();
    
    // Додавання дрону
    addDroneBtn?.addEventListener('click', () => addResourceRow('drone'));
    
    // Додавання БК
    addBkBtn?.addEventListener('click', () => addResourceRow('bk'));
    
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
    const container = document.getElementById(type === 'drone' ? 'dronesContainer' : 'bkContainer');
    const button = container.querySelector('button');
    
    const resourceItem = document.createElement('div');
    resourceItem.className = 'resource-item';
    resourceItem.dataset.type = type;
    
    const selectId = `${type}_${Date.now()}`;
    
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
    
    // Вставити перед кнопкою "Додати"
    container.insertBefore(resourceItem, button);
    
    // Завантажити опції
    loadResourceOptions(selectId, type);
    
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

// Збереження подання
async function saveSubmission() {
    try {
        const dateFrom = document.getElementById('dutyDateFrom').value;
        const dateTo = document.getElementById('dutyDateTo').value;
        
        // Збір екіпажу (чекбокси)
        const crewCheckboxes = document.querySelectorAll('.crew-checkbox:checked');
        const crewMembers = Array.from(crewCheckboxes).map(cb => cb.value);
        
        // Збір дронів
        const droneItems = document.querySelectorAll('.resource-item[data-type="drone"]');
        const drones = Array.from(droneItems).map(item => {
            const select = item.querySelector('select');
            const count = parseInt(item.querySelector('.count-input').value) || 0;
            return {
                name: select.value,
                label: select.options[select.selectedIndex]?.text || select.value,
                count: count
            };
        }).filter(d => d.name && d.count > 0);
        
        // Збір БК
        const bkItems = document.querySelectorAll('.resource-item[data-type="bk"]');
        const bk = Array.from(bkItems).map(item => {
            const select = item.querySelector('select');
            const count = parseInt(item.querySelector('.count-input').value) || 0;
            return {
                name: select.value,
                label: select.options[select.selectedIndex]?.text || select.value,
                count: count
            };
        }).filter(b => b.name && b.count > 0);
        
        if (crewMembers.length === 0) {
            showError('Оберіть хоча б одного оператора');
            return;
        }
        
        if (drones.length === 0 && bk.length === 0) {
            showError('Додайте хоча б один дрон або БК');
            return;
        }
        
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        
        const submissionData = {
            user_id: user.id,
            date_from: dateFrom,
            date_to: dateTo,
            crew_members: crewMembers,
            drones: drones,
            bk: bk,
            updated_at: new Date().toISOString()
        };
        
        // Перевірити чи є вже подання
        const { data: existing } = await window.supabaseClient
            .from('submissions')
            .select('id')
            .eq('user_id', user.id)
            .single();
        
        let result;
        if (existing) {
            // Оновити існуюче
            result = await window.supabaseClient
                .from('submissions')
                .update(submissionData)
                .eq('id', existing.id);
        } else {
            // Створити нове
            result = await window.supabaseClient
                .from('submissions')
                .insert([submissionData]);
        }
        
        if (result.error) throw result.error;
        
        currentSubmission = submissionData;
        displayCurrentSubmission();
        showSuccess('Подання збережено успішно! 📋');
        
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
        html += `<div class="info-row">
            <span class="info-label">Дрони:</span>
            <span class="info-value">
                ${currentSubmission.drones.map(d => `${d.label}: ${d.count} шт`).join(', ')}
            </span>
        </div>`;
    }
    
    if (currentSubmission.bk && currentSubmission.bk.length > 0) {
        html += `<div class="info-row">
            <span class="info-label">БК:</span>
            <span class="info-value">
                ${currentSubmission.bk.map(b => `${b.label}: ${b.count} шт`).join(', ')}
            </span>
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
