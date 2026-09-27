/* ============================================
   SALON INIT — Orchestration de la page
   ============================================ */

async function initSalon() {
  if (typeof supabaseClient === 'undefined') {
    console.error('❌ supabaseClient non défini');
    return;
  }

  // 1. Charge le tier d'accès du client
  await checkSalonAccess();

  // 2. Charge les blocs du groupe par défaut
  salonState.brand = 'group';
  salonState.blocks = await loadSalonBlocks('group');
  renderSalonBlocks(salonState.blocks);

  // 3. Initialise les filtres
  initSalonFilters();

  // 4. Rend la bannière et le formulaire d'accès
  renderAccessBanner();
  renderAccessLoginForm();
}

/* ---------- FILTRES ---------- */
function initSalonFilters() {
  const filters = document.querySelectorAll('.salon-filter-btn');
  filters.forEach(btn => {
    btn.addEventListener('click', async () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const brand = btn.dataset.brand;
      salonState.brand = brand;
      salonState.blocks = await loadSalonBlocks(brand);

      renderSalonBlocks(salonState.blocks);
    });
  });
}

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', initSalon);
