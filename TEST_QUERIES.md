# Test Queries for OnChain Chess

Use these queries to test if the backend is working correctly.

## Your Current Setup

- **Chain ID**: `01a3f07cee82f956a819d301d24fa9f57ba5db6f146d82305c155426a2e4746d`
- **Application ID**: `ff64b5660d3406c1d255d1859658e68fbe5d082b14f78d83189ca3b99bdcb670`
- **GraphQL Endpoint**: `http://localhost:8080/chains/01a3f07cee82f956a819d301d24fa9f57ba5db6f146d82305c155426a2e4746d/applications/ff64b5660d3406c1d255d1859658e68fbe5d082b14f78d83189ca3b99bdcb670`

## PowerShell Commands to Test

### 1. Check if Game ID 1 Exists

```powershell
$body = @{query='query { getGame(gameId: 1) { gameId whitePlayer blackPlayer status } }'} | ConvertTo-Json
$response = Invoke-WebRequest -Uri 'http://localhost:8080/chains/01a3f07cee82f956a819d301d24fa9f57ba5db6f146d82305c155426a2e4746d/applications/ff64b5660d3406c1d255d1859658e68fbe5d082b14f78d83189ca3b99bdcb670' -Method POST -Body $body -ContentType 'application/json'
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### 2. Get All Available Games

```powershell
$body = @{query='query { getAvailableGames { gameId whitePlayer blackPlayer status } }'} | ConvertTo-Json
$response = Invoke-WebRequest -Uri 'http://localhost:8080/chains/01a3f07cee82f956a819d301d24fa9f57ba5db6f146d82305c155426a2e4746d/applications/ff64b5660d3406c1d255d1859658e68fbe5d082b14f78d83189ca3b99bdcb670' -Method POST -Body $body -ContentType 'application/json'
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### 3. Get Player Games

```powershell
$body = @{query='query GetPlayerGames($player: AccountOwner!) { getPlayerGames(player: $player) { gameId whitePlayer blackPlayer status } }'; variables=@{player='0x28c938ce29e07ce93deb7134a0d69e7d481ab479'}} | ConvertTo-Json -Depth 10
$response = Invoke-WebRequest -Uri 'http://localhost:8080/chains/01a3f07cee82f956a819d301d24fa9f57ba5db6f146d82305c155426a2e4746d/applications/ff64b5660d3406c1d255d1859658e68fbe5d082b14f78d83189ca3b99bdcb670' -Method POST -Body $body -ContentType 'application/json'
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

### 4. Create a Game (Mutation)

```powershell
$body = @{query='mutation CreateGame($creator: AccountOwner!) { createGame(creator: $creator) { success message gameId } }'; variables=@{creator='0x28c938ce29e07ce93deb7134a0d69e7d481ab479'}} | ConvertTo-Json -Depth 10
$response = Invoke-WebRequest -Uri 'http://localhost:8080/chains/01a3f07cee82f956a819d301d24fa9f57ba5db6f146d82305c155426a2e4746d/applications/ff64b5660d3406c1d255d1859658e68fbe5d082b14f78d83189ca3b99bdcb670' -Method POST -Body $body -ContentType 'application/json'
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

## Check Backend Logs

```powershell
Get-Content backend.log -Tail 50 | Select-String -Pattern "Game|Query|Service|game_counter" -Context 1
```

## Expected Behavior

1. **After creating a game**: Backend logs should show "Game X created by 0x..."
2. **After querying**: Backend logs should show "Service: Loaded state, game_counter = X" and "Query get_game/get_player_games/get_available_games: found X games"
3. **GraphQL response**: Should return the game data, not empty arrays or null

## Troubleshooting

- If `getGame(gameId: 1)` returns `null`, but backend shows "Game 1 created", the service isn't loading state correctly
- If `game_counter = 0` in logs, no games have been created yet
- If queries return empty arrays but backend shows games, check the account address format matches exactly
