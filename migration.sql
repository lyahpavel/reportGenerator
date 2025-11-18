-- МІГРАЦІЯ БАЗИ ДАНИХ: Перенесення стандартних даних в user_custom_options
-- Виконувати по порядку в Supabase SQL Editor

-- КРОК 0: Перевірка структури таблиць (запустити спочатку, щоб побачити назви колонок)
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN (
    'subdivisions', 'joint_with_options', 'drone_names', 'drone_sizes',
    'camera_types', 'video_frequencies', 'control_frequencies',
    'target_types', 'settlements', 'bk_options', 'initiation_board_options',
    'status_options', 'reason_options', 'loss_options', 'operator_options'
  )
ORDER BY table_name, ordinal_position;

-- КРОК 1: Отримати user_id для користувача tysa
-- Запустити цей запит і скопіювати user_id
SELECT id, email FROM auth.users WHERE email = 'tysa@local.app';
-- Результат: скопіюйте ID і замініть fe6e9d4d-f93f-4b16-9648-6157650310f7 нижче

-- КРОК 2: Додати поле category якщо його немає
ALTER TABLE user_custom_options ADD COLUMN IF NOT EXISTS category TEXT;

-- КРОК 3: Перенести дані з кожної таблиці в user_custom_options
-- Замініть fe6e9d4d-f93f-4b16-9648-6157650310f7 на реальний UUID з кроку 1

-- Підрозділи (general)
INSERT INTO user_custom_options (user_id, option_type, category, value, label)
SELECT 
    'fe6e9d4d-f93f-4b16-9648-6157650310f7'::uuid,
    'subdivision',
    'general',
    value,
    label
FROM subdivisions
ON CONFLICT (user_id, option_type, value) DO NOTHING;

-- Сумісно з (general)
INSERT INTO user_custom_options (user_id, option_type, category, value, label)
SELECT 
    'fe6e9d4d-f93f-4b16-9648-6157650310f7'::uuid,
    'jointWith',
    'general',
    value,
    label
FROM joint_with_options
ON CONFLICT (user_id, option_type, value) DO NOTHING;

-- Оператори (general)
INSERT INTO user_custom_options (user_id, option_type, category, value, label)
SELECT 
    'fe6e9d4d-f93f-4b16-9648-6157650310f7'::uuid,
    'operator',
    'general',
    value,
    label
FROM operator_options
ON CONFLICT (user_id, option_type, value) DO NOTHING;

-- Назви дронів (drone)
INSERT INTO user_custom_options (user_id, option_type, category, value, label)
SELECT 
    'fe6e9d4d-f93f-4b16-9648-6157650310f7'::uuid,
    'droneName',
    'drone',
    value,
    label
FROM drone_names
ON CONFLICT (user_id, option_type, value) DO NOTHING;

-- Розміри дронів (drone)
INSERT INTO user_custom_options (user_id, option_type, category, value, label)
SELECT 
    'fe6e9d4d-f93f-4b16-9648-6157650310f7'::uuid,
    'droneSize',
    'drone',
    value,
    label
FROM drone_sizes
ON CONFLICT (user_id, option_type, value) DO NOTHING;

-- Типи камер (drone)
INSERT INTO user_custom_options (user_id, option_type, category, value, label)
SELECT 
    'fe6e9d4d-f93f-4b16-9648-6157650310f7'::uuid,
    'cameraType',
    'drone',
    value,
    label
FROM camera_types
ON CONFLICT (user_id, option_type, value) DO NOTHING;

-- Частоти відео (drone)
INSERT INTO user_custom_options (user_id, option_type, category, value, label)
SELECT 
    'fe6e9d4d-f93f-4b16-9648-6157650310f7'::uuid,
    'videoFrequency',
    'drone',
    value,
    label
FROM video_frequencies
ON CONFLICT (user_id, option_type, value) DO NOTHING;

-- Частоти керування (drone)
INSERT INTO user_custom_options (user_id, option_type, category, value, label)
SELECT 
    'fe6e9d4d-f93f-4b16-9648-6157650310f7'::uuid,
    'controlFrequency',
    'drone',
    value,
    label
