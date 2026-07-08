# pb-stock — Gestion des stocks associatifs

> Contexte pour Claude Code. Ce fichier est la source de vérité architecturale du projet.
> Dernière mise à jour : 7 juillet 2026 — mainteneur : Loïc Leray.

---

## 1. Vue d'ensemble

**pb-stock** est une interface web interne de gestion des stocks (boissons et nourriture) pour l'Association Jorat Parc naturel. Elle permet d'ajouter des produits au stock, de préparer des retraits (« commandes internes ») pour des événements, et de suivre l'historique des mouvements.

L'interface est protégée par un mot de passe partagé unique et accessible via `stock.jorapp.org`.

### Stack technique

| Composant | Techno |
| --- | --- |
| Backend + API | PocketBase v0.39.x (JSVM hooks) |
| Frontend | HTML statique + CSS + JS vanilla (pas de framework) |
| Serveur | DigitalOcean droplet `46.101.242.21` (Ubuntu 24.04, FRA1) |
| Reverse proxy | nginx + certbot (TLS) |
| Port PocketBase | 8094 |
| Chemin serveur | `/opt/pb-stock` |
| Repo | `jorapp-infra` (GitHub, `JPNDev2026`) — dossier `pb-stock/` |

### Instances PocketBase existantes sur le même serveur

| Instance | Port | Service systemd | Sous-domaine |
| --- | --- | --- | --- |
| pocketbase (principale) | 8090 | `pocketbase.service` | jorapp.org |
| pb-mobilier | 8091 | `pocketbase-mobilier.service` | db.jorapp.org |
| pb-budget | 8092 | `pocketbase-budget.service` | api.floozee.ch |
| pb-concours | 8093 | `pb-concours.service` | concours.jorapp.org |
| **pb-stock** | **8094** | **`pb-stock.service`** | **stock.jorapp.org** |

---

## 2. Charte graphique PNJ

Toutes les interfaces du parc utilisent cette charte. Elle est **obligatoire** et ne doit pas être adaptée/interprétée.

```css
:root {
  --teal:      #1F6481;
  --lime:      #D7E337;
  --encre:     #142228;
  --parchemin: #EDE0BC;
  --blanc:     #FFFFFF;

  /* Couleurs fonctionnelles dérivées */
  --success:   #2D8F4E;
  --warning:   #E6A817;
  --danger:    #C0392B;
  --muted:     #6B7280;
  --bg-light:  #F7F8FA;
  --border:    #E2E5E9;

  /* Typographie */
  --font-family: 'DM Sans', sans-serif;
  --font-size-base: 16px;
  --font-size-sm: 14px;
  --font-size-lg: 20px;
  --font-size-xl: 28px;

  /* Espacements */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Arrondis */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;

  /* Ombres */
  --shadow-sm: 0 1px 3px rgba(20, 34, 40, 0.08);
  --shadow-md: 0 4px 12px rgba(20, 34, 40, 0.12);
}
```

**Police** : DM Sans (Google Fonts), toutes graisses (Regular 400, Medium 500, Bold 700).
**Bouton primaire** : fond `--lime`, texte `--encre`.
**En-tête / nav** : fond `--teal`, texte `--blanc`.
**Fond de page** : `--bg-light`.
**Cartes** : fond `--blanc`, bordure `--border`, ombre `--shadow-sm`.

---

## 3. Architecture fichiers

```
pb-stock/
├── pb_hooks/
│   └── stock.pb.js          # Hook JSVM unique (routes API custom)
├── pb_migrations/            # Migrations PocketBase (auto-générées par l'admin)
├── pb_public/
│   ├── assets/
│   │   ├── css/
│   │   │   ├── theme.css     # Variables CSS, reset, typo, layout de base
│   │   │   ├── components.css # Composants réutilisables (boutons, cartes, formulaires, badges, nav, modale)
│   │   │   └── print.css     # Styles d'impression (commande imprimable)
│   │   ├── js/
│   │   │   ├── auth.js       # Gestion MDP partagé (vérif, localStorage, redirect)
│   │   │   ├── api.js        # Wrapper PocketBase SDK (CRUD produits, commandes, etc.)
│   │   │   ├── cart.js       # État du panier (localStorage, ajout/retrait/vidage)
│   │   │   └── ui.js         # Composants UI partagés (rendu nav, badges stock, filtres, modale)
│   │   └── img/
│   │       └── Logo_feuille.png  # Logo PNJ
│   ├── login.html            # Page de saisie du MDP
│   ├── index.html            # Vue d'ensemble des stocks (home)
│   ├── retrait.html          # Sélection de produits (shop-like)
│   ├── panier.html           # Résumé du panier + validation
│   ├── commandes.html        # Liste de toutes les commandes
│   ├── commande_details.html # Détail d'une commande (imprimable)
│   └── produits.html         # Catalogue produits + ajout
└── pb_data/                  # Données SQLite (PAS versionné, géré par backup.sh)
```

