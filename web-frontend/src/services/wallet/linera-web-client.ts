/**
 * Linera Web Client Integration
 * This uses @linera/client for direct connection to Linera network
 */

import initLinera, {
  Faucet,
  Client,
  Wallet,
  Application,
} from "@linera/client";

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
    rpcUrl: string = "https://faucet.testnet-conway.linera.net"
  ): Promise<LineraWebClientProvider> {
    if (this.provider) return this.provider;
    if (this.connectPromise) return this.connectPromise;

    try {
      this.connectPromise = (async () => {
        console.log("🔗 Initializing Linera Web Client...");

        // Initialize WASM modules
        try {
          if (!this.wasmInitPromise) {
            this.wasmInitPromise = initLinera();
          }
          await this.wasmInitPromise;
          console.log("✅ Linera WASM modules initialized");
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          if (msg.includes("storage is already initialized")) {
            console.warn("⚠️ Linera storage already initialized");
          } else {
            throw e;
          }
        }

        // Create faucet and wallet
        const faucet = await new Faucet(rpcUrl);
        const wallet = await faucet.createWallet();
        
        // Get the first account from wallet
        const accounts = await wallet.accounts();
        if (!accounts || accounts.length === 0) {
          throw new Error("No accounts found in wallet");
        }
        
        const address = accounts[0];
        const chainId = await faucet.claimChain(wallet, address);

        // Create client (without signer for read-only, or with signer for transactions)
        const client = await new Client(wallet);

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

    const application = await this.provider.client
      .frontend()
      .application(appId);

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
    this.wasmInitPromise = null;
    this.connectPromise = null;
  }
}

export const lineraWebClient = LineraWebClient.getInstance();
