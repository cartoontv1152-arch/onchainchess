# 🚀 Complete WSL Deployment Guide - Testnet Conway

**Step-by-step guide to deploy OnChain Chess on Linera Testnet Conway using WSL**

---

## 📋 Prerequisites

Before starting, ensure you have:

- ✅ **WSL 2** installed and running (Ubuntu recommended)
- ✅ **Rust** installed (`rustc --version` should work)
- ✅ **Linera CLI** installed (`linera --version` should show v0.16.0)
- ✅ **Node.js** v16+ installed (`node --version`)
- ✅ **WASM target** installed (`rustup target add wasm32-unknown-unknown`)

---

## 🔧 Step 1: Open WSL Terminal

1. Open **Windows Terminal** or **PowerShell**
2. Type: `wsl`
3. Navigate to your project:
   ```bash
   cd /mnt/c/Users/parth/Desktop/onchainchess
   ```

---

## 🏗️ Step 2: Set Up Workspace (IMPORTANT!)

Your project uses workspace dependencies. You have two options:

### Option A: Use Linera Workspace (Recommended)

If you have the `linera-protocol` repository cloned:

```bash
# Navigate to linera-protocol directory
cd ~/linera-protocol

# Copy your project into the examples directory
cp -r /mnt/c/Users/parth/Desktop/onchainchess examples/onchainchess

# Navigate to your project
cd examples/onchainchess

# Build from workspace
cargo build --release --target wasm32-unknown-unknown
```

### Option B: Standalone Build (If Option A doesn't work)

We'll need to modify `Cargo.toml` to use explicit versions. See `Cargo.toml.standalone` (we'll create this).

---

## 🔨 Step 3: Build the Contract

```bash
# Make sure you're in the project directory
cd /mnt/c/Users/parth/Desktop/onchainchess

# Build for WebAssembly
cargo build --release --target wasm32-unknown-unknown
```

**⏱️ First build takes 5-10 minutes!**

**Expected output:**
```
   Compiling onchainchess v0.1.0
   ...
   Finished release [optimized] target(s) in Xm Xs
```

**Verify build:**
```bash
ls -la target/wasm32-unknown-unknown/release/onchainchess_*.wasm
```

You should see:
- `onchainchess_contract.wasm`
- `onchainchess_service.wasm`

---

## 🌐 Step 4: Set Up Wallet for Testnet Conway

```bash
# Set environment variables
export LINERA_WALLET="$HOME/.config/linera/wallet.json"
export LINERA_KEYSTORE="$HOME/.config/linera/keystore.json"
export LINERA_STORAGE="rocksdb:$HOME/.config/linera/wallet.db"

# Create config directory
mkdir -p "$HOME/.config/linera"

# Initialize wallet with Testnet Conway faucet
linera wallet init --faucet https://faucet.testnet-conway.linera.net

# Request a chain from Testnet Conway
linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net
```

**Save the output!** You'll need:
- **Chain ID** (starts with `e...`)
- **Owner ID** (starts with `0x...`)

---

## 📦 Step 5: Publish Modules to Testnet Conway

```bash
# Publish both contract and service modules
linera publish-module \
    target/wasm32-unknown-unknown/release/onchainchess_contract.wasm \
    target/wasm32-unknown-unknown/release/onchainchess_service.wasm \
    --json-argument '{}'
```

**Save the Module ID!** (starts with `e...`)

---

## 🎮 Step 6: Create Application

```bash
# Replace MODULE_ID and CHAIN_ID with your values
MODULE_ID="e..."  # From Step 5
CHAIN_ID="e..."   # From Step 4

# Create the application
linera create-application "$MODULE_ID" "$CHAIN_ID" --json-argument '{}'
```

**Save the Application ID!** (starts with `e...`)

---

## 🚀 Step 7: Start Linera Service

**Keep this terminal open!**

```bash
# Start the service on port 8080
linera service --port 8080
```

You should see:
```
Listening on http://127.0.0.1:8080
```

**✅ Service is running!** Leave this terminal open.

---

## 💻 Step 8: Set Up Frontend

**Open a NEW WSL terminal:**

```bash
# Navigate to frontend directory
cd /mnt/c/Users/parth/Desktop/onchainchess/web-frontend

# Install dependencies
npm install

# Create .env file with your deployment info
cat > .env << EOF
VITE_CHAIN_ID=YOUR_CHAIN_ID_HERE
VITE_APP_ID=YOUR_APP_ID_HERE
VITE_OWNER_ID=YOUR_OWNER_ID_HERE
VITE_PORT=8080
VITE_HOST=localhost
EOF

# Replace the values above with your actual IDs from Steps 4-6
```