### Principe de séparation CSS/JS

**Chaque fichier HTML ne contient QUE la structure** : un `<head>` avec les liens vers les CSS/JS partagés, et un `<body>` avec le markup de la page. Aucun `<style>` inline, aucun `<script>` inline (sauf un éventuel `<script>` d'initialisation minimal en fin de body pour appeler les fonctions de `app.js`).

Les fichiers CSS et JS dans `assets/` sont la source unique pour le style et le comportement. Ceci permet :
- De modifier la charte en un seul endroit (`theme.css`)
- De réutiliser les composants (nav, cartes, badges) sans copier-coller
- De maintenir le code JS (auth, panier) sans toucher au HTML

### Head standard (toutes les pages sauf login)

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Stock PNJ — [Nom de la page]</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/assets/css/theme.css">
  <link rel="stylesheet" href="/assets/css/components.css">
  <link rel="stylesheet" href="/assets/css/print.css" media="print">
</head>
```

```html
<!-- Avant </body> -->
<script src="https://cdn.jsdelivr.net/npm/pocketbase@0.27.0/dist/pocketbase.umd.js"></script>
<script src="/assets/js/auth.js"></script>
<script src="/assets/js/api.js"></script>
<script src="/assets/js/cart.js"></script>
<script src="/assets/js/ui.js"></script>
```

---

## 4. Collections PocketBase

### 4.1 `produits`

| Champ | Type | Requis | Notes |
| --- | --- | --- | --- |
| `nom` | text | oui | Nom du produit |
| `quantite` | number | oui | Stock actuel (min: 0) |
| `prix` | number | non | Prix unitaire en CHF |
| `image` | file | non | Photo du produit (1 seul fichier) |
| `date_limite` | date | non | Date limite de consommation |
| `fournisseur` | text | non | Nom du fournisseur |
| `categorie` | relation | oui | → `categories` (single) |
| `actif` | bool | oui | Défaut: true. Masque le produit sans le supprimer |

### 4.2 `categories`

| Champ | Type | Requis | Notes |
| --- | --- | --- | --- |
| `nom` | text | oui | Ex: "Bières", "Softs", "Snacks", "Vins", "Spiritueux" |
| `icone` | text | non | Emoji pour affichage rapide (ex: 🍺, 🥤, 🍿) |
| `couleur` | text | non | Hex pour badge coloré (ex: #E6A817) |
| `ordre` | number | non | Ordre d'affichage dans les filtres |

### 4.3 `collaborateurs`

| Champ | Type | Requis | Notes |
| --- | --- | --- | --- |
| `nom` | text | oui | Nom/prénom du collaborateur |
| `actif` | bool | oui | Défaut: true. Collaborateurs inactifs masqués dans le select |

### 4.4 `commandes`

| Champ | Type | Requis | Notes |
| --- | --- | --- | --- |
| `description` | text | non | Nom de l'événement / raison du retrait |
| `collaborateur` | relation | oui | → `collaborateurs` (single) |
| `date_commande` | autodate | oui | Timestamp de validation |
| `numero` | text | oui | Numéro auto-généré (format: STK-YYYYMMDD-NNN) |

### 4.5 `commande_items`

| Champ | Type | Requis | Notes |
| --- | --- | --- | --- |
| `commande` | relation | oui | → `commandes` (single) |
| `produit` | relation | oui | → `produits` (single) |
| `quantite` | number | oui | Quantité retirée (min: 1) |
| `prix_unitaire` | number | non | Snapshot du prix au moment de la commande |

### 4.6 `parametres`

| Champ | Type | Requis | Notes |
| --- | --- | --- | --- |
| `cle` | text | oui | Clé unique (ex: "mot_de_passe") |
| `valeur` | text | oui | Valeur associée |

> Utilisée pour stocker le mot de passe partagé (cle: `mot_de_passe`).
> Créer un enregistrement unique via l'admin PB après le premier démarrage.

---

## 5. Hook JSVM — `stock.pb.js`

### Contraintes techniques JSVM (rappel)

- **Tout fichier `.pb.js` doit être en minuscules**
- **Tout le code doit être wrappé dans une IIFE** : `(function() { … })()`
- **Pas de `const`/`let`/`function` au scope fichier** — tout dans l'IIFE
- **Pas de modules ES** — utiliser les APIs globales PB (`$app`, `routerAdd`, etc.)
- **Les constantes et helpers doivent être définis inline dans chaque handler** si nécessaire

### Routes custom

| Méthode | Route | Description |
| --- | --- | --- |
| POST | `/api/check-password` | Vérifie le MDP partagé. Body: `{ "password": "xxx" }`. Retourne 200 si OK, 401 sinon. |
| POST | `/api/valider-commande` | Validation atomique du panier : crée la commande + items, décrémente le stock. |
| GET | `/api/stock-summary` | Résumé des stocks par catégorie (pour la page home). |

### Logique `/api/valider-commande`

1. Reçoit `{ description, collaborateur_id, items: [{ produit_id, quantite }] }`
2. Vérifie que chaque produit a suffisamment de stock
3. Génère le numéro de commande (`STK-YYYYMMDD-NNN`)
4. Crée l'enregistrement `commandes`
5. Pour chaque item :
   - Crée l'enregistrement `commande_items` (avec snapshot du prix)
   - Décrémente `produits.quantite`
6. Retourne la commande complète avec ses items
7. En cas d'erreur → aucune modification (atomicité via `$app.runInTransaction`)

---

## 6. Pages — Spécifications UX

### 6.1 `login.html`

- Fond `--teal`, carte centrée
- Logo PNJ en haut
- Champ password + bouton "Entrer"
- POST vers `/api/check-password`
- Succès : stocke un token dans localStorage, redirige vers `index.html`
- Toutes les autres pages vérifient ce token au chargement ; sinon → redirect `login.html`

### 6.2 `index.html` — Vue d'ensemble

- **Barre de navigation** en haut (commune à toutes les pages) : Home | Retrait | Panier (badge compteur) | Commandes | Produits
- **Filtres par catégorie** : boutons/pills cliquables (chargés depuis la collection `categories`)
- **Grille de cartes produit** : chaque carte affiche nom, catégorie (badge coloré), quantité avec indicateur visuel :
  - Barre de progression ou jauge
  - Couleur : vert (>10), orange (5-10), rouge (<5), gris (0)
  - Affichage de la date limite si proche (<30 jours) avec alerte visuelle
- **Compteurs en haut** : total produits, produits en alerte (<5), produits expirés/proches expiration
- Appel API : `GET /api/collections/produits/records?filter=(actif=true)&expand=categorie&sort=-quantite`

### 6.3 `retrait.html` — Sélection de produits

- Même nav + filtres par catégorie
- **Grille de cartes produit** (style e-commerce) :
  - Image (ou placeholder si absente)
  - Nom, catégorie, stock disponible
  - Sélecteur de quantité (+/−) avec maximum = stock disponible
  - Bouton "Ajouter au panier"
- **Barre flottante en bas** (si panier non vide) : "X articles dans le panier — Voir le panier →"
- Le panier est géré côté client dans localStorage via `cart.js`

### 6.4 `panier.html` — Résumé et validation

- **Liste des articles** du panier : nom, quantité, prix unitaire (si dispo), sous-total
- Possibilité de modifier les quantités ou supprimer un article
- **Formulaire de validation** :
  - Champ texte : description / nom de l'événement (facultatif)
  - Select : collaborateur (chargé depuis la collection `collaborateurs` filtrée `actif=true`)
  - Bouton "Valider la commande"
- **Modale de confirmation** : "Confirmer le retrait de X articles pour [événement] ?"
- POST vers `/api/valider-commande`
- Succès : vider le panier localStorage, rediriger vers `commande_details.html?id=XXX`

### 6.5 `commandes.html` — Liste des commandes

- **Tableau** (ou liste de cartes sur mobile) :
  - Numéro de commande
  - Date
  - Description (événement)
  - Collaborateur
  - Nombre d'articles
  - Lien "Voir le détail"
- **Tri** par date (défaut: plus récent en premier)
- **Recherche** par numéro ou description
- Appel API : `GET /api/collections/commandes/records?expand=collaborateur&sort=-date_commande`

### 6.6 `commande_details.html` — Détail imprimable

- **En-tête** : numéro, date, événement, collaborateur
- **Tableau des articles** : produit, quantité, prix unitaire, sous-total
- **Total** en bas
- **Boutons** : "Imprimer" (`window.print()`) et "Retour aux commandes"
- **CSS print** : masque la nav, les boutons, optimise pour A4
- URL : `commande_details.html?id=RECORD_ID`

### 6.7 `produits.html` — Gestion des produits

- **Tableau/grille des produits** : image (thumb), nom, catégorie, prix, fournisseur, stock, date limite, statut actif
- **Bouton "Ajouter un produit"** → ouvre une modale ou un formulaire en haut de page :
  - Nom (requis)
  - Catégorie (select, requis)
  - Quantité (number, requis)
  - Prix (number, optionnel)
  - Date limite (date, optionnel)
  - Fournisseur (text, optionnel)
  - Image (file upload, optionnel)
- Soumission via API PocketBase standard (`POST /api/collections/produits/records`)
- Possibilité d'éditer la quantité rapidement (inline) pour les réapprovisionnements

---

## 7. Navigation

Barre de navigation horizontale, présente sur toutes les pages (sauf `login.html`). Rendue par `ui.js`.

```
[🏠 Stocks]  [📦 Retrait]  [🛒 Panier (3)]  [📋 Commandes]  [⚙️ Produits]
```

- Le badge du panier affiche le nombre d'articles (lu depuis localStorage)
- La page active est visuellement marquée (souligné ou fond différent)
- Responsive : sur mobile, collapse en menu hamburger

---

## 8. Flux utilisateur principal

```
login.html → index.html (vue d'ensemble)
                ↓
         retrait.html (sélection produits → ajout au panier)
                ↓
         panier.html (résumé → validation)
                ↓
         POST /api/valider-commande
                ↓
         commande_details.html (confirmation, impression)
                ↓
         commandes.html (historique)
```

---

## 9. Déploiement

### Workflow standard (jorapp-infra)

1. Développer en local dans `C:\dev\jorapp-infra\pb-stock\`
2. Commit + push vers GitHub
3. SSH sur le serveur → `cd /opt/jorapp-infra && git pull`
4. `sudo bash scripts/deploy.sh pb-stock`

### Ce que `deploy.sh pb-stock` fait

```bash
rsync -av --delete pb-stock/pb_hooks/ /opt/pb-stock/pb_hooks/
rsync -av --delete pb-stock/pb_public/ /opt/pb-stock/pb_public/
systemctl restart pb-stock
```

### Ce que `deploy.sh` ne touche PAS

- `pb_data/` (données — géré par `backup.sh`)
- `pb_migrations/` (appliquées par PB au démarrage, récupérées manuellement par `scp`)
- Le binaire PocketBase

---

## 10. Contraintes et conventions

- **Pas de build step** : tout est du HTML/CSS/JS vanilla servi directement par PocketBase
- **PocketBase JS SDK** : chargé via CDN (`https://cdn.jsdelivr.net/npm/pocketbase@0.27.0/dist/pocketbase.umd.js`)
- **Pas de framework CSS** : tout est fait à la main dans `theme.css` et `components.css`
- **localStorage** pour le panier et le token d'auth — pas de cookies
- **Responsive** : toutes les pages doivent fonctionner sur mobile (les collaborateurs peuvent utiliser leur téléphone au stock)
- **Français** : toute l'interface est en français
- **Accessibilité minimale** : labels sur les inputs, contrastes corrects, navigation au clavier fonctionnelle
