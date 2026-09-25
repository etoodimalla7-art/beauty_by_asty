/* ============================================
   REVIEWS — Public + Submission
   ⚠️ AUCUN WhatsApp. Les avis vont uniquement dans l'admin.
   ============================================ */
window.reviewsData = [];
let selectedRating = 5;

async function loadReviews() {
  const { data, error } = await supabaseClient
    .from('reviews')
    .select('*')
    .eq('brand', 'beauty')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
  if (error) { console.error('loadReviews', error); return; }
  window.reviewsData = data || [];
  renderReviews();
  updateRatingSummary();
}

function renderReviews() {
  const list = document.getElementById('reviewsList');
  const empty = document.getElementById('reviewsEmpty');
  if (!list) return;
  if (window.reviewsData.length === 0) {
    list.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  list.innerHTML = window.reviewsData.map(r => `
    <article class="review-card reveal">
      <div class="flex gap-1 mb-4">${renderStars(r.rating)}</div>
      <p class="font-serif italic text-lg leading-relaxed mb-6">"${escapeHtml(r.message)}"</p>
      <p class="text-xs uppercase tracking-widest text-espresso/60">— ${escapeHtml(r.name)}</p>
    </article>
  `).join('');

  document.querySelectorAll('.review-card.reveal').forEach(el => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
    }, { threshold: 0.15 });
    obs.observe(el);
  });
}

function renderStars(rating) {
  let h = '';
  for (let i = 1; i <= 5; i++) {
    const filled = i <= rating;
    h += `<svg viewBox="0 0 24 24" width="16" height="16" fill="${filled ? '#B8895A' : 'none'}" stroke="#B8895A" stroke-width="1.25" stroke-linejoin="round">
      <path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 17.7 6.1 20.8l1.2-6.6L2.5 9.5l6.6-.9L12 2.5z"/>
    </svg>`;
  }
  return h;
}

function updateRatingSummary() {
  if (window.reviewsData.length === 0) return;
  const avg = (window.reviewsData.reduce((s, r) => s + r.rating, 0) / window.reviewsData.length).toFixed(1);
  ['avgRating', 'avgRating2'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = avg; });
  ['reviewCount', 'reviewCount2'].forEach(id => { const el = document.getElementById(id); if (el) el.textContent = window.reviewsData.length; });
  const starsBox = document.getElementById('avgStars');
  if (starsBox) starsBox.innerHTML = renderStars(Math.round(avg));
}

function initStarPicker() {
  document.querySelectorAll('.star-pick').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedRating = parseInt(btn.dataset.star, 10);
      updateStarPicker();
    });
  });
  updateStarPicker();
}

function updateStarPicker() {
  document.querySelectorAll('.star-pick').forEach(btn => {
    const val = parseInt(btn.dataset.star, 10);
    const svg = btn.querySelector('svg path');
    if (val <= selectedRating) svg.setAttribute('fill', '#B8895A');
    else svg.setAttribute('fill', 'none');
  });
}

function initReviewForm() {
  const form = document.getElementById('reviewForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('rv-name').value.trim();
    const message = document.getElementById('rv-message').value.trim();
    if (!name || !message) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    // ✅ UNIQUEMENT dans Supabase → apparaît dans l'admin
 const { error } = await supabaseClient.from('reviews').insert([{
   brand: 'beauty',
   name, rating: selectedRating, message, status: 'pending'
 }]);

    submitBtn.disabled = false;
    if (error) { console.error(error); alert('Erreur lors de l\'envoi.'); return; }

    document.getElementById('reviewSuccess').classList.remove('hidden');
    form.reset();
    selectedRating = 5;
    updateStarPicker();
    setTimeout(() => document.getElementById('reviewSuccess').classList.add('hidden'), 8000);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str ?? '');
  return div.innerHTML;
}
