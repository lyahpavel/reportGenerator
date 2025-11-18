// Функції для роботи з Supabase

// Завантаження даних з Supabase (тільки user_custom_options)
async function loadDataFromSupabase() {
    try {
        const supabase = window.supabaseClient;
        
        if (!supabase) {
            throw new Error('Supabase client не ініціалізовано');
        }

        // Отримати поточного користувача
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            throw new Error('Користувач не авторизований');
        }

        // Завантажуємо всі опції користувача
        const { data: userOptions, error } = await supabase
            .from('user_custom_options')
            .select('*')
            .eq('user_id', user.id)
            .order('value');

        if (error) {
            console.error('Помилка завантаження даних:', error);
            throw error;
        }

        console.log('📦 Завантажено опцій з БД:', userOptions?.length || 0);

        // Групуємо опції по типах
        const groupedOptions = {};
        userOptions.forEach(option => {
            if (!groupedOptions[option.option_type]) {
                groupedOptions[option.option_type] = [];
            }
            groupedOptions[option.option_type].push(option);
        });

        // Формуємо об'єкт даних у форматі, який очікує додаток
        // Конвертуємо кожен тип в потрібний формат (використовуємо label для відображення)
        const data = {
            subdivisions: (groupedOptions['subdivision'] || []).map(o => ({ name: o.label || o.value })),
            jointWithOptions: (groupedOptions['jointWith'] || []).map(o => ({ name: o.label || o.value })),
            droneNames: (groupedOptions['droneName'] || []).map(o => ({ name: o.label || o.value })),
            droneSizes: (groupedOptions['droneSize'] || []).map(o => ({ size: o.label || o.value })),
            cameraTypes: (groupedOptions['cameraType'] || []).map(o => ({ type: o.label || o.value })),
            videoFrequencies: (groupedOptions['videoFrequency'] || []).map(o => ({ frequency: o.label || o.value })),
            controlFrequencies: (groupedOptions['controlFrequency'] || []).map(o => ({ frequency: o.label || o.value })),
            targetTypeOptions: (groupedOptions['targetType'] || []).map(o => ({ type: o.label || o.value })),
            settlementOptions: (groupedOptions['settlement'] || []).map(o => ({ 
                name: o.label || o.value,
                coordinates: o.coordinates || ''
            })),
            bkOptions: (groupedOptions['bkOptions'] || []).map(o => ({ name: o.label || o.value })),
            initiationBoardOptions: (groupedOptions['initiationBoard'] || []).map(o => ({ name: o.label || o.value })),
            statusOptions: (groupedOptions['status'] || []).map(o => ({ status: o.label || o.value })),
            reasonOptions: (groupedOptions['reason'] || []).map(o => ({ reason: o.label || o.value })),
            lossOptions: (groupedOptions['lossOptions'] || []).map(o => ({ loss: o.label || o.value })),
            operatorOptions: (groupedOptions['operator'] || []).map(o => ({ name: o.label || o.value }))
        };

        console.log('✅ Дані успішно завантажено з Supabase (user_custom_options)');
        console.log('📊 Статистика по типах:', Object.keys(groupedOptions).map(key => `${key}: ${groupedOptions[key].length}`).join(', '));
        
        return data;

    } catch (error) {
        console.error('❌ Помилка завантаження даних з Supabase:', error);
        throw error;
    }
}

