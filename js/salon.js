/* ============================================
   SALON PRIVÉ — Chargement + affichage
   Beauty by Asty — Multi-plateforme v3
   ============================================ */

/* --- État global du salon (exposé dans window) --- */
window.salonState = window.salonState || {
  brand: 'group',
  blocks: [],
  tier: 'guest',
  client: null
};

const salonState = window.salonState;

/* ---- Charge les blocs depuis Supabase ---- */
async function loadSalonBlocks(brand) {
  if (typeof supabaseClient === 'undefined') {
    console.error('[salon] supabaseClient introuvable');
    return [];
  }

  const { data, error } = await supabaseClient
    .from('salon_blocks')
    .select('*')
    .eq('brand', brand)
    .eq('status', 'visible')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('[salon] loadSalonBlocks error:', error);
    return [];
  }
  return data || [];
}

/* ---- Détection du type de média depuis une URL ---- */
function detectMediaType(url) {
  if (!url || typeof url !== 'string') return 'none';
  const u = url.trim();
  if (/youtube\.com\/watch\?v=/.test(u) || /youtu\.be\//.test(u) || /youtube\.com\/embed\//.test(u)) return 'youtube';
  if (/vimeo\.com\//.test(u)) return 'vimeo';
  if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(u)) return 'video';
  if (/\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(u)) return 'image';
  if (/^https:\/\//i.test(u)) return 'link';
  return 'none';
}

function extractYouTubeId(url) {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

function extractVimeoId(url) {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

function extractDomain(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); }
  catch (_) { return 'lien'; }
}

/* ---- Vérifie si l'utilisateur a accès au bloc ---- */
function hasAccessToBlock(block, userTier) {
  const order = { guest: 0, client: 1, vip: 2 };
  const blockTier = order[block.min_tier] ?? 0;
  const user = order[userTier] ?? 0;
  return user >= blockTier;
}

/* ---- Rendu principal ---- */
function renderSalonBlocks(blocks) {
  const container = document.getElementById('salonBlocks');
  if (!container) {
    console.warn('[salon] #salonBlocks introuvable');
    return;
  }

  if (!Array.isArray(blocks)) blocks = [];

  if (blocks.length === 0) {
    container.innerHTML = `
      <div class="text-center py-20">
        <p class="font-serif italic text-xl text-espresso/60">
          Le Salon Privé se prépare...
        </p>
      </div>
    `;
    return;
  }

  const tier = (window.salonState && window.salonState.tier) || 'guest';

  container.innerHTML = blocks
    .filter(b => b.status === 'visible')
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map(block => renderBlock(block, tier))
    .join('');

  // Écouteurs pour les CTA
  document.querySelectorAll('.salon-cta').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const url = e.currentTarget.dataset.url;
      if (url) window.open(url, '_blank');
    });
  });
}

/* ---- Rendu d'un bloc ---- */
function renderBlock(block, tier) {
  const isFR = (window.currentLang || 'fr') === 'fr';
  const title = isFR ? block.title_fr : block.title_en;
  const content = isFR ? block.content_fr : block.content_en;
  const cta = isFR ? block.cta_fr : block.cta_en;

  const isLocked = !hasAccessToBlock(block, tier);

  if (isLocked) {
    return `
      <section class="salon-block salon-block-locked relative">
        <div class="relative overflow-hidden">
          <div class="aspect-video bg-espresso/90 flex flex-col items-center justify-center text-alabaster backdrop-blur-md">
            <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#B8895A" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" class="mb-4">
              <rect x="4" y="10" width="16" height="11" rx="2"/>
              <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
            </svg>
            <p class="text-xs uppercase tracking-[0.3em] text-gold mb-3">Contenu privé</p>
            <p class="font-serif italic text-xl text-center max-w-xs px-4 mb-4">
              ${escapeHtml(title || 'Réservé aux clients')}
            </p>
            <p class="text-xs text-alabaster/60 max-w-xs text-center px-4">
              ${isFR ? 'Réservez votre première séance pour débloquer ce contenu.' : 'Book your first session to unlock this content.'}
            </p>
          </div>
        </div>
      </section>
    `;
  }

  switch (block.type) {
    case 'video':    return renderVideoBlock(block, title, content);
    case 'offer':    return renderOfferBlock(block, title, content, cta, isFR);
    case 'article':  return renderArticleBlock(block, title, content);
    case 'gallery':  return renderGalleryBlock(block, title, content);
    case 'tour3d':   return renderTourBlock(block, title, content);
    case 'text':
    default:         return renderTextBlock(block, title, content, cta);
  }
}

