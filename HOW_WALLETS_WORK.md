# How Wallets Work - Technical Explanation

This document explains how wallets connect and work with OnChain Chess.

## 🔗 Wallet Connection Architecture

```
┌─────────────────┐
│   Chess Game    │
│   (Frontend)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ WalletProvider  │  ← Manages all wallet connections
│  (React Hook)   │
└────────┬────────┘
         │
         ├──► Linera Web Client ──► @linera/client ──► Testnet Conway
         │
         ├──► Croissant Wallet ────► window.croissant ──► Testnet Conway
         │
         ├──► Linera Extension ────► window.linera ────► Testnet Conway
         │
         └──► Dynamic Wallet ──────► Dynamic Labs SDK ─► Testnet Conway
```

## 📦 Wallet Components

### 1. WalletProvider (`providers/WalletProvider.js`)

**What it does:**
- Detects available wallets
- Manages connection state
- Stores account address
- Handles disconnection
- Provides wallet context to entire app

**Key Functions:**
```javascript
connectWallet()      // Connect to selected wallet
disconnectWallet()   // Disconnect current wallet
account              // Current account address
isConnected          // Connection status
walletType           // Which wallet is connected
```

### 2. Wallet Services (`services/wallet/`)

Each wallet type has its own service:

#### Linera Web Client (`linera-web-client.ts`)
```typescript
// Creates wallet using @linera/client
const provider = await lineraWebClient.connect();
const address = provider.address;  // Your account
const chainId = provider.chainId;  // Your chain
```

**How it works:**
1. Initializes Linera WASM modules
2. Creates Faucet connection to Testnet Conway
3. Creates wallet automatically
4. Claims a chain for you
5. Returns provider with account and chain ID

#### Croissant Wallet (`croissant-wallet.ts`)
```typescript
// Uses browser extension
const accounts = await croissantWallet.connect();
const account = accounts[0];  // Your account
```

**How it works:**
1. Checks if `window.croissant` exists
2. Calls `croissant.request({ method: 'linera_requestAccounts' })`
3. Extension shows popup for approval
4. Returns account addresses
5. Extension handles all signing

#### Linera Extension
```javascript
// Uses window.linera object
const accounts = await window.linera.request({
  method: 'linera_requestAccounts'
});
```

**How it works:**
1. Checks if `window.linera` exists
2. Calls Linera RPC methods
3. Extension handles wallet operations
4. Returns account and chain info

#### Dynamic Wallet
```javascript
// Uses Dynamic Labs SDK
const { primaryWallet } = useDynamicContext();
const address = primaryWallet.address;
```

**How it works:**
1. Uses Dynamic Labs React context
2. Connects Ethereum wallets (MetaMask, etc.)
3. Converts Ethereum address to Linera format
4. Uses DynamicSigner for transaction signing

## 🔄 Connection Flow

### Step-by-Step Process

**1. User Clicks "Connect Wallet"**
```
User Action → WalletSelector Component → Shows Options
```

**2. User Selects Wallet Type**
```
User clicks "Connect Web Client" or "Connect Croissant" etc.
```

**3. Wallet Service Connects**
```
WalletSelector → Wallet Service → Wallet API → Testnet Conway
```

**4. Account Retrieved**
```
Wallet API → Returns Account Address → WalletProvider → Stores in State
```

**5. App Uses Account**
```
WalletProvider → Provides account to App → Game Operations Use Account
```

## 💾 State Management

### Wallet State Stored In:

1. **React Context** (`WalletProvider`)
   - `account`: Current account address
   - `isConnected`: Connection status
   - `walletType`: Which wallet is connected
   - `chainId`: Current chain ID

2. **Local Storage** (Optional)
   - Caches wallet state
   - Persists across page refreshes
   - Expires after 5 minutes

3. **Wallet Extension** (If using extension)
   - Stores wallet data securely
   - Manages private keys
   - Handles signing

## 🔐 Security & Signing

### How Transactions Are Signed

**Linera Web Client:**
- Uses `@linera/client` signing
- WASM modules handle cryptography
- No private keys exposed

**Croissant/Linera Extension:**
- Extension handles signing
- Private keys stay in extension
- App requests signature, extension signs

**Dynamic Wallet:**
- Uses Ethereum wallet signing
- `DynamicSigner` converts to Linera format
- Private keys stay in Ethereum wallet

