# Wallet Visual Guide - Step by Step

## 🎯 Choose Your Wallet Path

```
┌─────────────────────────────────────────┐
│     Welcome to OnChain Chess!          │
│                                         │
│  Which wallet do you want to use?      │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐      ┌─────────────────┐
│ EASIEST PATH │      │  EXTENSION PATH │
│              │      │                 │
│ Web Client   │      │  Croissant     │
│              │      │  Linera Ext    │
│ No install!  │      │  MetaMask      │
└──────────────┘      └─────────────────┘
```

---

## 🚀 PATH 1: Linera Web Client (EASIEST!)

### Visual Flow:

```
Step 1: Open Chess Game
        ↓
Step 2: See Welcome Screen
        ↓
Step 3: Click "Connect Web Client"
        ↓
Step 4: Wait 5 seconds
        ↓
Step 5: ✅ Connected! Start Playing!
```

### What You See:

**Before:**
```
┌─────────────────────────────┐
│  Welcome to OnChain Chess!  │
│                             │
│  [Connect Web Client]  ← Click here!
│                             │
│  No installation needed!    │
└─────────────────────────────┘
```

**After:**
```
┌─────────────────────────────┐
│  ♟️ OnChain Chess           │
│  0x1234...5678  ← Your address│
│                             │
│  [+ Create New Game]        │
└─────────────────────────────┘
```

**Time:** 30 seconds total!

---

## 🥐 PATH 2: Croissant Wallet

### Visual Flow:

```
Step 1: Visit croissant.linera.io
        ↓
Step 2: Click "Install"
        ↓
Step 3: Add to Browser
        ↓
Step 4: Create Wallet in Extension
        ↓
Step 5: Open Chess Game
        ↓
Step 6: Click "Connect Croissant"
        ↓
Step 7: ✅ Connected! Start Playing!
```

### What You See:

**Installation:**
```
Browser Extension Store
┌─────────────────────────────┐
│  🥐 Croissant Wallet        │
│                             │
│  [Add to Chrome]  ← Click!  │
│                             │
│  Official Linera Wallet     │
└─────────────────────────────┘
```

**In Game:**
```
┌─────────────────────────────┐
│  Croissant                  │
│  ✅ Available               │
│                             │
│  [Connect Croissant] ← Click│
└─────────────────────────────┘
```

**Time:** 2 minutes total!

---

## 🔌 PATH 3: Linera Extension

### Visual Flow:

```
Step 1: GitHub Releases Page
        ↓
Step 2: Download Extension
        ↓
Step 3: Load in Browser
        ↓
Step 4: Create Wallet
        ↓
Step 5: Connect in Game
        ↓
Step 6: ✅ Connected!
```

**Time:** 5 minutes total!

---

## 🌐 PATH 4: Dynamic Wallet (MetaMask)

### Visual Flow:

```
Step 1: Install MetaMask (if needed)
        ↓
Step 2: Open Chess Game
        ↓
Step 3: Click "Dynamic Wallet"
        ↓
Step 4: Select MetaMask
        ↓
Step 5: Approve Connection
        ↓
Step 6: ✅ Connected!
```

**Time:** 2 minutes total!

---

## 📊 Comparison Chart

```
┌─────────────────┬──────────┬──────────┬──────────┐
│ Wallet          │ Install? │ Time    │ Difficulty│
├─────────────────┼──────────┼──────────┼──────────┤
│ Web Client      │    ❌    │  30 sec │   ⭐     │
│ Croissant       │    ✅    │  2 min  │   ⭐⭐   │
│ Linera Ext      │    ✅    │  5 min  │   ⭐⭐⭐ │
│ Dynamic         │    ✅    │  2 min  │   ⭐⭐   │
└─────────────────┴──────────┴──────────┴──────────┘
```

---

## 🎮 Complete User Journey

### First Time User Experience:

```
1. Open Chess Game
   ↓
2. See Welcome Screen
   ┌─────────────────────────────┐
   │ Welcome to OnChain Chess!   │
   │                             │
   │ Connect your wallet:         │
   │                             │
   │ [Connect Web Client]  ← Easiest│
   │ [Connect Croissant]          │
   │ [Connect Extension]          │
   │ [Dynamic Wallet]             │
   └─────────────────────────────┘
   ↓
3. Click "Connect Web Client"
   ↓
4. See "Connecting..." message
   ↓
5. Wallet Connected!
   ┌─────────────────────────────┐
   │ ✅ Wallet Connected          │
   │ Account: 0x1234...5678       │
   │                             │
   │ [+ Create New Game]         │
   └─────────────────────────────┘
   ↓
6. Create Game
   ↓
7. Play Chess! ♟️
```

---

## 🔍 What Happens When You Connect

### Behind the Scenes:

```
User clicks "Connect"
        ↓
┌───────────────────────┐
│ Wallet Detection      │
│ - Check extensions   │
│ - Check Web Client    │
└───────────────────────┘
        ↓
┌───────────────────────┐
│ Connection Request    │
│ - Call wallet API    │
│ - Request accounts   │
└───────────────────────┘
        ↓
┌───────────────────────┐
│ Account Retrieved     │
│ - Get address         │
│ - Get chain ID        │
└───────────────────────┘
        ↓
┌───────────────────────┐
│ State Updated         │
│ - Store account       │
│ - Update UI           │
└───────────────────────┘
        ↓
✅ Ready to Play!
```

---

## 💡 Quick Tips

### For First Time:
```
👉 Use Web Client - No thinking needed!
```

### For Best Experience:
```
👉 Install Croissant - Better UX
```

### For Demo:
```
👉 Use Web Client - Always works!
```

---

## 🆘 Troubleshooting Visual

```
Problem: "Wallet not found"
    ↓
Solution: Use Web Client instead
    ↓
✅ Works immediately!
```

```
Problem: "Can't connect"
    ↓
Check: Browser console (F12)
    ↓
Check: Wallet unlocked?
    ↓
Try: Refresh page
    ↓
✅ Should work!
```

---

## 📱 Mobile vs Desktop

```
Desktop Browser:
├── Web Client ✅ Works
├── Croissant ✅ Works
├── Linera Ext ✅ Works
└── Dynamic ✅ Works

Mobile Browser:
├── Web Client ✅ Works
├── Croissant ❌ No extensions
├── Linera Ext ❌ No extensions
└── Dynamic ⚠️ Limited
```

---

## ✅ Success Indicators

### You're Connected When You See:

```
✅ Account address in header: 0x1234...5678
✅ "Create New Game" button enabled
✅ No "Connect Wallet" message
✅ Can create/join games
```

---

**Ready to connect?** Choose your path and start playing! 🎮