function renderVideoBlock(block, title, content) {
  const url = block.media_url || '';
  const type = detectMediaType(url);
  let mediaHTML = '';

  if (type === 'youtube') {
    const id = extractYouTubeId(url);
    if (id) {
      mediaHTML = `
        <div class="salon-video-wrapper">
          <iframe src="https://www.youtube.com/embed/${id}?rel=0&modestbranding=1"
            title="${escapeHtml(title || 'Vidéo')}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen loading="lazy"></iframe>
        </div>`;
    }
  } else if (type === 'vimeo') {
    const id = extractVimeoId(url);
    if (id) {
      mediaHTML = `
        <div class="salon-video-wrapper">
          <iframe src="https://player.vimeo.com/video/${id}?color=B8895A&title=0&byline=0&portrait=0&dnt=1"
            title="${escapeHtml(title || 'Vidéo')}"
            frameborder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen loading="lazy"></iframe>
        </div>`;
    }
  } else if (type === 'video') {
    mediaHTML = `
      <div class="salon-video-wrapper">
        <video src="${url}" controls preload="metadata" playsinline class="w-full h-full object-cover"></video>
      </div>`;
  } else if (type === 'link') {
    const domain = extractDomain(url);
    mediaHTML = `
      <div class="p-6 border border-sand bg-sand/30 text-center">
        <p class="text-xs uppercase tracking-widest text-espresso/60 mb-3">Lien externe</p>
        <a href="${url}" target="_blank" rel="noopener"
           class="inline-flex items-center gap-2 border border-espresso px-5 py-2 text-xs uppercase tracking-widest hover:bg-espresso hover:text-alabaster transition">
          Ouvrir sur ${domain}
        </a>
      </div>`;
  } else {
    mediaHTML = `
      <div class="salon-video-placeholder">
        <div class="salon-video-placeholder-content">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#B8895A" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px;">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="10 8 16 12 10 16 10 8"/>
          </svg>
          <p class="salon-video-placeholder-title">Vidéo bientôt disponible</p>
        </div>
      </div>`;
  }

  return `
    <section class="salon-block salon-block-video">
      ${title ? `<h3 class="salon-block-title">${escapeHtml(title)}</h3>` : ''}
      ${content ? `<p class="salon-block-text">${escapeHtml(content)}</p>` : ''}
      ${mediaHTML}
    </section>
  `;
}

function renderOfferBlock(block, title, content, cta, isFR) {
  const expires = block.expires_at
    ? new Date(block.expires_at).toLocaleDateString(isFR ? 'fr-FR' : 'en-US', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    : null;

  return `
    <section class="salon-block salon-block-offer">
      <div class="salon-offer-badge">${isFR ? 'Offre privée' : 'Private offer'}</div>
      ${title ? `<h3 class="salon-block-title">${escapeHtml(title)}</h3>` : ''}
      ${content ? `<p class="salon-block-text">${escapeHtml(content)}</p>` : ''}
      ${expires ? `<p class="salon-offer-expires">${isFR ? 'Valable jusqu\'au' : 'Valid until'} ${expires}</p>` : ''}
      ${cta ? `<button class="salon-cta" data-url="${block.cta_url || ''}">${escapeHtml(cta)}</button>` : ''}
    </section>
  `;
}

function renderArticleBlock(block, title, content) {
  const url = block.media_url || '';
  const type = detectMediaType(url);

  let imgHTML = '';
  if (type === 'image') {
    imgHTML = `<div class="salon-article-image"><img src="${url}" alt="${escapeHtml(title || '')}" loading="lazy" /></div>`;
  }

  return `
    <section class="salon-block salon-block-article">
      ${imgHTML}
      <div class="salon-article-body">
        ${title ? `<h3 class="salon-block-title">${escapeHtml(title)}</h3>` : ''}
        ${content ? `<p class="salon-block-text">${escapeHtml(content)}</p>` : ''}
      </div>
    </section>
  `;
}

function renderGalleryBlock(block, title, content) {
  const images = Array.isArray(block.images) ? block.images
    : (block.media_url ? block.media_url.split(',').map(s => s.trim()).filter(Boolean) : []);

  return `
    <section class="salon-block salon-block-gallery">
      ${title ? `<h3 class="salon-block-title">${escapeHtml(title)}</h3>` : ''}
      ${content ? `<p class="salon-block-text">${escapeHtml(content)}</p>` : ''}
      <div class="salon-gallery-grid">
        ${images.map(img => `
          <div class="salon-gallery-item">
            <img src="${img}" alt="" loading="lazy" />
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderTourBlock(block, title, content) {
  const url = block.media_url || '';
  const isEmbeddable = url && (url.includes('matterport') || url.includes('sketchfab'));

  return `
    <section class="salon-block salon-block-tour">
      ${title ? `<h3 class="salon-block-title">${escapeHtml(title)}</h3>` : ''}
      ${content ? `<p class="salon-block-text">${escapeHtml(content)}</p>` : ''}
      <div class="salon-tour-wrapper">
        ${isEmbeddable ? `
          <iframe src="${url}" title="Visite 3D" frameborder="0"
            allow="xr-spatial-tracking; fullscreen" allowfullscreen loading="lazy"></iframe>
        ` : `
          <div class="salon-video-placeholder">
            <div class="salon-video-placeholder-content">
              <p class="salon-video-placeholder-title">Visite 3D bientôt disponible</p>
            </div>
          </div>
        `}
      </div>
    </section>
  `;
}

function renderTextBlock(block, title, content, cta) {
  return `
    <section class="salon-block salon-block-text">
      ${title ? `<h3 class="salon-block-title">${escapeHtml(title)}</h3>` : ''}
      ${content ? `<p class="salon-block-text">${escapeHtml(content)}</p>` : ''}
      ${cta ? `<button class="salon-cta" data-url="${block.cta_url || ''}">${escapeHtml(cta)}</button>` : ''}
    </section>
  `;
}

function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}
