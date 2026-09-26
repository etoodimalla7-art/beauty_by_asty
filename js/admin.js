/* ============================================
   ADMIN v3 — Contrôle total multi-pôles + upload
   ============================================ */
let session = null;
let currentBrand = 'group';
let currentTab = 'content';
let currentReviewFilter = 'pending';

let contentData = {};
let allReviewsAdmin = [];
let allMediaAdmin = [];
let allBookingsAdmin = [];
let allFaqAdmin = [];

/* Détection bilingue */
function isBilingualKey(key) { return key.endsWith('_fr') || key.endsWith('_en'); }
function baseKey(key) { return key.replace(/_(fr|en)$/, ''); }

/* Labels FR */
const FIELD_LABELS = {
  bg_url: 'Image de fond',
  image_url: 'Image',
  photo_url: 'Photo',
  location_label: 'Localisation',
  tag: 'Étiquette',
  title: 'Titre',
  subtitle: 'Sous-titre',
  cta1: 'Bouton 1',
  cta2: 'Bouton 2',
  eyebrow: 'Sur-titre',
  name: 'Nom',
  quote: 'Citation',
  bio: 'Biographie',
  body1: 'Paragraphe 1',
  body2: 'Paragraphe 2',
  address: 'Adresse',
  phone: 'Téléphone',
  phone_wa: 'WhatsApp (chiffres uniquement)',
  email: 'Email',
  hours: 'Horaires',
  map_embed: 'Google Maps Embed URL',
  instagram: 'Instagram URL',
  facebook: 'Facebook URL',
  tiktok: 'TikTok URL',
  tagline: 'Accroche',
  made: 'Ligne "made in"',
};

/* Champs connus par bloc */
const KNOWN_FIELDS = {
  hero: ['bg_url','location_label','title','subtitle','cta1','cta2'],
  about: ['image_url','tag','title','body1','body2'],
  contact: ['tag','title','address','phone','phone_wa','email','hours','map_embed'],
  socials: ['instagram','facebook','tiktok'],
  footer: ['tagline','made'],
  group_hero: ['bg_url','eyebrow','title','subtitle','cta1','cta2'],
  group_about: ['image_url','tag','title','body1','body2'],
  group_founder: ['photo_url','tag','name','title','quote','bio'],
  group_contact: ['tag','title','address','phone','phone_wa','email','map_embed'],
  group_footer: ['tagline','made'],
};

/* Détecte si un champ est un champ image (upload) */
function isImageField(key) {
  return key.includes('_url') || key.includes('image') || key.includes('photo') || key === 'bg_url';
}

/* ============================
   AUTH
   ============================ */
async function checkSession() {
  const { data } = await supabaseClient.auth.getSession();
  session = data?.session || null;
  toggleLoginUI();
  supabaseClient.auth.onAuthStateChange((_e, s) => { session = s; toggleLoginUI(); });
}

function toggleLoginUI() {
  const login = document.getElementById('loginScreen');
  const panel = document.getElementById('adminPanel');
  if (session) {
    login.classList.add('hidden');
    panel.classList.remove('hidden');
    document.getElementById('currentEmail').value = session.user.email || '';
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
    if (error) { errEl.textContent = 'Identifiants incorrects.'; errEl.classList.remove('hidden'); return; }
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
   ACCOUNT MODAL
   ============================ */
function initAccountModal() {
  const modal = document.getElementById('accountModal');
  const open = () => { modal.classList.remove('hidden'); modal.classList.add('flex'); };
  const close = () => { modal.classList.add('hidden'); modal.classList.remove('flex'); };

  document.getElementById('settingsBtn').addEventListener('click', open);
  document.getElementById('accountClose').addEventListener('click', close);
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const pwd = document.getElementById('newPassword').value;
    const conf = document.getElementById('confirmPassword').value;
    const status = document.getElementById('passwordStatus');

    if (pwd.length < 6) { status.textContent = '❌ 6 caractères minimum.'; status.className = 'text-center text-sm text-terracotta'; status.classList.remove('hidden'); return; }
    if (pwd !== conf) { status.textContent = '❌ Les mots de passe ne correspondent pas.'; status.className = 'text-center text-sm text-terracotta'; status.classList.remove('hidden'); return; }

    const { error } = await supabaseClient.auth.updateUser({ password: pwd });
    if (error) { status.textContent = '❌ ' + error.message; status.className = 'text-center text-sm text-terracotta'; status.classList.remove('hidden'); return; }
    status.textContent = '✅ Mot de passe mis à jour.'; status.className = 'text-center text-sm text-gold'; status.classList.remove('hidden');
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    setTimeout(() => status.classList.add('hidden'), 4000);
  });

  document.getElementById('signOutAllBtn').addEventListener('click', async () => {
    if (!confirm('Déconnecter toutes les sessions ?')) return;
    await supabaseClient.auth.signOut({ scope: 'global' });
    window.location.reload();
  });
}

