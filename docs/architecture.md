# Architecture

## Vue d'ensemble

Un seul droplet DigitalOcean (Ubuntu 24.04, fra1, 1 vCPU / 512 Mo) héberge **trois instances PocketBase indépendantes** et **plusieurs fronts**. nginx joue le rôle de reverse proxy et serveur statique. Certbot gère les certificats Let's Encrypt.

- **Droplet** : `46.101.242.21` (FRA1)
- **OS** : Ubuntu 24.04
- **Reverse proxy** : nginx (configs dans `/etc/nginx/sites-available/`)
- **Process manager** : systemd
- **TLS** : Certbot (renouvellement auto)

## Mapping domaines → backend

| Domaine                | Certbot | Servi par              | Cible                       | Code source                            |
| ---------------------- | :-----: | ---------------------- | --------------------------- | -------------------------------------- |
| `jorapp.org` (+ `www`) |   ✓     | nginx statique + proxy `/api/` `/_/` | `/var/www/jorapp` + `127.0.0.1:8090` | dépôt `JorAppLab` (`flutter build web`) |
| `api.jorapp.org`       |   ✓     | nginx proxy            | `127.0.0.1:8090`            | `pocketbase/` (ce dépôt)               |
| `bar.jorapp.org`       |   ✓     | nginx statique         | `/var/www/bar`              | `web/bar/` (ce dépôt)                  |
| `dashboard.jorapp.org` |   ✓     | nginx statique         | `/var/www/dashboard`        | `web/dashboard/` (ce dépôt)            |
| `voucher.jorapp.org`   |   ✓     | nginx statique         | `/var/www/voucher`          | `web/voucher/` (ce dépôt)              |
| `db.jorapp.org`        |   ✓     | nginx proxy            | `127.0.0.1:8091`            | `pb-mobilier/` (ce dépôt)              |
| `concours.jorapp.org`  |   ✓     | nginx proxy            | `127.0.0.1:8093`            | `pb-concours/` (ce dépôt)              |

### Points à connaître

- **`jorapp.org` fait deux choses à la fois** : il sert un site statique (le build Flutter web depuis `/var/www/jorapp`) **et** proxifie les routes `/api/` et `/_/` vers la première instance PocketBase. C'est le seul domaine dans ce cas.
- **`db.jorapp.org` est le seul cas où PocketBase sert lui-même du HTML** (via `pb_public/`). Les autres fronts statiques sont servis par nginx via /var/wwww.
- **`api.jorapp.org` et `jorapp.org/api/` pointent vers le même backend** (`127.0.0.1:8090`). C'est un doublon historique — voir `TODO.md`.

## Instances PocketBase

### Instance principale : `pocketbase`

- **Chemin sur le serveur** : `/opt/pocketbase/`
- **Port** : `127.0.0.1:8090`
- **Service systemd** : `pocketbase.service`
- **Utilisée par** : app Flutter (`JorAppLab`), fronts statiques Festi'Jorat (bar, dashboard, voucher)
- **Collections principales** : `balades`, `audio_points`, `restaurants`, `field_recordings`, `ventes`, `voucher_combos`
- **`pb_hooks/`** : aucun (n'utilise pas de hooks JSVM)
- **`pb_public/`** : aucun (PocketBase ne sert pas de HTML, c'est nginx qui s'en charge)
- **`pb_migrations/`** : voir `pocketbase/pb_migrations/` dans ce dépôt

### Instance mobilier : `pocketbase-mobilier`

- **Chemin sur le serveur** : `/opt/pb-mobilier/`
- **Port** : `127.0.0.1:8091`
- **Service systemd** : `pocketbase-mobilier.service`
- **Utilisée par** : prototype de plateforme de mobilier public en bois suisse - catalogue d'objet et visualisation des tables, relations et variables
- **Collections principales** : `Plans`, `Modules`, `Licences`, `Essences`, `Familles`, `Acteurs`, `Équipements`, `Collectivites`, `Projets`, `Affectations`, `Coalitions`, `Realisation`, `metadonee`
- **`pb_hooks/`** : `data.pb.js`, `schema_doc.pb.js` — JSVM (voir `pb-mobilier/pb_hooks/`)
- **`pb_public/`** : `index.html` (navigateur relationnel) + `schema.html` (visualiseur ER)
- **`pb_migrations/`** : voir `pb-mobilier/pb_migrations/` dans ce dépôt

### Instance concours : `pb-concours`

- **Chemin sur le serveur** : `/opt/pb-concours/`
- **Port** : `127.0.0.1:8093`
- **Service systemd** : `pb-concours.service`
- **Utilisée par** : sondage / concours QR-code du PNJ (`concours.jorapp.org`). Permet de gérer l'origine des sondages, de collecter les réponses et d'organiser la facturation des rewards par partenaire
- **Collections principales** : `participations`, `commercants`
- **`pb_hooks/`** : `jorapp_concours.pb.js` — JSVM (voir `pb-concours/pb_hooks/`)
- **`pb_public/`** : `deja-participe.html` (page si déjà participé) + `merci.html` (page de remerciement après scan QR)
- **`pb_migrations/`** : voir `pb-concours/pb_migrations/` dans ce dépôt

## Schéma de flux

```
Internet
   │
   ▼
[ nginx :80/:443 ]
   │
   ├─ jorapp.org ──── statique ──→ /var/www/jorapp  (build Flutter web depuis JorAppLab)
   │                   proxy /api/ + /_/ ──→ 127.0.0.1:8090
   │
   ├─ api.jorapp.org ──── proxy ──→ 127.0.0.1:8090 ─── PocketBase (/opt/pocketbase)
   │
   ├─ bar.jorapp.org ──── statique ──→ /var/www/bar
   ├─ dashboard.jorapp.org ── statique ──→ /var/www/dashboard
   ├─ voucher.jorapp.org ──── statique ──→ /var/www/voucher
   │     (tous trois appellent ensuite api.jorapp.org)
   │-├─ concours.jorapp.org ──── proxy ──→ 127.0.0.1:8093 ─── PocketBase (/opt/pb-concours)
   │                                                       sert pb_public/merci.html, deja-participe.html
   └─ db.jorapp.org ──── proxy ──→ 127.0.0.1:8091 ─── PocketBase (/opt/pb-mobilier)
                                                       sert pb_public/index.html + schema.html
```

## Arborescence sur le serveur

```
/opt/
├── pocketbase/                ← instance principale
│   ├── pocketbase             (binaire — pas versionné)
│   ├── pb_data/               (base SQLite + uploads — JAMAIS dans git)
│   └── pb_migrations/         (versionné — voir ce dépôt)
└── pb-mobilier/               ← instance mobilier
    ├── pocketbase             (binaire — pas versionné)
    ├── pb_data/               (base SQLite + uploads — JAMAIS dans git)
    ├── pb_hooks/              (versionné)
    ├── pb_migrations/         (versionné)
    └── pb_public/ 
└── pb-concours/               ← instance concours
    ├── pocketbase             (binaire — pas versionné)
    ├── pb_data/               (base SQLite + uploads — JAMAIS dans git)
    ├── pb_hooks/              (versionné)
    ├── pb_migrations/         (versionné)
    └── pb_public/             (versionné)            (versionné)

/var/www/
├── jorapp/                    ← build Flutter web (déployé depuis JorAppLab)
├── bar/                       ← versionné dans web/bar/
├── dashboard/                 ← versionné dans web/dashboard/
└── voucher/                   ← versionné dans web/voucher/

/etc/nginx/sites-available/    ← versionné dans nginx/
/etc/systemd/system/           ← versionné dans systemd/ (les 2 .service)
```
