# Beauty by Asty — Site + Admin

Site vitrine **bilingue FR/EN** entièrement administrable via un panneau privé Supabase.

---

## 🏗️ Architecture

| Fichier | Rôle |
|---------|------|
| `index.html` | Site public |
| `atelier-asty-2026.html` | Panneau admin (nom secret, non indexé) |
| `js/supabase-config.js` | Clés Supabase |
| `js/i18n.js` | Traductions FR/EN |
| `js/content.js` | Contenu dynamique (hero, about, services, contact, footer) |
| `js/gallery.js` | Galerie + lightbox |
| `js/reviews.js` | Avis publics + formulaire |
| `js/faq.js` | FAQ bilingue |
| `js/booking.js` | Réservations WhatsApp |
| `js/main.js` | Orchestration publique |
| `js/admin.js` | Toute la logique admin |

---

## 🚀 Déploiement Render

1. Pousse le dossier sur GitHub
2. Render → **New Static Site** → connecte le repo
3. **Build Command** : *(vide)*
4. **Publish Directory** : `.`
5. Deploy 🎉

---

## 🔑 Supabase — Configuration

### 1. Créer le projet

Aller sur https://supabase.com → New Project.

### 2. Exécuter le SQL

Aller dans **SQL Editor** et exécuter le script complet (fourni à part).

### 3. Récupérer les clés

**Settings → API Keys → Legacy anon, service_role** :
- Copier le **Project URL**
- Copier la clé **anon public** (commence par `eyJ...`)

Coller dans `js/supabase-config.js`.

### 4. Créer le compte admin

**Authentication → Users → Add user → Create new user** :
- Email : votre email admin
- Mot de passe : fort
- ✅ Cocher **Auto Confirm User**

C'est ce compte qui servira pour se connecter à `atelier-asty-2026.html`.

---

## 📝 Administration

Accès : **`/atelier-asty-2026.html`** (à mettre en favori, jamais de lien public).

### Onglets disponibles

- **Contenu** : modifier le hero, à propos, services, contact, réseaux, footer (FR + EN)
- **Réservations** : historique de toutes les demandes + bouton WhatsApp
- **Avis** : modération (approuver / refuser / modifier / supprimer)
- **Galerie** : upload images/vidéos, modifier légende/tag, supprimer
- **FAQ** : ajouter / modifier / supprimer les questions bilingues

---

## 🔒 Sécurité

- ✅ RLS activée partout
- ✅ Public peut insérer un avis **en `pending` uniquement** → invisible
- ✅ Public peut lire uniquement les avis **approuvés**
- ✅ Public ne voit **jamais** les réservations
- ✅ Admin authentifié peut tout faire
- ✅ Page admin en `noindex, nofollow` + anti-iframe
- ✅ Nom de fichier admin non devinable

---

## 🖼️ Ajouter du contenu

### Galerie
1. Admin → **Galerie**
2. Type : Image ou Vidéo
3. Choisir fichier + légende + tag
4. Uploader

### Avis client
1. Le client remplit le formulaire sur le site
2. L'avis arrive dans l'admin (statut "En attente")
3. L'admin clique **Approuver** → visible sur le site

### Réservation
1. Le client remplit le formulaire
2. → Sauvegardé dans l'admin + WhatsApp envoyé à l'admin
3. L'admin voit tout dans **Réservations**

---

## 📱 WhatsApp

Numéro modifiable depuis **Admin → Contenu → Contact → WhatsApp**.

Format : chiffres uniquement, ex : `2250798386599`.

---

## 🎨 Personnalisation

- **Couleurs** : dans `tailwind.config` (index.html + atelier) et `css/styles.css`
- **Polices** : Google Fonts (Cormorant Garamond + Jost)
- **Traductions statiques** : `js/i18n.js`
- **Contenu dynamique** : via l'admin

---

© 2026 Beauty by Asty
✅ Checklist finale
Étape	Fait ?
Script SQL exécuté dans Supabase (tables + RLS + bucket + seed)	☐
Utilisateur admin créé dans Authentication → Users (Auto Confirm)	☐
SUPABASE_URL + SUPABASE_ANON_KEY collés dans js/supabase-config.js	☐
Tous les fichiers créés aux bons endroits	☐
Test : index.html → contenu dynamique visible	☐
Test : atelier-asty-2026.html → login OK	☐
Test : modifier le hero depuis l'admin → visible sur le site	☐
Test : uploader une image → visible dans la galerie	☐
Test : poster un avis client → apparaît dans l'admin (pending) → approuver → visible sur le site	☐
Test : formulaire de réservation → sauvegardé admin + WhatsApp ouvert	☐
Test : responsive mobile (F12 → iPhone)	☐
🎯 Comportement final
Action	Où va le résultat
Avis client	✅ Uniquement dans l'admin (pending) → publication après validation
Réservation client	✅ Dans l'admin + ✅ WhatsApp admin
Modification de contenu (hero, about, services…)	✅ Depuis l'admin → visible instantanément sur le site
Upload média	✅ Supabase Storage → galerie publique
FAQ	✅ Gestion bilingue FR/EN depuis l'admin
🆘 Si tu bloques
Contenu qui ne s'affiche pas → vérifie que le SQL a bien été exécuté (table content avec le seed)

Login échoue → vérifie que le user est "Auto Confirmed" dans Supabase → Authentication → Users

Upload échoue → vérifie que le bucket media existe dans Storage

Erreur CORS → Supabase → API → CORS → ajoute * temporairement
