# 🎯 Step-by-Step Setup Guide - Linera Web Client

**Complete guide from zero to playing chess on Testnet Conway!**

---

## 📋 Quick Overview

**What you'll do:**
1. ✅ Install prerequisites (Rust, Node.js, Linera SDK)
2. ✅ Build backend (Rust → WASM)
3. ✅ Deploy to Testnet Conway
4. ✅ Start Linera service
5. ✅ Setup frontend
6. ✅ Connect Linera Web Client
7. ✅ Verify Testnet Conway connection
8. ✅ Play chess!

**Time needed:** 30-60 minutes (first time)

---

## 🔧 STEP 1: Prerequisites

### 1.1 Check Rust

**Open PowerShell or Terminal:**

```powershell
rustc --version
```

**Expected:** `rustc 1.70.0` or higher

**If not installed:**
- Visit: https://rustup.rs
- Download and run installer
- Or: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

### 1.2 Check Node.js

```powershell
node --version
```

**Expected:** `v16.0.0` or higher

**If not installed:**
- Visit: https://nodejs.org
- Download LTS version
- Install

### 1.3 Check Linera SDK

```powershell
linera --version
```

**Expected:** `linera 0.15.7` or compatible

**If not installed:**
```powershell
cargo install --locked linera-service@0.15.7 linera-storage-service@0.15.7
```

**⏱️ This takes 10-20 minutes!**

### 1.4 Install WASM Target

```powershell
rustup target add wasm32-unknown-unknown
```

**✅ Checklist:**
- [ ] Rust installed
- [ ] Node.js installed
- [ ] Linera SDK installed
- [ ] WASM target installed

---

## 🏗️ STEP 2: Build Backend

### 2.1 Navigate to Project

```powershell
cd onchainchess
```

### 2.2 Build for WebAssembly

```powershell
cargo build --release --target wasm32-unknown-unknown
```

**⏱️ First build: 5-10 minutes**

**Expected output:**
```
   Compiling onchainchess v0.1.0 (...)
   ...
   Finished release [optimized] target(s) in Xm Xs
```

### 2.3 Verify Build

```powershell
# Check WASM files exist
ls target/wasm32-unknown-unknown/release/onchainchess_*.wasm
```

**Should see:**
- `onchainchess_contract.wasm`
- `onchainchess_service.wasm`

**✅ Checklist:**
- [ ] Build completed
- [ ] Both WASM files exist
- [ ] No errors

---

## 🌐 STEP 3: Deploy to Testnet Conway

### 3.1 Set Environment Variables

**PowerShell:**
```powershell
$env:LINERA_WALLET = "$HOME\.config\wallet.json"
$env:LINERA_KEYSTORE = "$HOME\.config\keystore.json"
$env:LINERA_STORAGE = "rocksdb:$HOME\.config\wallet.db"

# Create config directory
New-Item -ItemType Directory -Force -Path "$HOME\.config"
```

**Linux/Mac/WSL:**
```bash
export LINERA_WALLET="$HOME/.config/wallet.json"
export LINERA_KEYSTORE="$HOME/.config/keystore.json"
export LINERA_STORAGE="rocksdb:$HOME/.config/wallet.db"
mkdir -p ~/.config
```

### 3.2 Initialize Wallet

```powershell
linera wallet init --faucet https://faucet.testnet-conway.linera.net
```

**Expected output:**
```
Wallet created successfully!
Chain ID: e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a650
Owner ID: 0x1234567890abcdef1234567890abcdef12345678
```

**📝 SAVE THESE VALUES!**

### 3.3 Request Chain

```powershell
linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net
```

**Expected output:**
```
Chain requested successfully!
Chain ID: e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a650
```

**📝 SAVE THE CHAIN ID!**

### 3.4 Verify Wallet

```powershell
linera wallet show
```

**Should show Chain ID and Owner ID**

### 3.5 Publish Modules

```powershell
# Get Module ID
$MODULE_ID = linera publish-module `
    target/wasm32-unknown-unknown/release/onchainchess_contract.wasm `
    target/wasm32-unknown-unknown/release/onchainchess_service.wasm

# Display Module ID
Write-Host "Module ID: $MODULE_ID"
```

**📝 SAVE THE MODULE ID!**

### 3.6 Create Application

```powershell
# Get Chain ID
$CHAIN_ID = linera wallet show | Select-String -Pattern 'e[0-9a-f]{63}' | Select-Object -First 1 -ExpandProperty Matches | Select-Object -ExpandProperty Value

# Create application
$APP_ID = linera create-application "$MODULE_ID" "$CHAIN_ID" --json-argument '{}'

# Display Application ID
Write-Host "Application ID: $APP_ID"
```

**📝 SAVE THE APPLICATION ID!**

### 3.7 Verify Deployment

