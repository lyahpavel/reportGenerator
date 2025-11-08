// Функції автентифікації та роботи з користувацькими опціями

let currentUser = null;
let userCustomOptions = {};

// Ініціалізація автентифікації
async function initAuth() {
    const supabase = window.supabaseClient;
    
    if (!supabase) {
        console.warn('⚠️ Supabase не налаштовано, автентифікація недоступна');
        // Показати додаток без автентифікації
        document.getElementById('authSection').style.display = 'none';
        document.getElementById('appSection').style.display = 'block';
        return;
    }

    // Перевірка поточної сесії
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
        currentUser = session.user;
        await handleUserLogin();
    } else {
        // Показати форму логіна
        document.getElementById('authSection').style.display = 'flex';
        document.getElementById('appSection').style.display = 'none';
    }

    // Слухати зміни стану автентифікації
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            currentUser = session.user;
            handleUserLogin();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            handleUserLogout();
        }
    });

    // Обробники форм
    setupAuthForms();
}

// Налаштування форм автентифікації
function setupAuthForms() {
    // Перемикання між формами
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    });

    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    });

    // Форма логіна
    document.getElementById('loginFormElement').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLogin();
    });

    // Форма реєстрації
    document.getElementById('registerFormElement').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleRegister();
    });

    // Кнопка виходу
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await handleLogout();
    });
}

// Обробка логіна
async function handleLogin() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    const supabase = window.supabaseClient;

    // Конвертуємо username в email формат для Supabase
    const email = `${username}@local.app`;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        console.log('✅ Успішний вхід');
        showSuccess('Ви увійшли в систему');

    } catch (error) {
        console.error('❌ Помилка входу:', error);
        showError('Помилка входу: ' + error.message);
    }
}

// Обробка реєстрації
async function handleRegister() {
    const username = document.getElementById('registerUsername').value;
    const name = document.getElementById('registerName').value;
    const password = document.getElementById('registerPassword').value;
    const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
    const supabase = window.supabaseClient;

    if (password !== passwordConfirm) {
        showError('Паролі не співпадають');
        return;
    }

    if (password.length < 6) {
        showError('Пароль має містити мінімум 6 символів');
        return;
    }

    // Перевірка формату username
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
        showError('Логін має містити 3-20 символів: літери, цифри, _ або -');
        return;
    }

    // Конвертуємо username в email формат для Supabase
    const email = `${username}@local.app`;

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username,
                    full_name: name || username
                }
            }
        });

        if (error) throw error;

        console.log('✅ Успішна реєстрація');
        showSuccess('Реєстрація успішна! Можете увійти з вашим логіном.');
        
        // Перемкнути на форму логіна
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
        
        // Очистити поля
        document.getElementById('registerUsername').value = '';
        document.getElementById('registerName').value = '';
        document.getElementById('registerPassword').value = '';
        document.getElementById('registerPasswordConfirm').value = '';

    } catch (error) {
        console.error('❌ Помилка реєстрації:', error);
        showError('Помилка реєстрації: ' + error.message);
    }
}

// Обробка виходу
async function handleLogout() {
    const supabase = window.supabaseClient;

    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        console.log('✅ Вихід з системи');
        showSuccess('Ви вийшли з системи');

    } catch (error) {
        console.error('❌ Помилка виходу:', error);
        showError('Помилка виходу: ' + error.message);
    }
}

// Обробка успішного входу
async function handleUserLogin() {
    // Приховати форму логіна
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('appSection').style.display = 'block';

    // Показати username або email користувача
    const username = currentUser.user_metadata?.username || currentUser.email.replace('@local.app', '');
    document.getElementById('userEmailDisplay').textContent = username;

    // Завантажити дані
    await loadData();

    // Завантажити кастомні опції користувача
    await loadUserCustomOptions();
}

// Обробка виходу користувача
function handleUserLogout() {
    // Показати форму логіна
    document.getElementById('authSection').style.display = 'flex';
    document.getElementById('appSection').style.display = 'none';

    // Очистити дані користувача
    currentUser = null;
    userCustomOptions = {};

    // Очистити форму
    document.getElementById('reportForm').reset();
}

