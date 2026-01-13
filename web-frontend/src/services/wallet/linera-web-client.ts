/**
 * Linera Web Client Integration
 * This uses @linera/client for direct connection to Linera network
 * 
 * IMPORTANT: WASM must be initialized BEFORE importing @linera/client classes
 */

// We'll import these classes dynamically after WASM is initialized
// Using any for now since we're dynamically importing
let Faucet: any;
let Client: any;
let Wallet: any;
let Application: any;

let wasmInitPromise: Promise<void> | null = null;
async function ensureLineraWasm() {
  if (!wasmInitPromise) {
    wasmInitPromise = (async () => {
      try {
        // Load WASM from public directory
        // Files in /public cannot be imported directly in Vite, so we use a workaround
        const wasmIndexUrl = "/wasm/index.js";
        
        // Check if already loaded
        if ((window as any).__lineraWasmModule) {
          console.log("WASM already loaded");
          const init = (window as any).__lineraWasmModule.default || (window as any).__lineraWasmModule;
          await init();
        } else {
          // Fetch the WASM module code and execute it
          const response = await fetch(wasmIndexUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch WASM: ${response.status} ${response.statusText}`);
          }
          
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("text/html")) {
            throw new Error("WASM file not found - server returned HTML instead. Make sure /wasm/index.js exists in public directory.");
          }
          
          let code = await response.text();
          
          // Fix relative imports to use absolute paths from /wasm/
          // Replace relative imports like './snippets/...' with '/wasm/snippets/...'
          code = code.replace(/from\s+['"]\.\//g, (match) => {
            return match.replace('./', '/wasm/');
          });
          
          // Create a blob URL and import it
          const blob = new Blob([code], { type: "application/javascript" });
          const blobUrl = URL.createObjectURL(blob);
          
          try {
            // Use dynamic import with the blob URL
            const wasmModule = await import(/* @vite-ignore */ blobUrl);
            (window as any).__lineraWasmModule = wasmModule;
            const init = wasmModule.default || wasmModule;
            // Try to initialize - if WASM file doesn't exist, init() will handle it
            // The init function can accept undefined to use default path or a string path
            try {
              await init('/wasm/index_bg.wasm');
            } catch (error) {
              // If explicit path fails, try without path (might be embedded or use default)
              console.warn('Failed to load WASM with explicit path, trying default:', error);
              await init();
            }
          } finally {
            // Clean up blob URL after a delay to ensure module is loaded
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
          }
        }
        
        // Now import @linera/client which should work after WASM is loaded
        const lineraClient = await import("@linera/client");
        Faucet = lineraClient.Faucet;
        Client = lineraClient.Client;
        Wallet = lineraClient.Wallet;
        Application = lineraClient.Application;
      } catch (error) {
        console.error("WASM initialization error:", error);
        throw new Error(`Failed to initialize WASM: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    })();
  }
  return wasmInitPromise;
}

export interface LineraWebClientProvider {
  client: any;
  wallet: any;
  faucet: any;
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

  async setApplication(appId: string): Promise<any> {
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
