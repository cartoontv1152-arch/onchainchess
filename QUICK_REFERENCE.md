# ⚡ Quick Reference Guide

**Everything you need in one place!**

---

## 🚀 Quick Start Commands

### 1. Build Backend
```powershell
cd onchainchess
cargo build --release --target wasm32-unknown-unknown
```

### 2. Deploy to Testnet Conway
```powershell
# Set environment variables
$env:LINERA_WALLET = "$HOME\.config\wallet.json"
$env:LINERA_KEYSTORE = "$HOME\.config\keystore.json"
$env:LINERA_STORAGE = "rocksdb:$HOME\.config\wallet.db"

# Initialize wallet
linera wallet init --faucet https://faucet.testnet-conway.linera.net

# Request chain
linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net

# Publish modules
$MODULE_ID = linera publish-module `
    target/wasm32-unknown-unknown/release/onchainchess_contract.wasm `
    target/wasm32-unknown-unknown/release/onchainchess_service.wasm

# Create application
$CHAIN_ID = linera wallet show | Select-String -Pattern 'e[0-9a-f]{63}' | Select-Object -First 1 -ExpandProperty Matches | Select-Object -ExpandProperty Value
$APP_ID = linera create-application "$MODULE_ID" "$CHAIN_ID" --json-argument '{}'
```

### 3. Start Service
```powershell
linera service --port 8080
```

### 4. Setup Frontend
```powershell
cd onchainchess\web-frontend
npm install

# Create .env file with your Chain ID, App ID, Owner ID
npm run dev
```

### 5. Connect Wallet
1. Open `http://localhost:3000`
2. Click "Connect Web Client"
3. Wait 5-10 seconds
4. Verify account address shown

---

## ✅ Verification Commands

### Check Wallet
```powershell
linera wallet show
```

### Query Application
```powershell
linera query-application "$APP_ID" "$CHAIN_ID"
```

### Test GraphQL
```powershell
curl -X POST http://localhost:8080/chains/$CHAIN_ID/applications/$APP_ID `
  -H "Content-Type: application/json" `
  -d '{\"query\": \"{ getAvailableGames { gameId } }\"}'
```

### Check Service
```powershell
curl http://localhost:8080
```

---

## 🔍 Verify Testnet Conway Connection

### Browser Console Check
1. Open browser: `http://localhost:3000`
2. Press F12 (open console)
3. Connect Linera Web Client
4. Look for: `✅ Connecting to: https://faucet.testnet-conway.linera.net`

**✅ If you see "testnet-conway", you're connected!**

### Network Tab Check
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "testnet-conway"
4. Look for requests to `faucet.testnet-conway.linera.net`

**✅ If you see testnet-conway requests, you're connected!**

---

## 📁 Important Files

### Configuration
- `.env` - Frontend configuration (Chain ID, App ID, Owner ID)
- `Cargo.toml` - Rust dependencies
- `package.json` - Frontend dependencies

### Documentation
- `STEP_BY_STEP_SETUP.md` - Complete setup guide
- `COMPLETE_SETUP_GUIDE.md` - Detailed guide with troubleshooting
- `VERIFY_TESTNET_CONWAY.md` - How to verify connection
- `QUICK_START.md` - Quick start guide

### Source Code
- `src/contract.rs` - Smart contract logic
- `src/service.rs` - GraphQL service
- `src/state.rs` - State management
- `web-frontend/src/App.jsx` - Main React app
- `web-frontend/src/components/WalletSelector.jsx` - Wallet connection UI

---

## 🐛 Common Issues

### Build Fails
```powershell
# Clean and rebuild
cargo clean
cargo build --release --target wasm32-unknown-unknown
```

### Service Won't Start
```powershell
# Check port
netstat -ano | findstr :8080

# Use different port
linera service --port 8081
```

### Frontend Won't Build
```powershell
# Reinstall dependencies
Remove-Item -Recurse -Force node_modules
npm install
```

### Wallet Won't Connect
1. Check browser console for errors
2. Clear browser cache
3. Refresh page
4. Try different browser

### Not Connected to Testnet Conway
1. Check .env file has correct Chain ID
2. Verify wallet initialized with Testnet Conway faucet
3. Restart frontend: Stop and restart `npm run dev`

---

## 📊 GraphQL Operations

### Queries (Get Data)
- `getGame(gameId)` - Get single game
- `getPlayerGames(player)` - Get player's games
- `getAvailableGames()` - Get games waiting for players

### Mutations (Send Data)
- `createGame(creator)` - Create new game
- `joinGame(gameId, player)` - Join game
- `makeMove(gameId, player, chessMove)` - Make move
- `resignGame(gameId, player)` - Resign game

---

## 🎯 Success Indicators

### ✅ Everything Working:
- Backend built successfully
- Service running on port 8080
- Frontend running on port 3000
- Wallet connected (account address shown)
- Console shows "testnet-conway"
- Can create games
- Can make moves
- Moves stored on-chain

---

## 📞 Need Help?

**Check these guides:**
1. `STEP_BY_STEP_SETUP.md` - Step-by-step instructions
2. `COMPLETE_SETUP_GUIDE.md` - Detailed guide with troubleshooting
3. `VERIFY_TESTNET_CONWAY.md` - How to verify connection
4. `WALLET_SETUP_GUIDE.md` - Wallet setup details

**Or check:**
- Browser console (F12) for errors
- Service terminal for logs
- Network tab for request details

---

**🎮 Happy chess playing on Testnet Conway!** ♟️🚀