```powershell
linera query-application "$APP_ID" "$CHAIN_ID"
```

**Should return application state (even if empty)**

**✅ Checklist:**
- [ ] Wallet initialized
- [ ] Chain requested
- [ ] Modules published
- [ ] Application created
- [ ] Query works

---

## 🖥️ STEP 4: Start Linera Service

### 4.1 Start Service

**IMPORTANT:** Keep this terminal open!

```powershell
# Make sure environment variables are set (from Step 3.1)
linera service --port 8080
```

**Expected output:**
```
Linera service starting...
Listening on http://localhost:8080
Ready to accept connections
```

**✅ Service is running when you see "Listening"**

### 4.2 Verify Service

**Open NEW terminal:**

```powershell
curl http://localhost:8080
```

**Should return response (even if error, service is running)**

**✅ Checklist:**
- [ ] Service started
- [ ] Shows "Listening on http://localhost:8080"
- [ ] Can curl endpoint

---

## 🎨 STEP 5: Setup Frontend

### 5.1 Navigate to Frontend

**Open NEW terminal (keep service running!):**

```powershell
cd onchainchess\web-frontend
```

### 5.2 Install Dependencies

```powershell
npm install
```

**⏱️ This takes 2-5 minutes**

**Expected output:**
```
added 234 packages in 2m
```

### 5.3 Create .env File

**Create file:** `onchainchess\web-frontend\.env`

**Content:**
```env
VITE_CHAIN_ID=YOUR_CHAIN_ID_HERE
VITE_APP_ID=YOUR_APP_ID_HERE
VITE_OWNER_ID=YOUR_OWNER_ID_HERE
VITE_PORT=8080
VITE_HOST=localhost
```

**Replace with your actual values from Step 3:**
- `YOUR_CHAIN_ID_HERE` → Your Chain ID (64 hex characters)
- `YOUR_APP_ID_HERE` → Your Application ID (64 hex characters)
- `YOUR_OWNER_ID_HERE` → Your Owner ID (0x + 40 hex characters)

**Example:**
```env
VITE_CHAIN_ID=e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a650
VITE_APP_ID=e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a650
VITE_OWNER_ID=0x1234567890abcdef1234567890abcdef12345678
VITE_PORT=8080
VITE_HOST=localhost
```

**✅ Checklist:**
- [ ] npm install completed
- [ ] .env file created
- [ ] All values filled correctly

---

## 🔧 STEP 6: Build Frontend

### 6.1 Build

```powershell
npm run build
```

**Expected output:**
```
vite v5.x.x building for production...
✓ built in Xs
```

### 6.2 Check for Errors

**If build succeeds:** ✅ Build successful!

**If build fails:** Check errors and fix (see Troubleshooting section)

**✅ Checklist:**
- [ ] Build completed
- [ ] No errors
- [ ] Build directory created

---

## 🚀 STEP 7: Start Frontend

### 7.1 Start Dev Server

```powershell
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:3000/
```

### 7.2 Open Browser

**Go to:** `http://localhost:3000`

**✅ Checklist:**
- [ ] Dev server started
- [ ] Can access http://localhost:3000
- [ ] Page loads

---

## 🔗 STEP 8: Connect Linera Web Client

### 8.1 Open Browser

**Go to:** `http://localhost:3000`

### 8.2 Find Wallet Selector

**You'll see:**
```
┌─────────────────────────────────────┐
│  Welcome to OnChain Chess!         │
│                                     │
│  Connect your wallet:               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Linera Web Client           │   │
│  │ ✅ Available                │   │
│  │                             │   │
│  │ [Connect Web Client] ← Click│   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

### 8.3 Click "Connect Web Client"

**What happens:**
1. Browser console shows: "🔗 Initializing Linera Web Client..."
2. Then: "✅ Linera WASM modules initialized"
3. Then: "✅ Linera wallet created successfully!"
4. Then: "✅ Linera Web Client connected successfully!"

**⏱️ Wait 5-10 seconds**

### 8.4 Verify Connection

**Check UI:**
- Account address shown in header
- "Create New Game" button enabled
- No "Connect Wallet" message

**Check Browser Console (F12):**
```javascript
// Should see:
✅ Linera WASM modules initialized
✅ Linera wallet created successfully!
✅ Linera Web Client connected successfully!
```

**✅ Checklist:**
- [ ] Clicked "Connect Web Client"
- [ ] Waited 5-10 seconds
- [ ] Account address shown
- [ ] Console shows success messages

---

## ✅ STEP 9: Verify Testnet Conway Connection

### 9.1 Check Browser Console

**Open Browser Console (F12):**

**Look for:**
```
✅ Connecting to: https://faucet.testnet-conway.linera.net
✅ Linera Web Client connected successfully!
✅ Chain ID: e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a650
```

**✅ If you see "testnet-conway", you're connected!**

### 9.2 Check Network Tab

**Open DevTools → Network Tab:**

1. Filter by "testnet-conway"
2. Look for requests to:
   - `faucet.testnet-conway.linera.net`

**✅ If you see testnet-conway requests, you're connected!**

### 9.3 Verify Chain ID

**Check your Chain ID matches:**

1. **From wallet:** `linera wallet show` → Chain ID
2. **In browser:** Check .env file → VITE_CHAIN_ID
3. **They should match!**

**✅ If Chain IDs match, you're on the right chain!**

### 9.4 Test GraphQL

**In Browser Console:**
```javascript
// Open Network tab
// Make a move or create a game
// Look for GraphQL requests to:
// http://localhost:8080/chains/<CHAIN_ID>/applications/<APP_ID>

