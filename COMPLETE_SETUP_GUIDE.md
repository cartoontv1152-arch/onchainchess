# Complete Setup Guide - OnChain Chess with Linera Web Client

This is your **complete step-by-step guide** from zero to playing chess on Testnet Conway!

## 📋 Table of Contents

1. [Prerequisites Check](#prerequisites-check)
2. [Backend Setup (Rust)](#backend-setup-rust)
3. [Deploy to Testnet Conway](#deploy-to-testnet-conway)
4. [Frontend Setup](#frontend-setup)
5. [Build & Fix Errors](#build--fix-errors)
6. [Connect Linera Web Client](#connect-linera-web-client)
7. [Verify Testnet Conway Connection](#verify-testnet-conway-connection)
8. [Test GraphQL](#test-graphql)
9. [Play Chess](#play-chess)
10. [Troubleshooting](#troubleshooting)

---

## ✅ Step 1: Prerequisites Check

### Check Rust Installation

```bash
# Check Rust version
rustc --version
# Should show: rustc 1.70.0 or higher

# If not installed, install Rust:
# Visit: https://rustup.rs
# Or run: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Check Node.js Installation

```bash
# Check Node.js version
node --version
# Should show: v16.0.0 or higher

# If not installed, install Node.js:
# Visit: https://nodejs.org
```

### Check Linera SDK Installation

```bash
# Check Linera version
linera --version
# Should show: linera 0.15.7 or compatible

# If not installed:
cargo install --locked linera-service@0.15.7 linera-storage-service@0.15.7
```

### Check WASM Target

```bash
# Check if WASM target is installed
rustup target list | grep wasm32-unknown-unknown

# If not installed:
rustup target add wasm32-unknown-unknown
```

### ✅ Prerequisites Checklist

- [ ] Rust installed (1.70+)
- [ ] Node.js installed (v16+)
- [ ] Linera SDK installed (0.15.7)
- [ ] WASM target installed
- [ ] Git installed (for cloning)

---

## 🔨 Step 2: Backend Setup (Rust)

### Navigate to Project

```bash
# Navigate to chess project
cd onchainchess

# Verify you're in the right place
pwd
# Should show: .../onchainchess
```

### Check Project Structure

```bash
# List files
ls -la

# Should see:
# - Cargo.toml
# - src/
#   - lib.rs
#   - contract.rs
#   - service.rs
#   - state.rs
```

### Build the Backend

```bash
# Build for WebAssembly
cargo build --release --target wasm32-unknown-unknown
```

**Expected Output:**
```
   Compiling onchainchess v0.1.0 (...)
   ...
   Finished release [optimized] target(s) in Xm Xs
```

**⏱️ This takes 5-10 minutes first time!**

### Verify Build Success

```bash
# Check WASM files exist
ls -la target/wasm32-unknown-unknown/release/onchainchess_*.wasm

# Should see:
# - onchainchess_contract.wasm
# - onchainchess_service.wasm
```

### ✅ Build Checklist

- [ ] Build completed without errors
- [ ] `onchainchess_contract.wasm` exists
- [ ] `onchainchess_service.wasm` exists
- [ ] No compilation errors

### 🐛 Common Build Errors & Solutions

**Error: "cannot find crate"**
```bash
# Solution: Make sure you're in linera-protocol workspace
# Or add workspace dependencies to Cargo.toml
```

**Error: "target wasm32-unknown-unknown not found"**
```bash
# Solution:
rustup target add wasm32-unknown-unknown
```

**Error: "linker not found"**
```bash
# Solution (Windows):
# Install Visual Studio Build Tools
# Or use WSL (Windows Subsystem for Linux)
```

---

## 🌐 Step 3: Deploy to Testnet Conway

### Set Up Wallet Environment

**On Linux/Mac/WSL:**
```bash
# Set environment variables
export LINERA_WALLET="$HOME/.config/wallet.json"
export LINERA_KEYSTORE="$HOME/.config/keystore.json"
export LINERA_STORAGE="rocksdb:$HOME/.config/wallet.db"

# Create config directory
mkdir -p ~/.config
```

**On Windows PowerShell:**
```powershell
# Set environment variables
$env:LINERA_WALLET = "$HOME\.config\wallet.json"
$env:LINERA_KEYSTORE = "$HOME\.config\keystore.json"
$env:LINERA_STORAGE = "rocksdb:$HOME\.config\wallet.db"

# Create config directory
New-Item -ItemType Directory -Force -Path "$HOME\.config"
```

### Initialize Wallet for Testnet Conway

```bash
# Initialize wallet with Testnet Conway faucet
linera wallet init --faucet https://faucet.testnet-conway.linera.net
```

**Expected Output:**
```
Wallet created successfully!
Chain ID: 261223281dc0e6ffb21eb3a1dd79a4411841f632218863fb0b43b4ff3efcd176
Owner ID: Owner ID: 0x086641a76489e2d121e1ec0c89f657b0cd9a90be21c0cdcd8503e137cc19ad37

```

**📝 SAVE THESE VALUES!** You'll need them later.

### Request Chain from Testnet Conway

```bash
# Request a chain from Testnet Conway
linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net
```

**Expected Output:**
```
Chain requested successfully!
Chain ID: a6d6c1d979496dc04ca15f3a11e8d54c7cb41c06d9c5339d19af18db05b91bc9
Owner ID: 0xa8743b8c99aa8b59a279a08f6743a13d855442f245765650561f62cd05068c30
```

**📝 SAVE THESE VALUES AGAIN!**

### Verify Wallet Setup

```bash
# Show wallet information
linera wallet show
```

**Expected Output:**
```
Wallet: /path/to/wallet.json

Chain: e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a650
Owner: 0x1234567890abcdef1234567890abcdef12345678
```

**✅ Verify:**
- Chain ID is shown (64 hex characters)
- Owner ID is shown (0x + 40 hex characters)
- No errors

### Publish Modules to Testnet Conway

```bash
# Publish both contract and service modules
MODULE_ID=$(linera publish-module \
    target/wasm32-unknown-unknown/release/onchainchess_contract.wasm \
    target/wasm32-unknown-unknown/release/onchainchess_service.wasm)

# Display Module ID
echo "Module ID: $MODULE_ID"
```

**Expected Output:**
```
Modules published successfully!
Module ID: 586bf13574b4f0f3ecf865824f6894eef82d3c0bfe1bedb4ec03bf5a2478164c2b7792ade2707e0f18912c356b3b68bfb1764fb67b0c3a3fef66fe7babdda50500
```
586bf13574b4f0f3ecf865824f6894eef82d3c0bfe1bedb4ec03bf5a2478164c2b7792ade2707e0f18912c356b3b68bfb1764fb67b0c3a3fef66fe7babdda50500
**📝 SAVE THE MODULE ID!**

### Create Application on Testnet Conway
linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net




```bash
# Get your Chain ID (from wallet show)
# IMPORTANT: Use the DEFAULT chain ID from wallet show output
# The regex below may not work - manually set CHAIN_ID if needed
CHAIN_ID=$(linera wallet show | grep -A 1 "Tags:.*DEFAULT" | grep "Chain ID:" | awk '{print $3}')
# If that doesn't work, manually set it:
# CHAIN_ID=261223281dc0e6ffb21eb3a1dd79a4411841f632218863fb0b43b4ff3efcd176

# Verify CHAIN_ID is set
if [ -z "$CHAIN_ID" ]; then
    echo "ERROR: CHAIN_ID is empty! Set it manually from 'linera wallet show' output"
    exit 1
fi

echo "Using CHAIN_ID: $CHAIN_ID"

# Create application
APP_ID=$(linera create-application "$MODULE_ID" "$CHAIN_ID" --json-argument '{}')

# Display Application ID
echo "Application ID: $APP_ID"
```

**Expected Output:**
```
Application created successfully!
Application ID: e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a650
```

**📝 SAVE THE APPLICATION ID!**

### Verify Deployment

```bash
# Query your application
linera query-application "$APP_ID" "$CHAIN_ID"
```

**Expected Output:**
```
Application state: {...}
```

**✅ If you see application state (even if empty), deployment is successful!**

### ✅ Deployment Checklist

- [ ] Wallet initialized with Testnet Conway faucet
- [ ] Chain requested from Testnet Conway
- [ ] Modules published successfully
- [ ] Application created successfully
- [ ] Application query returns state

### 🐛 Common Deployment Errors & Solutions

**Error: "Faucet not responding"**
```bash
# Solution: Check internet connection
ping faucet.testnet-conway.linera.net

# Or try again (faucet might be busy)
linera wallet init --faucet https://faucet.testnet-conway.linera.net
```

**Error: "Module not found"**
```bash
# Solution: Check WASM files exist
ls -la target/wasm32-unknown-unknown/release/onchainchess_*.wasm

# Rebuild if needed
cargo build --release --target wasm32-unknown-unknown
```

**Error: "Chain not found"**
```bash
# Solution: Verify Chain ID
linera wallet show

# Make sure you're using the correct Chain ID
```

**Error: "Unknown opcode 252" or "Invalid Wasm module"**
```bash
# This error means WASM files are incompatible with Linera runtime
# Solution 1: Install wasm-opt and optimize WASM files

# Install wasm-opt (if not installed)
# On Ubuntu/Debian:
sudo apt-get install binaryen

# On Mac:
brew install binaryen

# Optimize WASM files
wasm-opt -Os target/wasm32-unknown-unknown/release/onchainchess_contract.wasm -o target/wasm32-unknown-unknown/release/onchainchess_contract_opt.wasm
wasm-opt -Os target/wasm32-unknown-unknown/release/onchainchess_service.wasm -o target/wasm32-unknown-unknown/release/onchainchess_service_opt.wasm

# Use optimized files for publishing
MODULE_ID=$(linera publish-module \
    target/wasm32-unknown-unknown/release/onchainchess_contract_opt.wasm \
    target/wasm32-unknown-unknown/release/onchainchess_service_opt.wasm)

# Solution 2: Rebuild with specific optimization
# Clean and rebuild
cargo clean
cargo build --release --target wasm32-unknown-unknown

# Solution 3: Check Rust version compatibility
rustc --version
# Linera 0.15.7 works best with Rust 1.70-1.78
# If you have Rust 1.79+, try downgrading:
rustup install 1.78.0
rustup default 1.78.0
cargo clean
cargo build --release --target wasm32-unknown-unknown
```

---

## 🖥️ Step 4: Start Linera Service

### Start Service (Terminal 1)

**IMPORTANT:** Keep this terminal open! Service must keep running.

```bash
# Make sure environment variables are set
export LINERA_WALLET="$HOME/.config/wallet.json"
export LINERA_KEYSTORE="$HOME/.config/keystore.json"
export LINERA_STORAGE="rocksdb:$HOME/.config/wallet.db"

# Start Linera service
linera service --port 8080
```

**Expected Output:**
```
Linera service starting...
Listening on http://localhost:8080
Ready to accept connections
```

**✅ Service is running when you see "Ready" or "Listening"**

### Verify Service is Running

**In a NEW terminal:**
```bash
# Test service endpoint
curl http://localhost:8080

# Should return some response (even if error, service is running)
```

**Or test GraphQL endpoint:**
```bash
curl http://localhost:8080/chains/$CHAIN_ID/applications/$APP_ID
```

**Expected:** Returns GraphQL response or error (but service is running)

### ✅ Service Checklist

- [ ] Service started without errors
- [ ] Shows "Listening on http://localhost:8080"
- [ ] Can curl the endpoint
- [ ] No port conflicts (8080 is free)

### 🐛 Common Service Errors & Solutions

**Error: "Port 8080 already in use"**
```bash
# Solution 1: Kill process using port 8080
# Linux/Mac:
lsof -ti:8080 | xargs kill -9

# Windows:
netstat -ano | findstr :8080
# Then kill the process ID shown

# Solution 2: Use different port
linera service --port 8081
# Then update frontend .env: VITE_PORT=8081
```

**Error: "Wallet not found"**
```bash
# Solution: Set environment variables
export LINERA_WALLET="$HOME/.config/wallet.json"
export LINERA_KEYSTORE="$HOME/.config/keystore.json"
export LINERA_STORAGE="rocksdb:$HOME/.config/wallet.db"
```

---

## 🎨 Step 5: Frontend Setup

### Navigate to Frontend

```bash
# Open NEW terminal (keep service running!)
cd onchainchess/web-frontend
```

### Install Dependencies

```bash
# Install all npm packages
npm install
```

**Expected Output:**
```
added 234 packages in 2m
```

**⏱️ This takes 2-5 minutes**

### Create .env File

```bash
# Create .env file with your deployment info
cat > .env << EOF
VITE_CHAIN_ID=YOUR_CHAIN_ID_HERE
VITE_APP_ID=YOUR_APP_ID_HERE
VITE_OWNER_ID=YOUR_OWNER_ID_HERE
VITE_PORT=8080
VITE_HOST=localhost
EOF
```

**Replace with your actual values:**
- `YOUR_CHAIN_ID_HERE` → Your Chain ID from Step 3
- `YOUR_APP_ID_HERE` → Your Application ID from Step 3
- `YOUR_OWNER_ID_HERE` → Your Owner ID from Step 3

**Example .env:**
```env
VITE_CHAIN_ID=e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a650
VITE_APP_ID=e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a650
VITE_OWNER_ID=0x1234567890abcdef1234567890abcdef12345678
VITE_PORT=8080
VITE_HOST=localhost
```

### Verify .env File

```bash
# Check .env file contents
cat .env

# Should show your values
```

### ✅ Frontend Setup Checklist

- [ ] npm install completed
- [ ] .env file created
- [ ] All values filled in correctly
- [ ] No typos in Chain ID, App ID, Owner ID

---

## 🔧 Step 6: Build & Fix Errors

### Build Frontend

```bash
# Build for production
npm run build
```

**Expected Output:**
```
vite v5.x.x building for production...
✓ built in Xs
```

### Check for Build Errors

**If build succeeds:**
```
✅ Build successful!
```

**If build fails:**
```
❌ Build failed - check errors below
```

### Common Build Errors & Fixes

#### Error 1: "Cannot find module"

**Error:**
```
Error: Cannot find module 'react-chessboard'
```

**Solution:**
```bash
# Install missing package
npm install react-chessboard

# Or reinstall all dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Error 2: "Module not found"

**Error:**
```
Error: Cannot resolve './components/ChessBoard'
```

**Solution:**
```bash
# Check file exists
ls -la src/components/ChessBoard.jsx

# If missing, check file was created correctly
# All component files should exist
```

#### Error 3: "Syntax Error"

**Error:**
```
SyntaxError: Unexpected token
```

**Solution:**
```bash
# Check file syntax
# Look at the error line number
# Fix syntax error in that file
```

#### Error 4: "TypeScript/Type Errors"

**Error:**
```
Type error: Property 'xxx' does not exist
```

**Solution:**
```bash
# Check TypeScript files
# Fix type definitions
# Or add @ts-ignore if needed (not recommended)
```

### Verify Build Output

```bash
# Check build directory
ls -la build/

# Should see:
# - index.html
# - assets/
#   - index-xxx.js
#   - index-xxx.css
```

### ✅ Build Checklist

- [ ] `npm run build` completed successfully
- [ ] No build errors
- [ ] Build directory created
- [ ] All files present

---

## 🚀 Step 7: Start Frontend Development Server

### Start Dev Server

```bash
# Start development server
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.x.x:3000/
```

### Access the Application

**Open browser and go to:**
```
http://localhost:3000
```

**Or with URL parameters:**
```
http://localhost:3000/<CHAIN_ID>?app=<APP_ID>&owner=<OWNER_ID>&port=8080
```

### ✅ Frontend Running Checklist

- [ ] `npm run dev` started successfully
- [ ] Shows "ready" message
- [ ] Can access http://localhost:3000
- [ ] Page loads (even if errors, page should load)

---

## 🔗 Step 8: Connect Linera Web Client

### Visual Guide

**What you'll see:**

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
│                                     │
│  Other wallet options below...      │
└─────────────────────────────────────┘
```

### Step-by-Step Connection

**Step 1:** Open browser to `http://localhost:3000`

**Step 2:** You'll see welcome screen with wallet options

**Step 3:** Find "Linera Web Client" section

**Step 4:** Click "Connect Web Client" button

**Step 5:** Wait 5-10 seconds

**What happens:**
- Browser console shows: "🔗 Initializing Linera Web Client..."
- Then: "✅ Linera WASM modules initialized"
- Then: "✅ Linera Web Client connected successfully!"

**Step 6:** You'll see your account address in header

**Expected Result:**
```
┌─────────────────────────────────────┐
│  ♟️ OnChain Chess                   │
│  0x1234...5678  ← Your address!    │
│                                     │
│  [+ Create New Game]               │
└─────────────────────────────────────┘
```

### Verify Connection

**Check Browser Console (F12):**
```javascript
// Should see:
✅ Linera WASM modules initialized
✅ Linera wallet created successfully!
✅ Linera Web Client connected successfully!
```

**Check UI:**
- Account address shown in header
- "Create New Game" button enabled
- No "Connect Wallet" message

### ✅ Connection Checklist

- [ ] Clicked "Connect Web Client"
- [ ] Waited 5-10 seconds
- [ ] Account address shown
- [ ] Console shows success messages
- [ ] Can see "Create New Game" button

### 🐛 Connection Errors & Solutions

**Error: "Failed to initialize WASM"**
```bash
# Solution: Check browser console for details
# Make sure @linera/client is installed
npm install @linera/client

# Clear browser cache and reload
```

**Error: "Storage already initialized"**
```
# This is OK! Just a warning
# Connection should still work
```

**Error: "Failed to connect"**
```bash
# Solution 1: Check internet connection
# Solution 2: Check Testnet Conway is accessible
curl https://faucet.testnet-conway.linera.net

# Solution 3: Try refreshing page
# Solution 4: Check browser console for details
```

---

## ✅ Step 9: Verify Testnet Conway Connection

### Method 1: Check Browser Console

**Open Browser Console (F12):**

Look for these messages:
```
✅ Connecting to: https://faucet.testnet-conway.linera.net
✅ Linera Web Client connected successfully!
✅ Chain ID: e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a650
```

**✅ If you see Testnet Conway URL, you're connected!**

### Method 2: Check Network Tab

**Open Browser DevTools → Network Tab:**

1. Filter by "testnet-conway"
2. Look for requests to:
   - `faucet.testnet-conway.linera.net`
   - Any requests containing "testnet-conway"

**✅ If you see testnet-conway requests, you're connected!**

### Method 3: Check Wallet State

**In Browser Console:**
```javascript
// Check wallet connection
// The app should show your account address
// If address starts with 0x and is 42 characters, wallet is connected
```

### Method 4: Verify Chain ID

**Check your Chain ID matches:**

1. **From wallet:** `linera wallet show` → Chain ID
2. **In browser:** Check URL or .env file → VITE_CHAIN_ID
3. **They should match!**

**✅ If Chain IDs match, you're on the right chain!**

### Method 5: Test GraphQL Query

**In Browser Console:**
```javascript
// Open Network tab
// Make a move or create a game
// Look for GraphQL requests to:
// http://localhost:8080/chains/<CHAIN_ID>/applications/<APP_ID>

// If requests go to localhost:8080 with your Chain ID, you're connected!
```

### Method 6: Query Application Directly

**In Terminal:**
```bash
# Query your application
linera query-application "$APP_ID" "$CHAIN_ID"

# Should return application state
# If it works, you're on Testnet Conway!
```

### ✅ Testnet Conway Verification Checklist

- [ ] Browser console shows "testnet-conway" URLs
- [ ] Network tab shows testnet-conway requests
- [ ] Chain ID matches wallet Chain ID
- [ ] GraphQL requests use correct Chain ID
- [ ] `linera query-application` works
- [ ] Account address is shown

### 🐛 Not Connected to Testnet Conway?

**Symptoms:**
- No "testnet-conway" in console
- Requests to localhost only
- Wrong Chain ID

**Solutions:**
1. **Check .env file** - Make sure VITE_CHAIN_ID is correct
2. **Check wallet** - Make sure wallet initialized with Testnet Conway faucet
3. **Check service** - Make sure service is running
4. **Restart frontend** - Stop and restart `npm run dev`
5. **Clear cache** - Clear browser cache and reload

---

## 🔍 Step 10: Test GraphQL

### What is GraphQL?

**GraphQL** is the API that connects your frontend to the Linera blockchain:
- **Queries**: Get data (games, moves, etc.)
- **Mutations**: Send data (create game, make move, etc.)
- **Subscriptions**: Real-time updates (not implemented yet)

### GraphQL Endpoint

**Your GraphQL endpoint:**
```
http://localhost:8080/chains/<CHAIN_ID>/applications/<APP_ID>
```

**Example:**
```
http://localhost:8080/chains/e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a650/applications/e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a650
```

### Test GraphQL Queries

#### Test 1: Get Available Games

**In Browser Console (F12):**
```javascript
// Open Network tab
// Create a game or refresh page
// Look for POST request to GraphQL endpoint
// Click on it → Preview or Response tab
```

**Or use curl:**
```bash
curl -X POST http://localhost:8080/chains/$CHAIN_ID/applications/$APP_ID \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ getAvailableGames { gameId whitePlayer blackPlayer status } }"
  }'
```

**Expected Response:**
```json
{
  "data": {
    "getAvailableGames": [
      {
        "gameId": 1,
        "whitePlayer": "0x1234...",
        "blackPlayer": null,
        "status": "WaitingForPlayer"
      }
    ]
  }
}
```

#### Test 2: Create Game (Mutation)

**In Browser:**
1. Click "Create New Game"
2. Open Network tab
3. Find POST request
4. Check request payload

**Expected Request:**
```json
{
  "query": "mutation CreateGame($creator: AccountOwner!) { createGame(creator: $creator) { success message gameId } }",
  "variables": {
    "creator": "0x1234567890abcdef1234567890abcdef12345678"
  }
}
```

**Expected Response:**
```json
{
  "data": {
    "createGame": {
      "success": true,
      "message": "Game creation scheduled",
      "gameId": null
    }
  }
}
```

#### Test 3: Get Game

**In Browser Console:**
```javascript
// After creating a game, check Network tab
// Look for query to get game details
```

**Or use curl:**
```bash
curl -X POST http://localhost:8080/chains/$CHAIN_ID/applications/$APP_ID \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ getGame(gameId: 1) { gameId whitePlayer blackPlayer status board } }"
  }'
```

### GraphQL Operations Available

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

### How GraphQL Works in the App

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

### Test GraphQL in Browser

**Method 1: Network Tab**
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "applications"
4. Perform actions (create game, make move)
5. Click on requests to see details

**Method 2: GraphQL Playground (if available)**
- Some setups have GraphQL playground
- Access at: `http://localhost:8080/chains/<CHAIN_ID>/applications/<APP_ID>`
- Use browser to test queries

**Method 3: Console Logging**
- App logs GraphQL operations to console
- Check console for query/mutation logs

### ✅ GraphQL Checklist

- [ ] Can see GraphQL requests in Network tab
- [ ] Requests go to correct endpoint
- [ ] Queries return data
- [ ] Mutations execute successfully
- [ ] No GraphQL errors in console

### 🐛 GraphQL Errors & Solutions

**Error: "Failed to fetch"**
```bash
# Solution: Check Linera service is running
curl http://localhost:8080

# If not running, start it:
linera service --port 8080
```

**Error: "Invalid chainId format"**
```bash
# Solution: Check Chain ID is 64 hex characters
echo $CHAIN_ID | wc -c
# Should be 64

# Check .env file has correct Chain ID
```

**Error: "Application not found"**
```bash
# Solution: Verify Application ID is correct
linera query-application "$APP_ID" "$CHAIN_ID"

# If fails, recreate application
```

---

## 🎮 Step 11: Play Chess!

### Create Your First Game

**Step 1:** Make sure wallet is connected (see Step 8)

**Step 2:** Click "+ Create New Game" button

**Step 3:** Wait for confirmation message

**Step 4:** Game appears in "Your Games" section

**Step 5:** Click "View Game" to see chess board

### Join a Game

**Step 1:** Look at "Available Games" section

**Step 2:** Find a game waiting for player

**Step 3:** Click "Join Game" button

**Step 4:** Wait for confirmation

**Step 5:** Game loads with chess board

### Make Moves

**Step 1:** Wait for your turn (indicator shows "Your turn")

**Step 2:** Click on a piece

**Step 3:** Click on destination square

**Step 4:** Move is sent to blockchain

**Step 5:** Board updates with new move

**Step 6:** Opponent's turn!

### Verify Moves Are On-Chain

**Method 1: Check Move History**
- Move history sidebar shows all moves
- Each move is stored on-chain

**Method 2: Query Application**
```bash
linera query-application "$APP_ID" "$CHAIN_ID"
# Should show game state with moves
```

**Method 3: Check Network Tab**
- Each move creates GraphQL mutation
- Check Network tab for requests
- Verify requests succeed

### ✅ Playing Checklist

- [ ] Can create game
- [ ] Can join game
- [ ] Can make moves
- [ ] Moves appear on board
- [ ] Move history updates
- [ ] Game state persists

---

## 🔍 Step 12: Verify Everything is On-Chain

### Complete Verification Checklist

#### ✅ Backend Verification

- [ ] **Build successful**: `cargo build` completed
- [ ] **WASM files exist**: Both contract and service
- [ ] **Modules published**: Have Module ID
- [ ] **Application created**: Have Application ID
- [ ] **Query works**: `linera query-application` returns data

#### ✅ Service Verification

- [ ] **Service running**: `linera service` shows "Listening"
- [ ] **Port accessible**: Can curl `http://localhost:8080`
- [ ] **GraphQL works**: Can query endpoint
- [ ] **No errors**: Service logs show no errors

#### ✅ Frontend Verification

- [ ] **Build successful**: `npm run build` completed
- [ ] **Dev server running**: `npm run dev` shows "ready"
- [ ] **Page loads**: Can access `http://localhost:3000`
- [ ] **No console errors**: Browser console clean

#### ✅ Wallet Verification

- [ ] **Web Client connected**: Account address shown
- [ ] **Testnet Conway**: Console shows testnet-conway URLs
- [ ] **Chain ID matches**: Wallet Chain ID = App Chain ID
- [ ] **Can create game**: Wallet works for operations

#### ✅ On-Chain Verification

- [ ] **Game created**: Can create game successfully
- [ ] **Game queryable**: `linera query-application` shows game
- [ ] **Moves stored**: Move history persists
- [ ] **State updates**: Game state changes on moves
- [ ] **GraphQL works**: Queries and mutations succeed

### Final Verification Commands

```bash
# 1. Check wallet
linera wallet show
# Should show Chain ID and Owner ID

# 2. Query application
linera query-application "$APP_ID" "$CHAIN_ID"
# Should return application state

# 3. Test GraphQL
curl -X POST http://localhost:8080/chains/$CHAIN_ID/applications/$APP_ID \
  -H "Content-Type: application/json" \
  -d '{"query": "{ getAvailableGames { gameId } }"}'
# Should return games array

# 4. Check service
curl http://localhost:8080
# Should return response
```

### ✅ Everything Working Checklist

- [ ] Backend built and deployed
- [ ] Service running and accessible
- [ ] Frontend built and running
- [ ] Wallet connected (Linera Web Client)
- [ ] Connected to Testnet Conway
- [ ] Can create games
- [ ] Can make moves
- [ ] Moves stored on-chain
- [ ] GraphQL working
- [ ] No errors anywhere

---

## 🐛 Step 13: Troubleshooting

### Common Issues & Solutions

#### Issue 1: Build Fails

**Symptoms:**
- `cargo build` fails
- Compilation errors

**Solutions:**
1. Check Rust version: `rustc --version` (need 1.70+)
2. Update Rust: `rustup update stable`
3. Clean build: `cargo clean && cargo build`
4. Check dependencies in Cargo.toml
5. Check for syntax errors in Rust files

#### Issue 2: Service Won't Start

**Symptoms:**
- `linera service` fails
- Port already in use

**Solutions:**
1. Check port: `lsof -i :8080` (Linux/Mac) or `netstat -ano | findstr :8080` (Windows)
2. Kill process using port
3. Use different port: `linera service --port 8081`
4. Check environment variables are set
5. Check wallet files exist

#### Issue 3: Frontend Won't Build

**Symptoms:**
- `npm run build` fails
- Module not found errors

**Solutions:**
1. Delete node_modules: `rm -rf node_modules package-lock.json`
2. Reinstall: `npm install`
3. Check package.json has all dependencies
4. Check for syntax errors in JS/JSX files
5. Check file paths are correct

#### Issue 4: Wallet Won't Connect

**Symptoms:**
- "Failed to connect" error
- No account address shown

**Solutions:**
1. Check browser console for errors
2. Clear browser cache
3. Refresh page
4. Check internet connection
5. Try different browser
6. Check @linera/client is installed

#### Issue 5: Not Connected to Testnet Conway

**Symptoms:**
- No "testnet-conway" in console
- Wrong Chain ID

**Solutions:**
1. Check .env file has correct Chain ID
2. Verify wallet initialized with Testnet Conway faucet
3. Check faucet URL: `https://faucet.testnet-conway.linera.net`
4. Restart frontend: Stop and restart `npm run dev`
5. Clear browser cache

#### Issue 6: GraphQL Errors

**Symptoms:**
- "Failed to fetch" errors
- GraphQL requests fail

**Solutions:**
1. Check service is running: `curl http://localhost:8080`
2. Check Chain ID format (64 hex chars)
3. Check Application ID is correct
4. Check Network tab for request details
5. Verify endpoint URL is correct

#### Issue 7: Can't Create Game

**Symptoms:**
- Button doesn't work
- "Please connect wallet" message

**Solutions:**
1. Make sure wallet is connected
2. Check account address is shown
3. Check browser console for errors
4. Try refreshing page
5. Reconnect wallet

#### Issue 8: Moves Not Working

**Symptoms:**
- Can't make moves
- Moves don't appear

**Solutions:**
1. Check it's your turn
2. Check game status is "In Progress"
3. Check wallet is connected
4. Check browser console for errors
5. Check Network tab for GraphQL errors
6. Verify move is valid (chess.js validates)

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

## 📊 Step 14: Complete Verification Test

### Run This Complete Test

**Test Script:**
```bash
#!/bin/bash

echo "=== OnChain Chess Verification Test ==="
echo ""

# 1. Check backend
echo "1. Checking backend..."
if [ -f "target/wasm32-unknown-unknown/release/onchainchess_contract.wasm" ]; then
  echo "✅ Backend built successfully"
else
  echo "❌ Backend not built - run: cargo build --release --target wasm32-unknown-unknown"
fi

# 2. Check service
echo "2. Checking service..."
if curl -s http://localhost:8080 > /dev/null; then
  echo "✅ Service is running"
else
  echo "❌ Service not running - start: linera service --port 8080"
fi

# 3. Check wallet
echo "3. Checking wallet..."
if linera wallet show > /dev/null 2>&1; then
  echo "✅ Wallet configured"
  CHAIN_ID=$(linera wallet show | grep -oP 'e[0-9a-f]{63}' | head -1)
  echo "   Chain ID: $CHAIN_ID"
else
  echo "❌ Wallet not configured"
fi

# 4. Check frontend
echo "4. Checking frontend..."
if [ -d "web-frontend/node_modules" ]; then
  echo "✅ Frontend dependencies installed"
else
  echo "❌ Frontend dependencies not installed - run: cd web-frontend && npm install"
fi

# 5. Check .env
echo "5. Checking .env file..."
if [ -f "web-frontend/.env" ]; then
  echo "✅ .env file exists"
  if grep -q "VITE_CHAIN_ID" web-frontend/.env; then
    echo "✅ VITE_CHAIN_ID configured"
  else
    echo "❌ VITE_CHAIN_ID not configured"
  fi
else
  echo "❌ .env file not found"
fi

echo ""
echo "=== Test Complete ==="
```

### Manual Verification Steps

**1. Backend Test:**
```bash
cd onchainchess
cargo build --release --target wasm32-unknown-unknown
# Should complete without errors
```

**2. Service Test:**
```bash
curl http://localhost:8080
# Should return response
```

**3. Wallet Test:**
```bash
linera wallet show
# Should show Chain ID and Owner ID
```

**4. Application Test:**
```bash
linera query-application "$APP_ID" "$CHAIN_ID"
# Should return application state
```

**5. Frontend Test:**
```bash
cd web-frontend
npm run build
# Should complete without errors
```

**6. GraphQL Test:**
```bash
curl -X POST http://localhost:8080/chains/$CHAIN_ID/applications/$APP_ID \
  -H "Content-Type: application/json" \
  -d '{"query": "{ getAvailableGames { gameId } }"}'
# Should return JSON with games
```

**7. Browser Test:**
- Open http://localhost:3000
- Connect wallet
- Create game
- Make move
- Verify everything works

---

## 🎯 Step 15: Final Checklist

### Before Submission

- [ ] **Backend**: Built and deployed to Testnet Conway
- [ ] **Service**: Running and accessible
- [ ] **Frontend**: Built and running
- [ ] **Wallet**: Linera Web Client connected
- [ ] **Testnet**: Verified connected to Testnet Conway
- [ ] **GraphQL**: Queries and mutations working
- [ ] **Games**: Can create and join games
- [ ] **Moves**: Can make moves successfully
- [ ] **On-Chain**: Moves stored on blockchain
- [ ] **No Errors**: No errors in console or logs
- [ ] **Documentation**: README updated
- [ ] **Demo Ready**: Can demonstrate to judges

### Submission Requirements Met

- [ ] ✅ Compiles successfully
- [ ] ✅ Connects to Testnet Conway
- [ ] ✅ Functional Linera contract
- [ ] ✅ Live demo ready
- [ ] ✅ Uses Linera Web Client (preferred)
- [ ] ✅ All features working

---

## 🎉 Success Indicators

### You're Ready When:

1. ✅ **Backend built** - No compilation errors
2. ✅ **Deployed** - Application on Testnet Conway
3. ✅ **Service running** - Port 8080 accessible
4. ✅ **Frontend running** - http://localhost:3000 loads
5. ✅ **Wallet connected** - Account address shown
6. ✅ **Testnet verified** - Console shows testnet-conway
7. ✅ **Can create game** - Game appears in list
8. ✅ **Can make moves** - Moves appear on board
9. ✅ **GraphQL works** - Requests succeed
10. ✅ **No errors** - Clean console and logs

---

## 📞 Need Help?

**Check these files:**
- `WALLET_FAQ.md` - Common questions
- `WALLET_SETUP_GUIDE.md` - Detailed wallet setup
- `DEPLOYMENT.md` - Deployment guide
- `QUICK_START.md` - Quick reference

**Or check:**
- Browser console (F12) for errors
- Service terminal for logs
- Network tab for request details

---

**You're all set! Follow these steps and your chess game will be running perfectly on Testnet Conway!** ♟️🚀