/* ============================
   NAV
   ============================ */
function initNav() {
  document.querySelectorAll('.brand-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.brand-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentBrand = tab.dataset.brandSelect;
      const link = document.getElementById('viewSiteLink');
      if (link) {
        const urls = { group: 'index.html', beauty: 'beauty.html', deco: 'deco.html', studio: 'studio.html' };
        link.href = urls[currentBrand];
      }
      loadEverything();
    });
  });

  document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
      tab.classList.add('active');
      currentTab = tab.dataset.tab;
      document.getElementById(`tab-${currentTab}`).classList.remove('hidden');
    });
  });
}

/* ============================
   LOAD
   ============================ */
async function loadEverything() {
  await Promise.all([
    loadContentAdmin(),
    loadGalleryAdmin(),
    loadReviewsAdmin(),
    loadBookingsAdmin(),
    loadFaqAdmin(),
  ]);
}

/* ============================
   CONTENT
   ============================ */
async function loadContentAdmin() {
  const loading = document.getElementById('contentLoading');
  const wrapper = document.getElementById('contentForms');
  const list = document.getElementById('contentFormsList');
  loading.classList.remove('hidden');
  wrapper.classList.add('hidden');
  list.innerHTML = '';

  const { data, error } = await supabaseClient
    .from('content').select('*').eq('brand', currentBrand);

  if (error) { console.error(error); loading.textContent = 'Erreur : ' + error.message; return; }

  contentData = {};
  (data || []).forEach(row => contentData[row.key] = row.value);

  if (Object.keys(contentData).length === 0) {
    loading.textContent = 'Aucun contenu. Cliquez sur "+ Ajouter un bloc" pour commencer.';
    return;
  }

  list.innerHTML = Object.keys(contentData).map(key => renderContentForm(key, contentData[key])).join('');

  list.querySelectorAll('form.content-form').forEach(form => {
    form.addEventListener('submit', (e) => saveContentForm(e, form));
  });
  list.querySelectorAll('.delete-block-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteContentBlock(btn.dataset.key));
  });
  list.querySelectorAll('.img-file-input').forEach(fileInput => {
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const target = e.target.dataset.target;
      const status = e.target.parentElement.querySelector('.img-upload-status');
      status.textContent = 'Upload…';

      const url = await uploadFile(file);
      if (!url) { status.textContent = '❌ Erreur'; return; }

      const textInput = list.querySelector(`input[name="${target}"]`);
      if (textInput) textInput.value = url;

      const preview = e.target.closest('.field').querySelector('.img-preview');
      if (preview) { preview.src = url; preview.classList.remove('hidden'); }

      status.textContent = '✅ Image prête (cliquez sur Enregistrer)';
    });
  });

  initServicesEditor();

  loading.classList.add('hidden');
  wrapper.classList.remove('hidden');
}

