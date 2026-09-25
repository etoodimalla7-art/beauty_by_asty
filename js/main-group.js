/* ============================================
   MAIN GROUP — Orchestration page groupe
   ============================================ */
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof supabaseClient === 'undefined') {
    console.error('❌ supabaseClient non défini');
    return;
  }

  // Force la marque group
  window.BRAND = 'group';

  applyStaticTranslations();
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof switchLanguage === 'function') switchLanguage(btn.dataset.lang);
    });
  });

  // Mobile menu
  const mm = document.getElementById('mobileMenu');
  document.getElementById('menuToggle').addEventListener('click', () => {
    mm.classList.remove('hidden'); mm.classList.add('flex');
  });
  document.getElementById('menuClose').addEventListener('click', () => {
    mm.classList.add('hidden'); mm.classList.remove('flex');
  });
  mm.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mm.classList.add('hidden'); mm.classList.remove('flex');
  }));

  // Navbar scroll
  const navbar = document.getElementById('navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll); onScroll();

  // Charge le contenu groupe
  await loadGroupContent();
  renderGroupContent();

  // Charge les témoignages groupe
  await loadGroupReviews();

  // Init forms
  initGroupStarPicker();
  initGroupReviewForm();
  initGroupContactForm();

  // Re-render au changement de langue
  document.addEventListener('asty:lang-changed', () => {
    renderGroupContent();
  });
});
