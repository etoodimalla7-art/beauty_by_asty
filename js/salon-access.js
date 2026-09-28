/* ============================================
   SALON ACCESS — Vérification + Freemium
   Beauty by Asty — v2 (fix tiers + cache)
   ============================================ */

const SALON_ACCESS = {
  storageKey: 'asty-salon-access',
  currentTier: 'guest'
};

/* ============================================
   VÉRIFIER L'ACCÈS AU SALON
   ============================================ */
async function checkSalonAccess() {
  // 1. Récupère l'accès depuis localStorage
  const stored = localStorage.getItem(SALON_ACCESS.storageKey);

  if (stored) {
    try {
      const data = JSON.parse(stored);
      if (data.phone) {
        const cleanPhone = data.phone.replace(/\D/g, '');
        const { data: bookings, error } = await supabaseClient
          .from('bookings')
          .select('id')
          .ilike('phone', `%${cleanPhone}%`)
          .limit(1);

        if (!error && bookings && bookings.length > 0) {
          SALON_ACCESS.currentTier = 'client';
          if (window.salonState) {
            window.salonState.tier = 'client';
            window.salonState.client = data;
          }
          console.log('[salon-access] Tier : client');
          return true;
        }
      }
    } catch (e) {
      console.error('[salon-access] Erreur:', e);
    }
  }

  // 2. Sinon → guest
  SALON_ACCESS.currentTier = 'guest';
  if (window.salonState) {
    window.salonState.tier = 'guest';
  }
  console.log('[salon-access] Tier : guest');
  return false;
}

/* ============================================
   AFFICHER LA BANNIÈRE D'ACCÈS
   ============================================ */
function renderAccessBanner() {
  const banner = document.getElementById('salonAccessBanner');
  if (!banner) return;

  const isFR = (window.currentLang || 'fr') === 'fr';

  if (SALON_ACCESS.currentTier === 'client') {
    banner.innerHTML = `
      <div class="salon-access-banner salon-access-banner-client">
        <p>
          ${isFR
            ? `Bienvenue dans votre Salon Privé, <strong>${escapeHtml(window.salonState?.client?.name || 'chère cliente')}</strong>`
            : `Welcome to your Private Salon, <strong>${escapeHtml(window.salonState?.client?.name || 'dear client')}</strong>`}
        </p>
        <button id="salonLogoutBtn" class="salon-logout-btn">
          ${isFR ? 'Se déconnecter' : 'Log out'}
        </button>
      </div>
    `;

    const logoutBtn = document.getElementById('salonLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem(SALON_ACCESS.storageKey);
        location.reload();
      });
    }
  } else {
    banner.innerHTML = `
      <div class="salon-access-banner salon-access-banner-guest">
        <div>
          <p class="salon-access-title">
            ${isFR ? "Vous consultez l'aperçu public" : 'You are viewing the public preview'}
          </p>
          <p class="salon-access-subtitle">
            ${isFR
              ? 'Réservez votre première séance pour débloquer tout le contenu privé.'
              : 'Book your first session to unlock all private content.'}
          </p>
        </div>
        <a href="beauty.html#booking" class="salon-access-cta">
          ${isFR ? 'Réserver pour débloquer' : 'Book to unlock'}
        </a>
      </div>
    `;
  }
}

/* ============================================
   AFFICHER LE FORMULAIRE DE CONNEXION
   ============================================ */
function renderAccessLoginForm() {
  const wrapper = document.getElementById('salonLoginForm');
  if (!wrapper) return;

  if (SALON_ACCESS.currentTier === 'client') {
    wrapper.classList.add('hidden');
    wrapper.innerHTML = '';
    return;
  }

  const isFR = (window.currentLang || 'fr') === 'fr';
  wrapper.classList.remove('hidden');

  wrapper.innerHTML = `
    <div class="salon-login-card">
      <p class="salon-login-tag">${isFR ? 'Déjà client ?' : 'Already a client?'}</p>
      <h3 class="salon-login-title">
        ${isFR ? 'Accédez à votre Salon Privé' : 'Access your Private Salon'}
      </h3>
      <p class="salon-login-subtitle">
        ${isFR
          ? 'Entrez le numéro de téléphone utilisé lors de votre réservation.'
          : 'Enter the phone number used for your booking.'}
      </p>
      <form id="salonLoginFormInner" class="salon-login-form">
        <div class="field">
          <label for="salonPhone">${isFR ? 'Votre téléphone' : 'Your phone'}</label>
          <input id="salonPhone" type="tel" required placeholder="+225 07 XX XX XX XX" />
        </div>
        <button type="submit" class="btn-whatsapp w-full justify-center">
          <span>${isFR ? 'Accéder au Salon' : 'Access Salon'}</span>
        </button>
        <p id="salonLoginError" class="hidden text-center text-sm text-terracotta mt-4"></p>
      </form>
    </div>
  `;

  const form = document.getElementById('salonLoginFormInner');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('salonPhone').value.trim();
    const errorEl = document.getElementById('salonLoginError');

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      errorEl.textContent = isFR ? 'Numéro invalide.' : 'Invalid phone.';
      errorEl.classList.remove('hidden');
      return;
    }

    errorEl.textContent = isFR ? 'Vérification…' : 'Checking…';
    errorEl.classList.remove('hidden');

    const { data: bookings, error } = await supabaseClient
      .from('bookings')
      .select('*')
      .ilike('phone', `%${cleanPhone}%`)
      .limit(1);

    if (error || !bookings || bookings.length === 0) {
      errorEl.textContent = isFR
        ? "Aucune réservation trouvée avec ce numéro. Réservez d'abord une séance."
        : 'No booking found with this number. Book a session first.';
      errorEl.classList.remove('hidden');
      return;
    }

    const client = bookings[0];
    localStorage.setItem(SALON_ACCESS.storageKey, JSON.stringify({
      name: client.name,
      phone: client.phone,
      email: client.email || ''
    }));

    location.reload();
  });
}

/* ============================================
   HELPERS
   ============================================ */
function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

/* ============================================
   AUTO-INIT (fallback si salon-init.js échoue)
   ============================================ */
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof supabaseClient === 'undefined') return;
  // Note : normalement c'est salon-init.js qui appelle ces fonctions
  // Ce bloc est un filet de sécurité
  if (typeof window.__salonAccessInit === 'undefined') {
    window.__salonAccessInit = true;
  }
});
