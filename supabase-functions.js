// Функції для роботи з Supabase

// Завантаження даних з Supabase
async function loadDataFromSupabase() {
    try {
        const supabase = window.supabaseClient;
        
        if (!supabase) {
            throw new Error('Supabase client не ініціалізовано');
        }

        // Завантажуємо всі дані паралельно
        const [
            subdivisionsResult,
            jointWithResult,
            droneNamesResult,
            droneSizesResult,
            cameraTypesResult,
            videoFreqResult,
            controlFreqResult,
            targetTypesResult,
            settlementsResult,
            bkOptionsResult,
            initiationBoardResult,
            statusOptionsResult,
            reasonOptionsResult,
            lossOptionsResult,
            operatorOptionsResult
        ] = await Promise.all([
            supabase.from('subdivisions').select('*').order('id'),
            supabase.from('joint_with_options').select('*').order('id'),
            supabase.from('drone_names').select('*').order('id'),
            supabase.from('drone_sizes').select('*').order('id'),
            supabase.from('camera_types').select('*').order('id'),
            supabase.from('video_frequencies').select('*').order('id'),
            supabase.from('control_frequencies').select('*').order('id'),
            supabase.from('target_types').select('*').order('id'),
            supabase.from('settlements').select('*').order('id'),
            supabase.from('bk_options').select('*').order('id'),
            supabase.from('initiation_board_options').select('*').order('id'),
            supabase.from('status_options').select('*').order('id'),
            supabase.from('reason_options').select('*').order('id'),
            supabase.from('loss_options').select('*').order('id'),
            supabase.from('operator_options').select('*').order('id')
        ]);

        // Перевірка помилок
        const errors = [
            subdivisionsResult, jointWithResult, droneNamesResult, droneSizesResult,
            cameraTypesResult, videoFreqResult, controlFreqResult, targetTypesResult,
            settlementsResult, bkOptionsResult, initiationBoardResult, statusOptionsResult,
            reasonOptionsResult, lossOptionsResult, operatorOptionsResult
        ].filter(result => result.error);

        if (errors.length > 0) {
            console.error('Помилки при завантаженні даних:', errors);
            throw new Error('Не вдалося завантажити деякі дані з Supabase');
        }

        // Формуємо об'єкт даних у форматі, який очікує додаток
        const data = {
            subdivisions: subdivisionsResult.data,
            jointWithOptions: jointWithResult.data,
            droneNames: droneNamesResult.data,
            droneSizes: droneSizesResult.data,
            cameraTypes: cameraTypesResult.data,
            videoFrequencies: videoFreqResult.data,
            controlFrequencies: controlFreqResult.data,
            targetTypeOptions: targetTypesResult.data,
            settlementOptions: settlementsResult.data,
            bkOptions: bkOptionsResult.data,
            initiationBoardOptions: initiationBoardResult.data,
            statusOptions: statusOptionsResult.data,
            reasonOptions: reasonOptionsResult.data,
            lossOptions: lossOptionsResult.data,
            operatorOptions: operatorOptionsResult.data
        };

        console.log('✅ Дані успішно завантажено з Supabase');
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
