# jorapp-infra

Infrastructure et backend du Parc Naturel Périurbain du Jorat (PNJ).
Configuration nginx, instances PocketBase, fronts statiques, scripts d'opération
et documentation de reprise pour le droplet DigitalOcean qui sert `jorapp.org` et ses sous-domaines.

## Tu reprends ce projet ? Commence ici

1. Lis **[docs/architecture.md](docs/architecture.md)** pour comprendre quel domaine pointe vers quoi.
2. Lis **[docs/runbook.md](docs/runbook.md)** pour les gestes du quotidien (redémarrer, logs, sauvegarder).
3. Consulte **[TODO.md](TODO.md)** pour la dette connue et les chantiers en attente.

## Périmètre

Ce dépôt couvre **uniquement le backend et l'infrastructure**. Le code de l'application
Flutter (mobile + web) vit dans un dépôt séparé : [JorAppLab](https://github.com/JPNDev2026/JorAppLab).

| Domaine                 | Front (code source)                | Backend                          |
| ----------------------- | ---------------------------------- | -------------------------------- |
| `jorapp.org`            | `JorAppLab` (build Flutter web)    | PocketBase instance principale   |
| `api.jorapp.org`        | —                                  | PocketBase instance principale   |
| `bar.jorapp.org`        | `web/bar/` (dans ce dépôt)         | via `api.jorapp.org`             |
| `dashboard.jorapp.org`  | `web/dashboard/` (dans ce dépôt)   | via `api.jorapp.org`             |
| `voucher.jorapp.org`    | `web/voucher/` (dans ce dépôt)     | via `api.jorapp.org`             |
| `db.jorapp.org`         | `pb-mobilier/pb_public/` (servi par PocketBase) | PocketBase `pb-mobilier` |

## Structure du dépôt

```
jorapp-infra/
├── README.md                  ← ce fichier
├── TODO.md                    ← dette connue
├── docs/
│   ├── architecture.md        ← carte des domaines, ports, services
│   ├── runbook.md             ← opérations courantes
│   └── deploiement.md         ← procédure de déploiement
├── nginx/                     ← configs nginx (1 fichier par domaine)
├── systemd/                   ← services systemd des deux instances PocketBase
├── scripts/                   ← backup, restore, déploiement
├── pocketbase/                ← code de l'instance principale (/opt/pocketbase)
│   └── pb_migrations/         ← schéma PocketBase versionné
├── pb-mobilier/               ← code de l'instance mobilier bois (/opt/pb-mobilier)
│   ├── pb_hooks/              ← hooks JSVM
│   ├── pb_migrations/         ← schéma PocketBase versionné
│   └── pb_public/             ← HTML servi directement par PocketBase
└── web/                       ← fronts statiques servis par nginx
    ├── bar/                   ← bar.jorapp.org (Festi'Jorat)
    ├── dashboard/             ← dashboard.jorapp.org
    └── voucher/               ← voucher.jorapp.org
```

## Ce qui n'est PAS dans le dépôt (par choix)

- **`pb_data/`** des deux instances PocketBase : c'est la base SQLite et les uploads.
  Géré par **sauvegardes**, pas par versionnement. Voir `scripts/backup.sh`.
- **Binaires PocketBase** (`./pocketbase`) : à télécharger depuis
  [pocketbase.io](https://pocketbase.io) à chaque mise à jour.
- **Secrets** (`.env`, clés, tokens) : voir les `.env.example` dans chaque sous-dossier.
- **Certificats Certbot** : gérés par `certbot` sur le serveur, renouvellement automatique.

## Convention : le dépôt est la source de vérité

Toute modification de la config nginx, des services systemd, des migrations PocketBase,
des hooks ou des fronts statiques **doit passer par ce dépôt** (commit + push), puis
être déployée sur le serveur via `git pull` ou les scripts dans `scripts/`.

Ne **jamais** éditer directement les fichiers sur le serveur — cela crée une divergence
silencieuse et casse la reprise.

## Contexte

- **Cadre** : projet du Parc Naturel Périurbain du Jorat (PNJ), canton de Vaud, Suisse.
- **Mainteneur principal** : Loïc Leray.
- **Stack** : PocketBase + nginx + systemd sur Ubuntu, droplet DigitalOcean.
