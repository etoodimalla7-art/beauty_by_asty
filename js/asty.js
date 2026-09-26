/* ============================================
   ASTY — Assistante virtuelle Beauty by Asty
   ============================================ */

const ASTY_CONFIG = {
  name: 'Asty',
  whatsapp: SITE_CONFIG.whatsappNumber,
  greetings: {
    fr: "Bonjour, je suis Asty, votre assistante Beauty by Asty.",
    en: "Hello, I'm Asty, your Beauty by Asty assistant."
  }
};

/* État global */
let astyState = {
  language: null,
  clientName: null,
  clientEmail: null,
  clientPhone: null,
  conversationId: null,
  messages: [],
  knowledge: { services: {}, faqs: [], contacts: {} },
  isOpen: false
};

/* ============================================
   INITIALISATION
   ============================================ */
async function initAsty() {
  await loadAstyKnowledge();
  injectAstyUI();
  bindAstyEvents();
}

/* ============================================
   CHARGEMENT DES CONNAISSANCES
   ============================================ */
async function loadAstyKnowledge() {
  try {
    // Services (Beauty, Déco, Studio)
    const { data: servicesData } = await supabaseClient
      .from('content')
      .select('*')
      .eq('key', 'services');

    if (servicesData) {
      servicesData.forEach(row => {
        astyState.knowledge.services[row.brand] = row.value;
      });
    }

    // Contacts
    const { data: contactData } = await supabaseClient
      .from('content')
      .select('*')
      .eq('key', 'contact');

    if (contactData) {
      contactData.forEach(row => {
        astyState.knowledge.contacts[row.brand] = row.value;
      });
    }

    // FAQ
    const { data: faqData } = await supabaseClient
      .from('faq')
      .select('*')
      .order('sort_order');

    if (faqData) {
      astyState.knowledge.faqs = faqData;
    }
  } catch (e) {
    console.error('Asty knowledge load error:', e);
  }
}

/* ============================================
   UI — Injection du bouton + panel
   ============================================ */
function injectAstyUI() {
  if (document.querySelector('#astyBubble')) return;

  // Bouton flottant
  const bubble = document.createElement('button');
  bubble.id = 'astyBubble';
  bubble.setAttribute('aria-label', 'Ouvrir la discussion avec Asty');
  bubble.innerHTML = `
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
    </svg>
    <span class="asty-bubble-label">Asty</span>
  `;
  document.body.appendChild(bubble);

  // Panel de chat
  const panel = document.createElement('div');
  panel.id = 'astyPanel';
  panel.className = 'asty-panel';
  panel.innerHTML = `
    <div class="asty-header">
      <div class="asty-header-info">
        <div class="asty-avatar">A</div>
        <div>
          <p class="asty-name">Asty</p>
          <p class="asty-status">Assistante Beauty by Asty</p>
        </div>
      </div>
      <button id="astyClose" class="asty-close" aria-label="Fermer">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" aria-hidden="true">
          <line x1="6" y1="6" x2="18" y2="18"/>
          <line x1="18" y1="6" x2="6" y2="18"/>
        </svg>
      </button>
    </div>
    <div id="astyMessages" class="asty-messages"></div>
  `;
  document.body.appendChild(panel);
}

/* ============================================
   ÉVÉNEMENTS
   ============================================ */
function bindAstyEvents() {
  const bubble = document.getElementById('astyBubble');
  const panel = document.getElementById('astyPanel');
  const closeBtn = document.getElementById('astyClose');

  bubble.addEventListener('click', () => {
    astyState.isOpen = true;
    panel.classList.add('open');
    bubble.classList.add('hidden');

    // Premier démarrage → demander la langue
    if (!astyState.language) {
      askLanguage();
    }
  });

  closeBtn.addEventListener('click', () => {
    astyState.isOpen = false;
    panel.classList.remove('open');
    bubble.classList.remove('hidden');
  });
}

/* ============================================
   MESSAGES
   ============================================ */
function addAstyMessage(text, sender = 'asty', options = null) {
  const container = document.getElementById('astyMessages');
  if (!container) return;

  const msg = document.createElement('div');
  msg.className = `asty-msg asty-msg-${sender}`;

  const bubble = document.createElement('div');
  bubble.className = 'asty-msg-bubble';
  bubble.textContent = text;
  msg.appendChild(bubble);

  // Options (boutons cliquables)
  if (options && options.length > 0) {
    const opts = document.createElement('div');
    opts.className = 'asty-options';
    options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'asty-option-btn';
      btn.textContent = opt.label;
      btn.addEventListener('click', () => opt.action());
      opts.appendChild(btn);
    });
    msg.appendChild(opts);
  }

  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;

  // Sauvegarde
  astyState.messages.push({ sender, text, time: Date.now() });
}

