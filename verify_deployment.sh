#!/bin/bash

# Verification Script for OnChain Chess Deployment
# Run: bash verify_deployment.sh

set -e

echo "🔍 Verifying OnChain Chess Deployment"
echo "======================================"
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ERRORS=0

# Check 1: Build files
echo -e "${YELLOW}Checking build files...${NC}"
if [ -f "target/wasm32-unknown-unknown/release/onchainchess_contract.wasm" ]; then
    echo -e "${GREEN}✅ Contract WASM found${NC}"
else
    echo -e "${RED}❌ Contract WASM not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "target/wasm32-unknown-unknown/release/onchainchess_service.wasm" ]; then
    echo -e "${GREEN}✅ Service WASM found${NC}"
else
    echo -e "${RED}❌ Service WASM not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: Wallet
echo ""
echo -e "${YELLOW}Checking wallet...${NC}"
export LINERA_WALLET="$HOME/.config/linera/wallet.json"
if [ -f "$LINERA_WALLET" ]; then
    echo -e "${GREEN}✅ Wallet exists${NC}"
    
    # Try standard format first
    CHAIN_ID=$(linera wallet show 2>/dev/null | grep -oP 'Chain ID:\s+\K[0-9a-f]+' | head -1)
    
    # Fallback to hash pattern
    if [ -z "$CHAIN_ID" ]; then
        CHAIN_ID=$(linera wallet show 2>/dev/null | grep -oP 'e[0-9a-f]{63}' | head -1 || echo "")
    fi
    
    if [ -n "$CHAIN_ID" ]; then
        echo -e "${GREEN}✅ Chain ID: $CHAIN_ID${NC}"
    else
        echo -e "${RED}❌ Could not get Chain ID (is linera installed?)${NC}"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}❌ Wallet not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 3: Environment file
echo ""
echo -e "${YELLOW}Checking frontend configuration...${NC}"
if [ -f "web-frontend/.env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    
    if grep -q "VITE_CHAIN_ID=" web-frontend/.env && grep -q "VITE_APP_ID=" web-frontend/.env; then
        echo -e "${GREEN}✅ .env file has required variables${NC}"
    else
        echo -e "${YELLOW}⚠️  .env file missing some variables${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env file not found (will be created on deployment)${NC}"
fi

# Check 4: Service running
echo ""
echo -e "${YELLOW}Checking Linera service...${NC}"
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Linera service is running${NC}"
else
    echo -e "${YELLOW}⚠️  Linera service not running (start with: linera service --port 8080)${NC}"
fi

# Check 5: Frontend dependencies
echo ""
echo -e "${YELLOW}Checking frontend dependencies...${NC}"
if [ -d "web-frontend/node_modules" ]; then
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend dependencies not installed (run: cd web-frontend && npm install)${NC}"
fi

# Summary
echo ""
echo "======================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Your deployment looks good!"
    echo ""
    echo "Next steps:"
    echo "  1. Start service: linera service --port 8080"
    echo "  2. Start frontend: cd web-frontend && npm run dev"
    echo "  3. Open: http://localhost:3000/"
else
    echo -e "${RED}❌ Found $ERRORS issue(s)${NC}"
    echo ""
    echo "Please fix the issues above before deploying."
fi
echo "======================================"
