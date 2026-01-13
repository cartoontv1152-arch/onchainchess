# ✅ How to Verify You're Connected to Testnet Conway

**Quick guide to verify your chess game is running on Testnet Conway!**

---

## 🔍 Method 1: Browser Console Check (Easiest)




### Steps:

1. **Open your app** in browser: `http://localhost:3000`
2. **Open Browser Console** (Press F12 or Right-click → Inspect → Console)
3. **Connect Linera Web Client** (click "Connect Web Client" button)
4. **Look for these messages:**

```
🔗 Initializing Linera Web Client...
✅ Linera WASM modules initialized
✅ Linera wallet created successfully!
✅ Linera Web Client connected successfully!
```

5. **Check for Testnet Conway URL:**

```
✅ Connecting to: https://faucet.testnet-conway.linera.net
```

**✅ If you see "testnet-conway" in the console, you're connected!**

---

## 🌐 Method 2: Network Tab Check

### Steps:

1. **Open Browser DevTools** (F12)
2. **Go to Network tab**
3. **Filter by "testnet-conway"** (type in filter box)
4. **Connect Linera Web Client**
5. **Look for requests:**

**Should see requests to:**
- `faucet.testnet-conway.linera.net`
- Any URL containing "testnet-conway"

**✅ If you see testnet-conway requests, you're connected!**

---

## 🔗 Method 3: Chain ID Verification

### Steps:

1. **Get Chain ID from wallet:**

```powershell
linera wallet show
```

**Example output:**
```
Chain: e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a650
```

2. **Check Chain ID in browser:**

**Option A: Check .env file**
```powershell
# Open: onchainchess\web-frontend\.env
# Check: VITE_CHAIN_ID=...
```

**Option B: Check browser console**
```javascript
// In browser console, type:
console.log(import.meta.env.VITE_CHAIN_ID);
```

3. **Compare Chain IDs:**

**They should match exactly!**

**✅ If Chain IDs match, you're on the right chain!**

---

## 📡 Method 4: GraphQL Endpoint Check

### Steps:

1. **Open Browser DevTools** (F12)
2. **Go to Network tab**
3. **Filter by "applications"**
4. **Create a game or make a move**
5. **Click on a GraphQL request**
6. **Check Request URL:**

**Should be:**
```
http://localhost:8080/chains/<YOUR_CHAIN_ID>/applications/<YOUR_APP_ID>
```

**Where:**
- `<YOUR_CHAIN_ID>` = Your Chain ID (64 hex characters)
- `<YOUR_APP_ID>` = Your Application ID (64 hex characters)

**✅ If URL contains your Chain ID, you're connected!**

---

## 🔍 Method 5: Query Application Directly

### Steps:

1. **Open Terminal/PowerShell**
2. **Set variables:**

```powershell
# Get your Chain ID and App ID from Step 3 of setup
$CHAIN_ID = "e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a650"
$APP_ID = "e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a650"
```

3. **Query application:**

```powershell
linera query-application "$APP_ID" "$CHAIN_ID"
```

**Expected output:**
```json
{
  "owner": "0x1234...",
  "next_game_id": 1,
  "games": {...}
}
```

**✅ If query returns data, you're connected to Testnet Conway!**

---

## 🧪 Method 6: Test GraphQL Query

### Steps:

1. **Open Terminal/PowerShell**
2. **Set variables:**

```powershell
$CHAIN_ID = "YOUR_CHAIN_ID_HERE"
$APP_ID = "YOUR_APP_ID_HERE"
```

3. **Test GraphQL query:**

```powershell
curl -X POST http://localhost:8080/chains/$CHAIN_ID/applications/$APP_ID `
  -H "Content-Type: application/json" `
  -d '{\"query\": \"{ getAvailableGames { gameId whitePlayer blackPlayer status } }\"}'
```

**Expected output:**
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

**✅ If query returns data, GraphQL is working and you're connected!**

---

## ✅ Complete Verification Checklist

### Quick Check (30 seconds):

- [ ] Browser console shows "testnet-conway" URLs
- [ ] Network tab shows testnet-conway requests
- [ ] Account address is shown in UI
- [ ] Can create a game

