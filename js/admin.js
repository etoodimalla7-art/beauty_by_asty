/* ============================================
   ADMIN — Full control
   ============================================ */
let session = null;
let currentReviewFilter = 'pending';
let allReviewsAdmin = [];
let adminContent = {};

/* ============================
   AUTH
   ============================ */
async function checkSession() {
  const { data } = await supabaseClient.auth.getSession();
  session = data?.session || null;
  toggleLoginUI();
  supabaseClient.auth.onAuthStateChange((_e, s) => {
    session = s;
    toggleLoginUI();
  });
}

function toggleLoginUI() {
  const login = document.getElementById('loginScreen');
  const panel = document.getElementById('adminPanel');
  if (session) {
    login.classList.add('hidden');
    panel.classList.remove('hidden');
    loadEverything();
  } else {
    login.classList.remove('hidden');
    panel.classList.add('hidden');
    document.getElementById('login-pass').value = '';
  }
}

function initLogin() {
  const form = document.getElementById('loginForm');
  const btn = document.getElementById('loginBtn');
  const btnText = document.getElementById('loginBtnText');
  const errEl = document.getElementById('loginError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errEl.classList.add('hidden');
    btn.disabled = true; btnText.textContent = 'Connexion…';

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-pass').value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    btn.disabled = false; btnText.textContent = 'Se connecter';

    if (error) {
      errEl.textContent = 'Identifiants incorrects.';
      errEl.classList.remove('hidden');
      return;
    }
    session = data.session;
    toggleLoginUI();
  });

  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    session = null;
    toggleLoginUI();
    window.location.href = 'index.html';
  });
}

/* ============================
   TABS
   ============================ */
function initTabs() {
  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
      tab.classList.add('active');
      document.getElementById(`tab-${tab.dataset.tab}`).classList.remove('hidden');
    });
  });

  document.querySelectorAll('.content-subtab').forEach(sub => {
    sub.addEventListener('click', () => {
      document.querySelectorAll('.content-subtab').forEach(s => s.classList.remove('active'));
      document.querySelectorAll('.content-panel').forEach(p => p.classList.add('hidden'));
      sub.classList.add('active');
      document.getElementById(`sub-${sub.dataset.sub}`).classList.remove('hidden');
    });
  });
}

/* ============================
   LOAD EVERYTHING
   ============================ */
async function loadEverything() {
  await Promise.all([
    loadContentAdmin(),
    loadBookings(),
    loadReviewsAdmin(),
    loadMediaAdmin(),
    loadFAQAdmin(),
  ]);
}

/* ============================
   CONTENT
   ============================ */
async function loadContentAdmin() {
  const { data, error } = await supabaseClient.from('content').select('*');
  if (error) return console.error(error);
  adminContent = {};
  (data || []).forEach(row => adminContent[row.key] = row.value);

  // Hero
  fillForm('hero', adminContent.hero || {});
  // About
  fillForm('about', adminContent.about || {});
  // Services
  fillForm('services', adminContent.services || { items: [] });
  renderServicesEditor(adminContent.services?.items || []);
  // Contact
  fillForm('contact', adminContent.contact || {});
  // Socials
  fillForm('socials', adminContent.socials || {});
  // Footer
  fillForm('footer', adminContent.footer || {});

  // Wire all forms
  document.querySelectorAll('.content-form').forEach(form => {
    if (form.dataset.key === 'services') return; // handled separately
    form.addEventListener('submit', (e) => saveContentForm(e, form));
  });
  document.getElementById('servicesForm').addEventListener('submit', (e) => saveServices(e));

  // Services add button
  document.getElementById('addServiceBtn').addEventListener('click', () => {
    const items = readServicesFromEditor();
    items.push({ num: String(items.length + 1).padStart(2,'0'), title_fr:'', title_en:'', desc_fr:'', desc_en:'' });
    renderServicesEditor(items);
  });

  // Hero bg file upload
  document.querySelector('.hero-bg-file')?.addEventListener('change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const status = document.querySelector('.hero-upload-status');
    status.textContent = 'Upload…';
    const url = await uploadFile(file);
    if (url) {
      document.querySelector('input[name="bg_url"]').value = url;
      status.textContent = '✅ Upload réussi, cliquez sur Enregistrer';
    } else status.textContent = '❌ Erreur';
  });

  // About img upload
  document.querySelector('.about-img-file')?.addEventListener('change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const status = document.querySelector('.about-upload-status');
    status.textContent = 'Upload…';
    const url = await uploadFile(file);
    if (url) {
      document.querySelector('input[name="image_url"]').value = url;
      status.textContent = '✅ Upload réussi, cliquez sur Enregistrer';
    } else status.textContent = '❌ Erreur';
  });
}

