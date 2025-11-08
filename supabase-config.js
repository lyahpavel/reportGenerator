// Supabase Configuration
// Замініть ці значення на ваші власні з dashboard.supabase.com

const SUPABASE_URL = 'https://sjuhghdyhtotywpqorhn.supabase.co'; // Наприклад: 'https://xxxxx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqdWhnaGR5aHRvdHl3cHFvcmhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDIwMjEsImV4cCI6MjA3Nzc3ODAyMX0.YgpuHcpwMIi6hERbl02j3HKFVa_BJhfS6kXKTIztbUE'; // Anon/Public key з Settings > API

// Ініціалізація Supabase клієнта (перевіряємо, чи завантажена бібліотека)
if (typeof supabase !== 'undefined' && supabase.createClient) {
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Експорт для використання в інших файлах
    window.supabaseClient = supabaseClient;
    console.log('✅ Supabase client ініціалізовано');
} else {
    console.warn('⚠️ Supabase бібліотека не завантажена');
    window.supabaseClient = null;
}