/* ============================================
   ÉTAPE 1 — Choix de la langue
   ============================================ */
function askLanguage() {
  addAstyMessage(
    "Bonjour 👋 Je suis Asty, votre assistante Beauty by Asty.\n\nSouhaitez-vous continuer en français ou en English?",
    'asty',
    [
      { label: '🇫🇷 Français', action: () => setLanguage('fr') },
      { label: '🇬🇧 English', action: () => setLanguage('en') }
    ]
  );
}

function setLanguage(lang) {
  astyState.language = lang;
  const texts = {
    fr: { welcome: "Parfait. Comment puis-je vous aider ? Pour commencer, pourriez-vous me donner votre prénom ?", placeholder: "Votre prénom" },
    en: { welcome: "Perfect. How can I help you? First, may I have your first name?", placeholder: "Your first name" }
  };

  addAstyMessage(texts[lang].welcome, 'asty');
  showInput(texts[lang].placeholder, 'name');
}

/* ============================================
   ÉTAPE 2-3 — Nom, Email, Téléphone
   ============================================ */
function showInput(placeholder, type) {
  const container = document.getElementById('astyMessages');
  const wrapper = document.createElement('div');
  wrapper.className = 'asty-input-wrapper';
  wrapper.innerHTML = `
    <input
      type="${type === 'email' ? 'email' : type === 'phone' ? 'tel' : 'text'}"
      class="asty-input"
      placeholder="${placeholder}"
      autocomplete="${type === 'email' ? 'email' : type === 'phone' ? 'tel' : 'given-name'}"
    />
    <button class="asty-send" aria-label="Envoyer">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="22" y1="2" x2="11" y2="13"/>
        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
    </button>
  `;
  container.appendChild(wrapper);

  const input = wrapper.querySelector('.asty-input');
  const sendBtn = wrapper.querySelector('.asty-send');
  input.focus();

  const submit = () => {
    const val = input.value.trim();
    if (!val) return;
    wrapper.remove();
    handleInput(val, type);
  };

  sendBtn.addEventListener('click', submit);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') submit();
  });
}

async function handleInput(value, type) {
  const isFR = astyState.language === 'fr';

  if (type === 'name') {
    astyState.clientName = value;
    addAstyMessage(value, 'user');
    setTimeout(() => {
      addAstyMessage(
        isFR ? "Merci ! Quelle est votre adresse email ?" : "Thanks! What is your email address?",
        'asty'
      );
      showInput(isFR ? 'Votre email' : 'Your email', 'email');
    }, 400);
  } else if (type === 'email') {
    astyState.clientEmail = value;
    addAstyMessage(value, 'user');
    setTimeout(() => {
      addAstyMessage(
        isFR ? "Parfait. Et votre numéro de téléphone ?" : "Perfect. And your phone number?",
        'asty'
      );
      showInput(isFR ? 'Votre téléphone' : 'Your phone', 'phone');
    }, 400);
  } else if (type === 'phone') {
    astyState.clientPhone = value;
    addAstyMessage(value, 'user');

    // Crée la conversation dans Supabase
    await createConversation();

    // Affiche les sujets
    setTimeout(() => showMainTopics(), 400);
  }
}

async function createConversation() {
  try {
    const { data, error } = await supabaseClient
      .from('asty_conversations')
      .insert([{
        client_name: astyState.clientName,
        client_email: astyState.clientEmail,
        client_phone: astyState.clientPhone,
        language: astyState.language,
        messages: astyState.messages
      }])
      .select()
      .single();

    if (data && !error) {
      astyState.conversationId = data.id;
    }
  } catch (e) {
    console.error('Asty conversation create error:', e);
  }
}

/* ============================================
   ÉTAPE 4 — Sujets principaux
   ============================================ */
function showMainTopics() {
  const isFR = astyState.language === 'fr';

  addAstyMessage(
    isFR ? "En quoi puis-je vous aider aujourd'hui ?" : "How can I help you today?",
    'asty',
    [
      { label: isFR ? '💄 Beauté' : '💄 Beauty', action: () => showBrandTopics('beauty') },
      { label: isFR ? '🏛️ Déco' : '🏛️ Déco', action: () => showBrandTopics('deco') },
      { label: isFR ? '🎬 Studio' : '🎬 Studio', action: () => showBrandTopics('studio') },
      { label: isFR ? '📅 Réserver' : '📅 Book', action: () => explainBooking() },
      { label: isFR ? '📞 Contact' : '📞 Contact', action: () => showContact() },
      { label: isFR ? '❓ Autre question' : '❓ Other question', action: () => handleUnknown() }
    ]
  );
}

