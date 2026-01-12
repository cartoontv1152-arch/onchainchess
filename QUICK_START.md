# Quick Start Guide - OnChain Chess

## 🚀 Quick Start

### 1. Build the Backend

```bash
cd onchainchess
cargo build --release --target wasm32-unknown-unknown
```

### 2. Deploy to Testnet Conway

```bash
# Set environment variables
export LINERA_WALLET="$HOME/.config/wallet.json"
export LINERA_KEYSTORE="$HOME/.config/keystore.json"
export LINERA_STORAGE="rocksdb:$HOME/.config/wallet.db"

# Initialize wallet
linera wallet init --faucet https://faucet.testnet-conway.linera.net
linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net

# Save your Chain ID and Owner ID!
CHAIN_ID=$(linera wallet show | grep -oP 'e[0-9a-f]{63}' | head -1)
OWNER_ID=$(linera wallet show | grep -oP '0x[0-9a-f]{40}' | head -1)

# Publish modules
MODULE_ID=$(linera publish-module \
    target/wasm32-unknown-unknown/release/onchainchess_contract.wasm \
    target/wasm32-unknown-unknown/release/onchainchess_service.wasm)

# Create application
APP_ID=$(linera create-application "$MODULE_ID" "$CHAIN_ID" --json-argument '{}')

# Save your App ID!
echo "Chain ID: $CHAIN_ID"
echo "Owner ID: $OWNER_ID"
echo "Module ID: $MODULE_ID"
echo "Application ID: $APP_ID"
```

### 3. Start the Service

```bash
# Make sure environment variables are set
export LINERA_WALLET="$HOME/.config/wallet.json"
export LINERA_KEYSTORE="$HOME/.config/keystore.json"
export LINERA_STORAGE="rocksdb:$HOME/.config/wallet.db"

# Start service
linera service --port 8080
```

**Keep this terminal open!**

### 4. Set Up Frontend

```bash
cd web-frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_CHAIN_ID=$CHAIN_ID
VITE_APP_ID=$APP_ID
VITE_OWNER_ID=$OWNER_ID
VITE_PORT=8080
VITE_HOST=localhost
EOF

# Start development server
npm run dev
```

### 5. Access the Game

Open in browser:
```
http://localhost:3000/$CHAIN_ID?app=$APP_ID&owner=$OWNER_ID&port=8080
```

Or use the default route with .env variables:
```
http://localhost:3000
```

## ✅ Verification

1. **Check service is running**:
   ```bash
   curl http://localhost:8080/chains/$CHAIN_ID/applications/$APP_ID
   ```

2. **Query game**:
   ```bash
   linera query-application $APP_ID $CHAIN_ID
   ```

3. **Test in browser**:
   - Connect wallet
   - Create a game
   - Join a game
   - Make moves

## 📚 More Information

- See `README.md` for detailed documentation
- See `DEPLOYMENT.md` for deployment guide
- See `../TESTNET_CONWAY_DEPLOYMENT.md` for Testnet Conway setup

---

**Happy Chess Playing! ♟️**