function renderContentForm(key, obj) {
  if (key === 'services') return renderServicesForm(key, obj);

  const bilingual = {};
  const commons = [];

  Object.keys(obj).forEach(k => {
    const v = obj[k];
    if (Array.isArray(v) || (typeof v === 'object' && v !== null)) return;

    if (isBilingualKey(k)) {
      const b = baseKey(k);
      bilingual[b] = bilingual[b] || {};
      if (k.endsWith('_fr')) bilingual[b].fr = v;
      else bilingual[b].en = v;
    } else {
      commons.push({ key: k, value: v });
    }
  });

  const knownOrder = KNOWN_FIELDS[key] || [];
  const orderedBases = [
    ...knownOrder.filter(b => bilingual[b]),
    ...Object.keys(bilingual).filter(b => !knownOrder.includes(b)),
  ];

  const commonsHTML = commons.map(({ key: k, value: v }) => {
    const label = FIELD_LABELS[k] || k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    if (isImageField(k)) {
      return `
        <div class="field" data-image-field="${k}">
          <label>${label}</label>
          <input name="${k}" type="text" value="${escapeHtml(v)}" class="img-url-input" placeholder="https://..." />
          <div class="flex items-center gap-3 mt-2">
            <label class="cursor-pointer border border-espresso px-3 py-1 text-xs uppercase tracking-widest hover:bg-espresso hover:text-alabaster transition">
              Choisir un fichier
              <input type="file" accept="image/*" class="img-file-input hidden" data-target="${k}" />
            </label>
            <span class="text-xs text-gold img-upload-status"></span>
          </div>
          <img class="mt-3 w-full max-w-xs h-24 object-cover border border-sand img-preview ${v ? '' : 'hidden'}" src="${v ? escapeHtml(v) : ''}" />
        </div>
      `;
    }

    const isLong = typeof v === 'string' && v.length > 60;
    const input = isLong
      ? `<textarea name="${k}" rows="2">${escapeHtml(v)}</textarea>`
      : `<input name="${k}" type="text" value="${escapeHtml(v)}" />`;
    return `<div class="field"><label>${label}</label>${input}</div>`;
  }).join('');

  const bilingualHTML = orderedBases.map(base => {
    const label = FIELD_LABELS[base] || base.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const fr = bilingual[base].fr ?? '';
    const en = bilingual[base].en ?? '';
    const isLong = typeof fr === 'string' && fr.length > 60;

    const frInput = isLong
      ? `<textarea name="${base}_fr" rows="2">${escapeHtml(fr)}</textarea>`
      : `<input name="${base}_fr" type="text" value="${escapeHtml(fr)}" />`;
    const enInput = isLong
      ? `<textarea name="${base}_en" rows="2">${escapeHtml(en)}</textarea>`
      : `<input name="${base}_en" type="text" value="${escapeHtml(en)}" />`;

    return `
      <div class="bilingual-row">
        <div class="field">
          <label>${label} <span class="text-gold">🇫🇷 FR</span></label>
          ${frInput}
        </div>
        <div class="field">
          <label>${label} <span class="text-gold">🇬🇧 EN</span></label>
          ${enInput}
        </div>
      </div>
    `;
  }).join('');

  return `
    <form class="content-form border border-sand p-5 md:p-6" data-key="${key}">
      <div class="flex items-center justify-between mb-6 flex-wrap gap-2 border-b border-sand pb-4">
        <p class="text-sm uppercase tracking-widest text-gold font-medium">${key}</p>
        <button type="button" class="delete-block-btn text-xs uppercase tracking-widest text-terracotta hover:underline" data-key="${key}">Supprimer ce bloc</button>
      </div>

      ${commons.length ? `
        <p class="text-xs uppercase tracking-widest text-espresso/50 mb-4">Champs communs</p>
        <div class="grid md:grid-cols-2 gap-5 mb-8">${commonsHTML}</div>
      ` : ''}

      ${orderedBases.length ? `
        <p class="text-xs uppercase tracking-widest text-espresso/50 mb-4">Champs bilingues (FR / EN)</p>
        <div class="space-y-5">${bilingualHTML}</div>
      ` : ''}

      <button type="submit" class="btn-whatsapp mt-6">Enregistrer</button>
      <p class="text-sm text-gold mt-3 save-status"></p>
    </form>
  `;
}

