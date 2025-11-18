# План міграції бази даних

## Поточна структура
- Окремі таблиці для кожного типу даних (15+ таблиць)
- user_custom_options (користувацькі додаткові)

## Нова структура
Одна таблиця: **user_custom_options**

### Поля:
```sql
CREATE TABLE user_custom_options (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    option_type TEXT NOT NULL, -- 'subdivision', 'droneName', 'droneSize', etc.
    category TEXT, -- 'general', 'drone', 'combat', 'technical'
    value TEXT NOT NULL,
    label TEXT,
    coordinates TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, option_type, value)
);
```

### Категорії:
- **general**: subdivision, jointWith, operator
- **drone**: droneName, droneSize, cameraType, videoFrequency, controlFrequency
- **combat**: targetType, status, reason, losses
- **technical**: bkOptions, initiationBoard, settlement

## Кроки міграції:
1. ✅ Експортувати дані користувача tysa з усіх таблиць
2. ✅ Вставити в user_custom_options з відповідним option_type та category
3. ✅ Видалити старі таблиці
4. ✅ Оновити код завантаження даних (supabase-functions.js)
5. ✅ Тестування

## SQL для міграції:
```sql
-- 1. Додати поле category (якщо його немає)
ALTER TABLE user_custom_options ADD COLUMN IF NOT EXISTS category TEXT;

-- 2. Отримати user_id для tysa
-- (виконати в Supabase Dashboard)

-- 3. Вставити дані з кожної таблиці
-- Приклад для subdivisions:
INSERT INTO user_custom_options (user_id, option_type, category, value, label)
SELECT 
    '[USER_ID]'::uuid,
    'subdivision',
    'general',
    name,
    name
FROM subdivisions
ON CONFLICT (user_id, option_type, value) DO NOTHING;

-- Повторити для всіх таблиць...

-- 4. Видалити старі таблиці (після підтвердження)
DROP TABLE IF EXISTS subdivisions;
DROP TABLE IF EXISTS joint_with_options;
-- і т.д.
```
