# 🚨 ШВИДКЕ ВИПРАВЛЕННЯ: Таблиця user_custom_options не знайдена

## Проблема
```
Could not find the table 'public.user_custom_options' in the schema cache
```

## Рішення (2 хвилини)

### Крок 1: Відкрийте Supabase SQL Editor
1. Перейдіть на https://supabase.com
2. Відкрийте ваш проект
3. На лівій панелі натисніть **SQL Editor**

### Крок 2: Виконайте SQL скрипт
1. Натисніть **New Query**
2. Відкрийте файл `supabase-auth-schema.sql` у редакторі
3. Скопіюйте **весь** вміст файлу
4. Вставте в SQL Editor
5. Натисніть **Run** (або `Ctrl+Enter`)

### Крок 3: Перевірте створення таблиць
Після виконання скрипта перейдіть до **Table Editor** і перевірте, що створені:
- ✅ `user_profiles`
- ✅ `user_custom_options`

### Крок 4: Оновіть сторінку
1. Поверніться до додатку
2. Оновіть сторінку (F5)
3. Спробуйте створити звіт з кастомною опцією знову

---

## Що робить цей скрипт?

Файл `supabase-auth-schema.sql` створює:
1. **Таблицю `user_profiles`** - профілі користувачів
2. **Таблицю `user_custom_options`** - персональні опції
3. **RLS політики** - для безпеки даних
4. **Тригери** - для автоматичного створення профілів

---

## Альтернатива: Швидка команда SQL

Якщо не хочете копіювати весь файл, виконайте цей мінімальний SQL:

\`\`\`sql
-- Таблиця для користувацьких опцій
CREATE TABLE IF NOT EXISTS user_custom_options (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    option_type TEXT NOT NULL,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, option_type, value)
);

-- Індекси
CREATE INDEX idx_user_custom_options_user_id ON user_custom_options(user_id);
CREATE INDEX idx_user_custom_options_type ON user_custom_options(option_type);

-- RLS
ALTER TABLE user_custom_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom options" ON user_custom_options
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom options" ON user_custom_options
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom options" ON user_custom_options
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom options" ON user_custom_options
    FOR DELETE USING (auth.uid() = user_id);
\`\`\`

---

## Після виконання SQL

1. Оновіть додаток
2. В консолі має з'явитися:
   ```
   ✅ Завантажено кастомні опції користувача: {}
   ```
   (порожній об'єкт - це нормально для нового користувача)

3. Створіть звіт з "Інший" - опція збережеться!

---

## Потрібна допомога?

Перевірте:
- ✅ Чи виконано `supabase-schema.sql` (основні таблиці)
- ✅ Чи виконано `supabase-data.sql` (початкові дані)
- ✅ Чи виконано `supabase-auth-schema.sql` (автентифікація)
- ✅ Чи правильні ключі в `supabase-config.js`
