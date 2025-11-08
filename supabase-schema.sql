-- SQL скрипт для створення таблиць у Supabase
-- Виконайте цей скрипт у SQL Editor в Supabase Dashboard

-- Таблиця для налаштувань підрозділів
CREATE TABLE IF NOT EXISTS subdivisions (
    id SERIAL PRIMARY KEY,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця для опцій "Спільно з"
CREATE TABLE IF NOT EXISTS joint_with_options (
    id SERIAL PRIMARY KEY,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця для назв дронів
CREATE TABLE IF NOT EXISTS drone_names (
    id SERIAL PRIMARY KEY,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця для розмірів дронів
CREATE TABLE IF NOT EXISTS drone_sizes (
    id SERIAL PRIMARY KEY,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця для типів камер
CREATE TABLE IF NOT EXISTS camera_types (
    id SERIAL PRIMARY KEY,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця для частот відео
CREATE TABLE IF NOT EXISTS video_frequencies (
    id SERIAL PRIMARY KEY,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця для частот керування
CREATE TABLE IF NOT EXISTS control_frequencies (
    id SERIAL PRIMARY KEY,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця для типів цілей
CREATE TABLE IF NOT EXISTS target_types (
    id SERIAL PRIMARY KEY,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця для населених пунктів
CREATE TABLE IF NOT EXISTS settlements (
    id SERIAL PRIMARY KEY,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    coordinates TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця для опцій БК
CREATE TABLE IF NOT EXISTS bk_options (
    id SERIAL PRIMARY KEY,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця для плат ініціації
CREATE TABLE IF NOT EXISTS initiation_board_options (
    id SERIAL PRIMARY KEY,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця для статусів
CREATE TABLE IF NOT EXISTS status_options (
    id SERIAL PRIMARY KEY,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця для причин
CREATE TABLE IF NOT EXISTS reason_options (
    id SERIAL PRIMARY KEY,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця для втрат
CREATE TABLE IF NOT EXISTS loss_options (
    id SERIAL PRIMARY KEY,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця для операторів
CREATE TABLE IF NOT EXISTS operator_options (
    id SERIAL PRIMARY KEY,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Таблиця для збереження звітів
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    report_number TEXT NOT NULL UNIQUE,
    subdivision TEXT NOT NULL,
    joint_with TEXT,
    drone_name TEXT,
    drone_size TEXT,
    camera_type TEXT,
    video_frequency TEXT,
    control_frequency TEXT,
    fiber_optic BOOLEAN DEFAULT FALSE,
    fiber_length NUMERIC,
    bk TEXT,
    initiation_board TEXT,
    target_type TEXT,
    settlement TEXT,
    coordinates TEXT,
    status TEXT,
    reason TEXT,
    losses TEXT,
    operator TEXT,
    stream BOOLEAN DEFAULT FALSE,
    mission_date DATE,
    mission_time TIME,
    mission_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Індекси для швидшого пошуку
CREATE INDEX idx_reports_report_number ON reports(report_number);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
CREATE INDEX idx_reports_subdivision ON reports(subdivision);

-- Тригер для оновлення updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) - дозволяємо всім читати і писати (можна налаштувати згодом)
ALTER TABLE subdivisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE joint_with_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE drone_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE drone_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE camera_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_frequencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_frequencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE target_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bk_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE initiation_board_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE reason_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE loss_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE operator_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Політики доступу (для початку дозволяємо всім читати і писати)
CREATE POLICY "Enable read access for all users" ON subdivisions FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON joint_with_options FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON drone_names FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON drone_sizes FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON camera_types FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON video_frequencies FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON control_frequencies FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON target_types FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON settlements FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON bk_options FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON initiation_board_options FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON status_options FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON reason_options FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON loss_options FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON operator_options FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON reports FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON reports FOR UPDATE USING (true);
