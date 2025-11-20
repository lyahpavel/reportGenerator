-- Додавання колонки report_text до таблиці reports
-- Виконати в Supabase SQL Editor

ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS report_text TEXT;

-- Додати коментар до колонки
COMMENT ON COLUMN reports.report_text IS 'Повний текст згенерованого звіту';