FROM control_frequencies
ON CONFLICT (user_id, option_type, value) DO NOTHING;

-- Типи цілей (combat)
INSERT INTO user_custom_options (user_id, option_type, category, value, label)
SELECT 
    'fe6e9d4d-f93f-4b16-9648-6157650310f7'::uuid,
    'targetType',
    'combat',
    value,
    label
FROM target_types
ON CONFLICT (user_id, option_type, value) DO NOTHING;

-- Статуси (combat)
INSERT INTO user_custom_options (user_id, option_type, category, value, label)
SELECT 
    'fe6e9d4d-f93f-4b16-9648-6157650310f7'::uuid,
    'status',
    'combat',
    value,
    label
FROM status_options
ON CONFLICT (user_id, option_type, value) DO NOTHING;

-- Причини (combat)
INSERT INTO user_custom_options (user_id, option_type, category, value, label)
SELECT 
    'fe6e9d4d-f93f-4b16-9648-6157650310f7'::uuid,
    'reason',
    'combat',
    value,
    label
FROM reason_options
ON CONFLICT (user_id, option_type, value) DO NOTHING;

-- Втрати (combat)
INSERT INTO user_custom_options (user_id, option_type, category, value, label)
SELECT 
    'fe6e9d4d-f93f-4b16-9648-6157650310f7'::uuid,
    'lossOptions',
    'combat',
    value,
    label
FROM loss_options
ON CONFLICT (user_id, option_type, value) DO NOTHING;

-- БК опції (technical)
INSERT INTO user_custom_options (user_id, option_type, category, value, label)
SELECT 
    'fe6e9d4d-f93f-4b16-9648-6157650310f7'::uuid,
    'bkOptions',
    'technical',
    value,
    label
FROM bk_options
ON CONFLICT (user_id, option_type, value) DO NOTHING;

-- Плати ініціації (technical)
INSERT INTO user_custom_options (user_id, option_type, category, value, label)
SELECT 
    'fe6e9d4d-f93f-4b16-9648-6157650310f7'::uuid,
    'initiationBoard',
    'technical',
    value,
    label
FROM initiation_board_options
ON CONFLICT (user_id, option_type, value) DO NOTHING;

-- Населені пункти (technical)
INSERT INTO user_custom_options (user_id, option_type, category, value, label, coordinates)
SELECT 
    'fe6e9d4d-f93f-4b16-9648-6157650310f7'::uuid,
    'settlement',
    'technical',
    value,
    label,
    coordinates
FROM settlements
ON CONFLICT (user_id, option_type, value) DO NOTHING;

-- КРОК 4: Перевірка - подивитися скільки записів додалося
SELECT option_type, category, COUNT(*) as count
FROM user_custom_options
WHERE user_id = 'fe6e9d4d-f93f-4b16-9648-6157650310f7'::uuid
GROUP BY option_type, category
ORDER BY category, option_type;

-- КРОК 5: Після підтвердження що все добре - видалити старі таблиці
-- УВАГА! Це незворотна операція. Виконувати тільки після перевірки!

DROP TABLE IF EXISTS subdivisions CASCADE;
DROP TABLE IF EXISTS joint_with_options CASCADE;
DROP TABLE IF EXISTS drone_names CASCADE;
DROP TABLE IF EXISTS drone_sizes CASCADE;
DROP TABLE IF EXISTS camera_types CASCADE;
DROP TABLE IF EXISTS video_frequencies CASCADE;
DROP TABLE IF EXISTS control_frequencies CASCADE;
DROP TABLE IF EXISTS target_types CASCADE;
DROP TABLE IF EXISTS settlements CASCADE;
DROP TABLE IF EXISTS bk_options CASCADE;
DROP TABLE IF EXISTS initiation_board_options CASCADE;
DROP TABLE IF EXISTS status_options CASCADE;
DROP TABLE IF EXISTS reason_options CASCADE;
DROP TABLE IF EXISTS loss_options CASCADE;
DROP TABLE IF EXISTS operator_options CASCADE;
