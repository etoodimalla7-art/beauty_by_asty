<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="noindex, nofollow, noarchive" />
  <meta name="referrer" content="no-referrer" />
  <title>Espace Privé — Beauty by Asty</title>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: { extend: { colors: {
        alabaster:'#FAF7F2', espresso:'#1C1410', gold:'#B8895A',
        terracotta:'#8B4A3B', sand:'#E8DDD0'
      }, fontFamily: {
        serif:['"Cormorant Garamond"','serif'], sans:['Jost','sans-serif']
      }}}
    }
  </script>
  <link rel="stylesheet" href="css/styles.css" />
  <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
  <script>
    if (window.top !== window.self) { window.top.location = window.self.location; }
  </script>
</head>
<body class="bg-alabaster text-espresso font-sans">

  <!-- ============ LOGIN ============ -->
  <div id="loginScreen" class="min-h-screen flex items-center justify-center px-5 py-12">
    <div class="w-full max-w-md">
      <h1 class="font-serif text-3xl md:text-4xl text-center mb-2">Beauty by Asty</h1>
      <p class="text-center text-xs uppercase tracking-[0.3em] text-gold mb-10 md:mb-12">Espace Privé</p>

      <form id="loginForm" class="space-y-6">
        <div class="field">
          <label for="login-email">Email</label>
          <input id="login-email" type="email" required autocomplete="email" />
        </div>
        <div class="field">
          <label for="login-pass">Mot de passe</label>
          <input id="login-pass" type="password" required autocomplete="current-password" />
        </div>
        <button type="submit" class="btn-whatsapp w-full justify-center" id="loginBtn">
          <span id="loginBtnText">Se connecter</span>
        </button>
        <p id="loginError" class="hidden text-center text-terracotta text-sm"></p>
      </form>

      <p class="text-center text-xs text-espresso/40 mt-10 leading-relaxed">
        Accès réservé à l'administrateur.
      </p>
    </div>
  </div>

  <!-- ============ ADMIN PANEL ============ -->
  <div id="adminPanel" class="hidden min-h-screen">
    <header class="border-b border-sand bg-alabaster sticky top-0 z-30">
      <div class="max-w-[1500px] mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 class="font-serif text-lg md:text-2xl">Beauty by Asty</h1>
          <p class="text-[0.6rem] uppercase tracking-[0.3em] text-gold">Espace Privé</p>
        </div>
        <div class="flex items-center gap-2 md:gap-3">
          <a href="index.html" target="_blank" class="text-xs uppercase tracking-widest hover:text-gold transition hidden sm:inline">Voir le site ↗</a>
          <button id="settingsBtn" class="border border-espresso px-3 md:px-4 py-2 text-xs uppercase tracking-widest hover:bg-espresso hover:text-alabaster transition">
            ⚙ Compte
          </button>
          <button id="logoutBtn" class="border border-espresso px-3 md:px-4 py-2 text-xs uppercase tracking-widest hover:bg-espresso hover:text-alabaster transition">
            Déconnexion
          </button>
        </div>
      </div>

      <!-- Brand selector -->
      <nav class="max-w-[1500px] mx-auto px-4 md:px-6 pt-2 flex gap-1 border-t border-sand overflow-x-auto">
        <button class="brand-tab active whitespace-nowrap" data-brand-select="group">Groupe</button>
        <button class="brand-tab whitespace-nowrap" data-brand-select="beauty">Beauty</button>
        <button class="brand-tab whitespace-nowrap" data-brand-select="deco">Déco</button>
        <button class="brand-tab whitespace-nowrap" data-brand-select="studio">Studio</button>
      </nav>

      <!-- Section tabs -->
      <nav class="max-w-[1500px] mx-auto px-4 md:px-6 flex gap-1 border-t border-sand overflow-x-auto">
        <button class="admin-tab active whitespace-nowrap" data-tab="content">Contenu</button>
        <button class="admin-tab whitespace-nowrap" data-tab="gallery">Galerie</button>
        <button class="admin-tab whitespace-nowrap" data-tab="reviews">Avis</button>
        <button class="admin-tab whitespace-nowrap" data-tab="bookings">Réservations</button>
        <button class="admin-tab whitespace-nowrap" data-tab="faq">FAQ</button>
      </nav>
    </header>

    <main class="max-w-[1500px] mx-auto px-4 md:px-6 py-6 md:py-10">

      <!-- CONTENT TAB -->
      <section id="tab-content" class="tab-panel">
        <div class="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 class="font-serif text-2xl md:text-3xl">Contenu</h2>
          <button id="addContentBtn" class="border border-espresso px-4 py-2 text-xs uppercase tracking-widest hover:bg-espresso hover:text-alabaster transition">
            + Ajouter un bloc de contenu
          </button>
        </div>
        <div id="contentLoading" class="text-center py-12 text-espresso/60 font-serif italic">Chargement…</div>
        <div id="contentForms" class="hidden">
          <div id="contentFormsList" class="space-y-6"></div>
        </div>
      </section>

      <!-- GALLERY TAB -->
      <section id="tab-gallery" class="tab-panel hidden">
        <h2 class="font-serif text-2xl md:text-3xl mb-6 md:mb-8">Galerie</h2>
        <div class="border border-sand p-5 md:p-6 mb-10 max-w-2xl">
          <p class="text-xs uppercase tracking-widest text-espresso/50 mb-4">Ajouter un média</p>
          <div class="space-y-4">
            <div class="field">
              <label>Type</label>
              <select id="mediaType">
                <option value="image">Image</option>
                <option value="video">Vidéo</option>
              </select>
            </div>
            <div class="field">
              <label>Fichier</label>
              <input type="file" id="mediaFile" accept="image/*,video/*" />
            </div>
            <div class="field"><label>Légende</label><input id="mediaCaption" /></div>
            <div class="field"><label>Tag</label><input id="mediaTag" /></div>
            <button id="mediaAddBtn" class="btn-whatsapp">Uploader</button>
            <p id="mediaProgress" class="text-sm text-gold"></p>
          </div>
        </div>
        <div id="mediaAdminList" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"></div>
      </section>

      <!-- REVIEWS TAB -->
      <section id="tab-reviews" class="tab-panel hidden">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
          <h2 class="font-serif text-2xl md:text-3xl">Avis</h2>
          <div class="flex gap-2 flex-wrap">
            <button class="filter-review-btn active text-xs uppercase tracking-widest border border-sand px-3 py-2" data-status="pending">En attente</button>
            <button class="filter-review-btn text-xs uppercase tracking-widest border border-sand px-3 py-2" data-status="approved">Approuvés</button>
            <button class="filter-review-btn text-xs uppercase tracking-widest border border-sand px-3 py-2" data-status="rejected">Refusés</button>
            <button class="filter-review-btn text-xs uppercase tracking-widest border border-sand px-3 py-2" data-status="all">Tous</button>
          </div>
        </div>
        <div class="grid md:grid-cols-2 gap-6 mb-10">
          <div class="border border-sand p-5 md:p-6">
            <p class="text-xs uppercase tracking-widest text-espresso/50 mb-4">Ajouter un avis</p>
            <form id="addReviewForm" class="space-y-4">
              <div class="field"><label>Nom</label><input id="addReviewName" required /></div>
              <div class="field"><label>Note (1-5)</label><input id="addReviewRating" type="number" min="1" max="5" value="5" required /></div>
              <div class="field"><label>Message</label><textarea id="addReviewMessage" rows="3" required></textarea></div>
              <button type="submit" class="btn-whatsapp">Ajouter</button>
            </form>
          </div>
          <div class="border border-sand p-5 md:p-6 flex items-center justify-center">
            <div class="text-center">
              <p class="font-serif text-5xl text-gold mb-2" id="adminAvgRating">—</p>
              <p class="text-xs uppercase tracking-widest text-espresso/50">Note moyenne</p>
              <p class="mt-4 text-sm" id="adminReviewCount">—</p>
            </div>
          </div>
        </div>
        <div id="reviewsAdminList" class="space-y-4"></div>
      </section>

      <!-- BOOKINGS TAB -->
      <section id="tab-bookings" class="tab-panel hidden">
        <h2 class="font-serif text-2xl md:text-3xl mb-6 md:mb-8">Réservations</h2>
        <div id="bookingsList" class="space-y-4"></div>
      </section>

      <!-- FAQ TAB -->
      <section id="tab-faq" class="tab-panel hidden">
        <h2 class="font-serif text-2xl md:text-3xl mb-6 md:mb-8">FAQ</h2>
        <div class="border border-sand p-5 md:p-6 mb-10">
          <p class="text-xs uppercase tracking-widest text-espresso/50 mb-4">Ajouter une question</p>
          <form id="addFaqForm" class="grid md:grid-cols-2 gap-4">
            <div class="field"><label>Question (FR)</label><input id="faqQfr" required /></div>
            <div class="field"><label>Question (EN)</label><input id="faqQen" required /></div>
            <div class="field md:col-span-2"><label>Réponse (FR)</label><textarea id="faqAfr" rows="2" required></textarea></div>
            <div class="field md:col-span-2"><label>Réponse (EN)</label><textarea id="faqAen" rows="2" required></textarea></div>
            <div class="md:col-span-2"><button type="submit" class="btn-whatsapp">Ajouter</button></div>
          </form>
        </div>
        <div id="faqAdminList" class="space-y-4"></div>
      </section>
    </main>
  </div>

  <!-- ============ ACCOUNT MODAL ============ -->
  <div id="accountModal" class="fixed inset-0 z-[100] bg-espresso/70 hidden items-center justify-center px-5 py-10">
    <div class="bg-alabaster max-w-md w-full p-6 md:p-8 relative">
      <button id="accountClose" class="absolute top-3 right-3 text-espresso/60 hover:text-espresso" aria-label="Close">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
      </button>
      <h2 class="font-serif text-2xl md:text-3xl mb-2">Mon compte</h2>
      <p class="text-xs uppercase tracking-widest text-gold mb-8">Administrateur</p>

      <form id="passwordForm" class="space-y-5">
        <div class="field">
          <label for="currentEmail">Email</label>
          <input id="currentEmail" type="email" disabled />
        </div>
        <div class="field">
          <label for="newPassword">Nouveau mot de passe</label>
          <input id="newPassword" type="password" minlength="6" autocomplete="new-password" />
        </div>
        <div class="field">
          <label for="confirmPassword">Confirmer le mot de passe</label>
          <input id="confirmPassword" type="password" minlength="6" autocomplete="new-password" />
        </div>
        <button type="submit" class="btn-whatsapp w-full justify-center">Changer le mot de passe</button>
        <p id="passwordStatus" class="hidden text-center text-sm"></p>
      </form>

      <div class="border-t border-sand mt-8 pt-6">
        <p class="text-xs uppercase tracking-widest text-espresso/50 mb-3">Sécurité</p>
        <button id="signOutAllBtn" class="text-xs uppercase tracking-widest text-terracotta hover:underline">
          Déconnecter toutes les sessions
        </button>
      </div>
    </div>
  </div>

  <script src="js/supabase-config.js"></script>
  <script src="js/admin.js"></script>
</body>
</html>
