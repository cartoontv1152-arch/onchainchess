# OnChain Chess - Linera Wavehack

A fully on-chain chess game built on Linera blockchain for the Real-Time Markets Wavehack.

yt demo video --- https://youtu.be/9DMx1LZitKY


============================================
🎉 Deployment Complete!
============================================

📋 Deployment Summary:
  Chain ID:      f0e379379d5715d922c7da443db9c09ce8642111f8024b296f4ca894bde1cd1a

  Application ID: 3e324da7596aa2772fac866bb73b44581536ad96f35669949bc60813c9d96a25

  Owner ID:      0x62bda14cdcb5ee207ff27b60975283e35229424320a48ac10dc4b006a7478fa2
  
  Module ID:     3e324da7596aa2772fac866bb73b44581536ad96f35669949bc60813c9d96a25

## 🎯 Overview

OnChain Chess is a decentralized chess game where all moves are stored and validated on-chain using Linera's microchains. Players can create games, join games, make moves, and all game state is persisted on the blockchain.

## ✨ Features

- **On-Chain Game State**: All moves and game state stored on Linera blockchain
- **Real-Time Updates**: GraphQL subscriptions for live game updates
- **Beautiful UI**: Modern chess board interface using react-chessboard
- **Move Validation**: Chess.js for move validation
- **Game Management**: Create games, join games, resign games
- **Move History**: View complete move history for each game

## 🏗️ Architecture

### Backend (Rust)
- **Contract** (`src/contract.rs`): Handles game operations (create, join, move, resign)
- **Service** (`src/service.rs`): GraphQL API for queries and mutations
- **State** (`src/state.rs`): On-chain game state management
- **Types** (`src/lib.rs`): Game data structures and types

### Frontend (React)
- **Chess Board**: React component using react-chessboard
- **GraphQL Client**: Apollo Client for queries and subscriptions
- **Wallet Integration**: Linera wallet integration
- **Game Management**: UI for creating, joining, and playing games

## 🚀 Getting Started

### 📚 Documentation Guides

**Start here for complete setup:**

1. **[STEP_BY_STEP_SETUP.md](STEP_BY_STEP_SETUP.md)** ⭐ **START HERE!**
   - Complete step-by-step guide from zero to playing chess
   - Includes all commands, verification steps, and troubleshooting

2. **[COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)**
   - Detailed guide with extensive troubleshooting
   - All possible errors and solutions

3. **[VERIFY_TESTNET_CONWAY.md](VERIFY_TESTNET_CONWAY.md)**
   - How to verify you're connected to Testnet Conway
   - Multiple verification methods

4. **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)**
   - Quick command reference
   - Common issues and solutions

5. **[WALLET_SETUP_GUIDE.md](WALLET_SETUP_GUIDE.md)**
   - Detailed wallet setup for all wallet types

6. **[GRAPHQL_QUERIES.md](GRAPHQL_QUERIES.md)** ⭐ **For Debugging!**
   - GraphQL queries to check if games are created
   - How to verify game status
   - Troubleshooting game creation issues

7. **[TEST_QUERIES.md](TEST_QUERIES.md)** ⭐ **PowerShell Test Commands!**
   - Ready-to-use PowerShell commands to test the backend
   - Copy-paste queries for your current setup

8. **[FIX_SUMMARY.md](FIX_SUMMARY.md)** ⭐ **Recent Fixes!**
   - Summary of fixes applied
   - What changed and why

### Prerequisites

- **Rust**: Latest stable version
- **Node.js**: v16 or higher
- **Linera SDK**: Version 0.15.7 (Handled automatically by `DEPLOY_TESTNET_CONWAY.sh`)
- **WASM Target**: `rustup target add wasm32-unknown-unknown`

### 🚀 Quick Deployment (Recommended)

Run the automated deployment script which handles version checks, building, and deploying to Testnet Conway:

```bash
bash DEPLOY_TESTNET_CONWAY.sh
```

### Wallet Setup

**Choose ONE wallet option** (see `WALLET_SETUP_GUIDE.md` for details):

1. **Linera Web Client** ⭐ **RECOMMENDED FOR WAVEHACK!**
   - Just click "Connect Web Client" in the app
   - Works immediately, no downloads needed
   - **Perfect for Testnet Conway!**

