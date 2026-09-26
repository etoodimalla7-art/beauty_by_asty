/* ============================================
   RECEIPT PAGE — Affichage du reçu sur recu.html
   ============================================ */

const RECEIPT_CONFIG_PAGE = {
  beauty: {
    name: 'Beauty by Asty',
    sub: 'Beauté · Maquillage · Abidjan',
    logo: 'https://i.postimg.cc/3NLfBy9m/beaute.png',
    color: '#1C1410',
    accent: '#B8895A',
    prefix: 'BBA'
  },
  deco: {
    name: 'Beauty by Asty Déco',
    sub: 'Décoration d\'intérieur · Abidjan',
    logo: 'https://i.postimg.cc/J0Kv2Y75/design.png',
    color: '#1C1410',
    accent: '#8B4A3B',
    prefix: 'BBD'
  },
  studio: {
    name: 'Beauty by Asty Studio',
    sub: 'Création de contenu · Abidjan',
    logo: 'https://i.postimg.cc/fLfrVq9m/studio.png',
    color: '#1C1410',
    accent: '#B8895A',
    prefix: 'BBS'
  },
  group: {
    name: 'Beauty by Asty',
    sub: 'Groupe · Beauté · Déco · Studio',
    logo: 'https://i.postimg.cc/hGjxFhk9/f4c7dd9c-a888-401e-bdf4-98204fceed03.png',
    color: '#1C1410',
    accent: '#B8895A',
    prefix: 'BBG'
  }
};

async function loadReceiptFromUrl() {
  // Récupère l'ID depuis l'URL : recu.html?id=BBA-XXXX
  const urlParams = new URLSearchParams(window.location.search);
  const receiptId = urlParams.get('id');

  const loadingEl = document.getElementById('receiptLoading');
  const errorEl = document.getElementById('receiptError');
  const contentEl = document.getElementById('receiptContent');

  if (!receiptId) {
    loadingEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
    return;
  }

  // Cherche la réservation dans Supabase
  const { data, error } = await supabaseClient
    .from('bookings')
    .select('*')
    .eq('receipt_id', receiptId)
    .single();

  if (error || !data) {
    loadingEl.classList.add('hidden');
    errorEl.classList.remove('hidden');
    return;
  }

  // Charge la config selon le brand
  const brand = data.brand || 'beauty';
  const cfg = RECEIPT_CONFIG_PAGE[brand] || RECEIPT_CONFIG_PAGE.beauty;

  // Remplit la page
  document.getElementById('receiptBrandName').textContent = cfg.name;
  document.getElementById('receiptBrandSub').textContent = cfg.sub;
  document.getElementById('receiptBrandLogo').src = cfg.logo;
  document.getElementById('receiptId').textContent = data.receipt_id;
  document.getElementById('receiptClientName').textContent = data.name || '—';
  document.getElementById('receiptClientPhone').textContent = data.phone || '—';
  document.getElementById('receiptService').textContent = data.service || '—';
  document.getElementById('receiptDate').textContent = formatDateFR(data.date);
  document.getElementById('receiptTime').textContent = data.time || '—';
  document.getElementById('receiptLocation').textContent = data.location || 'À définir';

  // Message (si présent)
  if (data.message && data.message.trim()) {
    document.getElementById('receiptMessage').textContent = data.message;
    document.getElementById('receiptMessageBlock').classList.remove('hidden');
  }

  // Bouton télécharger PDF
  document.getElementById('receiptDownloadBtn').onclick = () => {
    generateReceiptPDF(
      {
        name: data.name,
        phone: data.phone,
        service: data.service,
        date: data.date,
        time: data.time,
        location: data.location,
        message: data.message,
        receiptId: data.receipt_id
      },
      brand
    );
  };

  // Bouton imprimer
  document.getElementById('receiptPrintBtn').onclick = () => window.print();

  // Affiche
  loadingEl.classList.add('hidden');
  contentEl.classList.remove('hidden');
}

function formatDateFR(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

document.addEventListener('DOMContentLoaded', loadReceiptFromUrl);
