# Wallet FAQ - Frequently Asked Questions

## 🤔 General Questions

### Q: Do I need to download a wallet?
**A:** Not necessarily! **Linera Web Client** works without any download - just click "Connect Web Client" in the app. However, **Croissant** or **Linera Extension** require installation for better UX.

### Q: Which wallet should I use?
**A:** 
- **First time**: Use **Linera Web Client** (easiest, no installation)
- **Best experience**: Use **Croissant** (install extension)
- **Already have MetaMask**: Use **Dynamic Wallet**

### Q: Can I use multiple wallets?
**A:** Yes, but only one at a time. Disconnect one before connecting another.

### Q: Do wallets cost money?
**A:** No! All wallets work with **Testnet Conway** which provides free test tokens. No real money needed!

---

## 📥 Download & Installation

### Q: Where do I download Croissant?
**A:** https://croissant.linera.io

### Q: Where do I download Linera Extension?
**A:** https://github.com/linera-io/linera-protocol/releases

### Q: Do I need MetaMask?
**A:** Only if you want to use Dynamic Wallet. Otherwise, use Web Client or Croissant.

### Q: How long does installation take?
**A:**
- **Web Client**: 0 seconds (no installation)
- **Croissant**: ~2 minutes
- **Linera Extension**: ~5 minutes
- **MetaMask**: ~2 minutes

### Q: Can I install on mobile?
**A:** Web Client works on mobile browsers. Extensions require desktop browsers.

---

## 🔌 Connection Issues

### Q: Wallet won't connect, what do I do?
**A:** 
1. Refresh the page
2. Check browser console (F12) for errors
3. Make sure wallet is unlocked
4. Try Web Client (always works)
5. Check internet connection

### Q: "Wallet not found" error?
**A:**
- **Croissant**: Install from https://croissant.linera.io
- **Linera Extension**: Install from GitHub releases
- **Web Client**: Should always work, refresh page

### Q: Connection popup not appearing?
**A:**
1. Check browser popup blocker settings
2. Allow popups for the site
3. Check extension permissions
4. Try clicking connect button again

### Q: "Failed to connect" error?
**A:**
1. Check wallet is unlocked
2. Check network connection
3. Make sure connected to Testnet Conway
4. Try disconnecting and reconnecting
5. Check browser console for details

---

## 💰 Tokens & Network

### Q: Do I need tokens to play?
**A:** No! Testnet Conway gives free test tokens automatically.

### Q: How do I get test tokens?
**A:** Automatically! When you connect:
- Web Client: Gets tokens from faucet automatically
- Croissant: Request from faucet in extension
- Linera Extension: Request from faucet

### Q: What network should I use?
**A:** **Testnet Conway** - it's automatically selected for all wallets.

### Q: Can I use mainnet?
**A:** This chess game is configured for Testnet Conway. Don't use mainnet for testing!

---

## 🎮 Using Wallets

### Q: How do I connect my wallet?
**A:**
1. Open chess game
2. Click "Connect Wallet"
3. Select wallet type
4. Click connect button
5. Approve if popup appears

### Q: How do I disconnect?
**A:** Click "Disconnect" button in wallet selector or header.

### Q: Can I change wallets?
**A:** Yes! Disconnect current wallet, then connect a different one.

### Q: Where is my account address?
**A:** After connecting, you'll see it:
- In top-right corner: `0x1234...5678`
- In browser console logs
- In wallet extension (if using extension)

---

## 🔐 Security

### Q: Is my wallet safe?
**A:** Yes! This uses Testnet Conway (test network, not real money). However:
- Never share your private key
- Only connect to trusted sites
- Verify URL is correct
- Check wallet permissions

### Q: Should I use my mainnet wallet?
**A:** No! Use a separate testnet wallet or Web Client (creates test wallet).

### Q: What if I lose my seed phrase?
**A:** 
- **Web Client**: Creates new wallet each time (session-based)
- **Extensions**: You'll lose access - always save seed phrase!

### Q: Can someone steal my wallet?
**A:** Only if you share your private key or seed phrase. Never share these!

---

## 🛠️ Technical Questions

### Q: How does Web Client work?
**A:** Uses `@linera/client` package to create wallet in browser. No extension needed!

### Q: How does Croissant work?
**A:** Browser extension that provides `window.croissant` object for wallet operations.

### Q: What's the difference between wallets?
**A:**
- **Web Client**: No installation, session-based
- **Croissant**: Extension, persistent storage
- **Linera Extension**: Official extension, full features
- **Dynamic**: Uses Ethereum wallets

### Q: Which wallet is fastest?
**A:** Web Client is fastest to connect (no installation). All are fast once connected.

### Q: Can I use wallet offline?
**A:** No, wallets need internet to connect to Testnet Conway.

---

## 🎯 Wavehack Specific

### Q: Which wallet should I use for Wavehack?
**A:** Either **Linera Web Client** or **Croissant** - both are accepted!

### Q: Do I need to show wallet in demo?
**A:** Yes, judges need to see wallet connection working.

### Q: What if wallet doesn't work in demo?
**A:** Use Web Client as backup - it always works!

### Q: Can I submit with local network?
**A:** No, must use Testnet Conway. See `TESTNET_CONWAY_DEPLOYMENT.md`.

---

## 🐛 Troubleshooting

### Q: Page won't load?
**A:**
1. Check Linera service is running (`linera service --port 8080`)
2. Check frontend is running (`npm run dev`)
3. Check URL is correct
4. Check browser console for errors

### Q: Can't create game?
**A:**
1. Make sure wallet is connected
2. Check account address is shown
3. Check browser console for errors
4. Try refreshing page

### Q: Moves not working?
**A:**
1. Check it's your turn
2. Check wallet is connected
3. Check game status is "In Progress"
4. Check browser console for errors

### Q: Game not updating?
**A:**
1. Wait a few seconds (polls every 2 seconds)
2. Try refreshing page
3. Check GraphQL connection
4. Check Linera service is running

---

## 📚 More Help

### Q: Where can I learn more?
**A:**
- **Setup Guide**: `WALLET_SETUP_GUIDE.md`
- **Quick Start**: `WALLET_QUICK_START.md`
- **Technical**: `WALLET_INTEGRATION.md`
- **How It Works**: `HOW_WALLETS_WORK.md`

### Q: Where to get support?
**A:**
- **Linera Discord**: For Linera questions
- **GitHub Issues**: For technical problems
- **Documentation**: Check the `.md` files

---

## ✅ Quick Checklist

Before asking for help, check:

- [ ] Wallet is installed (if using extension)
- [ ] Wallet is unlocked
- [ ] Connected to Testnet Conway
- [ ] Browser console shows no errors
- [ ] Linera service is running
- [ ] Frontend is running
- [ ] Internet connection is working

---

**Still have questions?** Check the detailed guides or ask in Linera Discord!