function fillForm(key, obj) {
  const form = document.querySelector(`.content-form[data-key="${key}"]`);
  if (!form) return;
  Object.keys(obj).forEach(k => {
    const field = form.querySelector(`[name="${k}"]`);
    if (field) field.value = obj[k] || '';
  });
}

async function saveContentForm(e, form) {
  e.preventDefault();
  const key = form.dataset.key;
  const status = form.querySelector('.save-status');
  status.textContent = 'Enregistrement…';

  const data = {};
  new FormData(form).forEach((v, k) => data[k] = v);

  const { error } = await supabaseClient.from('content').upsert({ key, value: data });
  if (error) { status.textContent = '❌ ' + error.message; return; }
  status.textContent = '✅ Enregistré';
  setTimeout(() => status.textContent = '', 3000);
}

/* ---- Services editor ---- */
function renderServicesEditor(items) {
  const list = document.getElementById('servicesListAdmin');
  list.innerHTML = items.map((it, i) => `
    <div class="border border-sand p-4 md:p-5 relative" data-idx="${i}">
      <button type="button" class="absolute top-3 right-3 text-terracotta text-xs uppercase tracking-widest remove-service">Supprimer</button>
      <div class="grid md:grid-cols-2 gap-4">
        <div class="field"><label>Numéro</label><input class="svc-num" value="${it.num || ''}" /></div>
        <div class="field"></div>
        <div class="field"><label>Titre FR</label><input class="svc-title-fr" value="${it.title_fr || ''}" /></div>
        <div class="field"><label>Titre EN</label><input class="svc-title-en" value="${it.title_en || ''}" /></div>
        <div class="field"><label>Description FR</label><textarea class="svc-desc-fr" rows="2">${it.desc_fr || ''}</textarea></div>
        <div class="field"><label>Description EN</label><textarea class="svc-desc-en" rows="2">${it.desc_en || ''}</textarea></div>
      </div>
    </div>
  `).join('');
  list.querySelectorAll('.remove-service').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.closest('[data-idx]').dataset.idx, 10);
      const items = readServicesFromEditor();
      items.splice(idx, 1);
      renderServicesEditor(items);
    });
  });
}

function readServicesFromEditor() {
  return [...document.querySelectorAll('#servicesListAdmin [data-idx]')].map(el => ({
    num: el.querySelector('.svc-num').value,
    title_fr: el.querySelector('.svc-title-fr').value,
    title_en: el.querySelector('.svc-title-en').value,
    desc_fr: el.querySelector('.svc-desc-fr').value,
    desc_en: el.querySelector('.svc-desc-en').value,
  }));
}

async function saveServices(e) {
  e.preventDefault();
  const form = document.getElementById('servicesForm');
  const status = form.querySelector('.save-status');
  status.textContent = 'Enregistrement…';

  const data = {
    tag_fr: form.querySelector('[name="tag_fr"]').value,
    tag_en: form.querySelector('[name="tag_en"]').value,
    title_fr: form.querySelector('[name="title_fr"]').value,
    title_en: form.querySelector('[name="title_en"]').value,
    items: readServicesFromEditor()
  };

  const { error } = await supabaseClient.from('content').upsert({ key: 'services', value: data });
  if (error) { status.textContent = '❌ ' + error.message; return; }
  status.textContent = '✅ Enregistré';
  setTimeout(() => status.textContent = '', 3000);
}

/* ---- File upload helper ---- */
async function uploadFile(file) {
  const ext = file.name.split('.').pop();
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabaseClient.storage.from('media').upload(name, file);
  if (error) { console.error(error); return null; }
  const { data } = supabaseClient.storage.from('media').getPublicUrl(name);
  return data.publicUrl;
}

/* ============================
   BOOKINGS
   ============================ */
