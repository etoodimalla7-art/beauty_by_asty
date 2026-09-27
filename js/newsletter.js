/* ============================================
   NEWSLETTER — Inscription + validation
   ============================================ */

const NEWSLETTER_CONFIG = {
  storageKey: 'asty-newsletter-shown',
  successDelay: 5000
};

/* ============================================
   VALIDATION EMAIL
   ============================================ */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

/* ============================================
   INSCRIPTION
   ============================================ */
async function subscribeToNewsletter(email, name, language) {
  const cleanEmail = email.trim().toLowerCase();

  if (!isValidEmail(cleanEmail)) {
    return { success: false, error: 'invalid_email' };
  }

  // Vérifie si déjà inscrit
  const { data: existing } = await supabaseClient
    .from('newsletter_subscribers')
    .select('id, status')
    .eq('email', cleanEmail)
    .single();

  if (existing) {
    if (existing.status === 'active') {
      return { success: false, error: 'already_subscribed' };
    } else {
      // Réactive l'abonnement
      await supabaseClient
        .from('newsletter_subscribers')
        .update({
          status: 'active',
          unsubscribed_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
      return { success: true };
    }
  }

  // Nouvelle inscription
  const { error } = await supabaseClient
    .from('newsletter_subscribers')
    .insert([{
      email: cleanEmail,
      name: name || null,
      language: language || 'fr',
      status: 'active',
      source: 'footer'
    }]);

  if (error) {
    console.error('subscribe error', error);
    return { success: false, error: 'db_error' };
  }

  return { success: true };
}

/* ============================================
   RENDU DU FORMULAIRE
   ============================================ */
function initNewsletterForms() {
  const forms = document.querySelectorAll('.newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailInput = form.querySelector('input[type="email"]');
      const nameInput = form.querySelector('input[name="name"]');
      const submitBtn = form.querySelector('button[type="submit"]');
      const statusEl = form.parentElement.querySelector('.newsletter-status');

      const email = emailInput.value.trim();
      const name = nameInput ? nameInput.value.trim() : '';

      if (!isValidEmail(email)) {
        showNewsletterStatus(statusEl, 'error', 'Email invalide');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = '...';

      const result = await subscribeToNewsletter(email, name, currentLang || 'fr');

      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = submitBtn.dataset.label || 'S\'inscrire';

      if (result.success) {
        showNewsletterStatus(statusEl, 'success', 
          currentLang === 'en' 
            ? 'Thank you! You are subscribed.' 
            : 'Merci ! Vous êtes inscrit(e).'
        );
        form.reset();
      } else if (result.error === 'already_subscribed') {
        showNewsletterStatus(statusEl, 'info',
          currentLang === 'en'
            ? 'You are already subscribed.'
            : 'Vous êtes déjà inscrit(e).'
        );
      } else {
        showNewsletterStatus(statusEl, 'error',
          currentLang === 'en'
            ? 'Error. Please try again.'
            : 'Erreur. Réessayez.'
        );
      }
    });
  });
}

function showNewsletterStatus(el, type, message) {
  if (!el) return;
  el.textContent = message;
  el.classList.remove('hidden', 'text-gold', 'text-terracotta', 'text-espresso/60');
  if (type === 'success') el.classList.add('text-gold');
  else if (type === 'error') el.classList.add('text-terracotta');
  else el.classList.add('text-espresso/60');

  setTimeout(() => {
    el.classList.add('hidden');
  }, NEWSLETTER_CONFIG.successDelay);
}

/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof supabaseClient === 'undefined') return;
  initNewsletterForms();
});
