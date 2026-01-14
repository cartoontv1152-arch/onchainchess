# Quick Test Commands for Your Setup

## Your Current Configuration
- **Chain ID**: `f5d3f8710123c7f657b0fd1a511b06bab913a86707aac72ed11e814aeddb85ca`
- **Application ID**: `9b749bba01c6f3cd1a765bff8764070cfaf369952ce6fe41a54b2bf3280c9d7c`
- **GraphQL Endpoint**: `http://localhost:8080/chains/f5d3f8710123c7f657b0fd1a511b06bab913a86707aac72ed11e814aeddb85ca/applications/9b749bba01c6f3cd1a765bff8764070cfaf369952ce6fe41a54b2bf3280c9d7c`

## PowerShell Commands (Copy & Paste)

### 1. Check if Game ID 1 Exists
```powershell
$body = @{query='query { getGame(gameId: 1) { gameId whitePlayer blackPlayer status } }'} | ConvertTo-Json
$response = Invoke-WebRequest -Uri 'http://localhost:8080/chains/f5d3f8710123c7f657b0fd1a511b06bab913a86707aac72ed11e814aeddb85ca/applications/9b749bba01c6f3cd1a765bff8764070cfaf369952ce6fe41a54b2bf3280c9d7c' -Method POST -Body $body -ContentType 'application/json'
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### 2. Get All Available Games
```powershell
$body = @{query='query { getAvailableGames { gameId whitePlayer blackPlayer status } }'} | ConvertTo-Json
$response = Invoke-WebRequest -Uri 'http://localhost:8080/chains/f5d3f8710123c7f657b0fd1a511b06bab913a86707aac72ed11e814aeddb85ca/applications/9b749bba01c6f3cd1a765bff8764070cfaf369952ce6fe41a54b2bf3280c9d7c' -Method POST -Body $body -ContentType 'application/json'
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### 3. Get Player Games (Replace with your account)
```powershell
$body = @{query='query GetPlayerGames($player: AccountOwner!) { getPlayerGames(player: $player) { gameId whitePlayer blackPlayer status } }'; variables=@{player='0x28c938ce29e07ce93deb7134a0d69e7d481ab479'}} | ConvertTo-Json -Depth 10
$response = Invoke-WebRequest -Uri 'http://localhost:8080/chains/f5d3f8710123c7f657b0fd1a511b06bab913a86707aac72ed11e814aeddb85ca/applications/9b749bba01c6f3cd1a765bff8764070cfaf369952ce6fe41a54b2bf3280c9d7c' -Method POST -Body $body -ContentType 'application/json'
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### 4. Create a Game (Mutation)
```powershell
$body = @{query='mutation CreateGame($creator: AccountOwner!) { createGame(creator: $creator) { success message gameId } }'; variables=@{creator='0x28c938ce29e07ce93deb7134a0d69e7d481ab479'}} | ConvertTo-Json -Depth 10
$response = Invoke-WebRequest -Uri 'http://localhost:8080/chains/f5d3f8710123c7f657b0fd1a511b06bab913a86707aac72ed11e814aeddb85ca/applications/9b749bba01c6f3cd1a765bff8764070cfaf369952ce6fe41a54b2bf3280c9d7c' -Method POST -Body $body -ContentType 'application/json'
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### 5. Check Backend Logs for Game Creation
```powershell
Get-Content backend.log -Tail 100 | Select-String -Pattern "Game.*created|game_counter|Service:" -Context 1
```

## What the Logs Should Show

**If working correctly:**
- `Service: Loaded state, game_counter = 1` (or higher if games exist)
- `Game 1 created by 0x...` (in contract logs)
- `Query get_available_games(): found 1 games`

**Current issue:**
- `game_counter = 0` means no games have been created
- The transaction hash is returned, but the contract operation isn't executing

## The Real Problem

The backend logs show `game_counter = 0`, which means:
1. ✅ Service is working (loading state correctly)
2. ❌ Contract is NOT executing the create game operation
3. The transaction hash is returned, but the operation isn't being processed

This suggests the mutation might not be calling the contract correctly, or there's an issue with how operations are being submitted to the blockchain.
