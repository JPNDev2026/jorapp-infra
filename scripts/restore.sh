#!/usr/bin/env bash
#
# restore.sh — restauration assistée d'une sauvegarde pb_data.
#
# Liste les sauvegardes disponibles, demande confirmation, puis restaure.
# L'ancien pb_data est renommé en pb_data.before_restore (à supprimer manuellement
# une fois la restauration validée).
#
# Usage:
#   sudo bash /opt/jorapp-infra/scripts/restore.sh
#
set -euo pipefail

BACKUP_DIR="/var/backups/pocketbase"

if [ ! -d "$BACKUP_DIR" ]; then
    echo "❌ $BACKUP_DIR n'existe pas."
    exit 1
fi

# Choix de l'instance
echo "Quelle instance restaurer ?"
echo "  1) pocketbase  (instance principale, /opt/pocketbase)"
echo "  2) pb-mobilier (mobilier bois, /opt/pb-mobilier)"
read -r -p "Choix [1/2] : " choice

case "$choice" in
    1) name="pocketbase";  service="pocketbase";          target="/opt/pocketbase" ;;
    2) name="pb-mobilier"; service="pocketbase-mobilier"; target="/opt/pb-mobilier" ;;
    *) echo "❌ Choix invalide." ; exit 1 ;;
esac

# Liste des archives disponibles pour cette instance
echo ""
echo "Sauvegardes disponibles pour $name :"
mapfile -t archives < <(ls -1t "$BACKUP_DIR/${name}_"*.tar.gz 2>/dev/null || true)

if [ "${#archives[@]}" -eq 0 ]; then
    echo "❌ Aucune sauvegarde trouvée."
    exit 1
fi

for i in "${!archives[@]}"; do
    printf "  %d) %s\n" "$((i+1))" "$(basename "${archives[$i]}")"
done

read -r -p "Numéro de la sauvegarde à restaurer : " sel
idx=$((sel - 1))
if [ "$idx" -lt 0 ] || [ "$idx" -ge "${#archives[@]}" ]; then
    echo "❌ Numéro invalide."
    exit 1
fi
archive="${archives[$idx]}"

# Confirmation
echo ""
echo "⚠️  Tu vas restaurer :"
echo "   archive : $archive"
echo "   cible   : $target/pb_data"
echo "L'ancien pb_data sera renommé en $target/pb_data.before_restore"
read -r -p "Confirmer ? (tape 'oui') : " confirm
[ "$confirm" = "oui" ] || { echo "Annulé." ; exit 0 ; }

# Restauration
echo ""
echo "→ Arrêt de $service…"
systemctl stop "$service"

if [ -d "$target/pb_data" ]; then
    rm -rf "$target/pb_data.before_restore"
    mv "$target/pb_data" "$target/pb_data.before_restore"
fi

echo "→ Extraction de l'archive…"
tar xzf "$archive" -C "$target"

echo "→ Redémarrage de $service…"
systemctl start "$service"

sleep 2
if systemctl is-active --quiet "$service"; then
    echo ""
    echo "✓ Restauration terminée."
    echo "  L'ancien pb_data est dans $target/pb_data.before_restore"
    echo "  Supprime-le quand tu as validé que tout fonctionne :"
    echo "    rm -rf $target/pb_data.before_restore"
else
    echo "❌ $service ne redémarre pas. Logs :"
    journalctl -u "$service" -n 30 --no-pager
    exit 1
fi
