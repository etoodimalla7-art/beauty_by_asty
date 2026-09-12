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
      alert(t('booking.required')); return;
    }

    // 1) Sauvegarde admin
    const { error } = await supabaseClient.from('bookings').insert([data]);
    if (error) console.error('booking', error);

    // 2) WhatsApp
   // ✅ Utilise TOUJOURS le numéro dédié aux réservations (celui de l'admin)
   const wa = SITE_CONFIG.whatsappNumber;
   window.open(`https://wa.me/${wa}?text=${buildWhatsAppMessage(data)}`, '_blank');

    const success = document.getElementById('bk-success');
    success.classList.remove('hidden');
    setTimeout(() => success.classList.add('hidden'), 6000);
    form.reset();
  });
}
