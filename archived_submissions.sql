-- Таблиця для архівних подань
CREATE TABLE IF NOT EXISTS archived_submissions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    submission_id UUID, -- ID оригінального подання (UUID, бо submissions.id це UUID)
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    crew_members TEXT[] NOT NULL, -- Масив імен членів екіпажу
    crew_leader TEXT, -- Старший екіпажу
    drones JSONB, -- Масив дронів з повними характеристиками
    bk JSONB, -- Масив боєкомплектів
    archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Індекси для швидкого пошуку
CREATE INDEX IF NOT EXISTS idx_archived_submissions_user_id ON archived_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_archived_submissions_date_from ON archived_submissions(date_from);
CREATE INDEX IF NOT EXISTS idx_archived_submissions_date_to ON archived_submissions(date_to);
CREATE INDEX IF NOT EXISTS idx_archived_submissions_archived_at ON archived_submissions(archived_at);

-- Додати колонки до таблиці reports для зв'язку з архівним поданням
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS archived_submission_id BIGINT REFERENCES archived_submissions(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS submission_archived BOOLEAN DEFAULT FALSE;

-- Індекс для зв'язку звітів з архівними поданнями
CREATE INDEX IF NOT EXISTS idx_reports_archived_submission ON reports(archived_submission_id);

-- Коментарі для документації
COMMENT ON TABLE archived_submissions IS 'Архівні подання - збережені подання після закриття з усіма деталями';
COMMENT ON COLUMN archived_submissions.submission_id IS 'UUID оригінального подання з таблиці submissions (перед видаленням)';
COMMENT ON COLUMN archived_submissions.drones IS 'Масив дронів: [{name, label, count, type, videoFrequency, controlFrequency, channel, hasFiberOptic, fiberCableLength, modificationStatus, modification}]';
COMMENT ON COLUMN archived_submissions.bk IS 'Масив боєкомплектів: [{name, label, count}]';
COMMENT ON COLUMN reports.archived_submission_id IS 'Посилання на архівне подання, до якого належить звіт';
COMMENT ON COLUMN reports.submission_archived IS 'Прапорець чи звіт належить до архівованого подання';

-- RLS policies (Row Level Security)
ALTER TABLE archived_submissions ENABLE ROW LEVEL SECURITY;

-- Політика: користувачі бачать тільки свої архівні подання
CREATE POLICY "Users can view own archived submissions" ON archived_submissions
    FOR SELECT USING (auth.uid() = user_id);

-- Політика: користувачі можуть створювати свої архівні подання
CREATE POLICY "Users can create own archived submissions" ON archived_submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Політика: користувачі можуть оновлювати свої архівні подання
CREATE POLICY "Users can update own archived submissions" ON archived_submissions
    FOR UPDATE USING (auth.uid() = user_id);

-- Політика: користувачі можуть видаляти свої архівні подання
CREATE POLICY "Users can delete own archived submissions" ON archived_submissions
    FOR DELETE USING (auth.uid() = user_id);
