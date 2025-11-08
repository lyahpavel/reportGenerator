-- ШВИДКЕ ВИПРАВЛЕННЯ ПОМИЛКИ РЕЄСТРАЦІЇ
-- Виконайте цей скрипт в Supabase SQL Editor

-- 1. Видаляємо старий тригер
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Створюємо таблицю user_profiles якщо її немає
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Додаємо колонку username якщо її немає
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' AND column_name = 'username'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN username TEXT;
    END IF;
END $$;

-- 4. Заповнюємо username для існуючих користувачів
UPDATE user_profiles 
SET username = SPLIT_PART(email, '@', 1) 
WHERE username IS NULL;

-- 5. Створюємо індекс для username
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- 6. Видаляємо стару функцію
DROP FUNCTION IF EXISTS handle_new_user();

-- 7. Створюємо нову функцію з обробкою помилок
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_username TEXT;
BEGIN
    user_username := COALESCE(NEW.raw_user_meta_data->>'username', SPLIT_PART(NEW.email, '@', 1));
    
    INSERT INTO public.user_profiles (id, username, email, full_name)
    VALUES (
        NEW.id,
        user_username,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', user_username)
    )
    ON CONFLICT (id) DO UPDATE SET
        username = EXCLUDED.username,
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error creating user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 8. Створюємо тригер
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 9. Перевірка - має показати таблицю з колонкою username
SELECT id, username, email, full_name FROM user_profiles LIMIT 5;

-- ГОТОВО! Тепер спробуйте зареєструватися знову.
