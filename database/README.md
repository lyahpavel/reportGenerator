# Створення таблиці submissions в Supabase

## Інструкція

1. Відкрий [Supabase Dashboard](https://supabase.com/dashboard)
2. Вибери свій проект
3. Перейди в **SQL Editor** (ліва панель)
4. Натисни **New query**
5. Скопіюй вміст файлу `submissions_table.sql`
6. Вставь в редактор
7. Натисни **Run** або `Cmd/Ctrl + Enter`

## Що створить цей SQL

✅ **Таблиця `submissions`** з полями:
- `id` - UUID, автоматичний primary key
- `user_id` - UUID, посилання на користувача
- `date_from` - дата початку чергування
- `date_to` - дата закінчення чергування
- `crew_members` - масив імен операторів
- `drones` - JSON масив об'єктів `{name: string, count: number}`
- `bk` - JSON масив об'єктів `{name: string, count: number}`
- `created_at` - дата створення
- `updated_at` - дата оновлення

✅ **Row Level Security (RLS)** - користувач бачить тільки свої подання

✅ **Тригер** для автоматичного оновлення `updated_at`

✅ **Індекси** для швидкого пошуку по user_id та датах

## Перевірка

Після виконання SQL можна перевірити в **Table Editor**:
- Таблиця `submissions` має з'явитись
- Вкладка **Policies** покаже 4 політики RLS
- Спроба створити запис через додаток має працювати

## Структура даних

### Приклад drones:
```json
[
  {"name": "DJI Mavic 3", "count": 5},
  {"name": "DJI Mini 3 Pro", "count": 2}
]
```

### Приклад bk:
```json
[
  {"name": "VOG-17", "count": 10},
  {"name": "RGD-5", "count": 15}
]
```

### Приклад crew_members:
```json
["Іванов І.І.", "Петров П.П.", "Сидоров С.С."]
```

## Відкат (якщо щось пішло не так)

```sql
DROP TABLE IF EXISTS public.submissions CASCADE;
DROP FUNCTION IF EXISTS update_submissions_updated_at() CASCADE;
```
