/* ============================================
   MAIN GROUP — Orchestration page d'accueil groupe
   ============================================ */
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof supabaseClient === 'undefined') {
    console.error('❌ supabaseClient non défini');
    return;
  }

  /* Lang */
  applyStaticTranslations();
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof switchLanguage === 'function') switchLanguage(btn.dataset.lang);
    });
  });

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

  /* Charge le contenu groupe */
  await loadGroupContent();
  renderGroupContent();

  /* Re-render au changement de langue */
  document.addEventListener('asty:lang-changed', () => {
    renderGroupContent();
  });
});
