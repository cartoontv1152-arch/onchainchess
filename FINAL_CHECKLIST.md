# ✅ Final Deployment Checklist

**Use this checklist to ensure your OnChain Chess app is ready for Wavehack submission**

---

## 🔧 Pre-Deployment Checklist

### Prerequisites
- [ ] WSL 2 installed and running
- [ ] Rust installed (`rustc --version` works)
- [ ] Linera CLI v0.16.0 installed (`linera --version`)
- [ ] Node.js v16+ installed (`node --version`)
- [ ] WASM target installed (`rustup target add wasm32-unknown-unknown`)

### Project Setup
- [ ] Project files in correct location
- [ ] Cargo.toml configured (workspace or standalone)
- [ ] All source files present (`src/contract.rs`, `src/service.rs`, etc.)
- [ ] Frontend files present (`web-frontend/` directory)

---

## 🏗️ Build Checklist

### Backend Build
- [ ] Contract compiles without errors
- [ ] Service compiles without errors
- [ ] `onchainchess_contract.wasm` exists
- [ ] `onchainchess_service.wasm` exists
- [ ] No compilation warnings (or acceptable warnings)

**Command:**
```bash
cargo build --release --target wasm32-unknown-unknown
```

---

## 🌐 Deployment Checklist

### Wallet Setup
- [ ] Wallet initialized with Testnet Conway faucet
- [ ] Chain requested from Testnet Conway
- [ ] Chain ID obtained and saved
- [ ] Owner ID obtained and saved
- [ ] Wallet has test tokens

**Commands:**
```bash
linera wallet init --faucet https://faucet.testnet-conway.linera.net
linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net
```

### Module Publication
- [ ] Contract module published successfully
- [ ] Service module published successfully
- [ ] Module ID obtained and saved

**Command:**
```bash
linera publish-module \
    target/wasm32-unknown-unknown/release/onchainchess_contract.wasm \
    target/wasm32-unknown-unknown/release/onchainchess_service.wasm \
    --json-argument '{}'
```

### Application Creation
- [ ] Application created successfully
- [ ] Application ID obtained and saved
- [ ] Application deployed on Testnet Conway

**Command:**
```bash
linera create-application MODULE_ID CHAIN_ID --json-argument '{}'
```

---

## 🚀 Service Checklist

### Linera Service
- [ ] Service starts without errors
- [ ] Service running on port 8080
- [ ] Service accessible via HTTP
- [ ] GraphQL endpoint accessible

**Command:**
```bash
linera service --port 8080
```

**Verification:**
```bash
curl http://localhost:8080/chains/YOUR_CHAIN_ID
```

---

## 💻 Frontend Checklist

### Frontend Setup
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with correct values
- [ ] `.env` contains:
  - [ ] `VITE_CHAIN_ID`
  - [ ] `VITE_APP_ID`
  - [ ] `VITE_OWNER_ID`
  - [ ] `VITE_PORT`
  - [ ] `VITE_HOST`

### Frontend Running
- [ ] Dev server starts without errors
- [ ] Frontend accessible at `http://localhost:3000/`
- [ ] No console errors in browser
- [ ] UI loads correctly

**Commands:**
```bash
cd web-frontend
npm install
npm run dev
```

---

## ✅ Functionality Checklist

### Basic Functionality
- [ ] Can connect wallet (Linera Web Client)
- [ ] Can view available games
- [ ] Can create a new game
- [ ] Can join an existing game
- [ ] Can view game board
- [ ] Can make a move
- [ ] Move is validated
- [ ] Move is stored on-chain
- [ ] Can view move history
- [ ] Can resign a game

### GraphQL API
- [ ] GraphQL endpoint accessible
- [ ] Can query `getAvailableGames`
- [ ] Can query `getGame`
- [ ] Can query `getPlayerGames`
- [ ] Can mutate `createGame`
- [ ] Can mutate `joinGame`
- [ ] Can mutate `makeMove`
- [ ] Can mutate `resignGame`

**GraphQL Endpoint:**
```
http://localhost:8080/chains/YOUR_CHAIN_ID/applications/YOUR_APP_ID/graphql
```

---

## 🔍 Verification Checklist

### Testnet Conway Connection
- [ ] Wallet connected to Testnet Conway
- [ ] Faucet URL: `https://faucet.testnet-conway.linera.net`
- [ ] All operations use Testnet Conway
- [ ] No local network references

### On-Chain Verification
- [ ] Game state stored on-chain
- [ ] Moves persisted on blockchain
- [ ] Game history retrievable
- [ ] State updates correctly

### Performance
- [ ] App loads quickly
- [ ] Moves process in reasonable time
- [ ] No major performance issues
- [ ] UI is responsive

---

## 📝 Documentation Checklist

### Required Documentation
- [ ] README.md updated with deployment instructions
- [ ] Public GitHub repository
- [ ] Setup instructions clear
- [ ] Environment variables documented
- [ ] Troubleshooting guide included

### Submission Requirements
- [ ] Project name and description
- [ ] GitHub repo link
- [ ] Live demo URL (or local setup instructions)
- [ ] Linera SDK features documented
- [ ] Team member info
- [ ] Changelog (if resubmitting)

---

## 🎯 Wavehack Requirements

### Must Have
- [ ] ✅ Compiles and runs successfully
- [ ] ✅ Functional Linera contract
- [ ] ✅ Connected to Testnet Conway
- [ ] ✅ Live demo accessible
- [ ] ✅ GraphQL API working

### Should Have
- [ ] ✅ Well-documented code
- [ ] ✅ Clean UI/UX
- [ ] ✅ Error handling
- [ ] ✅ User-friendly wallet integration

---

## 🐛 Final Checks

### Before Submission
- [ ] Run `bash verify_deployment.sh` - all checks pass
- [ ] Test with multiple browsers
- [ ] Test with multiple wallets
- [ ] Test game creation and moves
- [ ] Verify all moves are on-chain
- [ ] Check for console errors
- [ ] Verify GraphQL queries work
- [ ] Test error scenarios

### Documentation Review
- [ ] README is clear and complete
- [ ] Deployment instructions work
- [ ] Troubleshooting guide helpful
- [ ] Code comments adequate

---

## 🎉 Ready for Submission!

If all items above are checked:

✅ **Your app is ready for Wavehack submission!**

### Submission Checklist:
- [ ] All functionality works
- [ ] Connected to Testnet Conway
- [ ] Documentation complete
- [ ] Demo ready (or instructions provided)
- [ ] GitHub repo public
- [ ] Team info included

**Good luck! 🚀**

---

## 📞 Need Help?

If you're stuck on any item:

1. Check **[WSL_DEPLOYMENT_GUIDE.md](WSL_DEPLOYMENT_GUIDE.md)**
2. Review troubleshooting sections
3. Run `bash verify_deployment.sh`
4. Check Linera Discord community
5. Review Linera docs: https://linera.dev
