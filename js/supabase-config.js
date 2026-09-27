/* ============================================
   SUPABASE CONFIG
   ============================================ */
const SUPABASE_URL = 'https://nnlugrdzgfokcbabeqgv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ubHVncmR6Z2Zva2NiYWJlcWd2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMDQxNzEsImV4cCI6MjEwNDc4MDE3MX0.Il2EcqQyiayjG2uHDlpYYxOXylw28t58Am-0ANjzNNo';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* Config globale du site */
const SITE_CONFIG = {
  whatsappNumber: '22578494430',
  phoneDisplay: '+225 98 38 65 99',
  phoneDisplayLink: '+22598386599',
  email: 'beautybyasty@gmail.com',
  instagram: 'https://instagram.com/beautybyasty',
  facebook: 'https://facebook.com/beautybyasty',
  tiktok: 'https://tiktok.com/@beautybyasty',
};