**Edit `.env` file:**
```bash
nano .env
# Or use: code .env (if VS Code is available)
```

Update with your actual values:
```env
VITE_CHAIN_ID=e1234567890abcdef...
VITE_APP_ID=e9876543210fedcba...
VITE_OWNER_ID=0x1234567890abcdef...
VITE_PORT=8080
VITE_HOST=localhost
```

---

## 🌐 Step 9: Start Frontend Development Server

```bash
# Still in web-frontend directory
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
```

---

## ✅ Step 10: Access Your Application

### Option A: Using .env file
Open browser: **http://localhost:3000/**

### Option B: Using URL parameters
Open browser: **http://localhost:3000/YOUR_CHAIN_ID?app=YOUR_APP_ID&owner=YOUR_OWNER_ID&port=8080**

---

## 🔍 Step 11: Verify Testnet Conway Connection

### Check 1: Service is Running
```bash
# In another terminal
curl http://localhost:8080/chains/YOUR_CHAIN_ID/applications/YOUR_APP_ID
```

Should return JSON data.

### Check 2: GraphQL Endpoint
Open: **http://localhost:8080/chains/YOUR_CHAIN_ID/applications/YOUR_APP_ID/graphql**

Should show GraphQL playground.

### Check 3: Test Query
In GraphQL playground, try:
```graphql
query {
  getAvailableGames {
    gameId
    whitePlayer
    status
  }
}
```

---

## 🎮 Step 12: Play Chess!

1. **Connect Wallet**: Click "Connect Web Client" (no installation needed!)
2. **Create Game**: Click "+ Create New Game"
3. **Join Game**: Browse available games and click "Join"
4. **Make Moves**: Click and drag pieces to make moves
5. **View History**: See move history in the sidebar

---

## 🐛 Troubleshooting

### Build Errors

**Error: "cannot find crate"**
```bash
# Make sure you're in a Linera workspace or use standalone Cargo.toml
# See Step 2
```

**Error: "target wasm32-unknown-unknown not found"**
```bash
rustup target add wasm32-unknown-unknown
```

### Deployment Errors

**Error: "Failed to publish module"**
- Check you're connected to Testnet Conway
- Verify WASM files exist
- Check network connection

**Error: "Failed to create application"**
- Verify Module ID is correct
- Check Chain ID is valid
- Ensure wallet has tokens (request from faucet)

### Connection Errors

**Frontend can't connect to service**
- Verify `linera service` is running on port 8080
- Check `.env` file has correct values
- Try accessing GraphQL endpoint directly

**GraphQL queries fail**
- Check service logs for errors
- Verify application ID is correct
- Ensure chain ID matches

---

## 📝 Quick Reference

### Save These Values!

After deployment, save these in `DEPLOYMENT_INFO.txt`:

```
Chain ID: e...
Application ID: e...
Owner ID: 0x...
Module ID: e...
```

### Common Commands

```bash
# Check wallet
linera wallet show

# Check service status
curl http://localhost:8080/chains/YOUR_CHAIN_ID

# View logs
# Check the terminal where linera service is running
```

---

## ✅ Verification Checklist

- [ ] Contract builds successfully
- [ ] Service WASM file exists
- [ ] Wallet initialized with Testnet Conway
- [ ] Chain ID obtained
- [ ] Modules published successfully
- [ ] Application created successfully
- [ ] Linera service running on port 8080
- [ ] Frontend .env file configured
- [ ] Frontend dev server running
- [ ] Can access application in browser
- [ ] GraphQL endpoint accessible
- [ ] Can create a game
- [ ] Can make moves

---

## 🎉 Success!

If all steps complete successfully, your OnChain Chess app is now deployed on Linera Testnet Conway!

**For Wavehack submission:**
- ✅ App compiles and runs
- ✅ Connected to Testnet Conway
- ✅ Functional Linera contract
- ✅ Live demo URL ready

---

## 📚 Additional Resources

- [Linera Developer Docs](https://linera.dev)
- [Testnet Conway Faucet](https://faucet.testnet-conway.linera.net)
- [Linera Discord](https://discord.gg/linera)

---

**Need help?** Check the troubleshooting section or reach out to the Linera community!
