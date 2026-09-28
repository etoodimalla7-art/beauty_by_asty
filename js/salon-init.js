/* ============================================
   SALON INIT — Orchestration de la page
   Beauty by Asty — v2 (robuste)
   ============================================ */

async function initSalon() {
  console.log('[salon-init] Démarrage…');

  // ✅ Garde 1 : Supabase disponible ?
  if (typeof supabaseClient === 'undefined') {
    console.error('[salon-init] ❌ supabaseClient non défini');
    return;
  }

  // ✅ Garde 2 : salonState disponible ?
  if (typeof window.salonState === 'undefined') {
    console.warn('[salon-init] ⚠️ salonState non défini, création par défaut');
    window.salonState = { brand: 'group', blocks: [], tier: 'guest', client: null };
  }

  // ✅ Garde 3 : Fonctions critiques disponibles ?
  if (typeof loadSalonBlocks !== 'function' || typeof renderSalonBlocks !== 'function') {
    console.error('[salon-init] ❌ loadSalonBlocks ou renderSalonBlocks manquant');
    return;
  }

  try {
    // 1. Charge le tier d'accès du client (si la fonction existe)
    if (typeof checkSalonAccess === 'function') {
      await checkSalonAccess();
    } else {
      console.warn('[salon-init] checkSalonAccess manquant — tier = guest');
    }

    // 2. Charge les blocs du groupe par défaut
    window.salonState.brand = 'group';
    window.salonState.blocks = await loadSalonBlocks('group');
    renderSalonBlocks(window.salonState.blocks);

    // 3. Initialise les filtres
    initSalonFilters();

    // 4. Rend la bannière et le formulaire d'accès (si les fonctions existent)
    if (typeof renderAccessBanner === 'function') renderAccessBanner();
    if (typeof renderAccessLoginForm === 'function') renderAccessLoginForm();

    console.log('[salon-init] ✅ Prêt');
  } catch (err) {
    console.error('[salon-init] ❌ Erreur:', err);
  }
}

/* ---------- FILTRES ---------- */
function initSalonFilters() {
  const filters = document.querySelectorAll('.salon-filter-btn');
  if (filters.length === 0) return;

  filters.forEach(btn => {
    // Évite les doublons d'écouteurs
    if (btn.dataset.bound === 'true') return;
    btn.dataset.bound = 'true';

    btn.addEventListener('click', async () => {
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const brand = btn.dataset.brand;
      window.salonState.brand = brand;

      try {
        window.salonState.blocks = await loadSalonBlocks(brand);
        renderSalonBlocks(window.salonState.blocks);
      } catch (err) {
        console.error('[salon-init] Erreur filtre:', err);
      }
    });
  });
}

/* ---------- INIT AUTO ---------- */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSalon);
} else {
  // DOM déjà prêt (script chargé en defer)
  initSalon();
}
