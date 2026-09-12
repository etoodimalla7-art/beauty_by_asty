/* ============================================
   GALLERY — Supabase + lightbox
   ============================================ */
let currentFilter = 'all';
let currentMedia = [];
let currentIndex = 0;
let allMedia = [];

async function loadGallery() {
  const { data, error } = await supabaseClient
    .from('media')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) { console.error('loadGallery', error); return; }
  allMedia = data || [];
  renderGallery();
}

function renderGallery() {
  const grid    = document.getElementById('galleryGrid');
  const filters = document.getElementById('galleryFilters');
  const empty   = document.getElementById('galleryEmpty');
  if (!grid || !filters) return;

  // Tags uniques
  const tags = ['all', ...new Set(allMedia.map(m => m.tag).filter(Boolean))];
  filters.innerHTML = tags.map(tag => `
    <button class="filter-btn ${tag === currentFilter ? 'active' : ''}" data-tag="${tag}">
      ${tag === 'all'
        ? translations[currentLang].gallery.all
        : tag.charAt(0).toUpperCase() + tag.slice(1)}
    </button>
  `).join('');

  filters.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.tag;
      renderGallery();
    });
  });

  currentMedia = currentFilter === 'all'
    ? allMedia
    : allMedia.filter(m => m.tag === currentFilter);

  if (currentMedia.length === 0) {
    grid.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  grid.innerHTML = currentMedia.map((item, i) => {
    if (item.type === 'image') {
      return `
        <div class="gallery-item" data-index="${i}">
          <img src="${item.url}" alt="${item.caption || ''}" loading="lazy" />
          <span class="gallery-caption">${item.caption || ''}</span>
        </div>`;
    }
    // Video
    return `
      <div class="gallery-item" data-index="${i}">
        <video src="${item.url}" muted loop playsinline preload="metadata"></video>
        <span class="video-badge">
          <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="10 8 16 12 10 16 10 8"/>
          </svg>
        </span>
        <span class="gallery-caption">${item.caption || ''}</span>
      </div>`;
  }).join('');

  grid.querySelectorAll('.gallery-item').forEach(el => {
    el.addEventListener('click', () => openLightbox(parseInt(el.dataset.index, 10)));
  });
}

function openLightbox(index) {
  currentIndex = index;
  const lb = document.getElementById('lightbox');
  const content = document.getElementById('lbContent');
  const caption = document.getElementById('lbCaption');
  const item = currentMedia[currentIndex];

  if (item.type === 'image') {
    content.innerHTML = `<img src="${item.url}" alt="${item.caption || ''}" />`;
  } else {
    content.innerHTML = `<video src="${item.url}" controls autoplay playsinline></video>`;
  }
  caption.textContent = item.caption || '';
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
  document.getElementById('lbClose').addEventListener('click', closeLightbox);
  document.getElementById('lbPrev').addEventListener('click', () => navigateLightbox(-1));
  document.getElementById('lbNext').addEventListener('click', () => navigateLightbox(1));

  document.addEventListener('keydown', (e) => {
    if (!document.getElementById('lightbox').classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft')  navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
  });

  document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target.id === 'lightbox') closeLightbox();
  });
}