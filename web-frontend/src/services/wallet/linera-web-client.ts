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
        const wasmIndexUrl = new URL("/wasm/index.js", window.location.origin).toString();
        const init = (await import(/* @vite-ignore */ wasmIndexUrl)).default;
        await init();
        const lineraClient = await import("@linera/client");
        Faucet = lineraClient.Faucet;
        Client = lineraClient.Client;
        Wallet = lineraClient.Wallet;
        Application = lineraClient.Application;
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
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
