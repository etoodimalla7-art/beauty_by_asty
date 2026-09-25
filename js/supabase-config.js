/* ============================================
   SUPABASE CONFIG
   ============================================ */
const SUPABASE_URL = 'https://qlddwmimgmrqnsfqrftd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsZGR3bWltZ21ycW5zZnFyZnRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NjExNDEsImV4cCI6MjEwNTEzNzE0MX0.wpE5jA-ssMkenHoQDp_eFB3tKFiV8WIv3jqn_USQfZo';

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
