/* ============================================
   SALON ACCESS — Vérification + Freemium
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
        // Vérifie que ce téléphone a bien réservé
        const { data: bookings } = await supabaseClient
          .from('bookings')
          .select('id')
          .or(`phone.ilike.%${data.phone.replace(/\D/g, '')}%`)
          .limit(1);

        if (bookings && bookings.length > 0) {
          SALON_ACCESS.currentTier = 'client';
          salonState.tier = 'client';
          salonState.client = data;
          return true;
        }
      }
    } catch (e) {
      console.error('Erreur accès salon', e);
    }
  }

  // 2. Sinon → guest
  SALON_ACCESS.currentTier = 'guest';
  salonState.tier = 'guest';
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
    // Client connecté → bannière discrète
    banner.innerHTML = `
      <div class="salon-access-banner salon-access-banner-client">
        <p>
          ${isFR
            ? `✨ Bienvenue dans votre Salon Privé, <strong>${escapeHtml(salonState.client?.name || 'chère cliente')}</strong>`
            : `✨ Welcome to your Private Salon, <strong>${escapeHtml(salonState.client?.name || 'dear client')}</strong>`}
        </p>
        <button id="salonLogoutBtn" class="salon-logout-btn">
          ${isFR ? 'Se déconnecter' : 'Log out'}
        </button>
      </div>
    `;

    document.getElementById('salonLogoutBtn').addEventListener('click', () => {
      localStorage.removeItem(SALON_ACCESS.storageKey);
      location.reload();
    });
  } else {
    // Guest → bannière invitation
    banner.innerHTML = `
      <div class="salon-access-banner salon-access-banner-guest">
        <div>
          <p class="salon-access-title">
            ${isFR ? 'Vous consultez l\'aperçu public' : 'You are viewing the public preview'}
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

  document.getElementById('salonLoginFormInner').addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('salonPhone').value.trim();
    const errorEl = document.getElementById('salonLoginError');

    if (!phone || phone.replace(/\D/g, '').length < 8) {
      errorEl.textContent = isFR ? 'Numéro invalide.' : 'Invalid phone.';
      errorEl.classList.remove('hidden');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');

    const { data: bookings } = await supabaseClient
      .from('bookings')
      .select('*')
      .or(`phone.ilike.%${cleanPhone}%`)
      .limit(1);

    if (!bookings || bookings.length === 0) {
      errorEl.textContent = isFR
        ? 'Aucune réservation trouvée. Réservez d\'abord une séance.'
        : 'No booking found. Book a session first.';
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
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', async () => {
  if (typeof supabaseClient === 'undefined') return;
  await checkSalonAccess();
  renderAccessBanner();
  renderAccessLoginForm();
});