async function loadBookings() {
  const { data, error } = await supabaseClient.from('bookings').select('*').order('created_at', { ascending: false });
  if (error) return console.error(error);

  const list = document.getElementById('bookingsList');
  if (!data || data.length === 0) {
    list.innerHTML = `<p class="text-center font-serif italic text-espresso/60 py-12">Aucune réservation.</p>`;
    return;
  }
  list.innerHTML = data.map(b => `
    <div class="border border-sand p-4 md:p-6 flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
      <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
        <div><span class="text-espresso/50 text-xs uppercase tracking-widest">Nom</span><br>${esc(b.name)}</div>
        <div><span class="text-espresso/50 text-xs uppercase tracking-widest">Téléphone</span><br>${esc(b.phone)}</div>
        <div><span class="text-espresso/50 text-xs uppercase tracking-widest">Prestation</span><br>${esc(b.service)}</div>
        <div><span class="text-espresso/50 text-xs uppercase tracking-widest">Date</span><br>${b.date} à ${b.time}</div>
        <div><span class="text-espresso/50 text-xs uppercase tracking-widest">Lieu</span><br>${esc(b.location || '—')}</div>
        <div><span class="text-espresso/50 text-xs uppercase tracking-widest">Reçue le</span><br>${new Date(b.created_at).toLocaleDateString('fr-FR')}</div>
        ${b.message ? `<div class="sm:col-span-2 lg:col-span-3"><span class="text-espresso/50 text-xs uppercase tracking-widest">Message</span><br>${esc(b.message)}</div>` : ''}
      </div>
      <div class="flex flex-col gap-2">
        <a href="https://wa.me/${b.phone.replace(/\D/g, '')}" target="_blank" rel="noopener"
           class="border border-espresso px-4 py-2 text-xs uppercase tracking-widest hover:bg-espresso hover:text-alabaster transition whitespace-nowrap text-center">Répondre WhatsApp</a>
        <button onclick="deleteBooking('${b.id}')" class="px-4 py-2 text-xs uppercase tracking-widest text-terracotta hover:underline">Supprimer</button>
      </div>
    </div>
  `).join('');
}

async function deleteBooking(id) {
  if (!confirm('Supprimer cette réservation ?')) return;
  await supabaseClient.from('bookings').delete().eq('id', id);
  loadBookings();
}

/* ============================
   REVIEWS ADMIN
   ============================ */
async function loadReviewsAdmin() {
  const { data, error } = await supabaseClient.from('reviews').select('*').order('created_at', { ascending: false });
  if (error) return console.error(error);
  allReviewsAdmin = data || [];
  renderReviewsAdmin();
  updateAdminStats();
}

function renderReviewsAdmin() {
  const list = document.getElementById('reviewsAdminList');
  let filtered = allReviewsAdmin;
  if (currentReviewFilter !== 'all') filtered = filtered.filter(r => r.status === currentReviewFilter);

  if (filtered.length === 0) {
    list.innerHTML = `<p class="text-center font-serif italic text-espresso/60 py-12">Aucun avis dans cette catégorie.</p>`;
    return;
  }

  list.innerHTML = filtered.map(r => `
    <div class="border border-sand p-4 md:p-6">
      <div class="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <p class="font-serif text-lg md:text-xl">${esc(r.name)}</p>
          <div class="flex gap-1 mt-1">
            ${Array.from({length: 5}, (_, i) => `
              <svg viewBox="0 0 24 24" width="14" height="14" fill="${i < r.rating ? '#B8895A' : 'none'}" stroke="#B8895A" stroke-width="1.25"><path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 17.7 6.1 20.8l1.2-6.6L2.5 9.5l6.6-.9L12 2.5z"/></svg>
            `).join('')}
          </div>
        </div>
        <span class="status-badge status-${r.status}">${
          r.status === 'pending' ? 'En attente' :
          r.status === 'approved' ? 'Approuvé' : 'Refusé'
        }</span>
      </div>
      <p class="font-light mb-4">${esc(r.message)}</p>
      <div class="flex gap-2 flex-wrap">
        ${r.status !== 'approved' ? `<button onclick="setReviewStatus('${r.id}', 'approved')" class="border border-espresso px-4 py-2 text-xs uppercase tracking-widest hover:bg-espresso hover:text-alabaster transition">Approuver</button>` : ''}
        ${r.status !== 'rejected' ? `<button onclick="setReviewStatus('${r.id}', 'rejected')" class="border border-terracotta text-terracotta px-4 py-2 text-xs uppercase tracking-widest hover:bg-terracotta hover:text-alabaster transition">Refuser</button>` : ''}
        <button onclick="editReview('${r.id}')" class="border border-espresso px-4 py-2 text-xs uppercase tracking-widest hover:bg-espresso hover:text-alabaster transition">Modifier</button>
        <button onclick="deleteReview('${r.id}')" class="px-4 py-2 text-xs uppercase tracking-widest text-terracotta hover:underline">Supprimer</button>
      </div>
    </div>
  `).join('');
}