// If requests go to localhost:8080 with your Chain ID, you're connected!
```

**✅ Checklist:**
- [ ] Console shows "testnet-conway" URLs
- [ ] Network tab shows testnet-conway requests
- [ ] Chain ID matches wallet Chain ID
- [ ] GraphQL requests use correct Chain ID

---

## 🔍 STEP 10: Understand GraphQL

### What is GraphQL?

**GraphQL** connects your frontend to the Linera blockchain:
- **Queries**: Get data (games, moves, etc.)
- **Mutations**: Send data (create game, make move, etc.)

### GraphQL Endpoint

**Your endpoint:**
```
http://localhost:8080/chains/<CHAIN_ID>/applications/<APP_ID>
```

### Available Operations

#### Queries (Get Data):

1. **getGame(gameId)**
   - Get single game details
   - Returns: GameState

2. **getPlayerGames(player)**
   - Get all games for a player
   - Returns: Array of GameState

3. **getAvailableGames()**
   - Get games waiting for players
   - Returns: Array of GameState

#### Mutations (Send Data):

1. **createGame(creator)**
   - Create new game
   - Returns: CreateGameResponse

2. **joinGame(gameId, player)**
   - Join existing game
   - Returns: JoinGameResponse

3. **makeMove(gameId, player, chessMove)**
   - Make a chess move
   - Returns: MakeMoveResponse

4. **resignGame(gameId, player)**
   - Resign from game
   - Returns: ResignGameResponse

### How GraphQL Works

**Flow:**
```
User Action (click button)
    ↓
React Component calls hook
    ↓
GraphQL Mutation/Query
    ↓
Apollo Client sends request
    ↓
Linera Service receives
    ↓
Contract executes operation
    ↓
State updates on-chain
    ↓
GraphQL returns response
    ↓
React updates UI
```

### Test GraphQL

**Method 1: Network Tab**
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "applications"
4. Perform actions (create game, make move)
5. Click on requests to see details

**Method 2: Console Logging**
- App logs GraphQL operations to console
- Check console for query/mutation logs

**✅ Checklist:**
- [ ] Can see GraphQL requests in Network tab
- [ ] Requests go to correct endpoint
- [ ] Queries return data
- [ ] Mutations execute successfully

---

## 🎮 STEP 11: Play Chess!

### Create Your First Game

1. **Make sure wallet is connected** (Step 8)
2. **Click "+ Create New Game"** button
3. **Wait for confirmation** message
4. **Game appears** in "Your Games" section
5. **Click "View Game"** to see chess board

### Join a Game

1. **Look at "Available Games"** section
2. **Find a game** waiting for player
3. **Click "Join Game"** button
4. **Wait for confirmation**
5. **Game loads** with chess board

### Make Moves

1. **Wait for your turn** (indicator shows "Your turn")
2. **Click on a piece**
3. **Click on destination square**
4. **Move is sent** to blockchain
5. **Board updates** with new move
6. **Opponent's turn!**

### Verify Moves Are On-Chain

**Method 1: Check Move History**
- Move history sidebar shows all moves
- Each move is stored on-chain

**Method 2: Query Application**
```powershell
linera query-application "$APP_ID" "$CHAIN_ID"
# Should show game state with moves
```

**Method 3: Check Network Tab**
- Each move creates GraphQL mutation
- Check Network tab for requests
- Verify requests succeed

**✅ Checklist:**
- [ ] Can create game
- [ ] Can join game
- [ ] Can make moves
- [ ] Moves appear on board
- [ ] Move history updates
- [ ] Game state persists

---

## 🐛 STEP 12: Troubleshooting

### Common Issues

#### Issue 1: Build Fails

**Symptoms:** `cargo build` fails

**Solutions:**
1. Check Rust version: `rustc --version` (need 1.70+)
2. Update Rust: `rustup update stable`
3. Clean build: `cargo clean && cargo build`
4. Check dependencies in Cargo.toml

#### Issue 2: Service Won't Start

**Symptoms:** `linera service` fails

**Solutions:**
1. Check port: `netstat -ano | findstr :8080` (Windows)
2. Kill process using port
3. Use different port: `linera service --port 8081`
4. Check environment variables are set

#### Issue 3: Frontend Won't Build

**Symptoms:** `npm run build` fails

**Solutions:**
1. Delete node_modules: `Remove-Item -Recurse -Force node_modules`
2. Reinstall: `npm install`
3. Check package.json has all dependencies
4. Check for syntax errors

#### Issue 4: Wallet Won't Connect

**Symptoms:** "Failed to connect" error

**Solutions:**
1. Check browser console for errors
2. Clear browser cache
3. Refresh page
4. Check internet connection
5. Try different browser

#### Issue 5: Not Connected to Testnet Conway

**Symptoms:** No "testnet-conway" in console

**Solutions:**
1. Check .env file has correct Chain ID
2. Verify wallet initialized with Testnet Conway faucet
3. Check faucet URL: `https://faucet.testnet-conway.linera.net`
4. Restart frontend: Stop and restart `npm run dev`
5. Clear browser cache

