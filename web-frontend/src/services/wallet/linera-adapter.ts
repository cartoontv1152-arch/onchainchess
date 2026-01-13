import { Faucet, Client, Wallet, Application } from "@linera/client";

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
      } catch (error) {
        console.error("WASM initialization error:", error);
        throw new Error(`Failed to initialize WASM: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    })();
  }
  return wasmInitPromise;
}
import type { Wallet as DynamicWallet } from "@dynamic-labs/sdk-react-core";
import { DynamicSigner } from "./dynamic-signer";

export interface LineraProvider {
  client: Client;
  wallet: Wallet;
  faucet: Faucet;
  address: string;
  chainId: string;
}

export class LineraAdapter {
  private static instance: LineraAdapter | null = null;
  private provider: LineraProvider | null = null;
  private application: Application | null = null;
  private wasmInitPromise: Promise<unknown> | null = null;
  private connectPromise: Promise<LineraProvider> | null = null;
  private onConnectionChange?: () => void;

  private constructor() {}

  static getInstance(): LineraAdapter {
    if (!LineraAdapter.instance) LineraAdapter.instance = new LineraAdapter();
    return LineraAdapter.instance;
  }

  async connect(
    dynamicWallet: DynamicWallet,
    rpcUrl: string = "https://faucet.testnet-conway.linera.net"
  ): Promise<LineraProvider> {
    if (this.provider) return this.provider;
    if (this.connectPromise) return this.connectPromise;

    if (!dynamicWallet) {
      throw new Error("Dynamic wallet is required for Linera connection");
    }

    try {
      this.connectPromise = (async () => {
        const { address } = dynamicWallet;
        console.log("🔗 Connecting with Dynamic wallet:", address);

        await ensureLineraWasm();

        const faucet = new Faucet(rpcUrl);
        // Create a temporary wallet for this session
        const wallet = new Wallet(); 
        
        // We use the Dynamic wallet as the signer
        const signer = new DynamicSigner(dynamicWallet);
        const client = new Client(wallet, signer);

        // Get or claim a chain for this user
        let chainId: string;
        try {
            console.log("Requesting chain from faucet...");
            chainId = await faucet.claimChain(wallet, address);
            console.log("✅ Chain claimed:", chainId);
        } catch (error) {
            console.error("Failed to claim chain:", error);
             // Fallback or retry logic could go here
             throw error;
        }

        // Configure the client with the claimed chain
        // client.addChain(chainId); // Hypothetical API, adjust based on actual Client API

        console.log("✅ Linera wallet setup complete!");

        this.provider = {
          client,
          wallet,
          faucet,
          chainId,
          address: dynamicWallet.address,
        };

        this.onConnectionChange?.();
        return this.provider;
      })();

      const provider = await this.connectPromise;
      return provider;
    } catch (error) {
      console.error("Failed to connect to Linera:", error);
      throw new Error(
        `Failed to connect to Linera network: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      this.connectPromise = null;
    }
  }

  async setApplication(appId: string) {
    if (!this.provider) throw new Error("Not connected to Linera");
    if (!appId) throw new Error("Application ID is required");

    const application = await this.provider.client
      .frontend()
      .application(appId);

    if (!application) throw new Error("Failed to get application");
    console.log("✅ Linera application set successfully!");
    this.application = application;
    this.onConnectionChange?.();
  }

  async queryApplication<T>(query: object): Promise<T> {
    if (!this.application) throw new Error("Application not set");

    const result = await this.application.query(JSON.stringify(query));
    const response = JSON.parse(result);

    console.log("✅ Linera application queried successfully!");
    return response as T;
  }

  getProvider(): LineraProvider {
    if (!this.provider) throw new Error("Provider not set");
    return this.provider;
  }

  getFaucet(): Faucet {
    if (!this.provider?.faucet) throw new Error("Faucet not set");
    return this.provider.faucet;
  }

  getWallet(): Wallet {
    if (!this.provider?.wallet) throw new Error("Wallet not set");
    return this.provider.wallet;
  }

  getApplication(): Application {
    if (!this.application) throw new Error("Application not set");
    return this.application;
  }

  isChainConnected(): boolean {
    return this.provider !== null;
  }

  isApplicationSet(): boolean {
    return this.application !== null;
  }

  onConnectionStateChange(callback: () => void): void {
    this.onConnectionChange = callback;
  }

  offConnectionStateChange(): void {
    this.onConnectionChange = undefined;
  }

  reset(): void {
    this.application = null;
    this.provider = null;
    this.connectPromise = null;
    this.onConnectionChange?.();
  }
}

// Export singleton instance
export const lineraAdapter = LineraAdapter.getInstance();
