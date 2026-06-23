#!/usr/bin/env bash
#
# backup.sh — sauvegarde des pb_data des deux instances PocketBase.
#
# À exécuter sur le serveur (cron quotidien recommandé).
# Archive: /var/backups/pocketbase/{pocketbase,pb-mobilier}_YYYYMMDD_HHMMSS.tar.gz
# Rotation: garde les 7 derniers fichiers par instance.
#
# Usage:
#   sudo bash /opt/jorapp-infra/scripts/backup.sh
#
set -euo pipefail

BACKUP_DIR="/var/backups/pocketbase"
RETENTION=7
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"

mkdir -p "$BACKUP_DIR"

backup_instance() {
    local name="$1"
    local service="$2"
    local source_dir="$3"

    echo "→ Sauvegarde de $name…"

    # Arrêt du service pour cohérence SQLite
    systemctl stop "$service"

    # Création de l'archive
    local archive="$BACKUP_DIR/${name}_${TIMESTAMP}.tar.gz"
    tar czf "$archive" -C "$source_dir" pb_data

    # Redémarrage immédiat
    systemctl start "$service"

    # Vérification que le service est bien remonté
    sleep 2
    if ! systemctl is-active --quiet "$service"; then
        echo "❌ $service ne redémarre pas après sauvegarde !"
        exit 1
    fi

    echo "  ✓ $archive ($(du -h "$archive" | cut -f1))"

    # Rotation: garde les RETENTION fichiers les plus récents
    ls -1t "$BACKUP_DIR/${name}_"*.tar.gz 2>/dev/null \
        | tail -n +$((RETENTION + 1)) \
        | xargs -r rm -v
}

backup_instance "pocketbase"  "pocketbase"          "/opt/pocketbase"
backup_instance "pb-mobilier" "pocketbase-mobilier" "/opt/pb-mobilier"
backup_instance "pb-concours" "pb-concours"         "/opt/pb-concours"

echo ""
echo "Sauvegardes disponibles:"
ls -lh "$BACKUP_DIR/"
