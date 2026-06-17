# Dette technique connue

Chantiers identifiés lors de la mise en place du dépôt (juin 2026). À traiter dans l'ordre quand le contexte le permet.

## Aligner les fronts sur `api.jorapp.org`

**État** : duplication historique. L'app Flutter (`JorAppLab`) appelle `jorapp.org/api/`, les fronts statiques Festi (bar, dashboard, voucher) appellent `api.jorapp.org`. Les deux pointent vers le même backend.

**Cible** : tout aligner sur `api.jorapp.org` et supprimer le bloc `proxy_pass /api/` de `nginx/jorapp.org` afin que `jorapp.org` ne serve plus que le build Flutter web.

**Pas à pas** :
1. Modifier `lib/core/constants.dart` dans `JorAppLab` : `pbUrl = 'https://api.jorapp.org'`.
2. Publier une release Flutter (mobile via TestFlight + Play, web via build et déploiement nginx).
3. Vérifier que plus aucun client n'appelle `jorapp.org/api/` (logs nginx pendant 1-2 semaines).
4. Retirer le bloc `location /api/` de `nginx/jorapp.org`, recharger nginx.

**À éviter** : faire l'étape 4 avant d'avoir attendu que les anciennes versions mobiles soient sorties du parc.

## Nettoyer `/etc/nginx/sites-available/` sur le serveur

- Supprimer `default.bak` (résidu de configuration mélangeant la conf nginx par défaut et un ancien voucher).
- Vérifier l'utilité de `default` ; si gardé, le documenter dans `nginx/README.md`.

## Supprimer le zip orphelin

`pocketbase_0.25.8_linux_amd64.zip` traîne dans `/opt/pocketbase/`. Le binaire est déjà extrait, le zip ne sert à rien.

```bash
rm /opt/pocketbase/pocketbase_0.25.8_linux_amd64.zip
```

## Basculer le serveur en « git pull » plutôt qu'« édition directe »

Voir étape 8 du plan de mise en place (cloner ce dépôt sur le serveur et faire des liens symboliques depuis `/etc/nginx/sites-available/` etc. vers les fichiers du dépôt). Tant que ce n'est pas fait, la source de vérité reste ambiguë.

## Mettre en place la sauvegarde automatique

`scripts/backup.sh` à venir, à déclencher par cron quotidien (voir étape 10 du plan).
