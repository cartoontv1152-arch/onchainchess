#!/bin/bash

# Quick Deploy Script for Testnet Conway
# Run: bash QUICK_DEPLOY.sh

set -e

echo "🚀 Quick Deploy to Testnet Conway"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "Cargo.toml" ]; then
    echo -e "${RED}❌ Error: Cargo.toml not found. Run this from the project root.${NC}"
    exit 1
fi

# Step 1: Build
echo -e "${YELLOW}📦 Building contract...${NC}"
cargo build --release --target wasm32-unknown-unknown

if [ ! -f "target/wasm32-unknown-unknown/release/onchainchess_contract.wasm" ]; then
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"
echo ""

# Step 2: Set up environment
export LINERA_WALLET="$HOME/.config/linera/wallet.json"
export LINERA_KEYSTORE="$HOME/.config/linera/keystore.json"
export LINERA_STORAGE="rocksdb:$HOME/.config/linera/wallet.db"
mkdir -p "$HOME/.config/linera"

# Step 3: Initialize wallet if needed
if [ ! -f "$LINERA_WALLET" ]; then
    echo -e "${YELLOW}🔑 Initializing wallet...${NC}"
    linera wallet init --faucet https://faucet.testnet-conway.linera.net
    linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net
fi

# Step 4: Get chain ID
CHAIN_ID=$(linera wallet show | grep -oP 'e[0-9a-f]{63}' | head -1)
OWNER_ID=$(linera wallet show | grep -oP '0x[0-9a-f]{40}' | head -1)

if [ -z "$CHAIN_ID" ] || [ -z "$OWNER_ID" ]; then
    echo -e "${RED}❌ Could not get Chain ID or Owner ID${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Chain ID: $CHAIN_ID${NC}"
echo -e "${GREEN}✅ Owner ID: $OWNER_ID${NC}"
echo ""

# Step 5: Publish modules
echo -e "${YELLOW}📤 Publishing modules...${NC}"
MODULE_OUTPUT=$(linera publish-module \
    target/wasm32-unknown-unknown/release/onchainchess_contract.wasm \
    target/wasm32-unknown-unknown/release/onchainchess_service.wasm \
    --json-argument '{}' 2>&1)

MODULE_ID=$(echo "$MODULE_OUTPUT" | grep -oP 'e[0-9a-f]{63}' | head -1)

if [ -z "$MODULE_ID" ]; then
    echo -e "${RED}❌ Failed to publish module${NC}"
    echo "$MODULE_OUTPUT"
    exit 1
fi

echo -e "${GREEN}✅ Module ID: $MODULE_ID${NC}"
echo ""

# Step 6: Create application
echo -e "${YELLOW}🎮 Creating application...${NC}"
APP_OUTPUT=$(linera create-application "$MODULE_ID" "$CHAIN_ID" --json-argument '{}' 2>&1)
APP_ID=$(echo "$APP_OUTPUT" | grep -oP 'e[0-9a-f]{63}' | tail -1)

if [ -z "$APP_ID" ]; then
    echo -e "${RED}❌ Failed to create application${NC}"
    echo "$APP_OUTPUT"
    exit 1
fi

echo -e "${GREEN}✅ Application ID: $APP_ID${NC}"
echo ""

# Step 7: Create .env file
echo -e "${YELLOW}📝 Creating .env file...${NC}"
cat > web-frontend/.env << EOF
VITE_CHAIN_ID=$CHAIN_ID
VITE_APP_ID=$APP_ID
VITE_OWNER_ID=$OWNER_ID
VITE_PORT=8080
VITE_HOST=localhost
EOF

echo -e "${GREEN}✅ .env file created!${NC}"
echo ""

# Step 8: Summary
echo "============================================"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "============================================"
echo ""
echo "📋 Your Deployment Info:"
echo "  Chain ID:      $CHAIN_ID"
echo "  Application ID: $APP_ID"
echo "  Owner ID:      $OWNER_ID"
echo "  Module ID:     $MODULE_ID"
echo ""
echo "📝 Next Steps:"
echo "  1. Start Linera service:"
echo "     linera service --port 8080"
echo ""
echo "  2. In another terminal, start frontend:"
echo "     cd web-frontend"
echo "     npm install"
echo "     npm run dev"
echo ""
echo "  3. Open browser:"
echo "     http://localhost:3000/"
echo ""
echo "✅ Configuration saved to web-frontend/.env"
echo ""
