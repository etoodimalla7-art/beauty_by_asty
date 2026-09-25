/* ============================================
   DYNAMIC CONTENT — chargé depuis Supabase
   ============================================ */
window.content = {
  hero: {}, about: {}, services: { items: [] }, contact: {}, socials: {}, footer: {}
};

async function loadContent() {
  const { data, error } = await supabaseClient
    .from('content')
    .select('*')
 .eq('brand', window.BRAND || 'beauty');
   
  if (error) { console.error('loadContent', error); return; }
  (data || []).forEach(row => {
    window.content[row.key] = row.value;
  });
}

/* Petite aide pour sélectionner la bonne langue */
function pick(obj, key) {
  if (!obj) return '';
  return obj[`${key}_${currentLang}`] || obj[`${key}_fr`] || '';
}

/* Applique tout le contenu au DOM */
function renderAllContent() {
  const c = window.content;

  /* ---------- HERO ---------- */
  if (c.hero) {
    const img = document.getElementById('heroBg');
    if (img && c.hero.bg_url) img.src = c.hero.bg_url;
    setText('heroLocation', c.hero.location_label);
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
    if (phoneLink) phoneLink.href = `tel:${(c.contact.phone || '').replace(/\s/g,'')}`;
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
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value != null) el.textContent = value;
}
