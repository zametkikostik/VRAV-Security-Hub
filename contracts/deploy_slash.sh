#!/usr/bin/env bash
# Deploy VravReputationSlash with Foundry.
# Usage:
#   export POLYGON_RPC=https://...
#   export PK=0x...
#   export OWNER=0xYourWallet
#   ./contracts/deploy_slash.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! command -v forge >/dev/null 2>&1; then
  echo "Install Foundry: https://book.getfoundry.sh/getting-started/installation"
  exit 1
fi

: "${POLYGON_RPC:?set POLYGON_RPC}"
: "${PK:?set PK}"
: "${OWNER:?set OWNER (contract owner / slash operator)}"

echo "Deploying VravReputationSlash owner=$OWNER"
OUT=$(forge create contracts/VravReputationSlash.sol:VravReputationSlash \
  --rpc-url "$POLYGON_RPC" \
  --private-key "$PK" \
  --constructor-args "$OWNER" \
  --json)

ADDR=$(echo "$OUT" | python3 -c "import sys,json; print(json.load(sys.stdin).get('deployedTo',''))" 2>/dev/null || true)
if [ -z "$ADDR" ]; then
  echo "$OUT"
  echo "Parse address from forge output and set VITE_SLASH_CONTRACT_ADDRESS / Operator Setup"
else
  echo "Deployed at: $ADDR"
  echo "Add to .env:"
  echo "VITE_SLASH_CONTRACT_ADDRESS=$ADDR"
fi