### Detailed Check (5 minutes):

- [ ] Browser console shows "testnet-conway" URLs
- [ ] Network tab shows testnet-conway requests
- [ ] Chain ID matches wallet Chain ID
- [ ] GraphQL requests use correct Chain ID
- [ ] `linera query-application` works
- [ ] GraphQL queries return data
- [ ] Can create games
- [ ] Can make moves
- [ ] Moves stored on-chain

---

## 🚨 Not Connected? Troubleshooting

### Problem: No "testnet-conway" in console

**Solutions:**
1. **Check .env file** - Make sure VITE_CHAIN_ID is correct
2. **Check wallet** - Make sure wallet initialized with Testnet Conway faucet
3. **Restart frontend** - Stop and restart `npm run dev`
4. **Clear cache** - Clear browser cache and reload

### Problem: Wrong Chain ID

**Solutions:**
1. **Check wallet Chain ID:**
   ```powershell
   linera wallet show
   ```

2. **Update .env file:**
   ```env
   VITE_CHAIN_ID=YOUR_CORRECT_CHAIN_ID_HERE
   ```

3. **Restart frontend:**
   ```powershell
   # Stop current dev server (Ctrl+C)
   npm run dev
   ```

### Problem: GraphQL errors

**Solutions:**
1. **Check service is running:**
   ```powershell
   curl http://localhost:8080
   ```

2. **Check Chain ID format** (should be 64 hex characters)

3. **Check Application ID** is correct

4. **Check Network tab** for request details

---

## 📊 Visual Indicators

### ✅ Connected to Testnet Conway:

**In Browser:**
- Account address shown: `0x1234...5678`
- "Create New Game" button enabled
- No "Connect Wallet" message

**In Console:**
- `✅ Linera Web Client connected successfully!`
- `✅ Connecting to: https://faucet.testnet-conway.linera.net`
- `✅ Chain ID: e476187f...`

**In Network Tab:**
- Requests to `faucet.testnet-conway.linera.net`
- GraphQL requests to `/chains/<CHAIN_ID>/applications/<APP_ID>`

### ❌ NOT Connected:

**In Browser:**
- "Connect Wallet" message shown
- No account address
- Buttons disabled

**In Console:**
- Errors about connection
- No "testnet-conway" URLs
- No success messages

**In Network Tab:**
- No requests to testnet-conway
- Failed requests
- Wrong Chain ID in URLs

---

## 🎯 Quick Test

**Run this quick test:**

1. **Open browser:** `http://localhost:3000`
2. **Open console:** Press F12
3. **Connect wallet:** Click "Connect Web Client"
4. **Check console:** Look for "testnet-conway"
5. **Create game:** Click "+ Create New Game"
6. **Check Network tab:** Look for GraphQL request

**✅ If all steps work, you're connected to Testnet Conway!**

---

## 📞 Still Not Sure?

**Run this verification script:**

```powershell
# 1. Check wallet
Write-Host "1. Checking wallet..."
linera wallet show

# 2. Check service
Write-Host "`n2. Checking service..."
curl http://localhost:8080

# 3. Check Chain ID in .env
Write-Host "`n3. Checking .env file..."
Get-Content onchainchess\web-frontend\.env | Select-String "VITE_CHAIN_ID"

# 4. Test GraphQL
Write-Host "`n4. Testing GraphQL..."
$CHAIN_ID = (Get-Content onchainchess\web-frontend\.env | Select-String "VITE_CHAIN_ID").ToString().Split("=")[1].Trim()
$APP_ID = (Get-Content onchainchess\web-frontend\.env | Select-String "VITE_APP_ID").ToString().Split("=")[1].Trim()
curl -X POST http://localhost:8080/chains/$CHAIN_ID/applications/$APP_ID -H "Content-Type: application/json" -d '{\"query\": \"{ getAvailableGames { gameId } }\"}'
```

**If all checks pass, you're connected!**

---

**🎉 You're connected to Testnet Conway when you see "testnet-conway" in your browser console!**
