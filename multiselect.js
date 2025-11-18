// Власний multiselect з пошуком для форм
class CustomMultiSelect {
    constructor(selectElement, options = {}) {
        this.select = selectElement;
        this.isMultiple = options.multiple || false;
        this.searchable = options.searchable !== false;
        this.placeholder = options.placeholder || 'Оберіть...';
        this.overlay = null;
        this.searchInput = null;
        this.optionsContainer = null;
        this.selectedValues = [];
        
        this.init();
    }
    
    init() {
        // Робимо select множинним якщо потрібно
        if (this.isMultiple) {
            this.select.multiple = true;
            // Приховуємо візуально (але залишаємо в DOM для даних)
            this.select.style.opacity = '0';
            this.select.style.position = 'absolute';
            this.select.style.pointerEvents = 'none';
            this.select.style.height = '0';
            this.select.style.overflow = 'hidden';
        }
        
        // Ініціалізуємо обрані значення
        this.updateSelectedFromSelect();
        
        // Створюємо overlay для пошуку
        this.createOverlay();
        
        // Події
        this.attachEvents();
    }
    
    createOverlay() {
        // Overlay для пошуку (з'являється поверх select)
        this.overlay = document.createElement('div');
        this.overlay.className = 'multiselect-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: none;
            z-index: 10000;
            align-items: center;
            justify-content: center;
        `;
        
        // Модальне вікно
        const modal = document.createElement('div');
        modal.className = 'multiselect-modal';
        modal.style.cssText = `
            background: white;
            border-radius: 8px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        `;
        
        // Заголовок
        const header = document.createElement('div');
        header.style.cssText = `
            padding: 16px;
            border-bottom: 1px solid #eee;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        header.innerHTML = `
            <span style="font-weight: bold; font-size: 16px;">${this.placeholder}</span>
            <button class="close-btn" style="border: none; background: none; font-size: 24px; cursor: pointer; color: #999;">×</button>
        `;
        modal.appendChild(header);
        
        // Пошук (якщо ввімкнено)
        if (this.searchable) {
            const searchWrapper = document.createElement('div');
            searchWrapper.style.cssText = `
                padding: 12px 16px;
                border-bottom: 1px solid #eee;
            `;
            
            this.searchInput = document.createElement('input');
            this.searchInput.type = 'text';
            this.searchInput.placeholder = '🔍 Пошук...';
            this.searchInput.style.cssText = `
                width: 100%;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            `;
            searchWrapper.appendChild(this.searchInput);
            modal.appendChild(searchWrapper);
        }
        
        // Контейнер опцій
        this.optionsContainer = document.createElement('div');
        this.optionsContainer.className = 'multiselect-options';
        this.optionsContainer.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 8px 0;
        `;
        
        this.renderOptions();
        modal.appendChild(this.optionsContainer);
        
        // Футер з кнопками (тільки для множинного вибору)
        if (this.isMultiple) {
            const footer = document.createElement('div');
            footer.style.cssText = `
                padding: 12px 16px;
                border-top: 1px solid #eee;
                display: flex;
                gap: 8px;
                justify-content: flex-end;
            `;
            footer.innerHTML = `
                <button class="cancel-btn" style="padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">Скасувати</button>
                <button class="apply-btn" style="padding: 8px 16px; border: none; background: #4facfe; color: white; border-radius: 4px; cursor: pointer;">Застосувати</button>
            `;
            modal.appendChild(footer);
        }
        
        this.overlay.appendChild(modal);
        document.body.appendChild(this.overlay);
        
        // Закриття по кліку на overlay
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.closeOverlay();
            }
        });
        
        // Закриття по кнопці
        const closeBtn = header.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => this.closeOverlay());
        
        if (this.isMultiple) {
            const cancelBtn = modal.querySelector('.cancel-btn');
            const applyBtn = modal.querySelector('.apply-btn');
            
            cancelBtn.addEventListener('click', () => this.closeOverlay());
            applyBtn.addEventListener('click', () => {
                this.updateSelect();
                this.closeOverlay();
            });
        }
    }
    
    renderOptions(filter = '') {
        this.optionsContainer.innerHTML = '';
        const options = Array.from(this.select.options);
        
        options.forEach((option, index) => {
            // Пропускаємо placeholder опції (пусті value або disabled)
            if (option.value === '' || option.disabled) return;
            
            // Фільтр пошуку
            if (filter && !option.text.toLowerCase().includes(filter.toLowerCase())) {
                return;
            }
            
            const optionEl = document.createElement('div');
            optionEl.className = 'multiselect-option';
            optionEl.dataset.value = option.value;
            optionEl.dataset.index = index;
            
            const isSelected = this.selectedValues.includes(option.value);
            
            optionEl.style.cssText = `
                padding: 12px 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 10px;
                background: ${isSelected ? '#f0f7ff' : 'white'};
                transition: background 0.15s;
            `;
            
            if (this.isMultiple) {
                // Чекбокс для множинного вибору
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = isSelected;
                checkbox.style.cssText = `
                    pointer-events: none;
                    width: 18px;
                    height: 18px;
                `;
                optionEl.appendChild(checkbox);
            }
            
            const label = document.createElement('span');
            label.textContent = option.text;
            label.style.cssText = `flex: 1;`;
            optionEl.appendChild(label);
            
            optionEl.addEventListener('mouseenter', () => {
                if (!isSelected) {
                    optionEl.style.background = '#f5f5f5';
                }
            });
            
            optionEl.addEventListener('mouseleave', () => {
                optionEl.style.background = isSelected ? '#f0f7ff' : 'white';
            });
            
            optionEl.addEventListener('click', () => {
                this.toggleOption(option.value);
            });
            
            this.optionsContainer.appendChild(optionEl);
        });
    }
    
    toggleOption(value) {
        if (this.isMultiple) {
            // Множинний вибір
            const index = this.selectedValues.indexOf(value);
            if (index > -1) {
                this.selectedValues.splice(index, 1);
            } else {
                this.selectedValues.push(value);
            }
            this.renderOptions(this.searchInput ? this.searchInput.value : '');
        } else {
            // Одиничний вибір - одразу застосовуємо та закриваємо
            this.selectedValues = [value];
            this.updateSelect();
            this.closeOverlay();
        }
    }
    
    updateSelect() {
        // Оновлюємо оригінальний select
        Array.from(this.select.options).forEach(option => {
            option.selected = this.selectedValues.includes(option.value);
        });
        
        // Тригеримо change event для сумісності
        this.select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    updateSelectedFromSelect() {
        this.selectedValues = Array.from(this.select.selectedOptions).map(opt => opt.value);
    }
    
    openOverlay() {
        this.overlay.style.display = 'flex';
        if (this.searchInput) {
            setTimeout(() => this.searchInput.focus(), 100);
        }
    }
    
    closeOverlay() {
        this.overlay.style.display = 'none';
        if (this.searchInput) {
            this.searchInput.value = '';
            this.renderOptions();
        }
    }
    
    attachEvents() {
        // Відкриття overlay при кліку/фокусі на select
        const openHandler = (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.openOverlay();
            return false;
        };
        
        this.select.addEventListener('mousedown', openHandler);
        this.select.addEventListener('click', openHandler);
        this.select.addEventListener('focus', openHandler);
        
        // Пошук
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.renderOptions(e.target.value);
            });
        }
        
        // ESC для закриття
        const escHandler = (e) => {
            if (e.key === 'Escape' && this.overlay.style.display === 'flex') {
                this.closeOverlay();
            }
        };
        document.addEventListener('keydown', escHandler);
        
        // Зберігаємо handler для можливості видалення
        this.escHandler = escHandler;
    }
    
    destroy() {
        this.overlay.remove();
    }
}

// Функція для ініціалізації multiselect на select елементах
window.initCustomMultiSelect = function(selector, options = {}) {
    const selects = document.querySelectorAll(selector);
    const instances = [];
    
    selects.forEach(select => {
        const instance = new CustomMultiSelect(select, options);
        instances.push(instance);
    });
    
    return instances;
};
