-- SQL скрипт для додавання автентифікації та користувацьких опцій
-- Виконайте після supabase-schema.sql

-- Таблиця для профілів користувачів (розширення auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця для користувацьких опцій (коли вибирають "Інший")
CREATE TABLE IF NOT EXISTS user_custom_options (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    option_type TEXT NOT NULL, -- 'subdivision', 'jointWith', 'droneName', 'bk', etc.
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, option_type, value)
);

-- Індекси для швидшого пошуку
CREATE INDEX idx_user_custom_options_user_id ON user_custom_options(user_id);
CREATE INDEX idx_user_custom_options_type ON user_custom_options(option_type);

-- Оновлення таблиці звітів - додаємо прив'язку до користувача
ALTER TABLE reports ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);

-- Функція для автоматичного оновлення updated_at у user_profiles
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at_trigger 
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_user_profiles_updated_at();

-- Функція для автоматичного створення профілю при реєстрації
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Тригер на створення нового користувача
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Row Level Security для user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Row Level Security для user_custom_options
ALTER TABLE user_custom_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own custom options" ON user_custom_options
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own custom options" ON user_custom_options
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom options" ON user_custom_options
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom options" ON user_custom_options
    FOR DELETE USING (auth.uid() = user_id);

-- Оновлення RLS для таблиці reports - тільки власні звіти
DROP POLICY IF EXISTS "Enable read access for all users" ON reports;
DROP POLICY IF EXISTS "Enable insert for all users" ON reports;
DROP POLICY IF EXISTS "Enable update for all users" ON reports;

CREATE POLICY "Users can view their own reports" ON reports
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports" ON reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" ON reports
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" ON reports
    FOR DELETE USING (auth.uid() = user_id);
