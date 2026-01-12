# OnChain Chess - Deployment Guide

This guide explains how to deploy the OnChain Chess application to Linera Testnet Conway using WSL.

## Prerequisites

- **WSL (Windows Subsystem for Linux)** installed and running.
- **Rust** installed in WSL.
- **Linera CLI** installed in WSL (`linera`) - **Must be version 0.15.7** (The deployment script will help you install this quickly using pre-built binaries).
- **Rust** installed in WSL.
- **Node.js** (for the frontend).

## Step-by-Step Deployment

### 1. Build and Deploy the Contract

Open your WSL terminal and navigate to the project directory:

```bash
cd /path/to/onchainchess
```

Run the deployment script:

```bash
bash DEPLOY_TESTNET_CONWAY.sh
```

This script will:
1.  Check for necessary tools.
2.  Build the Rust contract and service for WebAssembly.
3.  Initialize a Linera wallet connected to **Testnet Conway**.
4.  Publish the bytecode to the testnet.
5.  Create the application on the testnet.
6.  Generate a `.env` file for the frontend.
7.  Create a `DEPLOYMENT_INFO.txt` file with details.

### 2. Start the Linera Service

After the deployment script finishes successfully, you need to run the Linera service locally. This acts as a gateway for the frontend to communicate with the blockchain.

**Open a NEW terminal window (WSL)** and run:

```bash
linera service --port 8080
```

Keep this terminal running!

### 3. Start the Frontend

**Open another NEW terminal window (WSL)**, navigate to the `web-frontend` directory, and start the development server:

```bash
cd web-frontend
npm install
npm run dev
```

### 4. Play the Game

Open your browser (in Windows) and go to:

http://localhost:3000

The application should now be connected to the Linera Testnet Conway via your local service.

## Troubleshooting

-   **"Failed to connect to Linera"**: Ensure `linera service --port 8080` is running.
-   **"Chain ID mismatch"**: Ensure the `.env` file in `web-frontend` matches the output of `linera wallet show`. The deployment script handles this automatically.
-   **"Build failed"**: Make sure you have the `wasm32-unknown-unknown` target installed (`rustup target add wasm32-unknown-unknown`).

## For Judges/Reviewers

To verify the deployment:
1.  Run `bash DEPLOY_TESTNET_CONWAY.sh`.
2.  Run `linera service --port 8080` in a separate terminal.
3.  Run `npm run dev` in `web-frontend`.
4.  Test creating a game and making a move.
