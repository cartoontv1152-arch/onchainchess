#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configurable defaults (can be overridden via environment variables)
FAUCET_URL="${FAUCET_URL:-https://faucet.testnet-conway.linera.net}"
SERVICE_PORT="${SERVICE_PORT:-8080}"
FRONTEND_PORT="${FRONTEND_PORT:-5173}"

export LINERA_DIR="${LINERA_DIR:-$SCRIPT_DIR}"
export LINERA_WALLET="${LINERA_WALLET:-$HOME/.config/linera/wallet.json}"
export LINERA_KEYSTORE="${LINERA_KEYSTORE:-$HOME/.config/linera/keystore.json}"
export LINERA_STORAGE="${LINERA_STORAGE:-rocksdb:$HOME/.config/linera/wallet.db}"

mkdir -p "$(dirname "$LINERA_WALLET")"

echo "== OnChainChess bootstrap =="
echo "Project directory : $SCRIPT_DIR"
echo "Linera binaries   : $(command -v linera || echo 'not found')"
echo "Faucet URL        : $FAUCET_URL"
echo "Service port      : $SERVICE_PORT"
echo "Frontend port     : $FRONTEND_PORT"

# Ensure npm is available when using nvm-installed Node
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  . "$NVM_DIR/nvm.sh"
fi

# Ensure wasm target is available
if ! rustup target list --installed | grep -q "wasm32-unknown-unknown"; then
  rustup target add wasm32-unknown-unknown
fi

# Wallet setup
if [ ! -f "$LINERA_WALLET" ]; then
  echo "Initializing wallet..."
  linera wallet init --faucet "$FAUCET_URL"
else
  echo "Wallet already exists."
fi

# Obtain chain + owner if not provided
if [ -z "${CHAIN_ID:-}" ] || [ -z "${OWNER_ID:-}" ]; then
  echo "Requesting new chain from faucet..."
  read -r CHAIN_ID OWNER_ID < <(linera wallet request-chain --faucet "$FAUCET_URL")
else
  echo "Using provided chain/app identifiers."
fi

echo "Chain ID : ${CHAIN_ID}"
echo "Owner ID : ${OWNER_ID:-unknown}"

# Build contract and service WASM
echo "Building WASM artifacts..."
cargo build --release --target wasm32-unknown-unknown --manifest-path "$SCRIPT_DIR/Cargo.toml"

MODULE_CONTRACT="$SCRIPT_DIR/target/wasm32-unknown-unknown/release/onchainchess_contract.wasm"
MODULE_SERVICE="$SCRIPT_DIR/target/wasm32-unknown-unknown/release/onchainchess_service.wasm"

if [ ! -f "$MODULE_CONTRACT" ] || [ ! -f "$MODULE_SERVICE" ]; then
  echo "ERROR: Compiled WASM modules not found."
  exit 1
fi

# Publish modules and create application unless an app was supplied
if [ -z "${APP_ID:-}" ]; then
  echo "Publishing modules to chain..."
  MODULE_ID="$(linera publish-module "$MODULE_CONTRACT" "$MODULE_SERVICE")"
  echo "Module ID: $MODULE_ID"

  echo "Creating application on chain..."
  APP_ID="$(linera create-application "$MODULE_ID" "$CHAIN_ID" --json-argument '{}')"
else
  echo "Skipping publish/create; using provided APP_ID."
fi

echo "Application ID: $APP_ID"

# Write frontend environment
ENV_FILE="$SCRIPT_DIR/web-frontend/.env"
cat > "$ENV_FILE" <<EOF
VITE_CHAIN_ID=$CHAIN_ID
VITE_APP_ID=$APP_ID
VITE_OWNER_ID=${OWNER_ID:-}
VITE_PORT=$SERVICE_PORT
VITE_HOST=localhost
EOF
echo "Wrote frontend env -> $ENV_FILE"

# Start Linera service
echo "Starting Linera service on port $SERVICE_PORT..."
linera service --port "$SERVICE_PORT" > "$SCRIPT_DIR/backend.log" 2>&1 &
SERVICE_PID=$!

# Start frontend
echo "Installing frontend deps..."
cd "$SCRIPT_DIR/web-frontend"
npm install
echo "Starting frontend on port $FRONTEND_PORT..."
HOST=0.0.0.0 PORT="$FRONTEND_PORT" BROWSER=none npm run dev > "$SCRIPT_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

sleep 3
echo "======================================"
echo "Frontend URL: http://localhost:${FRONTEND_PORT}/${CHAIN_ID}?app=${APP_ID}&owner=${OWNER_ID}&port=${SERVICE_PORT}"
echo "GraphQL URL : http://localhost:${SERVICE_PORT}/chains/${CHAIN_ID}/applications/${APP_ID}"
echo "Frontend log: $SCRIPT_DIR/frontend.log"
echo "Backend log : $SCRIPT_DIR/backend.log"
echo "======================================"

cleanup() {
  echo "Stopping services..."
  kill "$SERVICE_PID" "$FRONTEND_PID" 2>/dev/null || true
}

trap cleanup INT TERM
wait
