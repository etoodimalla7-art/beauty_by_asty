/* ============================================
   SUPABASE CONFIG
   ============================================ */
const SUPABASE_URL = 'https://nnlugrdzgfokcbabeqgv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ubHVncmR6Z2Zva2NiYWJlcWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMDQxNzEsImV4cCI6MjEwNDc4MDE3MX0.Il2EcqQyiayjG2uHDlpYYxOXylw28t58Am-0ANjzNNo';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);