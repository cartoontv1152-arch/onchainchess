/**
 * Linera Web Client Integration
 * This uses @linera/client for direct connection to Linera network
 */

import { Faucet, Client, Wallet, Application } from "@linera/client";

let wasmInitPromise: Promise<void> | null = null;
async function ensureLineraWasm() {
  if (!wasmInitPromise) {
    wasmInitPromise = (async () => {
      console.log("🔧 Starting WASM initialization...");
      
      try {
        // Try loading from public directory first (for Vite compatibility)
        const wasmIndexUrl = new URL(
          "/wasm/index.js",
          window.location.origin
        ).toString();
        
        console.log("📦 Loading WASM module from:", wasmIndexUrl);
        const wasmModule = await import(/* @vite-ignore */ wasmIndexUrl);
        
        // The init function might be the default export or a named export
        const init = wasmModule.default || wasmModule.init || wasmModule;
        
        if (typeof init !== 'function') {
          throw new Error(`WASM init is not a function. Got: ${typeof init}`);
        }
        
        const wasmUrl = new URL(
          "/wasm/index_bg.wasm",
          window.location.origin
        ).toString();
        
        console.log("📦 Initializing WASM with:", wasmUrl);
        const initResult = await init(wasmUrl);
        console.log("✅ WASM initialization function completed, result:", initResult);
        
        // Wait a bit to ensure WASM is fully loaded and check if it's actually initialized
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Verify WASM module is accessible
        if (!wasmModule.wasm && !(window as any).__wbindgen_malloc) {
          console.warn("⚠️ WASM module may not be fully initialized");
        } else {
          console.log("✅ WASM module verified as initialized");
        }
      } catch (error) {
        console.error("❌ Failed to load WASM from public directory:", error);
        // Fallback to node_modules path
        try {
          console.log("🔄 Trying fallback: node_modules path");
          const wasmIndexUrl = new URL(
            "/node_modules/@linera/client/dist/wasm/index.js",
            window.location.origin
          ).toString();
          const wasmModule = await import(/* @vite-ignore */ wasmIndexUrl);
          const init = wasmModule.default || wasmModule.init || wasmModule;
          
          if (typeof init !== 'function') {
            throw new Error(`WASM init is not a function in fallback. Got: ${typeof init}`);
          }
          
          const wasmUrl = new URL(
            "/node_modules/@linera/client/dist/wasm/index_bg.wasm",
            window.location.origin
          ).toString();
          await init(wasmUrl);
          console.log("✅ WASM initialized from node_modules (fallback)");
        } catch (fallbackError) {
          console.error("❌ Both WASM initialization methods failed:", fallbackError);
          throw new Error(`Failed to initialize WASM: ${error.message}. Fallback also failed: ${fallbackError.message}`);
        }
      }
    })();
  }
  return wasmInitPromise;
}

export interface LineraWebClientProvider {
  client: Client;
  wallet: Wallet;
  faucet: Faucet;
  address: string;
  chainId: string;
}

export class LineraWebClient {
  private static instance: LineraWebClient | null = null;
  private provider: LineraWebClientProvider | null = null;
  private wasmInitPromise: Promise<unknown> | null = null;
  private connectPromise: Promise<LineraWebClientProvider> | null = null;

  private constructor() {}

  static getInstance(): LineraWebClient {
    if (!LineraWebClient.instance) {
      LineraWebClient.instance = new LineraWebClient();
    }
    return LineraWebClient.instance;
  }

  async connect(
    rpcUrl: string = "http://localhost:8080"
  ): Promise<LineraWebClientProvider> {
    if (this.provider) return this.provider;
    if (this.connectPromise) return this.connectPromise;

    try {
      this.connectPromise = (async () => {
        console.log("🔗 Initializing Linera Web Client...");

        // Initialize WASM module first
        await ensureLineraWasm();

        // Create faucet and wallet
        const faucet = new Faucet(rpcUrl);
        const wallet = await faucet.createWallet();
        
        // Get the first account from wallet
        // Wallet API might vary - using type assertion for now
        const accounts = await (wallet as any).accounts();
        let address: string;
        
        if (Array.isArray(accounts) && accounts.length > 0) {
          address = accounts[0];
        } else if (accounts && typeof accounts === 'object' && 'length' in accounts) {
          address = (accounts as any)[0];
        } else {
          throw new Error("No accounts found in wallet");
        }
        const chainId = await faucet.claimChain(wallet, address);

        // Create client (without signer for read-only, or with signer for transactions)
        // Client constructor might need different parameters - using type assertion
        const client = new (Client as any)(wallet);

        console.log("✅ Linera Web Client connected successfully!");

        this.provider = {
          client,
          wallet,
          faucet,
          address,
          chainId,
        };

        return this.provider;
      })();

      const provider = await this.connectPromise;
      return provider;
    } catch (error) {
      console.error("Failed to connect Linera Web Client:", error);
      throw new Error(
        `Failed to connect to Linera network: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      this.connectPromise = null;
    }
  }

  async setApplication(appId: string): Promise<Application> {
    if (!this.provider) {
      throw new Error("Not connected to Linera Web Client");
    }
    if (!appId) {
      throw new Error("Application ID is required");
    }

    // Access application through client - API might be different
    const application = (this.provider.client as any).application(appId);

    if (!application) {
      throw new Error("Failed to get application");
    }

    console.log("✅ Linera application set successfully!");
    return application;
  }

  async queryApplication<T>(appId: string, query: object): Promise<T> {
    const application = await this.setApplication(appId);
    const result = await application.query(JSON.stringify(query));
    return JSON.parse(result) as T;
  }

  getProvider(): LineraWebClientProvider {
    if (!this.provider) {
      throw new Error("Provider not set");
    }
    return this.provider;
  }

  isConnected(): boolean {
    return this.provider !== null;
  }

  disconnect(): void {
    this.provider = null;
    this.connectPromise = null;
  }
}

export const lineraWebClient = LineraWebClient.getInstance();