function renderServicesForm(key, obj) {
  const items = obj.items || [];
  const itemsHTML = items.map((it, i) => serviceItemHTML(it, i)).join('');

  const metaFrHTML = ['tag','title'].map(k => `
    <div class="field"><label>${FIELD_LABELS[k] || k} 🇫🇷 FR</label><input name="${k}_fr" value="${escapeHtml(obj[k + '_fr'] || '')}" /></div>
  `).join('');
  const metaEnHTML = ['tag','title'].map(k => `
    <div class="field"><label>${FIELD_LABELS[k] || k} 🇬🇧 EN</label><input name="${k}_en" value="${escapeHtml(obj[k + '_en'] || '')}" /></div>
  `).join('');

  return `
    <form class="content-form border border-sand p-5 md:p-6" data-key="${key}" id="servicesForm">
      <div class="flex items-center justify-between mb-6 flex-wrap gap-2 border-b border-sand pb-4">
        <p class="text-sm uppercase tracking-widest text-gold font-medium">${key}</p>
        <button type="button" class="delete-block-btn text-xs uppercase tracking-widest text-terracotta hover:underline" data-key="${key}">Supprimer ce bloc</button>
      </div>

      <p class="text-xs uppercase tracking-widest text-espresso/50 mb-4">Titre du bloc</p>
      <div class="bilingual-row mb-4">${metaFrHTML}</div>
      <div class="bilingual-row mb-8">${metaEnHTML}</div>

      <p class="text-xs uppercase tracking-widest text-espresso/50 mb-4">Liste des services</p>
      <div id="servicesListAdmin" class="space-y-4">${itemsHTML}</div>
      <button type="button" id="addServiceBtn" class="border border-espresso px-4 py-2 text-xs uppercase tracking-widest mt-4 hover:bg-espresso hover:text-alabaster transition">+ Ajouter un service</button>
      <button type="submit" class="btn-whatsapp mt-6">Enregistrer</button>
      <p class="text-sm text-gold mt-3 save-status"></p>
    </form>
  `;
}

function serviceItemHTML(it, i) {
  return `
    <div class="border border-sand p-4 relative" data-idx="${i}">
      <button type="button" class="absolute top-3 right-3 text-terracotta text-xs uppercase tracking-widest remove-service">Supprimer</button>
      <div class="field mb-3"><label>Numéro</label><input class="svc-num" value="${escapeHtml(it.num || '')}" /></div>
      <div class="bilingual-row mb-3">
        <div class="field"><label>Titre 🇫🇷 FR</label><input class="svc-title-fr" value="${escapeHtml(it.title_fr || '')}" /></div>
        <div class="field"><label>Title 🇬🇧 EN</label><input class="svc-title-en" value="${escapeHtml(it.title_en || '')}" /></div>
      </div>
      <div class="bilingual-row">
        <div class="field"><label>Description 🇫🇷 FR</label><textarea class="svc-desc-fr" rows="2">${escapeHtml(it.desc_fr || '')}</textarea></div>
        <div class="field"><label>Description 🇬🇧 EN</label><textarea class="svc-desc-en" rows="2">${escapeHtml(it.desc_en || '')}</textarea></div>
      </div>
    </div>
  `;
}

function initServicesEditor() {
  const list = document.getElementById('servicesListAdmin');
  if (!list) return;

  list.querySelectorAll('.remove-service').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.closest('[data-idx]').dataset.idx, 10);
      const items = readServicesFromEditor();
      items.splice(idx, 1);
      renderServicesEditor(items);
    });
  });

  const addBtn = document.getElementById('addServiceBtn');
  if (addBtn && !addBtn.dataset.bound) {
    addBtn.addEventListener('click', () => {
      const items = readServicesFromEditor();
      items.push({ num: String(items.length + 1).padStart(2,'0'), title_fr:'', title_en:'', desc_fr:'', desc_en:'' });
      renderServicesEditor(items);
    });
    addBtn.dataset.bound = 'true';
  }
}

