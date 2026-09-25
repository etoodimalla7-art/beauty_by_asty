/* ============================================
   FAQ — Public
   ============================================ */
window.faqData = [];

async function loadFAQ() {
  const { data, error } = await supabaseClient
    .from('faq')
    .select('*')
    .eq('brand', 'beauty')
    .order('sort_order', { ascending: true });
  if (error) { console.error('loadFAQ', error); return; }
  window.faqData = data || [];
  renderFAQ(window.faqData);
}

function renderFAQ(items) {
  const list = document.getElementById('faqList');
  if (!list) return;
  if (items.length === 0) {
    list.innerHTML = `<p class="text-center font-serif italic text-espresso/60 py-8">—</p>`;
    return;
  }
  list.innerHTML = items.map((f, i) => {
    const q = currentLang === 'fr' ? f.question_fr : f.question_en;
    const a = currentLang === 'fr' ? f.answer_fr : f.answer_en;
    return `
      <details class="faq-item group py-6" ${i === 0 ? 'open' : ''}>
        <summary class="flex items-center justify-between cursor-pointer list-none">
          <span class="font-serif text-lg md:text-2xl pr-4 md:pr-6">${escapeHtml(q)}</span>
          <span class="faq-chevron text-gold flex-shrink-0 transition-transform duration-500">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
          </span>
        </summary>
        <div class="faq-answer mt-4 text-espresso/70 font-light leading-relaxed pr-6 md:pr-10">${escapeHtml(a)}</div>
      </details>
    `;
  }).join('');
}
