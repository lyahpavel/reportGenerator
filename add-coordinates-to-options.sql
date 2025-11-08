-- Міграція для додавання поля coordinates до таблиці user_custom_options
-- Виконайте цей скрипт в Supabase SQL Editor

-- Додаємо стовпець coordinates якщо його немає
ALTER TABLE user_custom_options 
ADD COLUMN IF NOT EXISTS coordinates TEXT;

-- Коментар для документації
COMMENT ON COLUMN user_custom_options.coordinates IS 'Координати для населених пунктів (формат: "50.4501, 30.5234")';
