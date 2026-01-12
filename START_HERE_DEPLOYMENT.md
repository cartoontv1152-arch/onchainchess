# 🚀 START HERE - Deploy OnChain Chess to Testnet Conway

**Complete guide to deploy your chess app on Linera Testnet Conway using WSL**

---

## ⚡ Quick Start (5 minutes)

If you just want to deploy quickly:

```bash
# 1. Open WSL terminal
wsl

# 2. Navigate to project
cd /mnt/c/Users/parth/Desktop/onchainchess

# 3. Run deployment script
bash QUICK_DEPLOY.sh

# 4. Follow the instructions it prints
```

**That's it!** The script will:
- ✅ Build your contract
- ✅ Set up wallet for Testnet Conway
- ✅ Publish modules
- ✅ Create application
- ✅ Create .env file

Then just:
1. Start service: `linera service --port 8080`
2. Start frontend: `cd web-frontend && npm install && npm run dev`
3. Open browser: `http://localhost:3000/`

---

## 📚 Detailed Guides

### For Complete Step-by-Step Instructions:
👉 **[WSL_DEPLOYMENT_GUIDE.md](WSL_DEPLOYMENT_GUIDE.md)**

### For Automated Deployment:
👉 **[QUICK_DEPLOY.sh](QUICK_DEPLOY.sh)** or **[DEPLOY_TESTNET_CONWAY.sh](DEPLOY_TESTNET_CONWAY.sh)**

### For Troubleshooting:
👉 Check the troubleshooting section in WSL_DEPLOYMENT_GUIDE.md

---

## 🔧 Prerequisites Check

Before starting, verify you have:

```bash
# Check Rust
rustc --version
# Should show: rustc 1.70.0 or higher

# Check Linera
linera --version
# Should show: linera v0.16.0

# Check Node.js
node --version
# Should show: v16.0.0 or higher

# Check WASM target
rustup target list --installed | grep wasm32-unknown-unknown
# Should show: wasm32-unknown-unknown (installed)
```

**Missing something?** Install it before proceeding.

---

## 🎯 What You'll Need

After deployment, save these values:

- **Chain ID** (starts with `e...`)
- **Application ID** (starts with `e...`)
- **Owner ID** (starts with `0x...`)
- **Module ID** (starts with `e...`)

These will be printed by the deployment script or shown in `DEPLOYMENT_INFO.txt`.

---

## 📋 Deployment Checklist

- [ ] Prerequisites installed (Rust, Linera, Node.js)
- [ ] WASM target installed
- [ ] Contract builds successfully
- [ ] Wallet initialized with Testnet Conway
- [ ] Modules published
- [ ] Application created
- [ ] .env file created with correct values
- [ ] Linera service running
- [ ] Frontend dev server running
- [ ] Can access app in browser
- [ ] Can create a game
- [ ] Can make moves

---

## 🐛 Common Issues

### Build Fails: "cannot find crate"
**Solution:** You need to be in a Linera workspace OR use standalone Cargo.toml
- Option 1: Copy project to `linera-protocol/examples/onchainchess`
- Option 2: Copy `Cargo.toml.standalone` to `Cargo.toml`

### Deployment Fails: "Failed to publish module"
**Solution:** 
- Check you're connected to Testnet Conway (`--faucet https://faucet.testnet-conway.linera.net`)
- Verify WASM files exist
- Check network connection

### Frontend Can't Connect
**Solution:**
- Verify `linera service` is running on port 8080
- Check `.env` file has correct values
- Try accessing GraphQL endpoint: `http://localhost:8080/chains/YOUR_CHAIN_ID/applications/YOUR_APP_ID/graphql`

---

## ✅ Success Criteria

Your deployment is successful when:

1. ✅ Contract compiles without errors
2. ✅ Service WASM file exists
3. ✅ Application created on Testnet Conway
4. ✅ Linera service running and accessible
5. ✅ Frontend connects and shows UI
6. ✅ Can create a game
7. ✅ Can make moves
8. ✅ GraphQL queries work

---

## 🎉 Next Steps After Deployment

1. **Test the Application:**
   - Create a game
   - Join a game (from another browser/wallet)
   - Make moves
   - Verify moves are stored on-chain

2. **Prepare for Submission:**
   - Take screenshots
   - Record a demo video
   - Update README with live demo URL
   - Document Linera features used

3. **Share Your App:**
   - Get your live demo URL
   - Share with judges
   - Test with multiple users

---

## 📞 Need Help?

- Check **[WSL_DEPLOYMENT_GUIDE.md](WSL_DEPLOYMENT_GUIDE.md)** for detailed instructions
- Review troubleshooting section
- Check Linera Discord community
- Review Linera developer docs: https://linera.dev

---

**Ready to deploy?** Run `bash QUICK_DEPLOY.sh` or follow **[WSL_DEPLOYMENT_GUIDE.md](WSL_DEPLOYMENT_GUIDE.md)**!
