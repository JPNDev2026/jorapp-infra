# Runbook — opérations courantes

Toutes les commandes ci-dessous se lancent **sur le serveur** (`ssh root@46.101.242.21`),
sauf indication contraire.

## Redémarrer un service

```bash
# Instance principale
systemctl restart pocketbase
systemctl status pocketbase

# Instance mobilier
systemctl restart pocketbase-mobilier
systemctl status pocketbase-mobilier

# Instance concours
systemctl restart pb-concours
systemctl status pb-concours

# nginx
systemctl reload nginx        # recharge la config sans couper
systemctl restart nginx       # redémarre complètement
nginx -t                      # teste la config sans l'appliquer
```

## Voir les logs

```bash
# PocketBase principale (logs systemd)
journalctl -u pocketbase -n 100 --no-pager
journalctl -u pocketbase -f               # suivi en direct

# PocketBase mobilier
journalctl -u pocketbase-mobilier -n 100 --no-pager
journalctl -u pocketbase-mobilier -f

# PocketBase concours
journalctl -u pb-concours -n 100 --no-pager
journalctl -u pb-concours -f

# nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Logs internes PocketBase (mobilier)
tail -f /opt/pb-mobilier/pb_data/errors.log
tail -f /opt/pb-mobilier/pb_data/std.log
```

## Sauvegarder `pb_data` manuellement

Voir aussi `scripts/backup.sh` (automatisé par cron).

```bash
# Crée un dossier de sauvegarde daté
ts=$(date +%Y%m%d_%H%M%S)
mkdir -p /var/backups/pocketbase

# Instance principale
systemctl stop pocketbase
tar czf /var/backups/pocketbase/pocketbase_${ts}.tar.gz -C /opt/pocketbase pb_data
systemctl start pocketbase

# Instance mobilier
systemctl stop pocketbase-mobilier
tar czf /var/backups/pocketbase/pb-mobilier_${ts}.tar.gz -C /opt/pb-mobilier pb_data
systemctl start pocketbase-mobilier

# Instance concours
systemctl stop pb-concours
tar czf /var/backups/pocketbase/pb-concours_${ts}.tar.gz -C /opt/pb-concours pb_data
systemctl start pb-concours
```

> ⚠️ Arrêter le service avant de copier `pb_data` garantit la cohérence de la base SQLite.
> Une copie « à chaud » peut produire un fichier corrompu.

## Restaurer une sauvegarde

```bash
# Identifie l'archive à restaurer
ls -lh /var/backups/pocketbase/

# Restauration (exemple pour l'instance principale)
systemctl stop pocketbase
mv /opt/pocketbase/pb_data /opt/pocketbase/pb_data.before_restore
tar xzf /var/backups/pocketbase/pocketbase_YYYYMMDD_HHMMSS.tar.gz -C /opt/pocketbase
systemctl start pocketbase

# Si tout fonctionne, supprime l'ancien pb_data
rm -rf /opt/pocketbase/pb_data.before_restore
```
## Sauvegardes automatiques

`scripts/backup.sh` s'exécute **tous les jours à 3h** via cron, sous root.

- **Emplacement** : `/var/backups/pocketbase/`
- **Format** : `pocketbase_YYYYMMDD_HHMMSS.tar.gz` et `pb-mobilier_YYYYMMDD_HHMMSS.tar.gz`
- **Rotation** : 7 fichiers les plus récents par instance, les plus anciens supprimés automatiquement
- **Logs** : `/var/log/jorapp-backup.log`

### Vérifier les sauvegardes

```bash
# Voir les archives disponibles
ls -lh /var/backups/pocketbase/

# Voir les logs des dernières exécutions cron
tail -50 /var/log/jorapp-backup.log
```

### Modifier la programmation

```bash
crontab -e   # éditer la planification cron
crontab -l   # lister la planification actuelle
```

### Sauvegarder à la main

Voir « Sauvegarder `pb_data` manuellement » plus haut, ou simplement :

```bash
bash /opt/jorapp-infra/scripts/backup.sh
```

## Renouveler / vérifier les certificats Certbot

```bash
certbot certificates                  # liste les certificats et leur expiration
certbot renew --dry-run               # test de renouvellement (ne change rien)
certbot renew                         # renouvellement réel (rarement nécessaire — cron s'en charge)
```

## Mettre à jour PocketBase (binaire)

```bash
# Repère la dernière version sur https://github.com/pocketbase/pocketbase/releases
cd /tmp
wget https://github.com/pocketbase/pocketbase/releases/download/vX.Y.Z/pocketbase_X.Y.Z_linux_amd64.zip
unzip pocketbase_X.Y.Z_linux_amd64.zip

# Instance principale
systemctl stop pocketbase
cp /opt/pocketbase/pocketbase /opt/pocketbase/pocketbase.previous
cp ./pocketbase /opt/pocketbase/pocketbase
systemctl start pocketbase

# Si KO, rollback : cp /opt/pocketbase/pocketbase.previous /opt/pocketbase/pocketbase
```

Faire le même processus pour `pb-mobilier`. **Toujours sauvegarder `pb_data` avant
une mise à jour majeure**, et tester l'instance mobilier en premier (moins critique).

## Déployer un changement depuis le dépôt

Voir `docs/deploiement.md`.

## Diagnostic rapide « ça ne répond plus »

1. `systemctl status pocketbase pocketbase-mobilier pb-concours nginx` — les trois services tournent ?
2. `nginx -t` — la config nginx est valide ?
3. `curl -I http://127.0.0.1:8090` et `curl -I http://127.0.0.1:8091` — les backends répondent ?
4. `df -h` — le disque n'est pas plein ?
5. `journalctl -u <service> -n 50` — quoi dans les logs récents ?
6. `certbot certificates` — un certificat expiré ?
