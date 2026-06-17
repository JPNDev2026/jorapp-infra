#!/usr/bin/env bash
#
# deploy.sh — synchronise le dépôt vers les bons emplacements sur le serveur.
#
# À exécuter sur le serveur, depuis la racine du dépôt cloné (typiquement /opt/jorapp-infra).
#
# Synchronise:
#   - nginx/*       → /etc/nginx/sites-available/
#   - systemd/*     → /etc/systemd/system/
#   - web/bar/*     → /var/www/bar/
#   - web/dashboard/* → /var/www/dashboard/
#   - web/voucher/* → /var/www/voucher/
#   - pb-mobilier/pb_hooks/*   → /opt/pb-mobilier/pb_hooks/
#   - pb-mobilier/pb_public/*  → /opt/pb-mobilier/pb_public/
#
# Ne touche PAS:
#   - pb_data des deux instances (données — gérées par backup/restore)
#   - les binaires PocketBase
#   - le build Flutter (/var/www/jorapp — déployé depuis le dépôt JorAppLab)
#   - les pb_migrations (appliquées par PocketBase au démarrage, pas synchronisées)
#
# Usage:
#   sudo bash /opt/jorapp-infra/scripts/deploy.sh           # tout
#   sudo bash /opt/jorapp-infra/scripts/deploy.sh nginx     # seulement nginx
#   sudo bash /opt/jorapp-infra/scripts/deploy.sh web       # seulement les fronts statiques
#   sudo bash /opt/jorapp-infra/scripts/deploy.sh pb-mobilier  # seulement hooks/public mobilier
#
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${1:-all}"

deploy_nginx() {
    echo "→ Déploiement nginx…"
    rsync -av "$REPO_DIR/nginx/" /etc/nginx/sites-available/ \
        --exclude=".gitkeep" --exclude="README.md"
    nginx -t
    systemctl reload nginx
    echo "  ✓ nginx rechargé."
}

deploy_systemd() {
    echo "→ Déploiement systemd…"
    rsync -av "$REPO_DIR/systemd/" /etc/systemd/system/ \
        --include="*.service" --exclude="*"
    systemctl daemon-reload
    echo "  ✓ systemd rechargé. (Restart manuel des services à faire si .service modifié.)"
}

deploy_web() {
    echo "→ Déploiement fronts statiques…"
    for site in bar dashboard voucher; do
        if [ -d "$REPO_DIR/web/$site" ]; then
            rsync -av --delete "$REPO_DIR/web/$site/" "/var/www/$site/" \
                --exclude=".gitkeep" --exclude="README.md"
            echo "  ✓ /var/www/$site/"
        fi
    done
}

deploy_pb_mobilier() {
    echo "→ Déploiement pb-mobilier (hooks + public)…"
    rsync -av --delete "$REPO_DIR/pb-mobilier/pb_hooks/" /opt/pb-mobilier/pb_hooks/ \
        --exclude=".gitkeep" --exclude="README.md"
    rsync -av --delete "$REPO_DIR/pb-mobilier/pb_public/" /opt/pb-mobilier/pb_public/ \
        --exclude=".gitkeep" --exclude="README.md"
    echo "  ✓ Redémarrer pocketbase-mobilier si les hooks ont changé :"
    echo "    systemctl restart pocketbase-mobilier"
}

case "$TARGET" in
    all)         deploy_nginx; deploy_systemd; deploy_web; deploy_pb_mobilier ;;
    nginx)       deploy_nginx ;;
    systemd)     deploy_systemd ;;
    web)         deploy_web ;;
    pb-mobilier) deploy_pb_mobilier ;;
    *)
        echo "Usage : $0 [all|nginx|systemd|web|pb-mobilier]"
        exit 1
        ;;
esac

echo ""
echo "Déploiement terminé."
