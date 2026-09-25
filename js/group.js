/* ============================================
   GROUP — Chargement du contenu groupe
   ============================================ */
window.group = {};

async function loadGroupContent() {
  const { data, error } = await supabaseClient
    .from('content').select('*').eq('brand', 'group');
  if (error) { console.error('loadGroupContent', error); return; }
  (data || []).forEach(row => { window.group[row.key] = row.value; });
}

function pick(obj, key) {
  if (!obj) return '';
  return obj[`${key}_${currentLang}`] || obj[`${key}_fr`] || '';
}

function renderGroupContent() {
  const g = window.group;

  /* ---------- HERO ---------- */
  if (g.group_hero) {
    const img = document.getElementById('groupHeroBg');
    if (img && g.group_hero.bg_url) img.src = g.group_hero.bg_url;
    setText('groupHeroEyebrow', pick(g.group_hero, 'eyebrow'));
    setText('groupHeroTitle', pick(g.group_hero, 'title'));
    setText('groupHeroSubtitle', pick(g.group_hero, 'subtitle'));
    setText('groupHeroCta1', pick(g.group_hero, 'cta1'));
    setText('groupHeroCta2', pick(g.group_hero, 'cta2'));
  }

  /* ---------- MANIFESTE (utilise group_about.body1) ---------- */
  if (g.group_about) {
    setText('groupManifestoTag', pick(g.group_about, 'tag') || 'Manifeste');
    const body = pick(g.group_about, 'body1');
    setText('groupManifestoText', body);
  } else {
    // Fallback si group_about n'existe pas
    setText('groupManifestoText',
      currentLang === 'fr'
        ? "La beauté n'est pas un seul geste, c'est une manière d'être."
        : "Beauty is not a single gesture — it's a way of being."
    );
  }

  /* ---------- BRANDS ---------- */
  if (g.group_brands) {
    setText('groupBrandsTag', pick(g.group_brands, 'tag'));
    setText('groupBrandsTitle', pick(g.group_brands, 'title'));
    const list = document.getElementById('groupBrandsList');
    if (list) {
      list.innerHTML = (g.group_brands.items || []).map(b => `
        <a href="${b.href}" class="brand-card group reveal">
          <div class="aspect-[3/4] overflow-hidden bg-sand mb-6">
            <img src="${b.image_url}" alt="${pick(b, 'name')}" class="w-full h-full object-cover" />
          </div>
          <p class="text-xs uppercase tracking-[0.3em] text-gold mb-2">${pick(b, 'tagline')}</p>
          <h3 class="font-serif text-2xl md:text-3xl mb-3">${pick(b, 'name')}</h3>
          <p class="text-sm font-light text-espresso/70 leading-relaxed mb-4">${pick(b, 'desc')}</p>
          <span class="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-espresso group-hover:text-gold transition-colors duration-300">
            ${pick(b, 'cta')}
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
    setText('groupFounderTag', pick(g.group_founder, 'tag'));
    setText('groupFounderTitle', pick(g.group_founder, 'title'));
    const q = pick(g.group_founder, 'quote');
    setText('groupFounderQuote', q ? `"${q}"` : '');
    setText('groupFounderBio', pick(g.group_founder, 'bio'));
  }

  /* ---------- CONTACT ---------- */
  if (g.group_contact) {
    setText('groupContactTag', pick(g.group_contact, 'tag'));
    setText('groupContactTitle', pick(g.group_contact, 'title'));
    setText('groupContactAddress', g.group_contact.address);
    setText('groupContactPhone', g.group_contact.phone);
    setText('groupContactEmail', g.group_contact.email);
    const phoneLink = document.getElementById('groupContactPhoneLink');
    if (phoneLink && g.group_contact.phone) phoneLink.href = `tel:${g.group_contact.phone.replace(/\s/g,'')}`;
    setText('groupFooterAddress', g.group_contact.address);
    setText('groupFooterPhone', g.group_contact.phone);
    setText('groupFooterEmail', g.group_contact.email);
  }

  /* ---------- FOOTER ---------- */
  if (g.group_footer) {
    setText('groupFooterTagline', pick(g.group_footer, 'tagline'));
    setText('groupFooterMade', pick(g.group_footer, 'made'));
  }

  /* ---------- REVEAL ---------- */
  document.querySelectorAll('.reveal').forEach(el => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.15 });
    obs.observe(el);
  });
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value != null) el.textContent = value;
}

/* ---------- TÉMOIGNAGES ---------- */
async function loadGroupReviews() {
  const { data, error } = await supabaseClient
    .from('reviews').select('*').eq('brand', 'group').eq('status', 'approved')
    .order('created_at', { ascending: false });
  if (error) { console.error(error); return; }
  window.groupReviews = data || [];
  renderGroupReviews();
}

function renderGroupReviews() {
  const list = document.getElementById('groupReviewsList');
  const empty = document.getElementById('groupReviewsEmpty');
  const reviews = window.groupReviews || [];

  if (reviews.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  list.innerHTML = reviews.map(r => `
    <article class="bg-alabaster border border-sand p-8 md:p-10 flex flex-col h-full">
      <div class="flex gap-1 mb-6">${renderStars(r.rating)}</div>
      <p class="font-serif italic text-lg md:text-xl leading-relaxed mb-8 flex-1">"${escapeHtml(r.message)}"</p>
      <p class="text-xs uppercase tracking-widest text-espresso/60">— ${escapeHtml(r.name)}</p>
    </article>
  `).join('');
}

function renderStars(rating) {
  let h = '';
  for (let i = 1; i <= 5; i++) {
    const filled = i <= rating;
    h += `<svg viewBox="0 0 24 24" width="18" height="18" fill="${filled ? '#B8895A' : 'none'}" stroke="#B8895A" stroke-width="1.25"><path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 17.7 6.1 20.8l1.2-6.6L2.5 9.5l6.6-.9L12 2.5z"/></svg>`;
  }
  return h;
}

/* ---------- FORM AVIS GROUP ---------- */
let groupSelectedRating = 5;

function initGroupStarPicker() {
  const picker = document.getElementById('groupStarPicker');
  if (!picker) return;
  picker.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'star-pick';
    btn.dataset.star = i;
    btn.innerHTML = `<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#B8895A" stroke-width="1.25"><path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 17.7 6.1 20.8l1.2-6.6L2.5 9.5l6.6-.9L12 2.5z"/></svg>`;
    btn.addEventListener('click', () => {
      groupSelectedRating = i;
      updateGroupStarPicker();
    });
    picker.appendChild(btn);
  }
  updateGroupStarPicker();
}

function updateGroupStarPicker() {
  document.querySelectorAll('#groupStarPicker .star-pick').forEach(btn => {
    const val = parseInt(btn.dataset.star, 10);
    const svg = btn.querySelector('svg path');
    svg.setAttribute('fill', val <= groupSelectedRating ? '#B8895A' : 'none');
  });
}

function initGroupReviewForm() {
  const form = document.getElementById('groupReviewForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('grv-name').value.trim();
    const message = document.getElementById('grv-message').value.trim();
    if (!name || !message) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;

    const { error } = await supabaseClient.from('reviews').insert([{
      brand: 'group', name, rating: groupSelectedRating, message, status: 'pending'
    }]);

    btn.disabled = false;
    if (error) { console.error(error); alert('Erreur lors de l\'envoi.'); return; }

    document.getElementById('groupReviewSuccess').classList.remove('hidden');
    form.reset();
    groupSelectedRating = 5;
    updateGroupStarPicker();
    setTimeout(() => document.getElementById('groupReviewSuccess').classList.add('hidden'), 8000);
  });
}

/* ---------- FORM CONTACT GROUP ---------- */
function initGroupContactForm() {
  const form = document.getElementById('groupContactForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;

    const payload = {
      brand: 'group',
      name: document.getElementById('gc-name').value.trim(),
      email: document.getElementById('gc-email').value.trim(),
      subject: document.getElementById('gc-subject').value.trim(),
      message: document.getElementById('gc-message').value.trim(),
    };

    const { error } = await supabaseClient.from('bookings').insert([{
      brand: 'group',
      name: payload.name,
      phone: payload.email,
      service: payload.subject || 'Message de contact',
      date: new Date().toISOString().slice(0,10),
      time: '00:00',
      location: '',
      message: payload.message,
      status: 'new'
    }]);

    btn.disabled = false;
    if (error) { console.error(error); alert('Erreur lors de l\'envoi.'); return; }

    document.getElementById('gc-success').classList.remove('hidden');
    form.reset();
    setTimeout(() => document.getElementById('gc-success').classList.add('hidden'), 8000);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}