function renderServicesEditor(items) {
  const list = document.getElementById('servicesListAdmin');
  if (!list) return;
  list.innerHTML = items.map((it, i) => serviceItemHTML(it, i)).join('');
  initServicesEditor();
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

async function saveContentForm(e, form) {
  e.preventDefault();
  const key = form.dataset.key;
  const status = form.querySelector('.save-status');
  status.textContent = 'Enregistrement…';

  let value;
  if (key === 'services') {
    value = {
      tag_fr: form.querySelector('[name="tag_fr"]').value,
      tag_en: form.querySelector('[name="tag_en"]').value,
      title_fr: form.querySelector('[name="title_fr"]').value,
      title_en: form.querySelector('[name="title_en"]').value,
      items: readServicesFromEditor(),
    };
  } else {
    value = {};
    form.querySelectorAll('[name]').forEach(field => { value[field.name] = field.value; });
    const original = contentData[key] || {};
    Object.keys(original).forEach(k => {
      if (Array.isArray(original[k]) || (typeof original[k] === 'object' && original[k] !== null)) {
        value[k] = original[k];
      }
    });
  }

  const { error } = await supabaseClient.from('content').upsert({ key, brand: currentBrand, value });
  if (error) { status.textContent = '❌ ' + error.message; return; }
  status.textContent = '✅ Enregistré';
  setTimeout(() => status.textContent = '', 3000);
}

async function deleteContentBlock(key) {
  if (!confirm(`Supprimer définitivement le bloc "${key}" ?`)) return;
  await supabaseClient.from('content').delete().eq('key', key).eq('brand', currentBrand);
  loadContentAdmin();
}

function initAddContent() {
  document.getElementById('addContentBtn').addEventListener('click', async () => {
    const key = prompt('Nom du nouveau bloc (ex: tarifs, événements) :');
    if (!key || !key.trim()) return;
    const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');

    if (contentData[cleanKey]) { alert('Ce bloc existe déjà.'); return; }

    const fieldsStr = prompt(
      'Champs du bloc (séparés par virgule, sans _fr/_en) :\n\n' +
      'Exemple : title, subtitle, body1, image_url',
      'title, body, image_url'
    );
    if (fieldsStr === null) return;

    const bases = fieldsStr.split(',').map(f => f.trim()).filter(Boolean);
    const value = {};
    bases.forEach(base => {
      if (base.includes('url') || base === 'name') {
        value[base] = '';
      } else {
        value[base + '_fr'] = '';
        value[base + '_en'] = '';
      }
    });

    const { error } = await supabaseClient.from('content').insert([{
      key: cleanKey, brand: currentBrand, value
    }]);

    if (error) { alert('Erreur : ' + error.message); return; }
    loadContentAdmin();
  });
}

/* ============================
   GALLERY
   ============================ */
async function loadGalleryAdmin() {
  const { data, error } = await supabaseClient
    .from('media').select('*').eq('brand', currentBrand)
    .order('created_at', { ascending: false });
  if (error) return console.error(error);
  allMediaAdmin = data || [];

  const list = document.getElementById('mediaAdminList');
  if (allMediaAdmin.length === 0) {
    list.innerHTML = `<p class="col-span-full text-center font-serif italic text-espresso/60 py-12">Galerie vide.</p>`;
    return;
  }
  list.innerHTML = allMediaAdmin.map(m => `
    <div class="border border-sand overflow-hidden">
      ${m.type === 'image'
        ? `<img src="${m.url}" class="w-full h-40 object-cover" />`
        : `<video src="${m.url}" class="w-full h-40 object-cover" muted></video>`}
      <div class="p-3">
        <p class="text-xs uppercase tracking-widest text-espresso/50 mb-1">FR: ${escapeHtml(m.tag_fr || m.tag || '—')}</p>
        <p class="font-serif italic text-sm mb-1">${escapeHtml(m.caption_fr || m.caption || '')}</p>
        <p class="text-xs uppercase tracking-widest text-espresso/50 mb-1">EN: ${escapeHtml(m.tag_en || '—')}</p>
        <p class="font-serif italic text-xs text-espresso/50 mb-3">${escapeHtml(m.caption_en || '')}</p>
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
  loadGalleryAdmin();
}

async function editMedia(id) {
  const { data } = await supabaseClient.from('media').select('*').eq('id', id).single();
  if (!data) return;

  const captionFr = prompt('Légende FR :', data.caption_fr || data.caption || ''); if (captionFr === null) return;
  const captionEn = prompt('Caption EN :', data.caption_en || ''); if (captionEn === null) return;
  const tagFr = prompt('Tag FR :', data.tag_fr || data.tag || ''); if (tagFr === null) return;
  const tagEn = prompt('Tag EN :', data.tag_en || ''); if (tagEn === null) return;

  await supabaseClient.from('media').update({
    caption_fr: captionFr.trim(),
    caption_en: captionEn.trim(),
    tag_fr: tagFr.trim().toLowerCase(),
    tag_en: tagEn.trim().toLowerCase(),
  }).eq('id', id);
  loadGalleryAdmin();
}

async function uploadFile(file) {
  const ext = file.name.split('.').pop();
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabaseClient.storage.from('media').upload(name, file);
  if (error) { console.error(error); return null; }
  const { data } = supabaseClient.storage.from('media').getPublicUrl(name);
  return data.publicUrl;
}

function initMediaUpload() {
  document.getElementById('mediaAddBtn').addEventListener('click', async () => {
    const type = document.getElementById('mediaType').value;
    const file = document.getElementById('mediaFile').files[0];
    const captionFr = document.getElementById('mediaCaptionFr').value.trim();
    const captionEn = document.getElementById('mediaCaptionEn').value.trim();
    const tagFr = document.getElementById('mediaTagFr').value.trim().toLowerCase();
    const tagEn = document.getElementById('mediaTagEn').value.trim().toLowerCase();
    const progress = document.getElementById('mediaProgress');

    if (!file) return alert('Choisissez un fichier.');
    progress.textContent = 'Upload en cours…';

    const url = await uploadFile(file);
    if (!url) { progress.textContent = '❌ Erreur upload'; return; }

    const { error } = await supabaseClient.from('media').insert([{
      brand: currentBrand, type, url,
      caption_fr: captionFr, caption_en: captionEn,
      tag_fr: tagFr, tag_en: tagEn,
      caption: captionFr,
      tag: tagFr
    }]);
    if (error) { progress.textContent = '❌ ' + error.message; return; }

    progress.textContent = '✅ Upload réussi !';
    document.getElementById('mediaFile').value = '';
    document.getElementById('mediaCaptionFr').value = '';
    document.getElementById('mediaCaptionEn').value = '';
    document.getElementById('mediaTagFr').value = '';
    document.getElementById('mediaTagEn').value = '';
    setTimeout(() => progress.textContent = '', 3000);
    loadGalleryAdmin();
  });
}

/* ============================
   REVIEWS
   ============================ */
async function loadReviewsAdmin() {
  const { data, error } = await supabaseClient
    .from('reviews').select('*').eq('brand', currentBrand)
    .order('created_at', { ascending: false });
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
          <p class="font-serif text-lg md:text-xl">${escapeHtml(r.name)}</p>
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
      <p class="font-light mb-4">${escapeHtml(r.message)}</p>
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

    await supabaseClient.from('reviews').insert([{
      brand: currentBrand, name, rating, message, status: 'approved'
    }]);
    e.target.reset();
    document.getElementById('addReviewRating').value = 5;
    loadReviewsAdmin();
  });
}

/* ============================
   BOOKINGS — Affichage corrigé
   Téléphone, Email, et type de message
   ============================ */
async function loadBookingsAdmin() {
  const { data, error } = await supabaseClient
    .from('bookings').select('*').eq('brand', currentBrand)
    .order('created_at', { ascending: false });
  if (error) return console.error(error);
  allBookingsAdmin = data || [];

  const list = document.getElementById('bookingsList');
  if (allBookingsAdmin.length === 0) {
    list.innerHTML = `<p class="text-center font-serif italic text-espresso/60 py-12">Aucune réservation.</p>`;
    return;
  }

  list.innerHTML = allBookingsAdmin.map(b => {
    // Détection : message de contact vs réservation
    const isMessage = b.status === 'message';

    // Sécurité : s'assurer que phone et email sont bien distincts
    const phone = b.phone || '';
    const email = (b.location && b.location.includes('@')) ? b.location : '';

    // Lien WhatsApp
    const waNumber = phone.replace(/\D/g, '');
    const waLink = waNumber ? `https://wa.me/${waNumber}` : '#';

    return `
      <div class="border border-sand p-4 md:p-6 flex flex-col lg:flex-row lg:items-start gap-4 justify-between">
        <div class="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">

          <div>
            <span class="text-espresso/50 text-xs uppercase tracking-widest">Nom</span><br>
            <span class="font-serif text-base">${escapeHtml(b.name)}</span>
          </div>

          <div>
            <span class="text-espresso/50 text-xs uppercase tracking-widest">Téléphone</span><br>
            ${phone
              ? `<a href="tel:${phone.replace(/\s/g,'')}" class="hover:text-gold transition">${escapeHtml(phone)}</a>`
              : '<span class="text-espresso/40">—</span>'}
          </div>

          <div>
            <span class="text-espresso/50 text-xs uppercase tracking-widest">Email</span><br>
            ${email
              ? `<a href="mailto:${escapeHtml(email)}" class="hover:text-gold transition break-all">${escapeHtml(email)}</a>`
              : '<span class="text-espresso/40">—</span>'}
          </div>

          <div>
            <span class="text-espresso/50 text-xs uppercase tracking-widest">${isMessage ? 'Sujet' : 'Prestation'}</span><br>
            ${escapeHtml(b.service)}
          </div>

          <div>
            <span class="text-espresso/50 text-xs uppercase tracking-widest">Date</span><br>
            ${b.date} à ${b.time}
          </div>

          <div>
            <span class="text-espresso/50 text-xs uppercase tracking-widest">Reçue le</span><br>
            ${new Date(b.created_at).toLocaleDateString('fr-FR')}
          </div>

          ${b.message ? `
            <div class="sm:col-span-2 lg:col-span-3 mt-2 pt-3 border-t border-sand">
              <span class="text-espresso/50 text-xs uppercase tracking-widest">Message</span><br>
              <p class="font-light mt-1">${escapeHtml(b.message)}</p>
            </div>
          ` : ''}

          <div class="sm:col-span-2 lg:col-span-3">
            <span class="status-badge ${isMessage ? 'status-new' : 'status-pending'}">
              ${isMessage ? 'Message de contact' : 'Réservation'}
            </span>
          </div>

        </div>

        <div class="flex flex-col gap-2 lg:min-w-[180px]">
          ${waNumber ? `
            <a href="${waLink}" target="_blank" rel="noopener"
               class="border border-espresso px-4 py-2 text-xs uppercase tracking-widest hover:bg-espresso hover:text-alabaster transition whitespace-nowrap text-center">
              Répondre WhatsApp
            </a>
          ` : ''}
          ${email ? `
            <a href="mailto:${escapeHtml(email)}"
               class="border border-espresso px-4 py-2 text-xs uppercase tracking-widest hover:bg-espresso hover:text-alabaster transition whitespace-nowrap text-center">
              Répondre Email
            </a>
          ` : ''}
          <button onclick="deleteBooking('${b.id}')" class="px-4 py-2 text-xs uppercase tracking-widest text-terracotta hover:underline">
            Supprimer
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function deleteBooking(id) {
  if (!confirm('Supprimer cette entrée ?')) return;
  await supabaseClient.from('bookings').delete().eq('id', id);
  loadBookingsAdmin();
}

/* ============================
   FAQ
   ============================ */
async function loadFaqAdmin() {
  const { data, error } = await supabaseClient
    .from('faq').select('*').eq('brand', currentBrand)
    .order('sort_order', { ascending: true });
  if (error) return console.error(error);
  allFaqAdmin = data || [];

  const list = document.getElementById('faqAdminList');
  if (allFaqAdmin.length === 0) {
    list.innerHTML = `<p class="text-center font-serif italic text-espresso/60 py-12">Aucune question.</p>`;
    return;
  }
  list.innerHTML = allFaqAdmin.map(f => `
    <div class="border border-sand p-4 md:p-6">
      <div class="bilingual-row mb-4">
        <div><p class="font-serif text-base md:text-lg mb-1">🇫🇷 ${escapeHtml(f.question_fr)}</p><p class="text-sm text-espresso/70">${escapeHtml(f.answer_fr)}</p></div>
        <div><p class="font-serif text-base md:text-lg mb-1">🇬🇧 ${escapeHtml(f.question_en)}</p><p class="text-sm text-espresso/70">${escapeHtml(f.answer_en)}</p></div>
      </div>
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
  loadFaqAdmin();
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
  loadFaqAdmin();
}

function initFaqAdd() {
  document.getElementById('addFaqForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await supabaseClient.from('faq').insert([{
      brand: currentBrand,
      question_fr: document.getElementById('faqQfr').value.trim(),
      answer_fr:   document.getElementById('faqAfr').value.trim(),
      question_en: document.getElementById('faqQen').value.trim(),
      answer_en:   document.getElementById('faqAen').value.trim(),
    }]);
    e.target.reset();
    loadFaqAdmin();
  });
}

/* ============================
   HELPERS
   ============================ */
function escapeHtml(str) {
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
  initNav();
  initAccountModal();
  initReviewFilters();
  initMediaUpload();
  initFaqAdd();
  initAddContent();
  await checkSession();
});
