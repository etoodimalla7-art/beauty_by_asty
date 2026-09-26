/* ============================================
   MES RÉSERVATIONS — Recherche par téléphone
   ============================================ */

const BRAND_LABELS = {
  beauty: { label: 'Beauty by Asty', url: 'beauty.html', icon: 'beauté' },
  deco:   { label: 'Beauty by Asty Déco', url: 'deco.html', icon: 'déco' },
  studio: { label: 'Beauty by Asty Studio', url: 'studio.html', icon: 'studio' },
  group:  { label: 'Beauty by Asty — Groupe', url: 'index.html', icon: 'groupe' }
};

function normalizePhone(phone) {
  // Enlève tout sauf les chiffres
  return (phone || '').replace(/\D/g, '');
}

async function searchBookings(phone) {
  const cleanPhone = normalizePhone(phone);

  if (cleanPhone.length < 8) {
    return { error: 'Numéro de téléphone invalide.' };
  }

  // Cherche toutes les réservations avec ce numéro (formats multiples)
  const { data, error } = await supabaseClient
    .from('bookings')
    .select('*')
    .or(`phone.ilike.%${cleanPhone}%,phone.ilike.%${phone}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return { error: 'Erreur lors de la recherche.' };
  }

  return { data: data || [] };
}

function renderBookingsList(bookings) {
  const list = document.getElementById('bookingsList');
  const noBookings = document.getElementById('noBookings');

  if (bookings.length === 0) {
    list.innerHTML = '';
    noBookings.classList.remove('hidden');
    return;
  }
  noBookings.classList.add('hidden');

  list.innerHTML = bookings.map(b => {
    const brandInfo = BRAND_LABELS[b.brand] || BRAND_LABELS.beauty;
    const dateFormatted = formatDate(b.date);
    const receiptUrl = b.receipt_id
      ? `recu.html?id=${encodeURIComponent(b.receipt_id)}`
      : null;

    return `
      <div class="booking-list-item">
        <div class="booking-list-item-header">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-gold mb-2">${brandInfo.label}</p>
            <p class="font-serif text-xl">${escapeHtml(b.service || 'Réservation')}</p>
          </div>
          <div class="text-right">
            ${b.receipt_id ? `<p class="booking-list-item-id">${escapeHtml(b.receipt_id)}</p>` : ''}
            <p class="booking-list-item-date">${dateFormatted}</p>
          </div>
        </div>

        <div class="booking-list-item-details">
          <div>
            <p class="receipt-field-label">Date</p>
            <p class="font-serif">${dateFormatted}</p>
          </div>
          <div>
            <p class="receipt-field-label">Heure</p>
            <p class="font-serif">${escapeHtml(b.time || '—')}</p>
          </div>
          <div>
            <p class="receipt-field-label">Lieu</p>
            <p class="font-serif">${escapeHtml(b.location || 'À définir')}</p>
          </div>
          <div>
            <p class="receipt-field-label">Statut</p>
            <p class="font-serif">${getStatusLabel(b.status)}</p>
          </div>
        </div>

        ${receiptUrl ? `
          <div class="flex flex-wrap gap-3 mt-4">
            <a href="${receiptUrl}" class="border border-espresso px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-espresso hover:text-alabaster transition inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Voir mon reçu
            </a>
            <a href="${brandInfo.url}" class="text-xs uppercase tracking-widest text-gold hover:underline inline-flex items-center gap-2 px-3 py-2.5">
              Voir la maison →
            </a>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

function getStatusLabel(status) {
  const labels = {
    'new': 'En attente',
    'message': 'Message',
    'read': 'Lu',
    'archived': 'Archivé',
    'pending': 'En attente',
    'approved': 'Confirmé',
    'rejected': 'Refusé'
  };
  return labels[status] || status || 'Confirmé';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function initPhoneForm() {
  const form = document.getElementById('phoneForm');
  const errorEl = document.getElementById('phoneError');
  const stepPhone = document.getElementById('stepPhone');
  const stepResults = document.getElementById('stepResults');
  const stepLoading = document.getElementById('stepLoading');
  const changePhoneBtn = document.getElementById('changePhoneBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.classList.add('hidden');

    const phone = document.getElementById('clientPhone').value.trim();

    stepPhone.classList.add('hidden');
    stepLoading.classList.remove('hidden');

    const result = await searchBookings(phone);

    stepLoading.classList.add('hidden');

    if (result.error) {
      stepPhone.classList.remove('hidden');
      errorEl.textContent = result.error;
      errorEl.classList.remove('hidden');
      return;
    }

    renderBookingsList(result.data);
    stepResults.classList.remove('hidden');
  });

  changePhoneBtn.addEventListener('click', () => {
    stepResults.classList.add('hidden');
    stepPhone.classList.remove('hidden');
    document.getElementById('clientPhone').value = '';
  });
}

document.addEventListener('DOMContentLoaded', initPhoneForm);
