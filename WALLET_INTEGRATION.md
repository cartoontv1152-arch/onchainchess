# Wallet Integration Guide - OnChain Chess

This guide explains how wallet integration works in OnChain Chess and how to connect using different wallet options.

## 🔗 Supported Wallets

OnChain Chess supports multiple wallet options for connecting to Linera Testnet Conway:

### 1. **Linera Web Client** (Preferred for Wavehack) ⭐
- Uses `@linera/client` package
- Direct connection to Linera network
- No browser extension required
- **Recommended for Wavehack submission**

### 2. **Croissant Wallet** ⭐
- Browser extension wallet for Linera
- Official Linera wallet solution
- **Recommended for Wavehack submission**
- Install from: https://croissant.linera.io

### 3. **Linera Extension**
- Official Linera wallet browser extension
- Download from: https://github.com/linera-io/linera-protocol/releases

### 4. **Dynamic Wallet**
- Ethereum-compatible wallet via Dynamic Labs
- Supports MetaMask, WalletConnect, etc.

## 📁 Wallet Files Location

All wallet integration code is located in:

```
onchainchess/web-frontend/src/
├── providers/
│   └── WalletProvider.js          # Main wallet provider (supports all wallet types)
├── services/wallet/
│   ├── linera-adapter.ts          # Linera adapter for Dynamic wallet
│   ├── dynamic-signer.ts          # Signer for Dynamic wallet
│   ├── croissant-wallet.ts        # Croissant wallet integration
│   ├── linera-web-client.ts       # Linera Web Client integration
│   └── index.ts                   # Exports
└── components/
    └── WalletSelector.jsx          # Wallet selection UI
```

## 🔌 How It Works

### Wallet Provider (`WalletProvider.js`)

The main wallet provider handles:
- Multiple wallet type detection
- Connection management
- Account state management
- Chain ID management
- Auto-reconnection

**Location**: `onchainchess/web-frontend/src/providers/WalletProvider.js`

### Wallet Services

#### 1. Linera Web Client (`linera-web-client.ts`)

Direct connection using `@linera/client`:

```typescript
import { lineraWebClient } from './services/wallet/linera-web-client';

// Connect
const provider = await lineraWebClient.connect('https://faucet.testnet-conway.linera.net');

// Get account
const address = provider.address;
const chainId = provider.chainId;

// Query application
const result = await lineraWebClient.queryApplication(appId, { query: '...' });
```

#### 2. Croissant Wallet (`croissant-wallet.ts`)

Browser extension wallet:

```typescript
import { croissantWallet } from './services/wallet/croissant-wallet';

// Check if installed
if (croissantWallet.isInstalled()) {
  // Connect
  const accounts = await croissantWallet.connect();
  const account = accounts[0];
  
  // Get chain ID
  const chainId = await croissantWallet.getChainId();
}
```

#### 3. Linera Extension

Uses `window.linera`:

```javascript
// Check if installed
if (window.linera) {
  // Connect
  const accounts = await window.linera.request({ 
    method: 'linera_requestAccounts' 
  });
}
```

#### 4. Dynamic Wallet

Uses Dynamic Labs SDK (already integrated in WalletProvider).

## 🎨 Wallet Selector Component

The `WalletSelector` component provides a UI for choosing and connecting wallets:

**Location**: `onchainchess/web-frontend/src/components/WalletSelector.jsx`

**Features**:
- Shows all available wallet options
- Detects installed wallets
- Provides install links for missing wallets
- Shows connection status
- Handles disconnection

## 🚀 Usage in App

The wallet is integrated in `App.jsx`:

```jsx
import { useWallet } from './providers';
import WalletSelector from './components/WalletSelector';

function App() {
  const { account, isConnected, connectWallet } = useWallet();
  
  // Use account for game operations
  // account is the connected wallet address
}
```

## 🔧 Configuration

### For Testnet Conway

The wallet automatically connects to Testnet Conway when:
- Using Linera Web Client with faucet URL: `https://faucet.testnet-conway.linera.net`
- Using Croissant or Linera Extension (configured in extension)

### Environment Variables

No special environment variables needed for wallet connection. The wallet uses:
- Chain ID from URL parameters or environment
- Application ID from URL parameters or environment
- Owner ID from URL parameters or environment

## 📝 Wavehack Requirements

According to Wavehack requirements, submissions should use one of:

1. ✅ **Linera Web client library** (with any signer backend) - **IMPLEMENTED**
2. ✅ **Croissant** - **IMPLEMENTED**
3. ✅ **CheCko Wallet** - Can be added similarly to Croissant
4. ✅ **Dockerized template** (for local network)

## 🎯 Recommended Setup for Wavehack

**For Testnet Conway submission, use:**

1. **Linera Web Client** (Preferred)
   - No installation required
   - Direct connection
   - Works in any browser

2. **Croissant Wallet** (Alternative)
   - Browser extension
   - Better UX
   - Official Linera wallet

## 🔍 How to Verify Connection

1. **Check console logs**:
   ```
   ✅ Linera WASM modules initialized
   ✅ Linera wallet created successfully!
   ✅ Linera application set successfully!
   ```

2. **Check wallet state**:
   ```javascript
   const { account, isConnected, walletType } = useWallet();
   console.log('Account:', account);
   console.log('Connected:', isConnected);
   console.log('Wallet Type:', walletType);
   ```

3. **Test game operations**:
   - Create a game (requires connected wallet)
   - Join a game (requires connected wallet)
   - Make moves (requires connected wallet)

## 🐛 Troubleshooting

### Wallet Not Connecting

1. **Check wallet installation**:
   - Croissant: Check if extension is installed
   - Linera Extension: Check if extension is installed
   - Web Client: No installation needed

2. **Check network**:
   - Ensure connected to Testnet Conway
   - Check faucet URL: `https://faucet.testnet-conway.linera.net`

3. **Check console errors**:
   - Look for connection errors
   - Check for missing dependencies

### Common Issues

**Issue**: "Wallet not found"
- **Solution**: Install the wallet extension or use Web Client

**Issue**: "Failed to connect"
- **Solution**: Check network connection and faucet URL

**Issue**: "No accounts available"
- **Solution**: Create/import account in wallet

## 📚 Additional Resources

- [Linera Documentation](https://linera.dev)
- [Croissant Wallet](https://croissant.linera.io)
- [Linera Protocol GitHub](https://github.com/linera-io/linera-protocol)
- [@linera/client NPM](https://www.npmjs.com/package/@linera/client)

---

**The wallet integration is complete and ready for Wavehack submission!** 🎉
