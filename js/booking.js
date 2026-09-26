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

    // 2. Sauvegarde dans Supabase (avec receipt_id)
    const { error } = await supabaseClient
      .from('bookings')
      .insert([{
        ...data,
        brand: window.BRAND || 'beauty',
        receipt_id: receiptId
      }]);

    if (error) console.error('booking save', error);

    // 3. Ouvre WhatsApp avec le message principal
    const wa = SITE_CONFIG.whatsappNumber;
    const whatsappMessage = buildWhatsAppMessage(data);
    window.open(`https://wa.me/${wa}?text=${whatsappMessage}`, '_blank');

    // 4. Message succès
    const success = document.getElementById('bk-success');
    success.classList.remove('hidden');
    setTimeout(() => success.classList.add('hidden'), 6000);

    // 5. Affiche le bloc de téléchargement du reçu
    const receiptBlock = document.getElementById('receiptBlock');
    if (receiptBlock) {
      receiptBlock.classList.remove('hidden');

      // Construit l'URL permanente du reçu
      const receiptUrl = `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, '')}recu.html?id=${encodeURIComponent(receiptId)}`;

      // === NOUVEAU : affiche le lien permanent du reçu ===
      const permanentLinkBlock = document.getElementById('permanentLinkBlock');
      const permanentLinkInput = document.getElementById('permanentLinkInput');
      const copyLinkBtn = document.getElementById('copyLinkBtn');
      const waReceiptBtn = document.getElementById('waReceiptBtn');

      if (permanentLinkBlock && permanentLinkInput) {
        permanentLinkInput.value = receiptUrl;
        permanentLinkBlock.classList.remove('hidden');
      }

      // Bouton "Copier le lien"
      if (copyLinkBtn) {
        copyLinkBtn.onclick = () => {
          navigator.clipboard.writeText(receiptUrl).then(() => {
            const originalText = copyLinkBtn.querySelector('span').textContent;
            copyLinkBtn.querySelector('span').textContent = '✅ Copié !';
            setTimeout(() => {
              copyLinkBtn.querySelector('span').textContent = originalText;
            }, 2000);
          });
        };
      }

      // Bouton "Envoyer le reçu sur WhatsApp"
      if (waReceiptBtn) {
        waReceiptBtn.onclick = () => {
          const isFR = currentLang === 'fr';
          const receiptMessage = isFR
            ? `📄 *Reçu de réservation Beauty by Asty*\n\nNuméro : *${receiptId}*\n\nRetrouvez mon reçu ici :\n${receiptUrl}`
            : `📄 *Beauty by Asty Reservation Receipt*\n\nNumber: *${receiptId}*\n\nFind my receipt here:\n${receiptUrl}`;
          window.open(`https://wa.me/${wa}?text=${encodeURIComponent(receiptMessage)}`, '_blank');
        };
      }

      // Stocke les données du reçu
      const receiptData = { ...data, receiptId };

      // Bouton de téléchargement direct du PDF
      const downloadBtn = document.getElementById('downloadReceiptBtn');
      if (downloadBtn) {
        downloadBtn.onclick = () => generateReceiptPDF(receiptData, window.BRAND || 'beauty');
      }

      // Scroll vers le bloc
      receiptBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    form.reset();
  });
}