#### Issue 6: GraphQL Errors

**Symptoms:** "Failed to fetch" errors

**Solutions:**
1. Check service is running: `curl http://localhost:8080`
2. Check Chain ID format (64 hex chars)
3. Check Application ID is correct
4. Check Network tab for request details

#### Issue 7: Can't Create Game

**Symptoms:** Button doesn't work

**Solutions:**
1. Make sure wallet is connected
2. Check account address is shown
3. Check browser console for errors
4. Try refreshing page
5. Reconnect wallet

#### Issue 8: Moves Not Working

**Symptoms:** Can't make moves

**Solutions:**
1. Check it's your turn
2. Check game status is "In Progress"
3. Check wallet is connected
4. Check browser console for errors
5. Check Network tab for GraphQL errors

### Debug Checklist

When something doesn't work:

1. **Check Browser Console (F12)**
   - Look for errors
   - Check warnings
   - Look for success messages

2. **Check Network Tab**
   - Look for failed requests
   - Check request URLs
   - Check response errors

3. **Check Service Logs**
   - Look at terminal running `linera service`
   - Check for errors
   - Check for connection logs

4. **Check Wallet State**
   - Verify wallet is connected
   - Check account address
   - Check Chain ID

5. **Verify Configuration**
   - Check .env file
   - Check environment variables
   - Check URLs are correct

---

## ✅ STEP 13: Final Verification

### Complete Checklist

#### Backend
- [ ] Build successful
- [ ] WASM files exist
- [ ] Modules published
- [ ] Application created
- [ ] Query works

#### Service
- [ ] Service running
- [ ] Port accessible
- [ ] GraphQL works
- [ ] No errors

#### Frontend
- [ ] Build successful
- [ ] Dev server running
- [ ] Page loads
- [ ] No console errors

#### Wallet
- [ ] Web Client connected
- [ ] Testnet Conway verified
- [ ] Chain ID matches
- [ ] Can create game

#### On-Chain
- [ ] Game created
- [ ] Game queryable
- [ ] Moves stored
- [ ] State updates
- [ ] GraphQL works

### Final Test Commands

```powershell
# 1. Check wallet
linera wallet show
# Should show Chain ID and Owner ID

# 2. Query application
linera query-application "$APP_ID" "$CHAIN_ID"
# Should return application state

# 3. Test GraphQL
curl -X POST http://localhost:8080/chains/$CHAIN_ID/applications/$APP_ID `
  -H "Content-Type: application/json" `
  -d '{\"query\": \"{ getAvailableGames { gameId } }\"}'
# Should return games array

# 4. Check service
curl http://localhost:8080
# Should return response
```

---

## 🎉 Success!

**You're ready when:**

1. ✅ Backend built and deployed
2. ✅ Service running and accessible
3. ✅ Frontend running
4. ✅ Wallet connected (Linera Web Client)
5. ✅ Connected to Testnet Conway
6. ✅ Can create games
7. ✅ Can make moves
8. ✅ Moves stored on-chain
9. ✅ GraphQL working
10. ✅ No errors anywhere

**🎮 Enjoy playing chess on the blockchain!**

---

## 📞 Need Help?

**Check these files:**
- `COMPLETE_SETUP_GUIDE.md` - Detailed guide
- `WALLET_FAQ.md` - Common questions
- `WALLET_SETUP_GUIDE.md` - Wallet setup
- `DEPLOYMENT.md` - Deployment guide
- `QUICK_START.md` - Quick reference

**Or check:**
- Browser console (F12) for errors
- Service terminal for logs
- Network tab for request details

---

**Follow these steps and your chess game will be running perfectly on Testnet Conway!** ♟️🚀
