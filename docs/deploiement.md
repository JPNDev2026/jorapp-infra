# Déploiement

## Principe : le dépôt est la source de vérité

Toute modification (config nginx, services systemd, hooks PocketBase, fronts statiques)
suit le même cycle :

1. Édite le fichier **dans le dépôt local** (`C:/dev/jorapp-infra`).
2. Commit + push sur GitHub.
3. Sur le serveur : `cd /opt/jorapp-infra && git pull`.
4. Lance le script de déploiement adapté.

**Ne jamais** éditer directement sur le serveur. Cela crée une divergence silencieuse
entre le dépôt et l'état réel.

## Scénarios

### Modifier une config nginx

```bash
# Local (PowerShell ou WSL)
# 1. Édite nginx/jorapp.org dans VS Code
# 2. Commit + push
git add nginx/jorapp.org
git commit -m "fix(nginx): ajuste le bloc location /api/"
git push

# Serveur
ssh root@46.101.242.21
cd /opt/jorapp-infra
git pull
bash scripts/deploy.sh nginx
```

Le script lance `nginx -t` avant de recharger. Si la config est invalide, nginx
ne sera pas rechargé et l'erreur s'affiche.

### Modifier un front statique (bar/dashboard/voucher)

```bash
# Local: édite web/bar/index.html, commit, push
# Serveur:
cd /opt/jorapp-infra
git pull
bash scripts/deploy.sh web
```

### Modifier un hook ou une page de pb-mobilier

```bash
# Local: édite pb-mobilier/pb_hooks/data.pb.js, commit, push
# Serveur:
cd /opt/jorapp-infra
git pull
bash scripts/deploy.sh pb-mobilier
systemctl restart pocketbase-mobilier   # nécessaire si hook modifié
```

### Modifier un service systemd

```bash
# Local: édite systemd/pocketbase.service, commit, push
# Serveur:
cd /opt/jorapp-infra
git pull
bash scripts/deploy.sh systemd
systemctl restart pocketbase            # ou le service concerné
```

## Cas particulier : déploiement de l'app Flutter

Le build Flutter web n'est **pas** géré par ce dépôt. Il vit dans `JorAppLab`
et se déploie séparément :

```bash
# Dans JorAppLab (WSL ou Windows)
flutter build web
rsync -av --delete build/web/ root@46.101.242.21:/var/www/jorapp/
```

## Cas particulier : migrations PocketBase

Les migrations dans `pocketbase/pb_migrations/` et `pb-mobilier/pb_migrations/`
sont versionnées pour traçabilité, mais **pas synchronisées par `deploy.sh`**.

PocketBase les applique automatiquement au démarrage si elles existent dans son
dossier `pb_migrations/` sur le serveur. La création de nouvelles migrations se
fait via l'admin PocketBase (qui les écrit directement dans le bon dossier serveur).

Workflow recommandé pour suivre le schéma :

1. Crée la migration via l'admin PocketBase (sur le serveur).
2. Sur le serveur : `scp` le nouveau fichier `.js` vers ton poste local.
3. Commit dans le dépôt.

Voir le `TODO.md` pour une automatisation future de ce workflow.