// Збереження звіту в Supabase
async function saveReportToSupabase(reportData) {
    try {
        const supabase = window.supabaseClient;
        
        if (!supabase) {
            throw new Error('Supabase client не ініціалізовано');
        }

        // Отримати поточного користувача
        const { data: { user } } = await supabase.auth.getUser();
        
        // Підготовка даних для збереження
        const reportToSave = {
            user_id: user ? user.id : null,
            report_number: reportData.reportNumber,
            subdivision: reportData.subdivision,
            joint_with: reportData.jointWith,
            drone_name: reportData.droneName,
            drone_size: reportData.droneSize,
            camera_type: reportData.cameraType,
            video_frequency: reportData.videoFrequency,
            control_frequency: reportData.controlFrequency,
            fiber_optic: reportData.fiberOptic,
            fiber_length: reportData.fiberLength ? parseFloat(reportData.fiberLength) : null,
            bk: reportData.bk,
            initiation_board: reportData.initiationBoard,
            target_type: reportData.targetType,
            settlement: reportData.settlement,
            coordinates: reportData.coordinates,
            status: reportData.status,
            reason: reportData.reason,
            losses: reportData.losses,
            operator: reportData.operator,
            stream: reportData.stream,
            mission_date: reportData.date,
            mission_time: reportData.time,
            mission_description: reportData.mission
        };

        // Збереження в базу
        const { data, error } = await supabase
            .from('reports')
            .insert([reportToSave])
            .select();

        if (error) {
            console.error('Помилка збереження звіту:', error);
            throw error;
        }

        console.log('✅ Звіт успішно збережено в Supabase:', data);
        showSuccess('Звіт збережено в базу даних');
        return data[0];

    } catch (error) {
        console.error('❌ Помилка збереження звіту в Supabase:', error);
        showError('Не вдалося зберегти звіт в базу даних: ' + error.message);
        throw error;
    }
}

// Завантаження списку всіх звітів
async function loadReportsFromSupabase(limit = 50, offset = 0) {
    try {
        const supabase = window.supabaseClient;
        
        if (!supabase) {
            throw new Error('Supabase client не ініціалізовано');
        }

        const { data, error, count } = await supabase
            .from('reports')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Помилка завантаження звітів:', error);
            throw error;
        }

        console.log(`✅ Завантажено ${data.length} звітів з Supabase`);
        return { reports: data, totalCount: count };

    } catch (error) {
        console.error('❌ Помилка завантаження звітів з Supabase:', error);
        throw error;
    }
}

// Пошук звіту за номером
async function findReportByNumber(reportNumber) {
    try {
        const supabase = window.supabaseClient;
        
        if (!supabase) {
            throw new Error('Supabase client не ініціалізовано');
        }

        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('report_number', reportNumber)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Звіт не знайдено
                return null;
            }
            console.error('Помилка пошуку звіту:', error);
            throw error;
        }

        console.log('✅ Знайдено звіт:', data);
        return data;

    } catch (error) {
        console.error('❌ Помилка пошуку звіту:', error);
        throw error;
    }
}

// Видалення звіту
async function deleteReportFromSupabase(reportId) {
    try {
        const supabase = window.supabaseClient;
        
        if (!supabase) {
            throw new Error('Supabase client не ініціалізовано');
        }

        const { error } = await supabase
            .from('reports')
            .delete()
            .eq('id', reportId);

        if (error) {
            console.error('Помилка видалення звіту:', error);
            throw error;
        }

        console.log('✅ Звіт успішно видалено');
        showSuccess('Звіт видалено');

    } catch (error) {
        console.error('❌ Помилка видалення звіту:', error);
        showError('Не вдалося видалити звіт: ' + error.message);
        throw error;
    }
}

// Оновлення звіту
async function updateReportInSupabase(reportId, updatedData) {
    try {
        const supabase = window.supabaseClient;
        
        if (!supabase) {
            throw new Error('Supabase client не ініціалізовано');
        }

        const { data, error } = await supabase
            .from('reports')
            .update(updatedData)
            .eq('id', reportId)
            .select();

        if (error) {
            console.error('Помилка оновлення звіту:', error);
            throw error;
        }

        console.log('✅ Звіт успішно оновлено:', data);
        showSuccess('Звіт оновлено');
        return data[0];

    } catch (error) {
        console.error('❌ Помилка оновлення звіту:', error);
        showError('Не вдалося оновити звіт: ' + error.message);
        throw error;
    }
}

// Експорт функцій для глобального доступу
window.supabaseFunctions = {
    loadDataFromSupabase,
    saveReportToSupabase,
    loadReportsFromSupabase,
    findReportByNumber,
    deleteReportFromSupabase,
    updateReportInSupabase
};
