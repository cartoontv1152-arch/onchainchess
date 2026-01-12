# 🎯 START HERE - Complete Setup Guide

**Welcome! Follow these guides in order to get your chess game running on Testnet Conway.**

---

## 📚 Guide Order (Follow This!)

### 1️⃣ **[STEP_BY_STEP_SETUP.md](STEP_BY_STEP_SETUP.md)** ⭐ **START HERE!**

**Complete step-by-step guide:**
- ✅ Prerequisites check
- ✅ Backend build
- ✅ Deploy to Testnet Conway
- ✅ Start service
- ✅ Setup frontend
- ✅ Connect Linera Web Client
- ✅ Verify Testnet Conway connection
- ✅ Understand GraphQL
- ✅ Play chess!
- ✅ Troubleshooting

**⏱️ Time: 30-60 minutes**

---

### 2️⃣ **[VERIFY_TESTNET_CONWAY.md](VERIFY_TESTNET_CONWAY.md)** - Verify Connection

**How to verify you're connected:**
- ✅ Browser console check
- ✅ Network tab check
- ✅ Chain ID verification
- ✅ GraphQL endpoint check
- ✅ Query application directly

**⏱️ Time: 5 minutes**

---

### 3️⃣ **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick Commands

**Quick reference for:**
- ✅ All commands in one place
- ✅ Verification commands
- ✅ Common issues
- ✅ GraphQL operations

**⏱️ Time: 2 minutes to read**

---

## 🚀 Quick Start (If You're Experienced)

**If you already know Linera, here's the quick version:**

```powershell
# 1. Build backend
cd onchainchess
cargo build --release --target wasm32-unknown-unknown

# 2. Deploy to Testnet Conway
$env:LINERA_WALLET = "$HOME\.config\wallet.json"
$env:LINERA_KEYSTORE = "$HOME\.config\keystore.json"
$env:LINERA_STORAGE = "rocksdb:$HOME\.config\wallet.db"
linera wallet init --faucet https://faucet.testnet-conway.linera.net
linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net
$MODULE_ID = linera publish-module target/wasm32-unknown-unknown/release/onchainchess_contract.wasm target/wasm32-unknown-unknown/release/onchainchess_service.wasm
$CHAIN_ID = linera wallet show | Select-String -Pattern 'e[0-9a-f]{63}' | Select-Object -First 1 -ExpandProperty Matches | Select-Object -ExpandProperty Value
$APP_ID = linera create-application "$MODULE_ID" "$CHAIN_ID" --json-argument '{}'

# 3. Start service (keep running)
linera service --port 8080

# 4. Setup frontend (new terminal)
cd onchainchess\web-frontend
npm install
# Create .env file with Chain ID, App ID, Owner ID
npm run dev

# 5. Connect wallet
# Open http://localhost:3000
# Click "Connect Web Client"
```

---

## 📋 What You'll Need

### Before Starting:

- [ ] Rust installed (1.70+)
- [ ] Node.js installed (v16+)
- [ ] Linera SDK installed (0.15.7)
- [ ] WASM target installed
- [ ] Internet connection (for Testnet Conway)

### During Setup:

- [ ] Chain ID (from wallet initialization)
- [ ] Application ID (from application creation)
- [ ] Owner ID (from wallet initialization)

**📝 Save these values - you'll need them for .env file!**

---

## ✅ Success Checklist

**You're ready when:**

- [ ] Backend built successfully
- [ ] Deployed to Testnet Conway
- [ ] Service running on port 8080
- [ ] Frontend running on port 3000
- [ ] Wallet connected (Linera Web Client)
- [ ] Console shows "testnet-conway"
- [ ] Can create games
- [ ] Can make moves
- [ ] Moves stored on-chain

---

## 🐛 Having Issues?

**Check these guides:**

1. **[STEP_BY_STEP_SETUP.md](STEP_BY_STEP_SETUP.md)** - Step 12: Troubleshooting
2. **[COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)** - Extensive troubleshooting
3. **[VERIFY_TESTNET_CONWAY.md](VERIFY_TESTNET_CONWAY.md)** - Verify connection

**Or check:**
- Browser console (F12) for errors
- Service terminal for logs
- Network tab for request details

---

## 🎯 For Wavehack Submission

**Requirements:**
- ✅ Compiles successfully
- ✅ Connects to Testnet Conway
- ✅ Functional Linera contract
- ✅ Live demo ready
- ✅ Uses Linera Web Client (preferred)

**All covered in the guides above!**

---

## 📞 Need Help?

**Documentation files:**
- `STEP_BY_STEP_SETUP.md` - Complete setup guide
- `COMPLETE_SETUP_GUIDE.md` - Detailed guide
- `VERIFY_TESTNET_CONWAY.md` - Verification guide
- `QUICK_REFERENCE.md` - Quick commands
- `WALLET_SETUP_GUIDE.md` - Wallet details
- `DEPLOYMENT.md` - Deployment guide

**Start with `STEP_BY_STEP_SETUP.md` and follow it step by step!**

---

**🎮 Ready to start? Open `STEP_BY_STEP_SETUP.md` and follow the steps!** ♟️🚀
