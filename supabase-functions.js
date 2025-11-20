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

        // Формуємо об'єкт даних у форматі, який очікує populateSelect: { value, label }
        const data = {
            subdivisions: (groupedOptions['subdivision'] || []).map(o => ({ 
                value: o.value, 
                label: o.label 
            })),
            jointWithOptions: (groupedOptions['jointWith'] || []).map(o => ({ 
                value: o.value, 
                label: o.label 
            })),
            droneNames: (groupedOptions['droneName'] || []).map(o => ({ 
                value: o.value, 
                label: o.label 
            })),
            droneSizes: (groupedOptions['droneSize'] || []).map(o => ({ 
                value: o.value, 
                label: o.label 
            })),
            cameraTypes: (groupedOptions['cameraType'] || []).map(o => ({ 
                value: o.value, 
                label: o.label 
            })),
            videoFrequencies: (groupedOptions['videoFrequency'] || []).map(o => ({ 
                value: o.value, 
                label: o.label 
            })),
            controlFrequencies: (groupedOptions['controlFrequency'] || []).map(o => ({ 
                value: o.value, 
                label: o.label 
            })),
            targetTypeOptions: (groupedOptions['targetType'] || []).map(o => ({ 
                value: o.value, 
                label: o.label 
            })),
            settlementOptions: (groupedOptions['settlement'] || []).map(o => ({ 
                value: o.value, 
                label: o.label,
                coordinates: o.coordinates || ''
            })),
            bkOptions: (groupedOptions['bkOptions'] || []).map(o => ({ 
                value: o.value, 
                label: o.label 
            })),
            initiationBoardOptions: (groupedOptions['initiationBoard'] || []).map(o => ({ 
                value: o.value, 
                label: o.label 
            })),
            statusOptions: (groupedOptions['status'] || []).map(o => ({ 
                value: o.value, 
                label: o.label 
            })),
            reasonOptions: (groupedOptions['reason'] || []).map(o => ({ 
                value: o.value, 
                label: o.label 
            })),
            lossOptions: (groupedOptions['lossOptions'] || []).map(o => ({ 
                value: o.value, 
                label: o.label 
            })),
            operatorOptions: (groupedOptions['operator'] || []).map(o => ({ 
                value: o.value, 
                label: o.label 
            }))
        };

        console.log('✅ Дані успішно завантажено з Supabase (user_custom_options)');
        console.log('📊 Статистика по типах:', Object.keys(groupedOptions).map(key => `${key}: ${groupedOptions[key].length}`).join(', '));
        
        return data;

    } catch (error) {
        console.error('❌ Помилка завантаження даних з Supabase:', error);
        throw error;
    }
}

// Віднімання ресурсів з подання після створення звіту
async function decrementSubmissionResources(reportData) {
    try {
        console.log('🔄 decrementSubmissionResources викликано з даними:', {
            droneName: reportData.droneName,
            bk: reportData.bk
        });
        
        const supabase = window.supabaseClient;
        if (!supabase) {
            console.log('❌ Supabase client не доступний');
            return;
        }

        // Отримуємо поточне подання
        const currentSubmission = window.submissionFunctions?.getCurrentSubmission?.();
        if (!currentSubmission || !currentSubmission.id) {
            console.log('❌ Немає активного подання для віднімання ресурсів');
            return;
        }

        console.log('📋 Поточне подання:', {
            id: currentSubmission.id,
            drones: currentSubmission.drones?.length,
            bk: currentSubmission.bk?.length
        });

        let updated = false;

        // Віднімаємо дрон якщо використовувався
        if (reportData.droneName && currentSubmission.drones) {
            const droneIndex = currentSubmission.drones.findIndex(d => d.name === reportData.droneName);
            console.log(`🔍 Шукаємо дрон "${reportData.droneName}", знайдено індекс: ${droneIndex}`);
            if (droneIndex !== -1 && currentSubmission.drones[droneIndex].count > 0) {
                currentSubmission.drones[droneIndex].count -= 1;
                updated = true;
                console.log(`📉 Зменшено кількість дрону "${reportData.droneName}": залишилось ${currentSubmission.drones[droneIndex].count}`);
            }
        }

        // Віднімаємо БК якщо використовувався
        if (reportData.bk && currentSubmission.bk) {
            const bkIndex = currentSubmission.bk.findIndex(b => b.name === reportData.bk);
            console.log(`🔍 Шукаємо БК "${reportData.bk}", знайдено індекс: ${bkIndex}`);
            if (bkIndex !== -1 && currentSubmission.bk[bkIndex].count > 0) {
                currentSubmission.bk[bkIndex].count -= 1;
                updated = true;
                console.log(`📉 Зменшено кількість БК "${reportData.bk}": залишилось ${currentSubmission.bk[bkIndex].count}`);
            }
        }

        // Оновлюємо подання в БД якщо були зміни
        if (updated) {
            console.log('💾 Оновлюємо подання в БД...');
            const { data: { user } } = await supabase.auth.getUser();
            const { error } = await supabase
                .from('submissions')
                .update({
                    drones: currentSubmission.drones,
                    bk: currentSubmission.bk,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', user.id);

            if (error) {
                console.error('❌ Помилка оновлення подання:', error);
            } else {
                console.log('✅ Подання успішно оновлено в БД після створення звіту');
                // Перезавантажуємо подання для оновлення UI
                if (window.submissionFunctions?.loadCurrentSubmission) {
                    await window.submissionFunctions.loadCurrentSubmission();
                    console.log('✅ Подання перезавантажене з БД');
                }
            }
        } else {
            console.log('ℹ️ Не було змін для оновлення подання');
        }

    } catch (error) {
        console.error('❌ Помилка віднімання ресурсів:', error);
        // Не кидаємо помилку далі, щоб не заважати збереженню звіту
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
            report_text: reportData.reportText || null,
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
        
        // Віднімаємо ресурси з подання після успішного збереження
        await decrementSubmissionResources(reportData);
        
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