async function setReviewStatus(id, status) {
  await supabaseClient.from('reviews').update({ status }).eq('id', id);
  loadReviewsAdmin();
}

async function deleteReview(id) {
  if (!confirm('Supprimer cet avis ?')) return;
  await supabaseClient.from('reviews').delete().eq('id', id);
  loadReviewsAdmin();
}

async function editReview(id) {
  const r = allReviewsAdmin.find(x => x.id === id);
  if (!r) return;
  const name = prompt('Nom :', r.name); if (name === null) return;
  const rating = prompt('Note (1-5) :', r.rating); if (rating === null) return;
  const message = prompt('Message :', r.message); if (message === null) return;
  await supabaseClient.from('reviews').update({
    name: name.trim(), rating: parseInt(rating, 10), message: message.trim()
  }).eq('id', id);
  loadReviewsAdmin();
}

function updateAdminStats() {
  const approved = allReviewsAdmin.filter(r => r.status === 'approved');
  const avg = approved.length ? (approved.reduce((s, r) => s + r.rating, 0) / approved.length).toFixed(1) : '—';
  document.getElementById('adminAvgRating').textContent = avg;
  document.getElementById('adminReviewCount').textContent = `${approved.length} approuvé(s) · ${allReviewsAdmin.length} au total`;
}

function initReviewFilters() {
  document.querySelectorAll('.filter-review-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-review-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentReviewFilter = btn.dataset.status;
      renderReviewsAdmin();
    });
  });

  document.getElementById('addReviewForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('addReviewName').value.trim();
    const rating = parseInt(document.getElementById('addReviewRating').value, 10);
    const message = document.getElementById('addReviewMessage').value.trim();
    if (!name || !message || !rating) return;

    await supabaseClient.from('reviews').insert([{ name, rating, message, status: 'approved' }]);
    e.target.reset();
    document.getElementById('addReviewRating').value = 5;
    loadReviewsAdmin();
  });
}

/* ============================
   MEDIA ADMIN
   ============================ */
async function loadMediaAdmin() {
  const { data, error } = await supabaseClient.from('media').select('*').order('created_at', { ascending: false });
  if (error) return console.error(error);

  const list = document.getElementById('mediaAdminList');
  if (!data || data.length === 0) {
    list.innerHTML = `<p class="col-span-full text-center font-serif italic text-espresso/60 py-12">Galerie vide.</p>`;
    return;
  }
  list.innerHTML = data.map(m => `
    <div class="border border-sand overflow-hidden">
      ${m.type === 'image'
        ? `<img src="${m.url}" class="w-full h-40 object-cover" />`
        : `<video src="${m.url}" class="w-full h-40 object-cover" muted></video>`}
      <div class="p-3">
        <p class="text-xs uppercase tracking-widest text-espresso/50 mb-1">${esc(m.tag || '—')}</p>
        <p class="font-serif italic text-sm mb-3">${esc(m.caption || '')}</p>
        <div class="flex gap-2">
          <button onclick="editMedia('${m.id}')" class="text-xs uppercase tracking-widest text-espresso hover:underline">Modifier</button>
          <button onclick="deleteMedia('${m.id}', '${m.url}')" class="text-xs uppercase tracking-widest text-terracotta hover:underline">Supprimer</button>
        </div>
      </div>
    </div>
  `).join('');
}

async function deleteMedia(id, url) {
  if (!confirm('Supprimer ce média ?')) return;
  const filePath = url.split('/media/')[1];
  if (filePath) await supabaseClient.storage.from('media').remove([filePath]);
  await supabaseClient.from('media').delete().eq('id', id);
  loadMediaAdmin();
}

