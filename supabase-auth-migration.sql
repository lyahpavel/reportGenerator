-- Міграція для додавання username до існуючої БД
-- Виконайте цей скрипт, якщо у вас вже є користувачі в базі

-- Додати колонку username, якщо її ще немає
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- Заповнити username для існуючих користувачів (з email)
UPDATE user_profiles 
SET username = SPLIT_PART(email, '@', 1) 
WHERE username IS NULL;

-- Зробити username обов'язковим і унікальним
ALTER TABLE user_profiles ALTER COLUMN username SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- Оновити функцію створення профілю
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, username, email, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;
