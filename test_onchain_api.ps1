# Comprehensive On-Chain API Test Script
# Tests all GraphQL endpoints to verify everything is working on-chain

$chainId = "0cbfa39ab22c08a0d318aad5f33a67b3f19aaa50bf128fe560ed5e12d8f0e8ba"
$appId = "8ae40bc8c6043039492099bbbede3ceaa99caf4c4e11bdb1f5d7fcc1d48cb572"
$owner = "0x62bda14cdcb5ee207ff27b60975283e35229424320a48ac10dc4b006a7478fa2"
$baseUrl = "http://localhost:8080/chains/$chainId/applications/$appId"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "On-Chain Chess API Test Suite" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

function Test-GraphQL {
    param(
        [string]$Name,
        [string]$Query,
        [string]$Description
    )
    
    Write-Host "Test: $Name" -ForegroundColor Yellow
    Write-Host "  Description: $Description" -ForegroundColor Gray
    try {
        $response = Invoke-WebRequest -Uri $baseUrl -Method POST -Body $Query -ContentType 'application/json' -ErrorAction Stop
        $content = [System.Text.Encoding]::UTF8.GetString($response.Content)
        Write-Host "  Status: SUCCESS" -ForegroundColor Green
        Write-Host "  Response: $content" -ForegroundColor White
        Write-Host ""
        return $content
    } catch {
        Write-Host "  Status: FAILED" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        return $null
    }
}

# Test 1: Get Available Games (should return empty initially or show existing games)
Write-Host "=== QUERY TESTS ===" -ForegroundColor Cyan
$query1 = '{"query":"query { getAvailableGames { gameId whitePlayer blackPlayer status currentTurn board createdAt } }"}'
Test-GraphQL -Name "getAvailableGames" -Query $query1 -Description "Query all available games waiting for players"

# Test 2: Get Game by ID
$query2 = '{"query":"query { getGame(gameId: 1) { gameId whitePlayer blackPlayer status board moveHistory { from { file rank } to { file rank } promotion } } }"}'
Test-GraphQL -Name "getGame" -Query $query2 -Description "Query specific game by ID"

# Test 3: Get Player Games
$query3 = @"
{"query":"query { getPlayerGames(player: \"$owner\") { gameId whitePlayer blackPlayer status } }"}
"@
Test-GraphQL -Name "getPlayerGames" -Query $query3 -Description "Query all games for a specific player"

# Test 4: Create Game Mutation
Write-Host "=== MUTATION TESTS ===" -ForegroundColor Cyan
$mutation1 = @"
{"query":"mutation { createGame(creator: \"$owner\") { success message gameId } }"}
"@
$createResult = Test-GraphQL -Name "createGame" -Query $mutation1 -Description "Create a new chess game"

# Wait for operation to process
Write-Host "Waiting 5 seconds for operation to process on-chain..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test 5: Verify game was created (query again)
Write-Host "=== VERIFICATION TESTS ===" -ForegroundColor Cyan
$query4 = '{"query":"query { getAvailableGames { gameId whitePlayer blackPlayer status } }"}'
$verifyResult = Test-GraphQL -Name "verifyGameCreated" -Query $query4 -Description "Verify the created game appears in available games"

# Test 6: Get the created game directly
$query5 = '{"query":"query { getGame(gameId: 1) { gameId whitePlayer blackPlayer status board } }"}'
Test-GraphQL -Name "getCreatedGame" -Query $query5 -Description "Get the created game directly by ID"

# Test 7: Get player games to verify it's linked
$query6 = @"
{"query":"query { getPlayerGames(player: \"$owner\") { gameId whitePlayer blackPlayer status } }"}
"@
Test-GraphQL -Name "verifyPlayerGames" -Query $query6 -Description "Verify game appears in player's game list"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Test Suite Complete" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all tests show SUCCESS, your application is working on-chain!" -ForegroundColor Green
Write-Host "Check the responses above to verify data persistence." -ForegroundColor Green
