#!/bin/bash

# Start Script for OnChain Chess
# Run this in WSL: bash START_APP.sh

# Ensure we use the correct Linera version from cargo bin if available
if [ -f "$HOME/.cargo/bin/linera" ]; then
    export PATH="$HOME/.cargo/bin:$PATH"
fi

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}♟️  Starting OnChain Chess Setup...${NC}"

# Check which linera we are using
LINERA_PATH=$(which linera)
LINERA_VER=$(linera --version | head -1)
echo -e "Using Linera: $LINERA_PATH ($LINERA_VER)"

# 1. Check/Install Dependencies
if [ ! -d "web-frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies (this may take a minute)...${NC}"
    cd web-frontend
    # Use standard npm install since we are running in WSL
    npm install
    cd ..
    echo -e "${GREEN}✅ Dependencies installed!${NC}"
else
    echo -e "${GREEN}✅ Frontend dependencies found.${NC}"
fi

# 2. Instructions
echo ""
echo "================================================================"
echo -e "${GREEN}🎉 Setup Complete! Now run the app in TWO terminals:${NC}"
echo "================================================================"
echo ""
echo -e "${YELLOW}TERMINAL 1 (Linera Service):${NC}"
echo "Run this command to connect to Testnet Conway:"
echo "----------------------------------------"
echo "export PATH=\"\$HOME/.cargo/bin:\$PATH\""
echo "linera service --port 8080"
echo "----------------------------------------"
echo ""
echo -e "${YELLOW}TERMINAL 2 (Frontend):${NC}"
echo "Run this command to start the web app:"
echo "----------------------------------------"
echo "cd web-frontend && npm run dev"
echo "----------------------------------------"
echo ""
echo "Then open your browser at: http://localhost:3000"
echo "================================================================"
