// Власний multiselect з пошуком для форм
class CustomMultiSelect {
    constructor(selectElement, options = {}) {
        this.select = selectElement;
        this.isMultiple = options.multiple || false;
        this.searchable = options.searchable !== false; // За замовчуванням true
        this.placeholder = options.placeholder || 'Оберіть...';
        this.container = null;
        this.dropdown = null;
        this.searchInput = null;
        this.optionsContainer = null;
        this.selectedValues = [];
        
        this.init();
    }
    
    init() {
        // Приховуємо оригінальний select
        this.select.style.display = 'none';
        
        // Створюємо контейнер
        this.createContainer();
        
        // Вставляємо після оригінального select
        this.select.parentNode.insertBefore(this.container, this.select.nextSibling);
        
        // Ініціалізуємо обрані значення
        this.updateSelectedFromSelect();
        
        // Події
        this.attachEvents();
    }
    
    createContainer() {
        // Головний контейнер
        this.container = document.createElement('div');
        this.container.className = 'custom-multiselect';
        this.container.style.cssText = `
            position: relative;
            width: 100%;
            z-index: 1;
        `;
        
        // Кнопка відкриття
        const button = document.createElement('div');
        button.className = 'multiselect-button';
        button.style.cssText = `
            padding: 10px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            min-height: 44px;
            font-size: 14px;
            transition: border-color 0.2s;
        `;
        button.innerHTML = `
            <span class="multiselect-text" style="color: #999;">${this.placeholder}</span>
            <span class="multiselect-arrow" style="color: #666; font-size: 10px;">▼</span>
        `;
        this.button = button;
        
        // Hover ефект
        button.addEventListener('mouseenter', () => {
            if (this.dropdown.style.display === 'none') {
                button.style.borderColor = '#4facfe';
            }
        });
        button.addEventListener('mouseleave', () => {
            if (this.dropdown.style.display === 'none') {
                button.style.borderColor = '#ddd';
            }
        });
        
        this.container.appendChild(button);
        
        // Dropdown
        this.dropdown = document.createElement('div');
        this.dropdown.className = 'multiselect-dropdown';
        this.dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin-top: 4px;
            max-height: 300px;
            display: none;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        // Пошук (якщо ввімкнено)
        if (this.searchable) {
            const searchWrapper = document.createElement('div');
            searchWrapper.style.cssText = `
                padding: 8px;
                border-bottom: 1px solid #eee;
            `;
            
            this.searchInput = document.createElement('input');
            this.searchInput.type = 'text';
            this.searchInput.placeholder = '🔍 Пошук...';
            this.searchInput.style.cssText = `
                width: 100%;
                padding: 6px;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 14px;
            `;
            searchWrapper.appendChild(this.searchInput);
            this.dropdown.appendChild(searchWrapper);
        }
        
        // Контейнер опцій
        this.optionsContainer = document.createElement('div');
        this.optionsContainer.className = 'multiselect-options';
        this.optionsContainer.style.cssText = `
            max-height: 250px;
            overflow-y: auto;
        `;
        
        this.renderOptions();
        this.dropdown.appendChild(this.optionsContainer);
        this.container.appendChild(this.dropdown);
    }
    
    renderOptions(filter = '') {
        this.optionsContainer.innerHTML = '';
        const options = Array.from(this.select.options);
        
        options.forEach((option, index) => {
            // Пропускаємо placeholder опції
            if (option.value === '') return;
            
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
                padding: 10px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                border-bottom: 1px solid #f5f5f5;
                background: ${isSelected ? '#f0f7ff' : 'white'};
            `;
            
            if (this.isMultiple) {
                // Чекбокс для множинного вибору
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.checked = isSelected;
                checkbox.style.cssText = `
                    pointer-events: none;
                `;
                optionEl.appendChild(checkbox);
            }
            
            const label = document.createElement('span');
            label.textContent = option.text;
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
        } else {
            // Одиничний вибір
            this.selectedValues = [value];
            this.closeDropdown();
        }
        
        this.updateSelect();
        this.updateButton();
        this.renderOptions(this.searchInput ? this.searchInput.value : '');
    }
    
    updateSelect() {
        // Оновлюємо оригінальний select
        Array.from(this.select.options).forEach(option => {
            option.selected = this.selectedValues.includes(option.value);
        });
        
        // Тригеримо change event
        this.select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    updateSelectedFromSelect() {
        this.selectedValues = Array.from(this.select.selectedOptions).map(opt => opt.value);
        this.updateButton();
    }
    
    updateButton() {
        const textSpan = this.button.querySelector('.multiselect-text');
        
        if (this.selectedValues.length === 0) {
            textSpan.textContent = this.placeholder;
            textSpan.style.color = '#999';
        } else {
            const selectedTexts = this.selectedValues.map(val => {
                const option = Array.from(this.select.options).find(opt => opt.value === val);
                return option ? option.text : val;
            });
            
            if (this.isMultiple) {
                textSpan.textContent = selectedTexts.join(', ');
            } else {
                textSpan.textContent = selectedTexts[0];
            }
            textSpan.style.color = '#333';
        }
    }
    
    openDropdown() {
        this.dropdown.style.display = 'block';
        this.container.style.zIndex = '1000'; // Підняти контейнер на передній план
        this.button.style.borderColor = '#4facfe'; // Підсвітити активну кнопку
        if (this.searchInput) {
            setTimeout(() => this.searchInput.focus(), 100);
        }
    }
    
    closeDropdown() {
        this.dropdown.style.display = 'none';
        this.container.style.zIndex = '1'; // Повернути назад
        this.button.style.borderColor = '#ddd'; // Повернути звичайний border
        if (this.searchInput) {
            this.searchInput.value = '';
            this.renderOptions();
        }
    }
    
    attachEvents() {
        // Відкриття/закриття dropdown
        this.button.addEventListener('click', (e) => {
            e.stopPropagation();
            if (this.dropdown.style.display === 'none') {
                this.openDropdown();
            } else {
                this.closeDropdown();
            }
        });
        
        // Пошук
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.renderOptions(e.target.value);
            });
            
            this.searchInput.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
        
        // Закриття при кліку поза елементом
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.closeDropdown();
            }
        });
    }
    
    destroy() {
        this.container.remove();
        this.select.style.display = '';
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
