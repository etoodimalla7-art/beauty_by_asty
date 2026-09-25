/* ============================================
   GALLERY — Supabase + Lightbox + Voir plus + Bilingue
   ============================================ */
window.allMedia = [];
let currentFilter = 'all';
let currentMedia = [];
let currentIndex = 0;

/* Nombre d'items visibles au départ */
const INITIAL_COUNT_MOBILE  = 4;
const INITIAL_COUNT_DESKTOP = 6;

let isExpanded = false;

function getInitialCount() {
  return window.innerWidth < 640 ? INITIAL_COUNT_MOBILE : INITIAL_COUNT_DESKTOP;
}

/* Retourne la bonne légende selon la langue courante */
function getCaption(item) {
  if (!item) return '';
  if (currentLang === 'fr') return item.caption_fr || item.caption || '';
  return item.caption_en || item.caption || '';
}

/* Retourne le bon tag selon la langue courante */
function getTag(item) {
  if (!item) return '';
  if (currentLang === 'fr') return item.tag_fr || item.tag || '';
  return item.tag_en || item.tag || '';
}

async function loadGallery() {
  const { data, error } = await supabaseClient
    .from('media')
    .select('*')
    .eq('brand', window.BRAND || 'beauty')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) { console.error('loadGallery', error); return; }
  window.allMedia = data || [];
  renderGallery();
}

function renderGallery() {
  const grid     = document.getElementById('galleryGrid');
  const filters  = document.getElementById('galleryFilters');
  const empty    = document.getElementById('galleryEmpty');
  const moreWrap = document.getElementById('galleryMoreWrap');
  const moreBtn  = document.getElementById('galleryMoreBtn');
  if (!grid || !filters) return;

  /* ---------- Filtres (tags bilingues) ---------- */
  const rawTags = window.allMedia
    .map(m => getTag(m))
    .filter(Boolean);
  const tags = ['all', ...new Set(rawTags)];

  filters.innerHTML = tags.map(tag => `
    <button class="filter-btn ${tag === currentFilter ? 'active' : ''}" data-tag="${tag}">
      ${tag === 'all' ? t('gallery.all') : tag.charAt(0).toUpperCase() + tag.slice(1)}
    </button>
  `).join('');

  filters.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.tag;
      isExpanded = false;
      renderGallery();
    });
  });

  /* ---------- Sélection ---------- */
  currentMedia = currentFilter === 'all'
    ? window.allMedia
    : window.allMedia.filter(m => getTag(m) === currentFilter);

  if (currentMedia.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    if (moreWrap) moreWrap.classList.add('hidden');
    return;
  }
  empty.classList.add('hidden');

  /* ---------- Affichage limité ---------- */
  const initialCount = getInitialCount();
  const hasMore = currentMedia.length > initialCount;
  const visibleMedia = isExpanded ? currentMedia : currentMedia.slice(0, initialCount);

  /* ---------- Rendu des items ---------- */
  grid.innerHTML = visibleMedia.map((item, i) => {
    const caption = getCaption(item);

    if (item.type === 'image') {
      return `
        <div class="gallery-item" data-index="${i}">
          <img src="${item.url}" alt="${caption}" loading="lazy" />
          <span class="gallery-caption">${caption}</span>
        </div>`;
    }
    return `
      <div class="gallery-item" data-index="${i}">
        <video src="${item.url}" muted loop playsinline preload="metadata"></video>
        <span class="video-badge">
          <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="10 8 16 12 10 16 10 8"/>
          </svg>
        </span>
        <span class="gallery-caption">${caption}</span>
      </div>`;
  }).join('');

  grid.querySelectorAll('.gallery-item').forEach(el => {
    el.addEventListener('click', () => openLightbox(parseInt(el.dataset.index, 10)));
  });

  /* ---------- Bouton Voir plus / Voir moins ---------- */
  if (moreWrap && moreBtn) {
    if (hasMore || isExpanded) {
      moreWrap.classList.remove('hidden');
      moreBtn.querySelector('span').textContent = isExpanded
        ? t('gallery.seeLess')
        : t('gallery.seeMore');
    } else {
      moreWrap.classList.add('hidden');
    }

    if (!moreBtn.dataset.bound) {
      moreBtn.addEventListener('click', () => {
        isExpanded = !isExpanded;
        renderGallery();
        if (!isExpanded) {
          document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
        }
      });
      moreBtn.dataset.bound = 'true';
    }
  }
}

/* ---------- LIGHTBOX ---------- */
function openLightbox(index) {
  currentIndex = index;
  const lb = document.getElementById('lightbox');
  const content = document.getElementById('lbContent');
  const caption = document.getElementById('lbCaption');
  const item = currentMedia[currentIndex];
  const cap = getCaption(item);

  if (item.type === 'image') {
    content.innerHTML = `<img src="${item.url}" alt="${cap}" />`;
  } else {
    content.innerHTML = `<video src="${item.url}" controls autoplay playsinline></video>`;
  }
  caption.textContent = cap;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  document.getElementById('lbContent').innerHTML = '';
  lb.classList.remove('open');
  document.body.style.overflow = '';
}

function navigateLightbox(dir) {
  if (currentMedia.length === 0) return;
  currentIndex = (currentIndex + dir + currentMedia.length) % currentMedia.length;
  openLightbox(currentIndex);
}

function initLightbox() {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', () => navigateLightbox(-1));
  document.getElementById('lbNext').addEventListener('click', () => navigateLightbox(1));

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });

  lb.addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') closeLightbox();
  });

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (!isExpanded) renderGallery();
    }, 250);
  });
}
