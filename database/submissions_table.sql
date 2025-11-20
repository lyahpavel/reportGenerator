-- Таблиця submissions для зберігання подань з ресурсами
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date_from DATE NOT NULL,
    date_to DATE NOT NULL,
    crew_members TEXT[] DEFAULT '{}',
    drones JSONB DEFAULT '[]',
    bk JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Індекси для швидкого пошуку
    CONSTRAINT submissions_user_id_idx UNIQUE (user_id)
);

-- Індекс для швидкого пошуку по користувачу
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);

-- Індекс для пошуку по датах
CREATE INDEX IF NOT EXISTS idx_submissions_dates ON public.submissions(date_from, date_to);

-- RLS (Row Level Security) - користувач бачить тільки свої подання
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Політика SELECT - користувач бачить тільки свої записи
CREATE POLICY "Users can view their own submissions"
    ON public.submissions
    FOR SELECT
    USING (auth.uid() = user_id);

-- Політика INSERT - користувач може створювати свої записи
CREATE POLICY "Users can insert their own submissions"
    ON public.submissions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Політика UPDATE - користувач може оновлювати свої записи
CREATE POLICY "Users can update their own submissions"
    ON public.submissions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Політика DELETE - користувач може видаляти свої записи
CREATE POLICY "Users can delete their own submissions"
    ON public.submissions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Функція для автоматичного оновлення updated_at
CREATE OR REPLACE FUNCTION update_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригер для оновлення updated_at
CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_submissions_updated_at();

-- Коментарі для документації
COMMENT ON TABLE public.submissions IS 'Зберігає подання з інформацією про чергування, екіпаж та ресурси (дрони, БК)';
COMMENT ON COLUMN public.submissions.user_id IS 'ID користувача, який створив подання';
COMMENT ON COLUMN public.submissions.date_from IS 'Дата початку чергування';
COMMENT ON COLUMN public.submissions.date_to IS 'Дата закінчення чергування';
COMMENT ON COLUMN public.submissions.crew_members IS 'Масив імен членів екіпажу';
COMMENT ON COLUMN public.submissions.drones IS 'JSON масив об''єктів {name: string, label: string, count: number}';
COMMENT ON COLUMN public.submissions.bk IS 'JSON масив об''єктів {name: string, label: string, count: number}';
