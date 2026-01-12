# Deployment Guide for OnChain Chess

This guide helps you deploy OnChain Chess to Testnet Conway for the Linera Wavehack.

## 📋 Prerequisites

- Rust (latest stable)
- Node.js (v16+)
- Linera SDK installed
- WASM target installed

## 🚀 Quick Deployment

### 1. Build the Project

```bash
cd onchainchess
cargo build --release --target wasm32-unknown-unknown
```

### 2. Set Up Wallet

```bash
export LINERA_WALLET="$HOME/.config/wallet.json"
export LINERA_KEYSTORE="$HOME/.config/keystore.json"
export LINERA_STORAGE="rocksdb:$HOME/.config/wallet.db"

linera wallet init --faucet https://faucet.testnet-conway.linera.net
linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net
```

**Save your Chain ID and Owner ID!**

### 3. Publish Modules

```bash
MODULE_ID=$(linera publish-module \
    target/wasm32-unknown-unknown/release/onchainchess_contract.wasm \
    target/wasm32-unknown-unknown/release/onchainchess_service.wasm)

echo "Module ID: $MODULE_ID"
```

**Save your Module ID!**

### 4. Create Application

```bash
CHAIN_ID=$(linera wallet show | grep -oP 'e[0-9a-f]{63}' | head -1)
APP_ID=$(linera create-application "$MODULE_ID" "$CHAIN_ID" --json-argument '{}')

echo "Application ID: $APP_ID"
```

**Save your Application ID!**

### 5. Start Service

```bash
linera service --port 8080
```

Keep this terminal open!

### 6. Set Up Frontend

```bash
cd web-frontend
npm install

# Create .env file
cat > .env << EOF
VITE_CHAIN_ID=$CHAIN_ID
VITE_APP_ID=$APP_ID
VITE_OWNER_ID=$(linera wallet show | grep -oP '0x[0-9a-f]{40}' | head -1)
VITE_PORT=8080
VITE_HOST=localhost
EOF

npm run dev
```

### 7. Access the Game

Open in browser:
```
http://localhost:3000/$CHAIN_ID?app=$APP_ID&owner=$OWNER_ID&port=8080
```

## ✅ Verification

1. Check service is running: `curl http://localhost:8080/chains/$CHAIN_ID/applications/$APP_ID`
2. Query game: `linera query-application $APP_ID $CHAIN_ID`
3. Test in browser: Create a game and make a move

## 📚 More Information

See `../TESTNET_CONWAY_DEPLOYMENT.md` for detailed deployment instructions.
