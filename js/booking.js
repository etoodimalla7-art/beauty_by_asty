/* ============================================
   BOOKING — Save + WhatsApp (avec lien reçu)
   Beauty by Asty
   ============================================ */

/* -------- Message WhatsApp (propre, sans emoji) -------- */
function buildWhatsAppMessage(data, receiptId, receiptUrl) {
  const isFR = currentLang === 'fr';

  const lines = isFR ? [
    `Nouvelle demande de réservation — Beauty by Asty`,
    ``,
    `Nom : ${data.name}`,
    `Téléphone : ${data.phone}`,
    `Prestation : ${data.service}`,
    `Date : ${data.date}`,
    `Heure : ${data.time}`,
    `Lieu : ${data.location || '—'}`,
    ``,
    `Message :`,
    data.message || '—',
    ``,
    `Numéro de reçu : ${receiptId}`,
    ``,
    `Télécharger mon reçu :`,
    receiptUrl,
    ``,
    `Merci de confirmer ma réservation.`
  ] : [
    `New booking request — Beauty by Asty`,
    ``,
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    `Service: ${data.service}`,
    `Date: ${data.date}`,
    `Time: ${data.time}`,
    `Location: ${data.location || '—'}`,
    ``,
    `Message:`,
    data.message || '—',
    ``,
    `Receipt number: ${receiptId}`,
    ``,
    `Download my receipt:`,
    receiptUrl,
    ``,
    `Please confirm my booking.`
  ];

  return encodeURIComponent(lines.join('\n'));
}

/* -------- Init du formulaire -------- */
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

    // 1. ID de reçu unique
    const receiptId = generateReceiptId(window.BRAND || 'beauty');

    // 2. Sauvegarde Supabase
    const { data: insertedData, error } = await supabaseClient
      .from('bookings')
      .insert([{
        ...data,
        brand: window.BRAND || 'beauty',
        receipt_id: receiptId
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ ERREUR INSERTION BOOKING:', error);
      alert(
        '❌ ERREUR SUPABASE\n\n' +
        'Message : ' + error.message + '\n' +
        'Code : ' + error.code + '\n' +
        'Détails : ' + (error.details || 'aucun') + '\n' +
        'Hint : ' + (error.hint || 'aucun')
      );
      return;
    }

    console.log('✅ Réservation sauvegardée :', insertedData);

    // 3. Construit l'URL permanente du reçu
    const receiptUrl = `${window.location.origin}${window.location.pathname.replace(/[^/]*$/, '')}recu.html?id=${encodeURIComponent(receiptId)}`;

    // 4. WhatsApp AVEC le lien du reçu
    const wa = SITE_CONFIG.whatsappNumber;
    const whatsappMessage = buildWhatsAppMessage(data, receiptId, receiptUrl);
    window.open(`https://wa.me/${wa}?text=${whatsappMessage}`, '_blank');

    // 5. Message succès
    const success = document.getElementById('bk-success');
    if (success) {
      success.classList.remove('hidden');
      setTimeout(() => success.classList.add('hidden'), 6000);
    }

    // 6. Bloc de téléchargement du reçu
    const receiptBlock = document.getElementById('receiptBlock');
    if (receiptBlock) {
      receiptBlock.classList.remove('hidden');

      const permanentLinkBlock = document.getElementById('permanentLinkBlock');
      const permanentLinkInput = document.getElementById('permanentLinkInput');
      const copyLinkBtn = document.getElementById('copyLinkBtn');
      const waReceiptBtn = document.getElementById('waReceiptBtn');

      if (permanentLinkBlock && permanentLinkInput) {
        permanentLinkInput.value = receiptUrl;
        permanentLinkBlock.classList.remove('hidden');
      }

      // Bouton "Copier"
      if (copyLinkBtn) {
        copyLinkBtn.onclick = () => {
          navigator.clipboard.writeText(receiptUrl).then(() => {
            const span = copyLinkBtn.querySelector('span');
            if (!span) return;
            const originalText = span.textContent;
            span.textContent = 'Copié';
            setTimeout(() => { span.textContent = originalText; }, 2000);
          });
        };
      }

      // Bouton "Envoyer le reçu sur WhatsApp" (message court, sans emoji)
      if (waReceiptBtn) {
        waReceiptBtn.onclick = () => {
          const isFR = currentLang === 'fr';
          const receiptMessage = isFR
            ? `Reçu de réservation Beauty by Asty\n\nNuméro : ${receiptId}\n\nRetrouver mon reçu :\n${receiptUrl}`
            : `Beauty by Asty booking receipt\n\nNumber: ${receiptId}\n\nFind my receipt:\n${receiptUrl}`;
          window.open(`https://wa.me/${wa}?text=${encodeURIComponent(receiptMessage)}`, '_blank');
        };
      }

      // Bouton PDF
      const downloadBtn = document.getElementById('downloadReceiptBtn');
      if (downloadBtn) {
        downloadBtn.onclick = () => generateReceiptPDF(
          { ...data, receiptId },
          window.BRAND || 'beauty'
        );
      }

      receiptBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    form.reset();
  });
}
