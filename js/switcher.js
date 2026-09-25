/* ============================================
   BRAND SWITCHER — Navigation entre pôles
   ============================================ */
(function() {
  // Injecte le switcher au tout début du body
  const switcherHTML = `
    <div class="brand-switcher">
      <div class="brand-switcher-inner">
        <a href="index.html" class="switcher-link" data-switch="group">
          <span data-i18n="switcher.group">Beauty by Asty — Groupe</span>
        </a>
        <span class="switcher-dot">·</span>
        <a href="beauty.html" class="switcher-link" data-switch="beauty">
          <span data-i18n="switcher.beauty">Beauty</span>
        </a>
        <span class="switcher-dot">·</span>
        <a href="deco.html" class="switcher-link" data-switch="deco">
          <span data-i18n="switcher.deco">Déco</span>
        </a>
        <span class="switcher-dot">·</span>
        <a href="studio.html" class="switcher-link" data-switch="studio">
          <span data-i18n="switcher.studio">Studio</span>
        </a>
      </div>
    </div>
  `;

  // Insère le switcher comme premier enfant du <body>
  const inject = () => {
    if (!document.body) return;
    if (document.querySelector('.brand-switcher')) return;
    document.body.insertAdjacentHTML('afterbegin', switcherHTML);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
