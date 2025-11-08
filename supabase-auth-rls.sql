-- Додаткові RLS політики для довідникових таблиць
-- Виконайте після supabase-auth-schema.sql

-- Видалити старі політики "для всіх"
DROP POLICY IF EXISTS "Enable read access for all users" ON subdivisions;
DROP POLICY IF EXISTS "Enable read access for all users" ON joint_with_options;
DROP POLICY IF EXISTS "Enable read access for all users" ON drone_names;
DROP POLICY IF EXISTS "Enable read access for all users" ON drone_sizes;
DROP POLICY IF EXISTS "Enable read access for all users" ON camera_types;
DROP POLICY IF EXISTS "Enable read access for all users" ON video_frequencies;
DROP POLICY IF EXISTS "Enable read access for all users" ON control_frequencies;
DROP POLICY IF EXISTS "Enable read access for all users" ON target_types;
DROP POLICY IF EXISTS "Enable read access for all users" ON settlements;
DROP POLICY IF EXISTS "Enable read access for all users" ON bk_options;
DROP POLICY IF EXISTS "Enable read access for all users" ON initiation_board_options;
DROP POLICY IF EXISTS "Enable read access for all users" ON status_options;
DROP POLICY IF EXISTS "Enable read access for all users" ON reason_options;
DROP POLICY IF EXISTS "Enable read access for all users" ON loss_options;
DROP POLICY IF EXISTS "Enable read access for all users" ON operator_options;

-- Створити нові політики для автентифікованих користувачів
CREATE POLICY "Authenticated users can read" ON subdivisions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON joint_with_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON drone_names FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON drone_sizes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON camera_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON video_frequencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON control_frequencies FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON target_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON settlements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON bk_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON initiation_board_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON status_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON reason_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON loss_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can read" ON operator_options FOR SELECT TO authenticated USING (true);
