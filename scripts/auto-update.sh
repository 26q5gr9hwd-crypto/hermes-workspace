#!/usr/bin/env bash
# Auto-update: pull latest from the dangpt fork (origin = 26q5gr9hwd-crypto/hermes-workspace),
# rebuild, restart. Upstream (outsourc-e/hermes-workspace) is intentionally NOT pulled
# automatically — upstream merges happen manually to avoid OOM rebuilds on the VPS.
set -euo pipefail
cd /opt/hermes-workspace

BEFORE=$(git rev-parse HEAD)
git fetch --quiet origin
AFTER=$(git rev-parse origin/main)

if [[ "$BEFORE" == "$AFTER" ]]; then
  echo "[hermes-workspace-update] already up to date at $BEFORE"
  exit 0
fi

echo "[hermes-workspace-update] updating: $BEFORE -> $AFTER"
git reset --hard "$AFTER"

/usr/local/bin/pnpm install --frozen-lockfile --prefer-offline
/usr/local/bin/pnpm build

systemctl restart hermes-workspace.service
echo "[hermes-workspace-update] restarted hermes-workspace.service"
