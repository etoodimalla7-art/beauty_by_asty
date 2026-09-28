/* ============================================
   DYNAMIC CONTENT — Beauty by Asty
   Version FINALE (auto-init + brand detection + footer fix)
   ============================================ */

/* ---- Détection du brand (multi-source) ---- */
function detectBrand() {
  // 1. window.BRAND (défini dans le HTML)
  if (typeof window.BRAND === 'string' && window.BRAND) return window.BRAND;
  // 2. data-brand sur <body>
  const fromBody = document.body?.dataset?.brand;
  if (fromBody) return fromBody;
  // 3. Fallback
  return 'beauty';
}

const BRAND_DETECTED = detectBrand();
console.log('[content] Brand détecté :', BRAND_DETECTED);

/* ---- Store global ---- */
window.content = {
  hero: {}, about: {}, services: { items: [] }, contact: {}, socials: {}, footer: {}
};

/* ---- Chargement depuis Supabase ---- */
async function loadContent() {
  if (typeof supabaseClient === 'undefined') {
    console.error('[content] supabaseClient introuvable');
    return;
  }

  const { data, error } = await supabaseClient
    .from('content')
    .select('*')
    .eq('brand', BRAND_DETECTED);

  if (error) { console.error('[content] loadContent error:', error); return; }

  (data || []).forEach(row => {
    window.content[row.key] = row.value;
  });

  // Alias pour le brand 'group' (qui utilise des clés préfixées)
  if (BRAND_DETECTED === 'group') {
    if (window.content.group_hero)    window.content.hero    = window.content.group_hero;
    if (window.content.group_about)   window.content.about   = window.content.group_about;
    if (window.content.group_founder) window.content.founder = window.content.group_founder;
    if (window.content.group_contact) window.content.contact = window.content.group_contact;
    if (window.content.group_footer)  window.content.footer  = window.content.group_footer;
    if (window.content.group_brands)  window.content.brands  = window.content.group_brands;
  }

  console.log('[content] Données chargées :', Object.keys(window.content));
  console.log('[content] Footer brut :', window.content.footer);
}

/* ---- Helper bilingue ---- */
function pick(obj, key) {
  if (!obj) return '';
  const lang = (typeof currentLang === 'string' && currentLang) ? currentLang : 'fr';
  return obj[`${key}_${lang}`] ?? obj[`${key}_fr`] ?? obj[key] ?? '';
}

/* ---- Rendu complet ---- */
function renderAllContent() {
  const c = window.content;

  /* ---------- HERO ---------- */
  if (c.hero) {
    const img = document.getElementById('heroBg');
    if (img && c.hero.bg_url) img.src = c.hero.bg_url;
    setText('heroLocation', pick(c.hero, 'location_label'));
    setText('heroTitle', pick(c.hero, 'title'));
    setText('heroSubtitle', pick(c.hero, 'subtitle'));
    setText('heroCta1', pick(c.hero, 'cta1'));
    setText('heroCta2', pick(c.hero, 'cta2'));
  }

  /* ---------- ABOUT ---------- */
  if (c.about) {
    const img = document.getElementById('aboutImg');
    if (img && c.about.image_url) img.src = c.about.image_url;
    setText('aboutTag', pick(c.about, 'tag'));
    setText('aboutTitle', pick(c.about, 'title'));
    setText('aboutBody1', pick(c.about, 'body1'));
    setText('aboutBody2', pick(c.about, 'body2'));
  }

  /* ---------- SERVICES ---------- */
  if (c.services) {
    setText('servicesTag', pick(c.services, 'tag'));
    setText('servicesTitle', pick(c.services, 'title'));
    const list = document.getElementById('servicesList');
    if (list) {
      list.innerHTML = (c.services.items || []).map((it, i) => `
        <div class="service-row group grid md:grid-cols-12 gap-4 md:gap-6 py-8 md:py-10 items-center">
          <span class="md:col-span-1 font-serif text-xl md:text-2xl text-gold">${it.num || String(i+1).padStart(2,'0')}</span>
          <h3 class="md:col-span-4 font-serif text-2xl md:text-4xl">${pick(it, 'title')}</h3>
          <p class="md:col-span-6 font-light text-espresso/70">${pick(it, 'desc')}</p>
          <span class="md:col-span-1 flex md:justify-end text-gold transition-transform duration-500 group-hover:translate-x-2">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></svg>
          </span>
        </div>
      `).join('');
    }
  }

  /* ---------- CONTACT ---------- */
  if (c.contact) {
    setText('contactTag', pick(c.contact, 'tag'));
    setText('contactTitle', pick(c.contact, 'title'));
    setText('contactAddress', c.contact.address);
    setText('contactPhone', c.contact.phone);
    setText('contactEmail', c.contact.email);
    setText('contactHours', c.contact.hours);

    const phoneLink = document.getElementById('contactPhoneLink');
    if (phoneLink && c.contact.phone) {
      phoneLink.href = `tel:${String(c.contact.phone).replace(/\s/g,'')}`;
    }
    const map = document.getElementById('contactMap');
    if (map && c.contact.map_embed) map.src = c.contact.map_embed;
  }

  /* ---------- SOCIALS ---------- */
  if (c.socials) {
    const wa = c.contact && c.contact.phone_wa ? `https://wa.me/${c.contact.phone_wa}` : '#';
    document.querySelectorAll('[data-social]').forEach(a => {
      const k = a.dataset.social;
      const url = k === 'whatsapp' ? wa : c.socials[k];
      if (url) a.href = url;
    });
  }

  /* ---------- FOOTER ---------- */
  if (c.footer) {
    setText('footerTagline', pick(c.footer, 'tagline'));
    setText('footerMade', pick(c.footer, 'made'));

    // ✅ AJOUT CRITIQUE : adresse / tél / email du footer
    setText('footerAddress', c.footer.address || (c.contact && c.contact.address) || '');
    setText('footerPhone',   c.footer.phone   || (c.contact && c.contact.phone)   || '');
    setText('footerEmail',   c.footer.email   || (c.contact && c.contact.email)   || '');

    // Liens cliquables
    const fp = document.getElementById('footerPhone');
    if (fp && fp.tagName === 'A') {
      const rawPhone = c.footer.phone || c.contact?.phone;
      if (rawPhone) fp.href = `tel:${String(rawPhone).replace(/\s/g,'')}`;
    }
    const fe = document.getElementById('footerEmail');
    if (fe && fe.tagName === 'A') {
      const rawEmail = c.footer.email || c.contact?.email;
      if (rawEmail) fe.href = `mailto:${rawEmail}`;
    }
  }

  console.log('[content] Rendu terminé');
}

/* ---- Utilitaire ---- */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value != null && value !== '') el.textContent = value;
}

/* ============================================
   AUTO-INIT
   ============================================ */
(async function initContent() {
  if (document.readyState === 'loading') {
    await new Promise(r => document.addEventListener('DOMContentLoaded', r, { once: true }));
  }
  try {
    await loadContent();
    renderAllContent();
    window.__renderContent = renderAllContent;
    console.log('[content] ✅ Prêt');
  } catch (err) {
    console.error('[content] ❌ Erreur:', err);
  }
})();
