#!/bin/bash

# Reset Script for OnChain Chess
# Use this if you get "Blobs not found" or other wallet errors

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${RED}⚠️  WARNING: This will delete your current Linera wallet configuration!${NC}"
echo -e "This is necessary to fix version conflicts and 'Blobs not found' errors."
echo ""
echo "Press ENTER to continue or Ctrl+C to cancel..."
read

# Ensure we use the correct Linera version from cargo bin if available
if [ -f "$HOME/.cargo/bin/linera" ]; then
    export PATH="$HOME/.cargo/bin:$PATH"
fi

echo -e "${YELLOW}🧹 Cleaning up old configuration...${NC}"
rm -rf ~/.config/linera
rm -f web-frontend/.env
rm -f DEPLOYMENT_INFO.txt

echo -e "${GREEN}✅ Cleanup complete.${NC}"
echo ""
echo -e "${YELLOW}🚀 Starting fresh deployment...${NC}"

# Run the deployment script
bash DEPLOY_TESTNET_CONWAY.sh
