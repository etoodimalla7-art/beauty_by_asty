/* ============================================
   TRANSLATIONS — i18n
   ============================================ */
const translations = {
  fr: {
    nav: { about: "À propos", services: "Services", gallery: "Galerie", reviews: "Avis", faq: "FAQ", booking: "Réservation", contact: "Contact", cta: "Réserver" },
    gallery: {
     tag: "Galerie",
     title: "Portfolio",
     empty: "La galerie arrive bientôt.",
     all: "Tout",
     seeMore: "Voir plus",
     seeLess: "Voir moins"
   },
     switcher: {
       group: "Beauty by Asty — Groupe",
       beauty: "Beauty",
       deco: "Déco",
       studio: "Studio"
   },
    reviews: {
      tag: "Avis", title: "Ce que disent nos clientes",
      empty: "Soyez la première à laisser un avis.",
      formTitle: "Laissez votre avis",
      formSubtitle: "Votre avis sera publié après validation par l'équipe.",
      name: "Votre nom", rating: "Note", message: "Votre avis",
      submit: "Envoyer mon avis",
      success: "Merci ! Votre avis sera publié après validation."
    },
    faq: { tag: "FAQ", title: "Questions fréquentes" },
    booking: {
      tag: "Réservation", title: "Réserver votre Séance",
      subtitle: "Remplissez le formulaire, nous vous confirmerons sur WhatsApp.",
      name: "Nom complet", phone: "Téléphone", service: "Prestation",
      select: "Sélectionnez…", location: "Lieu",
      date: "Date souhaitée", time: "Heure souhaitée", message: "Message",
      submit: "Réserver via WhatsApp",
      success: "Votre demande a été préparée. WhatsApp va s'ouvrir…",
      required: "Merci de remplir tous les champs requis."
    },
    footer: { nav: "Navigation", services: "Services", contact: "Contact", followUs: "Suivez-nous" },
    contact: { address: "Adresse", phone: "Téléphone", hours: "Horaires", email: "Email" }
  },
  en: {
    nav: { about: "About", services: "Services", gallery: "Gallery", reviews: "Reviews", faq: "FAQ", booking: "Booking", contact: "Contact", cta: "Book" },
   gallery: {
     tag: "Gallery",
     title: "Portfolio",
     empty: "The gallery is coming soon.",
     all: "All",
     seeMore: "See more",
     seeLess: "See less"
   },  
     switcher: {
      group: "Beauty by Asty — Group",
      beauty: "Beauty",
      deco: "Déco",
      studio: "Studio"
   },
      reviews: {
      tag: "Reviews", title: "What our clients say",
      empty: "Be the first to leave a review.",
      formTitle: "Leave your review",
      formSubtitle: "Your review will be published after validation by the team.",
      name: "Your name", rating: "Rating", message: "Your review",
      submit: "Send my review",
      success: "Thank you! Your review will be published after validation."
    },
    faq: { tag: "FAQ", title: "Frequently asked questions" },
    booking: {
      tag: "Booking", title: "Book Your Session",
      subtitle: "Fill out the form and we'll confirm on WhatsApp.",
      name: "Full Name", phone: "Phone", service: "Service",
      select: "Select…", location: "Location",
      date: "Preferred Date", time: "Preferred Time", message: "Message",
      submit: "Book via WhatsApp",
      success: "Your request is ready. WhatsApp will open…",
      required: "Please fill in all required fields."
    },
    footer: { nav: "Navigation", services: "Services", contact: "Contact", followUs: "Follow us" },
    contact: { address: "Address", phone: "Phone", hours: "Hours", email: "Email" }
  }
};

let currentLang = localStorage.getItem('asty-lang') || 'fr';

function t(path) {
  return path.split('.').reduce((o, k) => o && o[k], translations[currentLang]);
}

function applyStaticTranslations() {
  document.documentElement.setAttribute('lang', currentLang);
  // On cible TOUT le document, y compris les éléments injectés
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = t(el.getAttribute('data-i18n'));
    if (v) el.textContent = v;
  });
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === currentLang);
  });
}

function switchLanguage(lang) {
  if (lang === currentLang) return;
  document.body.classList.add('lang-fade');
  setTimeout(() => {
    currentLang = lang;
    localStorage.setItem('asty-lang', lang);
    if (typeof renderAllContent === 'function') renderAllContent();
    if (typeof renderGallery === 'function') renderGallery();
    if (typeof renderFAQ === 'function' && window.faqData) renderFAQ(window.faqData);
    if (typeof renderReviews === 'function') renderReviews();
    applyStaticTranslations();
    document.body.classList.remove('lang-fade');
  }, 200);
}