async function editMedia(id) {
  const { data } = await supabaseClient.from('media').select('*').eq('id', id).single();
  if (!data) return;
  const caption = prompt('Légende :', data.caption || ''); if (caption === null) return;
  const tag = prompt('Tag :', data.tag || ''); if (tag === null) return;
  await supabaseClient.from('media').update({ caption: caption.trim(), tag: tag.trim().toLowerCase() }).eq('id', id);
  loadMediaAdmin();
}

function initMediaUpload() {
  document.getElementById('mediaAddBtn').addEventListener('click', async () => {
    const type = document.getElementById('mediaType').value;
    const file = document.getElementById('mediaFile').files[0];
    const caption = document.getElementById('mediaCaption').value.trim();
    const tag = document.getElementById('mediaTag').value.trim().toLowerCase();
    const progress = document.getElementById('mediaProgress');

    if (!file) return alert('Choisissez un fichier.');
    progress.textContent = 'Upload en cours…';

    const url = await uploadFile(file);
    if (!url) { progress.textContent = '❌ Erreur upload'; return; }

    const { error } = await supabaseClient.from('media').insert([{ type, url, caption, tag }]);
    if (error) { progress.textContent = '❌ ' + error.message; return; }

    progress.textContent = '✅ Upload réussi !';
    document.getElementById('mediaFile').value = '';
    document.getElementById('mediaCaption').value = '';
    document.getElementById('mediaTag').value = '';
    setTimeout(() => progress.textContent = '', 3000);
    loadMediaAdmin();
  });
}

/* ============================
   FAQ ADMIN
   ============================ */
async function loadFAQAdmin() {
  const { data, error } = await supabaseClient.from('faq').select('*').order('sort_order', { ascending: true });
  if (error) return console.error(error);

  const list = document.getElementById('faqAdminList');
  if (!data || data.length === 0) {
    list.innerHTML = `<p class="text-center font-serif italic text-espresso/60 py-12">Aucune question.</p>`;
    return;
  }
  list.innerHTML = data.map(f => `
    <div class="border border-sand p-4 md:p-6">
      <p class="font-serif text-base md:text-lg mb-1">🇫🇷 ${esc(f.question_fr)}</p>
      <p class="text-sm text-espresso/70 mb-3">${esc(f.answer_fr)}</p>
      <p class="font-serif text-base md:text-lg mb-1">🇬🇧 ${esc(f.question_en)}</p>
      <p class="text-sm text-espresso/70 mb-4">${esc(f.answer_en)}</p>
      <div class="flex gap-2">
        <button onclick="editFaq('${f.id}')" class="text-xs uppercase tracking-widest text-espresso hover:underline">Modifier</button>
        <button onclick="deleteFaq('${f.id}')" class="text-xs uppercase tracking-widest text-terracotta hover:underline">Supprimer</button>
      </div>
    </div>
  `).join('');
}

async function deleteFaq(id) {
  if (!confirm('Supprimer cette question ?')) return;
  await supabaseClient.from('faq').delete().eq('id', id);
  loadFAQAdmin();
}

async function editFaq(id) {
  const { data } = await supabaseClient.from('faq').select('*').eq('id', id).single();
  if (!data) return;
  const q_fr = prompt('Question FR :', data.question_fr); if (q_fr === null) return;
  const a_fr = prompt('Réponse FR :', data.answer_fr); if (a_fr === null) return;
  const q_en = prompt('Question EN :', data.question_en); if (q_en === null) return;
  const a_en = prompt('Réponse EN :', data.answer_en); if (a_en === null) return;
  await supabaseClient.from('faq').update({
    question_fr: q_fr, answer_fr: a_fr, question_en: q_en, answer_en: a_en
  }).eq('id', id);
  loadFAQAdmin();
}

function initFaqAdd() {
  document.getElementById('addFaqForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await supabaseClient.from('faq').insert([{
      question_fr: document.getElementById('faqQfr').value.trim(),
      answer_fr:   document.getElementById('faqAfr').value.trim(),
      question_en: document.getElementById('faqQen').value.trim(),
      answer_en:   document.getElementById('faqAen').value.trim(),
    }]);
    e.target.reset();
    loadFAQAdmin();
  });
}

/* ============================
   HELPERS
   ============================ */
function esc(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

/* ============================
   INIT
   ============================ */
document.addEventListener('DOMContentLoaded', async () => {
  initLogin();
  initTabs();
  initReviewFilters();
  initMediaUpload();
  initFaqAdd();
  await checkSession();
});