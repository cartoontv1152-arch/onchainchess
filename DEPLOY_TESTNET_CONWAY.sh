#!/bin/bash

# OnChain Chess - Testnet Conway Deployment Script
# This script deploys your chess app to Linera Testnet Conway
# Run this in WSL: bash DEPLOY_TESTNET_CONWAY.sh

# Ensure we use the correct Linera version from cargo bin if available
if [ -f "$HOME/.cargo/bin/linera" ]; then
    export PATH="$HOME/.cargo/bin:$PATH"
fi

set -e  # Exit on error

echo "🎯 OnChain Chess - Testnet Conway Deployment"
echo "============================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"
echo ""

# Check Rust
if ! command -v rustc &> /dev/null; then
    echo -e "${RED}❌ Rust not found. Please install Rust first.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Rust found: $(rustc --version)${NC}"

# Check Linera
if ! command -v linera &> /dev/null; then
    echo -e "${RED}❌ Linera CLI not found. Please install Linera SDK.${NC}"
    echo "Install with: cargo install --locked linera-service linera-storage-service"
    exit 1
fi
LINERA_VERSION=$(linera --version | head -1)
echo -e "${GREEN}✅ Linera found: $LINERA_VERSION${NC}"

# Version Check
if [[ "$LINERA_VERSION" != *"0.15.7"* ]] && [[ "$LINERA_VERSION" != *"v0.15.7"* ]]; then
    echo -e "${YELLOW}⚠️  WARNING: Linera version mismatch detected!${NC}"
    echo "Your version: $LINERA_VERSION"
    echo "Required version: 0.15.7 (for Testnet Conway compatibility)"
    echo ""
    echo -e "${YELLOW}Do you want to install the compatible version (v0.15.7)? [y/N]${NC}"
    read -r install_choice
    if [[ "$install_choice" =~ ^[Yy]$ ]]; then
        echo "Installing Linera v0.15.7..."
        
        # Try installing pre-built binaries first (FASTEST)
        echo "Attempting to install pre-built binaries (fastest method)..."
        if curl -LSfs https://raw.githubusercontent.com/linera-io/linera-protocol/main/install.sh | sh -s -- --version v0.15.7; then
             echo -e "${GREEN}✅ Linera v0.15.7 installed via binary script!${NC}"
             # Refresh path just in case
             source "$HOME/.cargo/env" 2>/dev/null || true
        else
             echo -e "${YELLOW}⚠️  Binary installation failed. Falling back to crates.io...${NC}"
             
             # Fallback to crates.io
             if cargo install linera-service linera-storage-service --version 0.15.7 --locked; then
                 echo -e "${GREEN}✅ Linera v0.15.7 installed from crates.io!${NC}"
             else
                 echo -e "${RED}❌ Installation failed.${NC}"
                 exit 1
             fi
        fi
    else
        echo -e "${RED}❌ Cannot proceed with incompatible Linera version.${NC}"
        echo "Please install manually: cargo install linera-service --version 0.15.7"
        exit 1
    fi
fi


# Check WASM target
if ! rustup target list --installed | grep -q "wasm32-unknown-unknown"; then
    echo -e "${YELLOW}⚠️  WASM target not installed. Installing...${NC}"
    rustup target add wasm32-unknown-unknown
fi
echo -e "${GREEN}✅ WASM target installed${NC}"

echo ""
echo -e "${YELLOW}Step 2: Building the contract...${NC}"
echo ""

# Build the contract
cd "$(dirname "$0")"
echo "Building for WebAssembly..."
cargo build --release --target wasm32-unknown-unknown

# Check if build succeeded
if [ ! -f "target/wasm32-unknown-unknown/release/onchainchess_contract.wasm" ]; then
    echo -e "${RED}❌ Build failed! Contract WASM not found.${NC}"
    exit 1
fi

if [ ! -f "target/wasm32-unknown-unknown/release/onchainchess_service.wasm" ]; then
    echo -e "${RED}❌ Build failed! Service WASM not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"
echo ""

# Step 3: Set up wallet for Testnet Conway
echo -e "${YELLOW}Step 3: Setting up wallet for Testnet Conway...${NC}"
echo ""

# Set environment variables
export LINERA_WALLET="$HOME/.config/linera/wallet.json"
export LINERA_KEYSTORE="$HOME/.config/linera/keystore.json"
export LINERA_STORAGE="rocksdb:$HOME/.config/linera/wallet.db"

# Create config directory
mkdir -p "$HOME/.config/linera"

# Check if wallet exists
if [ ! -f "$LINERA_WALLET" ]; then
    echo "Initializing wallet with Testnet Conway faucet..."
    linera wallet init --faucet https://faucet.testnet-conway.linera.net
    
    echo ""
    echo -e "${GREEN}✅ Wallet initialized!${NC}"
    echo ""
    echo "Requesting chain from Testnet Conway faucet..."
    linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net
else
    echo -e "${GREEN}✅ Wallet already exists${NC}"
