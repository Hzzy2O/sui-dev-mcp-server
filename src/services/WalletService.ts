import { CoinMetadata } from '@mysten/sui/client';
import { ServiceConfig } from './config/ServiceConfig.js';
import { NetworkEnvironment, TokenMetadata } from './types/index.js';
import { getFaucetHost, requestSuiFromFaucetV0 } from '@mysten/sui/faucet';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { generateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

/**
 * Wallet Service
 * Handles wallet and account related functionality
 */
export class WalletService {
  private config: ServiceConfig;

  constructor(network?: NetworkEnvironment) {
    this.config = ServiceConfig.getInstance(network);
  }

  /**
   * Create a new wallet
   */
  async createNewWallet(): Promise<{
    address: string;
    mnemonic: string;
    privateKey: string;
  }> {
    try {
      // Generate new mnemonic (24 words)
      const mnemonic = generateMnemonic(wordlist, 256);
      
      // Derive keypair from mnemonic
      const keypair = Ed25519Keypair.deriveKeypair(mnemonic);
      
      // Get address
      const address = keypair.getPublicKey().toSuiAddress();
      
      // Get private key
      const privateKey = keypair.getSecretKey();

      return {
        address,
        mnemonic,
        privateKey
      };
    } catch (error) {
      throw new Error(
        `Failed to create wallet: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Request tokens from a faucet
   */
  async requestFaucetTokens(address: string): Promise<{
    success: boolean;
    amount?: number;
    txHash?: string;
    message?: string;
  }> {
    try {
      // Check if trying to get tokens on mainnet (not allowed)
      if (this.config.currentNetwork === 'mainnet') {
        throw new Error('Cannot request faucet tokens on mainnet');
      }

      // In a real implementation, this would use the Sui SDK to request from faucet
      // Note: This is a mock implementation that simulates the actual SDK call
      console.log(
        `Requesting ${this.config.currentNetwork} tokens for address: ${address}`
      );

      // Note: For a real implementation we would do:
      //
      const { transferredGasObjects } = await requestSuiFromFaucetV0({
        host: getFaucetHost(this.config.currentNetwork),
        recipient: address,
      });

      // Response would depend on the network
      const amount =
        transferredGasObjects[0]?.amount;

      return {
        success: true,
        amount,
        txHash: transferredGasObjects[0]?.transferTxDigest,
        message: `${
          this.config.currentNetwork.charAt(0).toUpperCase() +
          this.config.currentNetwork.slice(1)
        } faucet tokens successfully requested (${amount / 1000000000} SUI)`,
      };
    } catch (error) {
      console.error('Error requesting faucet tokens:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get token metadata
   */
  async getTokenMetadata(coinType: string): Promise<CoinMetadata | null> {
    try {
        const metadata = await this.config.client.getCoinMetadata({
          coinType: coinType,
        });

        if (metadata) {
          return metadata;
        }

        // Fall back to minimal metadata
        return {
          name: 'Unknown Token',
          symbol: 'UNKNOWN',
          decimals: 9,
          description: 'Token metadata not available',
        };
      
    } catch (error) {
      console.error('Error retrieving token metadata:', error);
      return null;
    }
  }

  /**
   * Get all token balances for an address
   */
  async getAllTokenBalances(address: string): Promise<
    Array<{
      coinType: string;
      coinObjectCount: number;
      totalBalance: bigint;
      lockedBalance: bigint;
      metadata?: CoinMetadata;
    }>
  > {
    try {

      // Get all coins for this address
      const allCoins = await this.config.client.getAllCoins({
        owner: address,
      });

      // Process coin objects by type
      const balancesByType = new Map<
        string,
        {
          coinType: string;
          coinObjectCount: number;
          totalBalance: bigint;
          lockedBalance: bigint;
        }
      >();

      // Process each coin
      for (const coin of allCoins.data) {
        const coinType = coin.coinType;

        // Initialize entry if not exists
        if (!balancesByType.has(coinType)) {
          balancesByType.set(coinType, {
            coinType,
            coinObjectCount: 0,
            totalBalance: 0n,
            lockedBalance: 0n,
          });
        }

        // Update the entry
        const entry = balancesByType.get(coinType)!;
        entry.coinObjectCount++;

        // Add balance
        const balance = BigInt(coin.balance || '0');
        entry.totalBalance += balance;

        // Calculate locked balance (if applicable)
        // This is simplified; in real implementation it would check stake, etc.
      }

      // Convert to array and attach metadata
      const result = await Promise.all(
        Array.from(balancesByType.values()).map(async (balance) => {
          // Try to get metadata
          const metadata = await this.getTokenMetadata(balance.coinType);

          return {
            ...balance,
            metadata: metadata || undefined,
          };
        })
      );

      return result;
    } catch (error) {
      console.error('Error retrieving token balances:', error);
      return [];
    }
  }
}