2. **Croissant Wallet** ⭐ (Also Recommended)
   - Install from: https://croissant.linera.io
   - Browser extension for best UX

3. **Linera Extension**
   - Download from: https://github.com/linera-io/linera-protocol/releases

4. **Dynamic Wallet**
   - Use MetaMask or any Ethereum wallet
   - Via Dynamic Labs integration

**Quick Start**: See `STEP_BY_STEP_SETUP.md` for complete setup!

### Backend Setup

1. **Build the contract**:
   ```bash
   cd onchainchess
   cargo build --release --target wasm32-unknown-unknown
   ```

2. **Deploy to Testnet Conway**:
   ```bash
   # Initialize wallet
   linera wallet init --faucet https://faucet.testnet-conway.linera.net
   linera wallet request-chain --faucet https://faucet.testnet-conway.linera.net
   
   # Publish modules
   linera publish-module target/wasm32-unknown-unknown/release/onchainchess_{contract,service}.wasm
   
   # Create application
   linera create-application <MODULE_ID> <CHAIN_ID> --json-argument '{}'
   ```

3. **Start service**:
   ```bash
   linera service --port 8080
   ```

### Frontend Setup

1. **Install dependencies**:
   ```bash
   cd web-frontend
   npm install
   ```

2. **Create .env file**:
   ```env
   VITE_CHAIN_ID=your_chain_id
   VITE_APP_ID=your_app_id
   VITE_OWNER_ID=your_owner_id
   VITE_PORT=8080
   VITE_HOST=localhost
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   ```
   http://localhost:3000/<CHAIN_ID>?app=<APP_ID>&owner=<OWNER_ID>&port=8080
   ```

## 📋 Deployment to Testnet Conway

### 🚀 Quick Deploy (Recommended)

**In WSL terminal:**
```bash
cd /mnt/c/Users/parth/Desktop/onchainchess
bash QUICK_DEPLOY.sh
```

Then:
```bash
# Terminal 1: Start service
linera service --port 8080

# Terminal 2: Start frontend
cd web-frontend
npm install
npm run dev
```

Open: `http://localhost:3000/`

### 📚 Detailed Guides

- **[START_HERE_DEPLOYMENT.md](START_HERE_DEPLOYMENT.md)** - Quick start guide
- **[WSL_DEPLOYMENT_GUIDE.md](WSL_DEPLOYMENT_GUIDE.md)** - Complete step-by-step guide
- **[DEPLOYMENT_SUMMARY.md](DEPLOYMENT_SUMMARY.md)** - Deployment overview

### ✅ What's Included

- ✅ Automated deployment scripts
- ✅ Testnet Conway setup
- ✅ Environment configuration
- ✅ Troubleshooting guides

## 🎮 How to Play

1. **Connect Wallet**: Connect your Linera wallet
2. **Create Game**: Click "Create New Game" to start a game as White
3. **Join Game**: Browse available games and click "Join" to play as Black
4. **Make Moves**: Click and drag pieces to make moves (validated by chess.js)
5. **View History**: See move history in the sidebar
6. **Resign**: Click "Resign" to forfeit the game

## 🏗️ Project Structure

```
onchainchess/
├── src/
│   ├── lib.rs          # Type definitions
│   ├── contract.rs     # Contract logic
│   ├── service.rs      # GraphQL service
│   └── state.rs        # State management
├── web-frontend/
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── providers/  # Context providers
│   │   └── services/   # GraphQL operations
│   └── package.json
├── Cargo.toml
└── README.md
```

## 🔧 Development

### Building

```bash
# Build Rust contract
cargo build --release --target wasm32-unknown-unknown

# Build frontend
cd web-frontend
npm run build
```

### Testing

```bash
# Run Rust tests
cargo test

# Run frontend tests
cd web-frontend
npm test
```

## 📚 Technologies

- **Backend**: Rust, Linera SDK, async-graphql
- **Frontend**: React, Vite, Apollo Client, chess.js, react-chessboard
- **Blockchain**: Linera Testnet Conway

## 📝 License

This project is part of the Linera Buildathon submission.

## 🤝 Contributing

Contributions welcome! This is a Wavehack submission.

---

**Built with ❤️ for the Linera Real-Time Markets Wavehack**
