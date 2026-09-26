/* ============================================
   BOOKING — Save + WhatsApp (réservations uniquement)
   ============================================ */
function buildWhatsAppMessage(data) {
  const isFR = currentLang === 'fr';
  const lines = isFR ? [
    `✨ *Nouvelle Demande de Réservation — Beauty by Asty*`, ``,
    `👤 *Nom :* ${data.name}`,
    `📞 *Téléphone :* ${data.phone}`,
    `💄 *Prestation :* ${data.service}`,
    `📅 *Date :* ${data.date}`,
    `🕐 *Heure :* ${data.time}`,
    `📍 *Lieu :* ${data.location || '—'}`, ``,
    `📝 *Message :*`, data.message || '—', ``,
    `_Merci de confirmer ma réservation._`
  ] : [
    `✨ *New Booking Request — Beauty by Asty*`, ``,
    `👤 *Name:* ${data.name}`,
    `📞 *Phone:* ${data.phone}`,
    `💄 *Service:* ${data.service}`,
    `📅 *Date:* ${data.date}`,
    `🕐 *Time:* ${data.time}`,
    `📍 *Location:* ${data.location || '—'}`, ``,
    `📝 *Message:*`, data.message || '—', ``,
    `_Please confirm my booking._`
  ];
  return encodeURIComponent(lines.join('\n'));
}

function initBookingForm() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      name:     document.getElementById('bk-name').value.trim(),
      phone:    document.getElementById('bk-phone').value.trim(),
      service:  document.getElementById('bk-service').value,
      date:     document.getElementById('bk-date').value,
      time:     document.getElementById('bk-time').value,
      location: document.getElementById('bk-location').value.trim(),
      message:  document.getElementById('bk-message').value.trim()
    };

    if (!data.name || !data.phone || !data.service || !data.date || !data.time) {
      alert(t('booking.required'));
      return;
    }

    // 1. Génère un ID de reçu unique
    const receiptId = generateReceiptId(window.BRAND || 'beauty');

    // 2. Sauvegarde dans Supabase
    const { error } = await supabaseClient
      .from('bookings')
      .insert([{ ...data, brand: window.BRAND || 'beauty', receipt_id: receiptId }]);

    if (error) console.error('booking save', error);

    // 3. Ouvre WhatsApp (comme avant)
    const wa = SITE_CONFIG.whatsappNumber;
    window.open(`https://wa.me/${wa}?text=${buildWhatsAppMessage(data)}`, '_blank');

    // 4. Message succès
    const success = document.getElementById('bk-success');
    success.classList.remove('hidden');
    setTimeout(() => success.classList.add('hidden'), 6000);

    // 5. Affiche le bloc de téléchargement du reçu
    const receiptBlock = document.getElementById('receiptBlock');
    if (receiptBlock) {
      receiptBlock.classList.remove('hidden');

      // Stocke les données du reçu
      const receiptData = { ...data, receiptId };

      // Bouton de téléchargement
      const btn = document.getElementById('downloadReceiptBtn');
      btn.onclick = () => generateReceiptPDF(receiptData, window.BRAND || 'beauty');

      // Scroll vers le bloc
      receiptBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    form.reset();
  });
}