// Завантаження кастомних опцій користувача
async function loadUserCustomOptions() {
    const supabase = window.supabaseClient;
    
    if (!supabase || !currentUser) return;

    try {
        const { data, error } = await supabase
            .from('user_custom_options')
            .select('*')
            .eq('user_id', currentUser.id);

        if (error) throw error;

        // Організувати опції по типах
        userCustomOptions = {};
        data.forEach(option => {
            if (!userCustomOptions[option.option_type]) {
                userCustomOptions[option.option_type] = [];
            }
            const optionData = {
                value: option.value,
                label: option.label
            };
            // Додаємо координати якщо є
            if (option.coordinates) {
                optionData.coordinates = option.coordinates;
            }
            userCustomOptions[option.option_type].push(optionData);
        });

        console.log('✅ Завантажено кастомні опції користувача:', userCustomOptions);

        // Додати кастомні опції до селектів
        addUserCustomOptionsToSelects();

    } catch (error) {
        console.error('❌ Помилка завантаження кастомних опцій:', error);
    }
}

// Додавання кастомних опцій до селектів
function addUserCustomOptionsToSelects() {
    const selectMappings = {
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

    Object.keys(selectMappings).forEach(selectId => {
        const optionType = selectMappings[selectId];
        const customOpts = userCustomOptions[optionType];

        if (customOpts && customOpts.length > 0) {
            const select = document.getElementById(selectId);
            if (!select) return;

            // Знайти опцію "Інший" та вставити перед нею
            const otherOption = Array.from(select.options).find(opt => 
                opt.value === 'Інший' || opt.value === 'Інша' || opt.value === 'Інше'
            );

            customOpts.forEach(customOpt => {
                // Перевірити, чи вже є така опція
                const exists = Array.from(select.options).some(opt => opt.value === customOpt.value);
                if (!exists) {
                    const option = document.createElement('option');
                    option.value = customOpt.value;
                    option.textContent = customOpt.label + ' 👤';
                    
                    // Зберігаємо координати в data-атрибут для населених пунктів
                    if (customOpt.coordinates) {
                        option.setAttribute('data-coordinates', customOpt.coordinates);
                    }
                    
                    if (otherOption) {
                        select.insertBefore(option, otherOption);
                    } else {
                        select.appendChild(option);
                    }
                }
            });
        }
    });
}

// Збереження кастомної опції
async function saveUserCustomOption(optionType, value, label, coordinates = null) {
    const supabase = window.supabaseClient;
    
    if (!supabase) {
        console.warn('⚠️ Supabase client не ініціалізовано');
        return false;
    }
    
    if (!currentUser) {
        console.warn('⚠️ Користувач не авторизований, currentUser:', currentUser);
        return false;
    }

    console.log(`📝 Спроба збереження: ${optionType} = "${value}"${coordinates ? ` (координати: ${coordinates})` : ''}`);

    try {
        const insertData = {
            user_id: currentUser.id,
            option_type: optionType,
            value: value,
            label: label
        };
        
        // Додаємо координати якщо вони є
        if (coordinates) {
            insertData.coordinates = coordinates;
        }

        const { data, error } = await supabase
            .from('user_custom_options')
            .insert([insertData])
            .select();

        if (error) {
            // Якщо опція вже існує, це нормально
            if (error.code === '23505') {
                console.log('ℹ️ Опція вже існує:', optionType, value);
                return true;
            }
            console.error('❌ Помилка SQL:', error);
            throw error;
        }

        console.log('✅ Кастомну опцію збережено:', data);

        // Додати до локального кешу
        if (!userCustomOptions[optionType]) {
            userCustomOptions[optionType] = [];
        }
        
        const exists = userCustomOptions[optionType].some(opt => opt.value === value);
        if (!exists) {
            const optionData = { value, label };
            if (coordinates) {
                optionData.coordinates = coordinates;
            }
            userCustomOptions[optionType].push(optionData);
        }

        return true;

    } catch (error) {
        console.error('❌ Помилка збереження кастомної опції:', error);
        return false;
    }
}

// Функція для збереження кастомних опцій після відправки форми
async function saveCustomOptionsFromForm(formData) {
    if (!currentUser || !window.supabaseClient) {
        console.log('ℹ️ Користувач не авторизований, кастомні опції не зберігаються');
        return;
    }

    console.log('🔄 Перевірка кастомних опцій для збереження...');

    const customFields = [
        { type: 'subdivisions', field: 'subdivision', selectId: 'subdivision', customId: 'customSubdivision' },
        { type: 'jointWithOptions', field: 'jointWith', selectId: 'jointWith', customId: 'customJointWith' },
        { type: 'droneNames', field: 'droneName', selectId: 'droneName', customId: 'customDroneName' },
        { type: 'droneSizes', field: 'droneSize', selectId: 'droneSize', customId: 'customDroneSize' },
        { type: 'cameraTypes', field: 'cameraType', selectId: 'cameraType', customId: 'customCameraType' },
        { type: 'videoFrequencies', field: 'videoFrequency', selectId: 'videoFrequency', customId: 'customVideoFrequency' },
        { type: 'controlFrequencies', field: 'controlFrequency', selectId: 'controlFrequency', customId: 'customControlFrequency' },
        { type: 'bkOptions', field: 'bk', selectId: 'bk', customId: 'customBk' },
        { type: 'initiationBoardOptions', field: 'initiationBoard', selectId: 'initiationBoard', customId: 'customInitiationBoard' },
        { type: 'targetTypeOptions', field: 'targetType', selectId: 'targetType', customId: 'customTargetType' },
        { type: 'settlementOptions', field: 'settlement', selectId: 'settlement', customId: 'customSettlement' },
        { type: 'statusOptions', field: 'status', selectId: 'status', customId: 'customStatus' },
        { type: 'reasonOptions', field: 'reason', selectId: 'reason', customId: 'customReason' },
        { type: 'lossOptions', field: 'losses', selectId: 'losses', customId: 'customLosses' },
        { type: 'operatorOptions', field: 'operator', selectId: 'operator', customId: 'customOperator' }
    ];

    for (const custom of customFields) {
        const selectElement = document.getElementById(custom.selectId);
        const customInputElement = document.getElementById(custom.customId);
        
        console.log(`🔎 Перевіряю поле: ${custom.selectId}`);
        
        if (!selectElement) {
            console.log(`  ⚠️ Select елемент не знайдено: ${custom.selectId}`);
            continue;
        }

        const selectValue = selectElement.value;
        console.log(`  📋 Значення select: "${selectValue}"`);
        
        const isCustom = selectValue === 'Інший' || selectValue === 'Інша' || selectValue === 'Інше';
        console.log(`  🔍 Чи це кастомне значення? ${isCustom}`);
        
        if (isCustom) {
            if (!customInputElement) {
                console.log(`  ⚠️ Custom input елемент не знайдено: ${custom.customId}`);
                continue;
            }
            
            const customValue = customInputElement.value.trim();
            const shouldSave = customInputElement.getAttribute('data-save-option') === 'true';
            console.log(`  ✏️ Значення custom input: "${customValue}"`);
            console.log(`  💾 Чи потрібно зберігати? ${shouldSave}`);
            
            if (customValue && shouldSave) {
                console.log(`  💾 Зберігаю кастомну опцію: ${custom.type} = "${customValue}"`);
                
                // Для населених пунктів додаємо координати
                let coordinates = null;
                if (custom.type === 'settlementOptions') {
                    const coordinatesInput = document.getElementById('coordinates');
                    if (coordinatesInput && coordinatesInput.value.trim()) {
                        coordinates = coordinatesInput.value.trim();
                        console.log(`  📍 З координатами: ${coordinates}`);
                    }
                }
                
                const result = await saveUserCustomOption(custom.type, customValue, customValue, coordinates);
                console.log(`  ${result ? '✅' : '❌'} Результат збереження: ${result}`);
            } else if (customValue && !shouldSave) {
                console.log(`  ℹ️ Опція не буде збережена (користувач не натиснув кнопку)`);
            } else {
                console.log(`  ⚠️ Custom input порожній`);
            }
        }
    }

    console.log('✅ Перевірка кастомних опцій завершена');
}

// Експорт функцій
window.authFunctions = {
    initAuth,
    getCurrentUser: () => currentUser,
    saveUserCustomOption,
    loadUserCustomOptions,
    saveCustomOptionsFromForm
};

// Автоматична ініціалізація при завантаженні
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        if (window.supabaseClient) {
            initAuth();
        }
    }, 100);
});