### What Gets Signed

When you make a move:
1. App creates `ChessMove` object
2. Sends to GraphQL mutation
3. Mutation schedules operation
4. Contract executes operation
5. Operation may require signature (depending on wallet)

## 🌐 Network Connection

### Testnet Conway Connection

All wallets connect to:
```
https://faucet.testnet-conway.linera.net
```

**What happens:**
1. Wallet connects to faucet
2. Requests test tokens (free!)
3. Gets chain ID
4. Ready to use

### Chain ID Format

Chain IDs are 64-character hex strings:
```
e476187f6ddfeb9d588c7b45d3df334d5501d6499b3f9ad5595cae86cce16a650
```

**Used for:**
- Identifying your chain
- GraphQL queries
- Application routing

## 📡 GraphQL Integration

### How Wallet Connects to GraphQL

```
Wallet Account → GraphQL Mutation → Linera Service → Contract → Blockchain
```

**Example: Making a Move**

1. **User makes move** on chess board
2. **App calls** `makeMove(gameId, account, chessMove)`
3. **GraphQL mutation** sends to Linera service
4. **Service schedules** operation on-chain
5. **Contract executes** move
6. **State updates** on blockchain
7. **GraphQL query** fetches updated game state
8. **UI updates** with new move

### Account Usage in Queries

```graphql
mutation MakeMove($gameId: UInt64!, $player: AccountOwner!, $chessMove: ChessMoveInput!) {
  makeMove(gameId: $gameId, player: $player, chessMove: $chessMove) {
    success
    message
  }
}
```

The `$player` parameter comes from your connected wallet account!

## 🔄 Real-Time Updates

### How Game State Updates

**Polling Method:**
```javascript
// Polls every 2 seconds
useEffect(() => {
  const interval = setInterval(() => {
    refetchGame();
  }, 2000);
  return () => clearInterval(interval);
}, [selectedGameId]);
```

**What happens:**
1. App polls GraphQL every 2 seconds
2. Gets latest game state
3. Updates chess board
4. Shows new moves
5. Updates game status

**Future:** Could use GraphQL subscriptions for real-time updates!

## 🎯 Account Format

### Account Owner Format

Linera uses `AccountOwner` type:
- **Format**: `0x` + 40 hex characters
- **Example**: `0x1234567890abcdef1234567890abcdef12345678`
- **Length**: 42 characters total

### Conversion

**Ethereum Address → Linera Account:**
- Dynamic wallet converts automatically
- Uses same format
- Compatible addresses

**Linera Account → Display:**
```javascript
formatAddress(address)  // "0x1234...5678"
```

## 🛠️ Developer Notes

### Adding New Wallet Type

1. Create service file in `services/wallet/`
2. Implement connection logic
3. Add to `WalletSelector` component
4. Update `WalletProvider` if needed
5. Test connection flow

### Debugging Wallet Connection

**Check Console:**
```javascript
// Wallet connection logs
console.log('Connecting to wallet...');
console.log('Account:', account);
console.log('Chain ID:', chainId);
```

**Check Network:**
- Open DevTools → Network tab
- Look for GraphQL requests
- Check for errors

**Check State:**
```javascript
const { account, isConnected, walletType } = useWallet();
console.log({ account, isConnected, walletType });
```

## 📚 Technical Details

### Wallet Provider Implementation

**Location**: `onchainchess/web-frontend/src/providers/WalletProvider.js`

**Key Features:**
- Auto-detects available wallets
- Caches wallet state
- Handles reconnection
- Manages multiple wallet types
- Provides React context

### Wallet Services

**Location**: `onchainchess/web-frontend/src/services/wallet/`

**Structure:**
- Each wallet has own service file
- Exported through `index.ts`
- Singleton pattern for some services
- Error handling included

### Component Integration

**WalletSelector**: UI for choosing wallet
**WalletProvider**: Manages wallet state
**App**: Uses wallet for game operations

## ✅ Summary

**How wallets work:**
1. User selects wallet type
2. Wallet service connects
3. Account retrieved
4. Stored in WalletProvider
5. Used for all game operations
6. GraphQL uses account for mutations
7. Contract executes operations
8. Game state updates on-chain

**All wallets connect to Testnet Conway automatically!**

---

**For user guide**: See `WALLET_SETUP_GUIDE.md`
**For quick start**: See `WALLET_QUICK_START.md`
