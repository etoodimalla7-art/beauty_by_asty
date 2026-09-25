// Force la marque selon la page (beauty | deco | studio)
  window.BRAND = window.BRAND || 'beauty';
/* ============================================
   PUBLIC SITE — Orchestration
   ============================================ */
document.addEventListener('DOMContentLoaded', async () => {
  /* Lang */
  applyStaticTranslations();
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => switchLanguage(btn.dataset.lang));
  });

  /* Navbar scroll */
  const navbar = document.getElementById('navbar');
  const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll); onScroll();

  /* Mobile menu */
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

  /* Scroll reveal */
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

  /* Charge le contenu dynamique */
  await loadContent();
  renderAllContent();

  /* Modules */
  await Promise.all([ loadGallery(), loadReviews(), loadFAQ() ]);
  initLightbox();
  initStarPicker();
  initReviewForm();
  initBookingForm();
});
