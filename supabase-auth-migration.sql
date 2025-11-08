-- Міграція для додавання username до існуючої БД
-- Виконайте цей скрипт, якщо у вас вже є користувачі в базі

-- Видаляємо старий тригер
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Додати колонку username, якщо її ще немає
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- Заповнити username для існуючих користувачів (з email)
UPDATE user_profiles 
SET username = SPLIT_PART(email, '@', 1) 
WHERE username IS NULL;

-- Зробити username унікальним (не обов'язковим для сумісності)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- Оновити функцію створення профілю
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

-- Створюємо тригер
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