fi

# Get chain ID
# Adjust grep pattern to match Chain ID format from standard output
# We expect: "Chain ID: <hash>"
CHAIN_ID=$(linera wallet show | grep -oP 'Chain ID:\s+\K[0-9a-f]+' | head -1)

if [ -z "$CHAIN_ID" ]; then
    # Fallback: try finding just the hash if the label is different
    CHAIN_ID=$(linera wallet show | grep -oP 'e[0-9a-f]{63}' | head -1)
fi

if [ -z "$CHAIN_ID" ]; then
    echo -e "${RED}❌ Could not get Chain ID. Please check your wallet.${NC}"
    linera wallet show
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Chain ID: $CHAIN_ID${NC}"

# Get owner ID
# We expect: "Default owner: <hash>"
OWNER_ID=$(linera wallet show | grep -oP 'Default owner:\s+\K0x[0-9a-f]+' | head -1)

if [ -z "$OWNER_ID" ]; then
     # Fallback: try just "Owner: ..."
     OWNER_ID=$(linera wallet show | grep -oP 'Owner:\s+\K[0-9a-f]+' | head -1)
fi

if [ -z "$OWNER_ID" ]; then
    echo -e "${RED}❌ Could not get Owner ID. Please check your wallet.${NC}"
    linera wallet show
    exit 1
fi

echo -e "${GREEN}✅ Owner ID: $OWNER_ID${NC}"
echo ""

# Step 4: Publish modules
echo -e "${YELLOW}Step 4: Publishing modules to Testnet Conway...${NC}"
echo ""

# Publish module
# Note: publish-module returns the ModuleId
MODULE_ID=$(linera publish-module \
    target/wasm32-unknown-unknown/release/onchainchess_contract.wasm \
    target/wasm32-unknown-unknown/release/onchainchess_service.wasm \
    2>&1 | grep -oP '([0-9a-f]{64})' | tail -1)

# If publish-module fails or output format is different
if [ -z "$MODULE_ID" ]; then
    # Try capturing the whole output and finding the ID
    OUTPUT=$(linera publish-module \
    target/wasm32-unknown-unknown/release/onchainchess_contract.wasm \
    target/wasm32-unknown-unknown/release/onchainchess_service.wasm 2>&1)
    echo "$OUTPUT"
    MODULE_ID=$(echo "$OUTPUT" | grep -oP '([0-9a-f]{64})' | tail -1)
fi

if [ -z "$MODULE_ID" ]; then
    echo -e "${RED}❌ Failed to publish module.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Module published!${NC}"
echo -e "${GREEN}   Module ID: $MODULE_ID${NC}"
echo ""

# Step 5: Create application
echo -e "${YELLOW}Step 5: Creating application on Testnet Conway...${NC}"
echo ""

# Create application
# create-application <MODULE_ID> --json-argument <INIT_ARGS>
APP_ID=$(linera create-application "$MODULE_ID" \
    --json-argument '{}' \
    2>&1 | grep -oP '([0-9a-f]{64})' | tail -1)

if [ -z "$APP_ID" ]; then
    echo -e "${RED}❌ Failed to create application.${NC}"
    # Try to show output
    linera create-application "$MODULE_ID" --json-argument '{}'
    exit 1
fi

echo -e "${GREEN}✅ Application created!${NC}"
echo -e "${GREEN}   Application ID: $APP_ID${NC}"
echo ""

# Step 6: Save configuration
echo -e "${YELLOW}Step 6: Saving configuration...${NC}"
echo ""

# Create .env file for frontend
cat > web-frontend/.env << EOF
VITE_CHAIN_ID=$CHAIN_ID
VITE_APP_ID=$APP_ID
VITE_OWNER_ID=$OWNER_ID
VITE_PORT=8080
VITE_HOST=localhost
EOF

echo -e "${GREEN}✅ Configuration saved to web-frontend/.env${NC}"
echo ""

# Create deployment info file
cat > DEPLOYMENT_INFO.txt << EOF
OnChain Chess - Testnet Conway Deployment
==========================================
Deployment Date: $(date)
Chain ID: $CHAIN_ID
Application ID: $APP_ID
Owner ID: $OWNER_ID
Module ID: $MODULE_ID

To start the service:
  linera service --port 8080

To access the frontend:
  cd web-frontend
  npm install
  npm run dev

Then open: http://localhost:3000/$CHAIN_ID?app=$APP_ID&owner=$OWNER_ID&port=8080

Or use the .env file:
  http://localhost:3000/
EOF

echo -e "${GREEN}✅ Deployment info saved to DEPLOYMENT_INFO.txt${NC}"
echo ""

# Summary
echo "============================================"
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "============================================"
echo ""
echo "📋 Deployment Summary:"
echo "  Chain ID:      $CHAIN_ID"
echo "  Application ID: $APP_ID"
echo "  Owner ID:      $OWNER_ID"
echo "  Module ID:     $MODULE_ID"
