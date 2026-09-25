/* ============================================
   GROUP — Chargement du contenu du groupe
   ============================================ */
window.group = {};

async function loadGroupContent() {
  const { data, error } = await supabaseClient
    .from('content')
    .select('*')
    .eq('brand', 'group');

  if (error) { console.error('loadGroupContent', error); return; }

  (data || []).forEach(row => {
    window.group[row.key] = row.value;
  });
}

function pickGroup(obj, key) {
  if (!obj) return '';
  return obj[`${key}_${currentLang}`] || obj[`${key}_fr`] || '';
}

function renderGroupContent() {
  const g = window.group;

  /* ---------- HERO ---------- */
  if (g.group_hero) {
    const img = document.getElementById('groupHeroBg');
    if (img && g.group_hero.bg_url) img.src = g.group_hero.bg_url;
    setText('groupHeroEyebrow', pickGroup(g.group_hero, 'eyebrow'));
    setText('groupHeroTitle', pickGroup(g.group_hero, 'title'));
    setText('groupHeroSubtitle', pickGroup(g.group_hero, 'subtitle'));
    setText('groupHeroCta1', pickGroup(g.group_hero, 'cta1'));
    setText('groupHeroCta2', pickGroup(g.group_hero, 'cta2'));
  }

  /* ---------- ABOUT ---------- */
  if (g.group_about) {
    const img = document.getElementById('groupAboutImg');
    if (img && g.group_about.image_url) img.src = g.group_about.image_url;
    setText('groupAboutTag', pickGroup(g.group_about, 'tag'));
    setText('groupAboutTitle', pickGroup(g.group_about, 'title'));
    setText('groupAboutBody1', pickGroup(g.group_about, 'body1'));
    setText('groupAboutBody2', pickGroup(g.group_about, 'body2'));
  }

  /* ---------- BRANDS ---------- */
  if (g.group_brands) {
    setText('groupBrandsTag', pickGroup(g.group_brands, 'tag'));
    setText('groupBrandsTitle', pickGroup(g.group_brands, 'title'));
    const list = document.getElementById('groupBrandsList');
    if (list) {
      list.innerHTML = (g.group_brands.items || []).map(b => `
        <a href="${b.href}" class="group block overflow-hidden reveal">
          <div class="aspect-[3/4] overflow-hidden bg-sand mb-6">
            <img src="${b.image_url}" alt="${pickGroup(b, 'name')}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
          <p class="text-xs uppercase tracking-[0.3em] text-gold mb-2">${pickGroup(b, 'tagline')}</p>
          <h3 class="font-serif text-2xl md:text-3xl mb-3">${pickGroup(b, 'name')}</h3>
          <p class="text-sm font-light text-espresso/70 leading-relaxed mb-4">${pickGroup(b, 'desc')}</p>
          <span class="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-espresso group-hover:text-gold transition-colors duration-300">
            ${pickGroup(b, 'cta')}
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="19" y2="12"/><polyline points="13 6 19 12 13 18"/></svg>
          </span>
        </a>
      `).join('');
    }
  }

  /* ---------- FOUNDER ---------- */
  if (g.group_founder) {
    const img = document.getElementById('groupFounderImg');
    if (img && g.group_founder.photo_url) img.src = g.group_founder.photo_url;
    setText('groupFounderTag', pickGroup(g.group_founder, 'tag'));
    setText('groupFounderTitle', pickGroup(g.group_founder, 'title'));
    setText('groupFounderQuote', `"${pickGroup(g.group_founder, 'quote')}"`);
    setText('groupFounderBio', pickGroup(g.group_founder, 'bio'));
  }

  /* ---------- CONTACT ---------- */
  if (g.group_contact) {
    setText('groupContactTag', pickGroup(g.group_contact, 'tag'));
    setText('groupContactTitle', pickGroup(g.group_contact, 'title'));
    setText('groupContactAddress', g.group_contact.address);
    setText('groupContactPhone', g.group_contact.phone);
    setText('groupContactEmail', g.group_contact.email);
    const phoneLink = document.getElementById('groupContactPhoneLink');
    if (phoneLink && g.group_contact.phone) phoneLink.href = `tel:${g.group_contact.phone.replace(/\s/g,'')}`;
    const map = document.getElementById('groupContactMap');
    if (map && g.group_contact.map_embed) map.src = g.group_contact.map_embed;
    // Footer
    setText('groupFooterAddress', g.group_contact.address);
    setText('groupFooterPhone', g.group_contact.phone);
    setText('groupFooterEmail', g.group_contact.email);
  }

  /* ---------- FOOTER ---------- */
  if (g.group_footer) {
    setText('groupFooterTagline', pickGroup(g.group_footer, 'tagline'));
    setText('groupFooterMade', pickGroup(g.group_footer, 'made'));
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value != null) el.textContent = value;
}
