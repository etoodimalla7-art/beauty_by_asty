/* ============================================
   NEWSLETTER — Inscription + validation
   Beauty by Asty
   Version corrigée : utilise RPC Supabase
   ============================================ */

const NEWSLETTER_CONFIG = {
  statusDelay: 5000
};

/* ============================================
   HELPERS
   ============================================ */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function nlLang() {
  if (typeof currentLang === 'string' && currentLang) return currentLang;
  const htmlLang = document.documentElement.getAttribute('lang');
  if (htmlLang === 'en') return 'en';
  try {
    const stored = localStorage.getItem('bba_lang');
    if (stored === 'en' || stored === 'fr') return stored;
  } catch (_) {}
  return 'fr';
}

function nlText(fr, en) {
  return nlLang() === 'en' ? en : fr;
}

/* ============================================
   INSCRIPTION (via RPC Supabase)
   ============================================ */
async function subscribeToNewsletter(email, name, language) {
  const cleanEmail = String(email || '').trim().toLowerCase();

  if (!isValidEmail(cleanEmail)) {
    return { success: false, error: 'invalid_email' };
  }

  if (typeof supabaseClient === 'undefined' || !supabaseClient) {
    return { success: false, error: 'no_client' };
  }

  try {
    const { data, error } = await supabaseClient.rpc('subscribe_newsletter', {
      p_email: cleanEmail,
      p_name: name || null,
      p_language: language || 'fr',
      p_source: 'footer'
    });

    if (error) {
      console.error('[newsletter] RPC error', error);
      return { success: false, error: 'db_error' };
    }

    switch (data) {
      case 'subscribed':
      case 'reactivated':
        return { success: true, status: data };
      case 'already_active':
        return { success: false, error: 'already_subscribed' };
      case 'invalid_email':
        return { success: false, error: 'invalid_email' };
      default:
        return { success: false, error: 'db_error' };
    }
  } catch (err) {
    console.error('[newsletter] exception', err);
    return { success: false, error: 'db_error' };
  }
}

/* ============================================
   RENDU DU FORMULAIRE
   ============================================ */
function initNewsletterForms() {
  const forms = document.querySelectorAll('.newsletter-form');

  forms.forEach(form => {
    if (form.dataset.newsletterBound === 'true') return;
    form.dataset.newsletterBound = 'true';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailInput = form.querySelector('input[type="email"], input[name="email"]');
      const nameInput  = form.querySelector('input[name="name"]');
      const submitBtn  = form.querySelector('button[type="submit"]');
      // Le statut est cherché DANS le form pour éviter les collisions
      const statusEl   = form.querySelector('.newsletter-status')
                       || form.parentElement?.querySelector('.newsletter-status');

      if (!emailInput) return;

      const email = emailInput.value.trim();
      const name  = nameInput ? nameInput.value.trim() : '';

      if (!isValidEmail(email)) {
        showNewsletterStatus(statusEl, 'error', nlText('Email invalide', 'Invalid email'));
        return;
      }

      // Désactive le bouton sans crasher s'il n'y a pas de <span>
      const originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '...';
      }

      const result = await subscribeToNewsletter(email, name, nlLang());

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel || nlText("S'inscrire", 'Subscribe');
      }

      if (result.success) {
        showNewsletterStatus(statusEl, 'success',
          nlText('Merci ! Vous êtes inscrit(e).', 'Thank you! You are subscribed.')
        );
        form.reset();
      } else if (result.error === 'already_subscribed') {
        showNewsletterStatus(statusEl, 'info',
          nlText('Vous êtes déjà inscrit(e).', 'You are already subscribed.')
        );
      } else if (result.error === 'invalid_email') {
        showNewsletterStatus(statusEl, 'error',
          nlText('Email invalide.', 'Invalid email.')
        );
      } else {
        showNewsletterStatus(statusEl, 'error',
          nlText('Erreur. Réessayez.', 'Error. Please try again.')
        );
      }
    });
  });
}

function showNewsletterStatus(el, type, message) {
  if (!el) {
    console.warn('[newsletter] pas de .newsletter-status trouvé');
    return;
  }
  el.textContent = message;
  el.classList.remove('hidden', 'text-gold', 'text-terracotta', 'text-espresso/60');
  if (type === 'success')      el.classList.add('text-gold');
  else if (type === 'error')   el.classList.add('text-terracotta');
  else                         el.classList.add('text-espresso/60');

  clearTimeout(el._nlTimeout);
  el._nlTimeout = setTimeout(() => el.classList.add('hidden'), NEWSLETTER_CONFIG.statusDelay);
}

/* ============================================
   INIT
   ============================================ */
function bootNewsletter() {
  if (typeof supabaseClient === 'undefined') {
    console.warn('[newsletter] supabaseClient indisponible — script reporté');
    return;
  }
  initNewsletterForms();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootNewsletter);
} else {
  bootNewsletter();
}

// Ré-expose pour les pages qui injectent le footer dynamiquement
window.initNewsletterForms = initNewsletterForms;
window.subscribeToNewsletter = subscribeToNewsletter;
