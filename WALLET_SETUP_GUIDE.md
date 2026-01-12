# Complete Wallet Setup Guide - OnChain Chess

This guide will help you download, install, and use wallets with OnChain Chess for the Linera Wavehack.

## 🎯 Quick Overview

OnChain Chess supports **4 different wallet options**. You only need **ONE** of them to play:

1. **Linera Web Client** ⭐ (Easiest - No installation needed!)
2. **Croissant Wallet** ⭐ (Recommended browser extension)
3. **Linera Extension** (Official Linera wallet)
4. **Dynamic Wallet** (MetaMask, WalletConnect, etc.)

## 🚀 Option 1: Linera Web Client (EASIEST - Recommended!)

### ✅ Why Choose This?
- ✅ **No installation needed** - Works immediately
- ✅ **No browser extension required**
- ✅ **Perfect for Wavehack submission**
- ✅ **Works in any browser**

### 📥 How to Use

**Step 1:** Open the chess game in your browser

**Step 2:** Click "Connect Wallet" button

**Step 3:** Select "Linera Web Client"

**Step 4:** Click "Connect Web Client"

**That's it!** The wallet will automatically:
- Connect to Testnet Conway
- Create a wallet for you
- Get test tokens from the faucet
- Connect to the chess game

### 🔧 How It Works

The Linera Web Client uses the `@linera/client` package that's already included in the project. It:
1. Initializes Linera WASM modules in your browser
2. Creates a wallet automatically
3. Connects to Testnet Conway faucet
4. Claims a chain for you
5. Provides your account address

**No downloads, no installations, no extensions!**

---

## 🥐 Option 2: Croissant Wallet (Browser Extension)

### ✅ Why Choose This?
- ✅ Official Linera wallet solution
- ✅ Better user experience
- ✅ Persistent wallet storage
- ✅ Recommended for Wavehack

### 📥 Download & Install

**Step 1:** Visit Croissant Wallet website
```
https://croissant.linera.io
```

**Step 2:** Click "Install" or "Download"

**Step 3:** Add to your browser:
- **Chrome/Edge**: Click "Add to Chrome"
- **Firefox**: Click "Add to Firefox"
- **Brave**: Click "Add to Brave"

**Step 4:** Follow the installation prompts

**Step 5:** Create or import a wallet in Croissant

**Step 6:** Make sure you're connected to **Testnet Conway**

### 🎮 How to Use with Chess Game

**Step 1:** Open the chess game in your browser

**Step 2:** Click "Connect Wallet"

**Step 3:** Select "Croissant"

**Step 4:** Click "Connect Croissant"

**Step 5:** Approve the connection in Croissant popup

**Done!** Your wallet is now connected.

### 🔧 How It Works

Croissant is a browser extension that:
1. Stores your wallet securely in the browser
2. Provides a `window.croissant` object
3. Handles signing transactions
4. Manages your accounts and chains

---

## 🔌 Option 3: Linera Extension (Official)

### ✅ Why Choose This?
- ✅ Official Linera wallet
- ✅ Full Linera protocol support
- ✅ Advanced features

### 📥 Download & Install

**Step 1:** Go to Linera Protocol GitHub Releases
```
https://github.com/linera-io/linera-protocol/releases
```

**Step 2:** Download the latest release

**Step 3:** Extract the files

**Step 4:** Install as browser extension:
- **Chrome/Edge**: 
  1. Go to `chrome://extensions/`
  2. Enable "Developer mode"
  3. Click "Load unpacked"
  4. Select the extension folder

- **Firefox**:
  1. Go to `about:debugging`
  2. Click "This Firefox"
  3. Click "Load Temporary Add-on"
  4. Select the extension file

**Step 5:** Create or import wallet in extension

**Step 6:** Connect to Testnet Conway

### 🎮 How to Use with Chess Game

**Step 1:** Open the chess game

**Step 2:** Click "Connect Wallet"

**Step 3:** Select "Linera Extension"

**Step 4:** Click "Connect Extension"

**Step 5:** Approve in extension popup

**Done!**

### 🔧 How It Works

The Linera Extension:
1. Provides `window.linera` object
2. Handles all Linera operations
3. Manages wallet and chain state
4. Signs transactions

---

## 🌐 Option 4: Dynamic Wallet (MetaMask, etc.)

### ✅ Why Choose This?
- ✅ Use existing Ethereum wallets
- ✅ MetaMask, WalletConnect support
- ✅ Familiar interface

### 📥 Setup

