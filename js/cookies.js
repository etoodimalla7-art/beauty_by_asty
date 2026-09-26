/* ============================================
   BANDEAU COOKIES — RGPD-like
   ============================================ */
(function() {
  const STORAGE_KEY = 'asty-cookies-choice';

  // Si l'utilisateur a déjà choisi, on ne fait rien
  if (localStorage.getItem(STORAGE_KEY)) return;

  // Injection du bandeau au chargement du DOM
  const inject = () => {
    if (!document.body) return;
    if (document.querySelector('.cookie-banner')) return;

    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Gestion des cookies');
    banner.innerHTML = `
      <div class="cookie-banner-inner">
        <p class="cookie-text">
          Nous utilisons des cookies pour améliorer votre expérience et analyser
          notre trafic. Vous pouvez accepter ou refuser ces cookies.
          <a href="confidentialite.html" class="cookie-link">En savoir plus</a>
        </p>
        <div class="cookie-actions">
          <button id="cookie-refuse" class="cookie-btn cookie-btn-outline">Refuser</button>
          <button id="cookie-accept" class="cookie-btn cookie-btn-fill">Accepter</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    // Animation d'apparition
    requestAnimationFrame(() => banner.classList.add('visible'));

    // Gestion des boutons
    document.getElementById('cookie-accept').addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEY, 'accepted');
      // Active Google Analytics si présent
      if (typeof gtag === 'function') {
        gtag('consent', 'update', { analytics_storage: 'granted' });
      }
      hideBanner(banner);
    });

    document.getElementById('cookie-refuse').addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEY, 'refused');
      // Désactive Google Analytics si présent
      if (typeof gtag === 'function') {
        gtag('consent', 'update', { analytics_storage: 'denied' });
      }
      hideBanner(banner);
    });
  };

  function hideBanner(banner) {
    banner.classList.remove('visible');
    setTimeout(() => banner.remove(), 400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
