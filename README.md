# OnChain Chess - Linera Blockchain

A fully on-chain chess game built on Linera blockchain. All moves and game state are stored and validated on-chain.

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### Run the Application

```bash
# Clone the repository
git clone <repository-url>
cd onchainchess

# Start the application
docker compose up --build
```

The application will:
- Build the Rust contract and service
- Set up the Linera wallet
- Start the Linera service on port 8080
- Start the frontend on port 5173

### Access the Application

After startup, you'll see output like:
```
Frontend URL: http://localhost:5173/{CHAIN_ID}?app={APP_ID}&owner={OWNER_ID}&port=8080
GraphQL URL : http://localhost:8080/chains/{CHAIN_ID}/applications/{APP_ID}
```

Open the Frontend URL in your browser.

## 🎮 How to Play

1. **Connect Wallet**: Connect using Dynamic Wallet or MetaMask
2. **Create Game**: Click "+ Create New Game" to start a new game
3. **Join Game**: Browse available games and join one
4. **Make Moves**: Click and drag pieces to make moves
5. **Resign**: Click "Resign" to forfeit the game

## 🏗️ Architecture

- **Backend (Rust)**: Linera contract and GraphQL service
- **Frontend (React)**: React + Vite with Apollo Client
- **Blockchain**: Linera Testnet Conway

## 📁 Project Structure

```
onchainchess/
├── src/              # Rust source code
│   ├── contract.rs   # Game contract logic
│   ├── service.rs    # GraphQL API service
│   └── state.rs      # Game state management
├── web-frontend/     # React frontend
└── Dockerfile        # Container configuration
```

## 🔧 Development

### Rebuild After Code Changes

```bash
docker compose down
docker compose up --build
```

### Check Logs

```bash
# Backend logs
docker compose logs app | grep -i "game\|error"

# Or view backend.log file
cat backend.log | tail -50
```

### Test GraphQL Queries

```bash
# Get available games
curl -X POST http://localhost:8080/chains/{CHAIN_ID}/applications/{APP_ID} \
  -H "Content-Type: application/json" \
  -d '{"query": "query { getAvailableGames { gameId whitePlayer blackPlayer status } }"}'
```

## 🐛 Troubleshooting

### Games Not Appearing After Creation

1. Wait 2-3 seconds for the operation to process
2. Check backend logs: `docker compose logs app | grep "Game\|game_counter"`
3. Verify the service sees games: Look for `game_counter = X` in logs (X > 0)

### Container Issues

```bash
# Stop and remove containers
docker compose down

# Rebuild from scratch
docker compose up --build --force-recreate
```

### Port Already in Use

Change ports in `compose.yaml` or stop the conflicting service.

## 📚 Documentation

- **GraphQL Queries**: See `GRAPHQL_QUERIES.md` for query examples
- **Linera Docs**: https://linera.io/docs

## 🛠️ Tech Stack

- **Blockchain**: Linera SDK 0.15.7
- **Backend**: Rust, async-graphql 7.0.17
- **Frontend**: React, Vite, Apollo Client
- **Chess Engine**: Chess.js

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.
