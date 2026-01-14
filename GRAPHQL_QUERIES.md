# GraphQL Queries Reference

This document provides GraphQL queries you can use to check game status and debug issues.

## Base URL

The GraphQL endpoint is available at:
```
http://localhost:8080/chains/{CHAIN_ID}/applications/{APPLICATION_ID}
```

Replace:
- `{CHAIN_ID}` with your chain ID (64-character hex string)
- `{APPLICATION_ID}` with your application ID (64-character hex string)

## Queries

### 1. Check if a Specific Game Exists

Query a game by its ID to verify it was created:

```graphql
query GetGame($gameId: UInt64!) {
  getGame(gameId: $gameId) {
    gameId
    whitePlayer
    blackPlayer
    currentTurn
    status
    board
    moveHistory {
      from {
        file
        rank
      }
      to {
        file
        rank
      }
      promotion
    }
    createdAt
    lastMoveAt
  }
}
```

**Variables:**
```json
{
  "gameId": 1
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8080/chains/YOUR_CHAIN_ID/applications/YOUR_APP_ID \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetGame($gameId: UInt64!) { getGame(gameId: $gameId) { gameId whitePlayer blackPlayer status } }",
    "variables": { "gameId": 1 }
  }'
```

### 2. Get All Games for a Player

Check all games created by or joined by a specific player:

```graphql
query GetPlayerGames($player: AccountOwner!) {
  getPlayerGames(player: $player) {
    gameId
    whitePlayer
    blackPlayer
    currentTurn
    status
    board
    createdAt
    lastMoveAt
  }
}
```

**Variables:**
```json
{
  "player": "0x28c938ce29e07ce93deb7134a0d69e7d481ab479"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8080/chains/YOUR_CHAIN_ID/applications/YOUR_APP_ID \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetPlayerGames($player: AccountOwner!) { getPlayerGames(player: $player) { gameId whitePlayer blackPlayer status } }",
    "variables": { "player": "0x28c938ce29e07ce93deb7134a0d69e7d481ab479" }
  }'
```

### 3. Get All Available Games (Waiting for Players)

Get all games that are waiting for a second player to join:

```graphql
query GetAvailableGames {
  getAvailableGames {
    gameId
    whitePlayer
    blackPlayer
    currentTurn
    status
    board
    createdAt
    lastMoveAt
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:8080/chains/YOUR_CHAIN_ID/applications/YOUR_APP_ID \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getAvailableGames { gameId whitePlayer blackPlayer status } }"
  }'
```

## Mutations

### Create a Game

```graphql
mutation CreateGame($creator: AccountOwner!) {
  createGame(creator: $creator) {
    success
    message
    gameId
  }
}
```

**Variables:**
```json
{
  "creator": "0x28c938ce29e07ce93deb7134a0d69e7d481ab479"
}
```

## Testing Game Creation

### Step 1: Create a Game

```bash
curl -X POST http://localhost:8080/chains/YOUR_CHAIN_ID/applications/YOUR_APP_ID \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation CreateGame($creator: AccountOwner!) { createGame(creator: $creator) { success message gameId } }",
    "variables": { "creator": "0x28c938ce29e07ce93deb7134a0d69e7d481ab479" }
  }'
```

### Step 2: Check if Game Exists (by ID)

If you know the game ID (usually starts at 1), check it directly:

```bash
curl -X POST http://localhost:8080/chains/YOUR_CHAIN_ID/applications/YOUR_APP_ID \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getGame(gameId: 1) { gameId whitePlayer blackPlayer status } }"
  }'
```

### Step 3: Check Player Games

Check all games for your account:

```bash
curl -X POST http://localhost:8080/chains/YOUR_CHAIN_ID/applications/YOUR_APP_ID \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query GetPlayerGames($player: AccountOwner!) { getPlayerGames(player: $player) { gameId whitePlayer blackPlayer status } }",
    "variables": { "player": "0x28c938ce29e07ce93deb7134a0d69e7d481ab479" }
  }'
```

### Step 4: Check Available Games

Check all games waiting for players:

```bash
curl -X POST http://localhost:8080/chains/YOUR_CHAIN_ID/applications/YOUR_APP_ID \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getAvailableGames { gameId whitePlayer blackPlayer status } }"
  }'
```

## Troubleshooting

### Game Created but Not Showing in Queries

If the backend logs show "Game X created" but queries return empty:

1. **Check Backend Logs**: Look for `Game X created by 0x...` messages
2. **Wait a Few Seconds**: State sync between contract and service may take time
3. **Query by Game ID**: Try querying the specific game ID directly (usually starts at 1)
4. **Check Account Format**: Ensure the account address matches exactly (case-sensitive)

### Example: Verify Game Creation

```bash
# 1. Create game
RESPONSE=$(curl -s -X POST http://localhost:8080/chains/YOUR_CHAIN_ID/applications/YOUR_APP_ID \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation CreateGame($creator: AccountOwner!) { createGame(creator: $creator) { success message } }",
    "variables": { "creator": "0x28c938ce29e07ce93deb7134a0d69e7d481ab479" }
  }')

echo "Create game response: $RESPONSE"

# 2. Wait 2 seconds
sleep 2

# 3. Check game by ID (assuming game ID 1)
curl -X POST http://localhost:8080/chains/YOUR_CHAIN_ID/applications/YOUR_APP_ID \
  -H "Content-Type: application/json" \
  -d '{
    "query": "query { getGame(gameId: 1) { gameId whitePlayer blackPlayer status } }"
  }'
```

## Using GraphQL Playground

You can also test queries using a GraphQL client like:
- **GraphQL Playground**: https://github.com/graphql/graphql-playground
- **Altair GraphQL Client**: https://altairgraphql.dev/
- **Postman**: Has GraphQL support

Point the client to: `http://localhost:8080/chains/{CHAIN_ID}/applications/{APPLICATION_ID}`
