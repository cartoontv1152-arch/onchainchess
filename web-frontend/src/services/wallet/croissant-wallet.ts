/**
 * Croissant Wallet Integration
 * Croissant is a browser extension wallet for Linera
 */

export interface CroissantProvider {
  isCroissant?: boolean;
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (event: string, callback: (...args: any[]) => void) => void;
  removeListener: (event: string, callback: (...args: any[]) => void) => void;
}

declare global {
  interface Window {
    croissant?: CroissantProvider;
    linera?: any;
  }
}

export class CroissantWallet {
  private static instance: CroissantWallet | null = null;
  private provider: CroissantProvider | null = null;

  private constructor() {}

  static getInstance(): CroissantWallet {
    if (!CroissantWallet.instance) {
      CroissantWallet.instance = new CroissantWallet();
    }
    return CroissantWallet.instance;
  }

  isInstalled(): boolean {
    return typeof window !== 'undefined' && !!window.croissant;
  }

  async connect(): Promise<string[]> {
    if (!this.isInstalled()) {
      throw new Error(
        'Croissant wallet not installed. Please install from https://croissant.linera.io'
      );
    }

    this.provider = window.croissant!;

    try {
      const accounts = await this.provider.request({
        method: 'linera_requestAccounts',
        params: [],
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from Croissant wallet');
      }

      return accounts;
    } catch (error) {
      console.error('Croissant connection error:', error);
      throw new Error(
        `Failed to connect to Croissant wallet: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  async getAccounts(): Promise<string[]> {
    if (!this.provider) {
      throw new Error('Croissant wallet not connected');
    }

    try {
      const accounts = await this.provider.request({
        method: 'linera_getAccounts',
        params: [],
      });

      return accounts || [];
    } catch (error) {
      console.error('Error getting accounts:', error);
      return [];
    }
  }

  async getChainId(): Promise<string> {
    if (!this.provider) {
      throw new Error('Croissant wallet not connected');
    }

    try {
      const chainId = await this.provider.request({
        method: 'linera_getChainId',
        params: [],
      });

      return chainId?.toString() || '1';
    } catch (error) {
      console.error('Error getting chain ID:', error);
      return '1';
    }
  }

  async signMessage(message: string, account: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Croissant wallet not connected');
    }

    try {
      const signature = await this.provider.request({
        method: 'linera_signMessage',
        params: [message, account],
      });

      return signature;
    } catch (error) {
      console.error('Error signing message:', error);
      throw new Error(
        `Failed to sign message: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  onAccountsChanged(callback: (accounts: string[]) => void): void {
    if (!this.provider) return;

    this.provider.on('accountsChanged', callback);
  }

  onChainChanged(callback: (chainId: string) => void): void {
    if (!this.provider) return;

    this.provider.on('chainChanged', callback);
  }

  removeListeners(): void {
    if (!this.provider) return;

    // Note: Croissant may not have removeListener, so we check
    if (typeof this.provider.removeListener === 'function') {
      // Remove listeners if available
    }
  }

  disconnect(): void {
    this.provider = null;
  }
}

export const croissantWallet = CroissantWallet.getInstance();