function showBrandTopics(brand) {
  const isFR = astyState.language === 'fr';
  const services = astyState.knowledge.services[brand];

  if (!services || !services.items) {
    handleUnknown();
    return;
  }

  const topics = services.items.slice(0, 5).map(item => ({
    label: `• ${isFR ? item.title_fr : item.title_en}`,
    action: () => explainService(item, brand)
  }));

  topics.push({
    label: isFR ? '← Retour' : '← Back',
    action: () => showMainTopics()
  });

  addAstyMessage(
    isFR
      ? `Voici nos services ${getBrandLabel(brand, 'fr')} :`
      : `Here are our ${getBrandLabel(brand, 'en')} services:`,
    'asty',
    topics
  );
}

function explainService(item, brand) {
  const isFR = astyState.language === 'fr';
  const desc = isFR ? item.desc_fr : item.desc_en;
  const title = isFR ? item.title_fr : item.title_en;

  addAstyMessage(
    `${title}\n\n${desc}\n\n${
      isFR
        ? "Souhaitez-vous réserver cette prestation ?"
        : "Would you like to book this service?"
    }`,
    'asty',
    [
      { label: isFR ? '📅 Oui, réserver' : '📅 Yes, book', action: () => explainBooking() },
      { label: isFR ? '← Retour aux services' : '← Back to services', action: () => showBrandTopics(brand) },
      { label: isFR ? '💬 Autre question' : '💬 Another question', action: () => handleUnknown() }
    ]
  );
}

function explainBooking() {
  const isFR = astyState.language === 'fr';

  addAstyMessage(
    isFR
      ? "Pour réserver, vous pouvez :\n\n1. Remplir le formulaire de réservation directement sur notre site\n2. Nous contacter via WhatsApp — nous vous répondrons immédiatement\n\nSouhaitez-vous continuer sur WhatsApp ?"
      : "To book, you can:\n\n1. Fill out the booking form directly on our website\n2. Contact us on WhatsApp — we'll respond immediately\n\nWould you like to continue on WhatsApp?",
    'asty',
    [
      { label: isFR ? '💬 Contacter sur WhatsApp' : '💬 Contact on WhatsApp', action: () => openWhatsApp() },
      { label: isFR ? '← Retour' : '← Back', action: () => showMainTopics() }
    ]
  );
}

function showContact() {
  const isFR = astyState.language === 'fr';
  const contact = astyState.knowledge.contacts['beauty'] || astyState.knowledge.contacts['group'];

  if (!contact) {
    handleUnknown();
    return;
  }

  addAstyMessage(
    isFR
      ? `Voici nos coordonnées :\n\n📍 ${contact.address}\n📞 ${contact.phone}\n✉️ ${contact.email}`
      : `Here's how to reach us:\n\n📍 ${contact.address}\n📞 ${contact.phone}\n✉️ ${contact.email}`,
    'asty',
    [
      { label: isFR ? '💬 Contacter sur WhatsApp' : '💬 Contact on WhatsApp', action: () => openWhatsApp() },
      { label: isFR ? '← Retour' : '← Back', action: () => showMainTopics() }
    ]
  );
}

/* ============================================
   HORS PÉRIMÈTRE — Redirection WhatsApp
   ============================================ */
function handleUnknown() {
  const isFR = astyState.language === 'fr';

  addAstyMessage(
    isFR
      ? "Je ne suis pas apte à répondre à votre demande. Je vous recommande de nous contacter directement sur WhatsApp — notre équipe vous répondra avec plaisir."
      : "I'm not able to answer your request. I recommend contacting us directly on WhatsApp — our team will be happy to help.",
    'asty',
    [
      { label: isFR ? '💬 Contacter sur WhatsApp' : '💬 Contact on WhatsApp', action: () => openWhatsApp() },
      { label: isFR ? '← Retour au menu' : '← Back to menu', action: () => showMainTopics() }
    ]
  );
}

function openWhatsApp() {
  const isFR = astyState.language === 'fr';
  const message = isFR
    ? `Bonjour, je suis ${astyState.clientName || 'un visiteur'} et j'ai une question concernant Beauty by Asty.`
    : `Hello, I'm ${astyState.clientName || 'a visitor'} and I have a question about Beauty by Asty.`;

  window.open(`https://wa.me/${ASTY_CONFIG.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
}

/* ============================================
   HELPERS
   ============================================ */
function getBrandLabel(brand, lang) {
  const labels = {
    beauty: { fr: 'Beauté', en: 'Beauty' },
    deco: { fr: 'Déco', en: 'Déco' },
    studio: { fr: 'Studio', en: 'Studio' },
    group: { fr: 'Groupe', en: 'Group' }
  };
  return labels[brand]?.[lang] || brand;
}

/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Attendre que supabaseClient soit prêt
  if (typeof supabaseClient !== 'undefined') {
    initAsty();
  }
});
