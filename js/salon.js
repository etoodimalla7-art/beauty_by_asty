/* ============================================
   SALON PRIVÉ — Chargement + affichage
   ============================================ */

let salonState = {
  brand: 'group',
  blocks: [],
  tier: 'guest',
  client: null
};

/* ============================================
   CHARGEMENT DU CONTENU
   ============================================ */
async function loadSalonBlocks(brand) {
  const { data, error } = await supabaseClient
    .from('salon_blocks')
    .select('*')
    .eq('brand', brand)
    .eq('status', 'visible')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('loadSalonBlocks', error);
    return [];
  }

  return data || [];
}

/* ============================================
   RENDU DES BLOCS
   ============================================ */
function renderSalonBlocks(blocks) {
  const container = document.getElementById('salonBlocks');
  if (!container) return;

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

  // Filtrer selon le tier du client
  const visibleBlocks = blocks.filter(b => {
    if (b.min_tier === 'guest') return true;
    if (b.min_tier === 'client' && (salonState.tier === 'client' || salonState.tier === 'vip')) return true;
    if (b.min_tier === 'vip' && salonState.tier === 'vip') return true;
    return false;
  });

  container.innerHTML = visibleBlocks.map(block => renderBlock(block)).join('');

  // Ajoute les écouteurs
  document.querySelectorAll('.salon-cta').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const url = e.currentTarget.dataset.url;
      if (url) window.open(url, '_blank');
    });
  });
}

/* ============================================
   RENDU D'UN BLOC SELON SON TYPE
   ============================================ */
function renderBlock(block) {
  const isFR = (window.currentLang || 'fr') === 'fr';
  const title = isFR ? block.title_fr : block.title_en;
  const content = isFR ? block.content_fr : block.content_en;
  const cta = isFR ? block.cta_fr : block.cta_en;

  switch (block.type) {
       case 'video':
      // Détecte si l'URL est un embed YouTube/Vimeo valide
      const isEmbeddable = block.media_url &&
        (block.media_url.includes('youtube.com/embed') || block.media_url.includes('player.vimeo.com'));

      if (!isEmbeddable) {
        // Placeholder élégant pour les URLs non-embeddables
        return `
          <section class="salon-block salon-block-video reveal">
            ${title ? `<h3 class="salon-block-title">${escapeHtml(title)}</h3>` : ''}
            ${content ? `<p class="salon-block-text">${escapeHtml(content)}</p>` : ''}
            <div class="salon-video-placeholder">
              <div class="salon-video-placeholder-content">
                <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#B8895A" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 16px;">
                  <circle cx="12" cy="12" r="10"/>
                  <polygon points="10 8 16 12 10 16 10 8"/>
                </svg>
                <p class="salon-video-placeholder-title">
                  ${isFR ? 'Vidéo bientôt disponible' : 'Video coming soon'}
                </p>
                <p class="salon-video-placeholder-sub">
                  ${isFR ? 'Coulisses en préparation' : 'Backstage in preparation'}
                </p>
              </div>
            </div>
          </section>
        `;
      }

      return `
        <section class="salon-block salon-block-video reveal">
          ${title ? `<h3 class="salon-block-title">${escapeHtml(title)}</h3>` : ''}
          ${content ? `<p class="salon-block-text">${escapeHtml(content)}</p>` : ''}
          <div class="salon-video-wrapper">
            <iframe
              src="${block.media_url}"
              title="${escapeHtml(title || 'Vidéo')}"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
              loading="lazy"
            ></iframe>
          </div>
        </section>
      `;

    case 'offer':
      const expires = block.expires_at
        ? new Date(block.expires_at).toLocaleDateString(isFR ? 'fr-FR' : 'en-US', {
            day: 'numeric', month: 'long', year: 'numeric'
          })
        : null;
      return `
        <section class="salon-block salon-block-offer reveal">
          <div class="salon-offer-badge">${isFR ? 'Offre privée' : 'Private offer'}</div>
          ${title ? `<h3 class="salon-block-title">${escapeHtml(title)}</h3>` : ''}
          ${content ? `<p class="salon-block-text">${escapeHtml(content)}</p>` : ''}
          ${expires ? `<p class="salon-offer-expires">${isFR ? 'Valable jusqu\'au' : 'Valid until'} ${expires}</p>` : ''}
          ${cta ? `
            <button class="salon-cta" data-url="${block.cta_url || ''}">
              ${escapeHtml(cta)}
            </button>
          ` : ''}
        </section>
      `;

    case 'article':
      return `
        <section class="salon-block salon-block-article reveal">
          ${block.media_url ? `
            <div class="salon-article-image">
              <img src="${block.media_url}" alt="${escapeHtml(title || '')}" loading="lazy" />
            </div>
          ` : ''}
          <div class="salon-article-body">
            ${title ? `<h3 class="salon-block-title">${escapeHtml(title)}</h3>` : ''}
            ${content ? `<p class="salon-block-text">${escapeHtml(content)}</p>` : ''}
          </div>
        </section>
      `;

    case 'gallery':
      const images = block.images || [];
      return `
        <section class="salon-block salon-block-gallery reveal">
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

    case 'tour3d':
      return `
        <section class="salon-block salon-block-tour reveal">
          ${title ? `<h3 class="salon-block-title">${escapeHtml(title)}</h3>` : ''}
          ${content ? `<p class="salon-block-text">${escapeHtml(content)}</p>` : ''}
          <div class="salon-tour-wrapper">
            <iframe
              src="${block.media_url}"
              title="Visite 3D"
              frameborder="0"
              allow="xr-spatial-tracking; fullscreen"
              allowfullscreen
              loading="lazy"
            ></iframe>
          </div>
        </section>
      `;

    case 'text':
    default:
      return `
        <section class="salon-block salon-block-text reveal">
          ${title ? `<h3 class="salon-block-title">${escapeHtml(title)}</h3>` : ''}
          ${content ? `<p class="salon-block-text">${escapeHtml(content)}</p>` : ''}
          ${cta ? `
            <button class="salon-cta" data-url="${block.cta_url || ''}">
              ${escapeHtml(cta)}
            </button>
          ` : ''}
        </section>
      `;
  }
}

/* ============================================
   HELPERS
   ============================================ */
function escapeHtml(str) {
  if (str == null) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}