**Step 1:** Install MetaMask (if you don't have it)
```
https://metamask.io
```

**Step 2:** Create or import wallet in MetaMask

**Step 3:** Open the chess game

**Step 4:** Click "Connect Wallet"

**Step 5:** Click "Dynamic Wallet" button

**Step 6:** Select MetaMask or your preferred wallet

**Step 7:** Approve connection

**Done!**

### 🔧 How It Works

Dynamic Wallet:
1. Uses Dynamic Labs SDK
2. Connects Ethereum wallets to Linera
3. Converts Ethereum addresses to Linera format
4. Handles signing through your Ethereum wallet

---

## 🎮 Complete Usage Flow

### First Time Setup

1. **Open the chess game**:
   ```
   http://localhost:3000/<CHAIN_ID>?app=<APP_ID>&owner=<OWNER_ID>&port=8080
   ```

2. **See the welcome screen** with wallet options

3. **Choose a wallet**:
   - **Easiest**: Click "Connect Web Client" (no installation)
   - **Best UX**: Install Croissant, then connect
   - **Already have MetaMask**: Use Dynamic Wallet

4. **Connect wallet**:
   - Click the connect button
   - Approve if extension popup appears
   - Wait for connection confirmation

5. **Start playing**:
   - Create a game
   - Join a game
   - Make moves!

### Daily Usage

1. Open the chess game
2. Wallet should auto-connect (if you used Web Client or have extension)
3. If not, click "Connect Wallet" again
4. Play chess!

---

## 🔍 How Wallet Connection Works

### Technical Flow

```
User clicks "Connect Wallet"
    ↓
WalletSelector shows options
    ↓
User selects wallet type
    ↓
Wallet service connects:
  - Linera Web Client: Creates wallet via @linera/client
  - Croissant: Uses window.croissant API
  - Linera Extension: Uses window.linera API
  - Dynamic: Uses Dynamic Labs SDK
    ↓
Wallet provides account address
    ↓
WalletProvider stores account
    ↓
App uses account for game operations
```

### What Happens Behind the Scenes

1. **Wallet Detection**: App checks which wallets are installed
2. **Connection**: Requests connection from selected wallet
3. **Account Retrieval**: Gets your account address
4. **Chain Setup**: Connects to Testnet Conway
5. **State Management**: Stores wallet state in React context
6. **Game Integration**: Uses account for all chess operations

---

## 📋 Wallet Comparison

| Feature | Web Client | Croissant | Linera Extension | Dynamic |
|---------|-----------|-----------|------------------|---------|
| Installation | ❌ None | ✅ Extension | ✅ Extension | ✅ Extension |
| Setup Time | ⚡ Instant | 🕐 2 min | 🕐 5 min | 🕐 2 min |
| Testnet Ready | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Wavehack Ready | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Persistent | ⚠️ Session | ✅ Yes | ✅ Yes | ✅ Yes |
| User Friendly | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

---

## 🎯 Recommended Setup for Wavehack

### For Quick Testing:
**Use Linera Web Client** - No installation, works immediately!

### For Best Experience:
**Use Croissant** - Install extension, better UX

### For Submission:
**Either works!** Both are accepted for Wavehack.

---

## 🔧 Troubleshooting

### Problem: "Wallet not found"

**Solution:**
- **Web Client**: Should always work, refresh page
- **Croissant**: Install from https://croissant.linera.io
- **Linera Extension**: Install from GitHub releases
- **Dynamic**: Install MetaMask first

### Problem: "Failed to connect"

**Solutions:**
1. Check browser console for errors
2. Make sure wallet is unlocked
3. Try refreshing the page
4. Try disconnecting and reconnecting
5. Check network connection

### Problem: "No accounts available"

**Solutions:**
1. Create account in wallet
2. Import existing account
3. For Web Client: It creates account automatically

### Problem: "Wrong network"

**Solutions:**
1. Make sure connected to **Testnet Conway**
2. Check wallet network settings
3. For Web Client: It auto-connects to Testnet Conway

### Problem: Wallet popup not appearing

**Solutions:**
1. Check browser popup blocker
2. Allow popups for the site
3. Check extension permissions
4. Try clicking connect button again

---

## 📱 Step-by-Step: First Time User

### Complete Walkthrough

**1. Open Chess Game**
```
http://localhost:3000/<CHAIN_ID>?app=<APP_ID>&owner=<OWNER_ID>&port=8080
```

**2. See Welcome Screen**
- You'll see "Welcome to OnChain Chess!"
- Wallet selector with options

**3. Choose Wallet (Easiest Option)**
- Click "Connect Web Client" button
- No installation needed!

**4. Wait for Connection**
- You'll see "Connecting..." message
- Takes 5-10 seconds
- Console shows: "✅ Linera wallet created successfully!"

**5. Wallet Connected!**
- You'll see your address in header
- Can now create/join games

**6. Create Your First Game**
- Click "+ Create New Game"
- Wait for confirmation
- Game appears in "Your Games"

**7. Play Chess!**
- Make moves by clicking pieces
- See move history update
- Enjoy!

---

## 🎓 Understanding Wallet Addresses

### What is a Wallet Address?

A wallet address is like your account number:
- **Format**: `0x1234567890abcdef...` (hexadecimal)
- **Length**: 40 characters (20 bytes)
- **Unique**: Each wallet has a unique address

### Where to Find Your Address

**After connecting:**
- Shown in top-right corner: `0x1234...5678`
- Also in browser console logs
- In wallet extension (if using extension)

### Using Your Address

Your address is used for:
- Creating games (as White player)
- Joining games (as Black player)
- Making moves
- Identifying you in games

---

## 🔐 Security Notes

### Wallet Security

1. **Never share your private key**
2. **Only connect to trusted sites**
3. **Verify URL is correct**
4. **Check wallet permissions**

### Testnet vs Mainnet

- **Testnet Conway**: Free test tokens, safe to use
- **Mainnet**: Real tokens, be careful!

**This chess game uses Testnet Conway** - safe for testing!

---

## 📚 Additional Resources

### Wallet Documentation

- **Croissant**: https://croissant.linera.io/docs
- **Linera Protocol**: https://linera.dev
- **Dynamic Labs**: https://docs.dynamic.xyz

### Support

- **Linera Discord**: For Linera-specific questions
- **GitHub Issues**: For technical problems
- **Documentation**: See `WALLET_INTEGRATION.md`

---

## ✅ Quick Checklist

Before playing:

- [ ] Chess game is running (`npm run dev`)
- [ ] Linera service is running (`linera service --port 8080`)
- [ ] Browser is open
- [ ] Choose a wallet option
- [ ] Connect wallet
- [ ] See your address in header
- [ ] Ready to play!

---

## 🎉 You're Ready!

Now you know how to:
- ✅ Download wallets (if needed)
- ✅ Connect wallets to chess game
- ✅ Use wallets for playing
- ✅ Troubleshoot connection issues

**Start playing OnChain Chess now!** ♟️🚀

---

**Need Help?** Check `WALLET_INTEGRATION.md` for technical details.
