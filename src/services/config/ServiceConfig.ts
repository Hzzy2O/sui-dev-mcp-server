import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs/promises';
import { NetworkEnvironment } from '../types/index.js';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { SuiGraphQLClient } from '@mysten/sui/graphql';

/**
 * Service Configuration Class
 * Provides global configuration and shared resources
 */
export class ServiceConfig {
  // Singleton instance
  private static instance: ServiceConfig;
  
  // Current network environment
  private _currentNetwork: NetworkEnvironment;
  
  // SUI RPC client
  private _client: SuiClient;
  
  // SUI GraphQL client
  private _graphqlClient: SuiGraphQLClient | null = null;
  
  // Storage directory
  private _storageDir: string;
  
  /**
   * Private constructor
   */
  private constructor(network: NetworkEnvironment = 'testnet') {
    this._currentNetwork = network;
    this._client = new SuiClient({ url: getFullnodeUrl(network) });
    this._storageDir = path.join(os.tmpdir(), 'sui-explorer-storage');
    
    // Initialize storage directory
    this.initStorageDir().catch(err => {
      console.warn(`Failed to initialize storage directory: ${err}`);
    });
    
    // GraphQL client only for mainnet and testnet
    if (network === 'mainnet' || network === 'testnet') {
      this.initGraphQLClient(network);
    }
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(network?: NetworkEnvironment): ServiceConfig {
    if (!ServiceConfig.instance) {
      ServiceConfig.instance = new ServiceConfig(network);
    } else if (network && network !== ServiceConfig.instance._currentNetwork) {
      // If a new network environment is specified, update the client
      ServiceConfig.instance._currentNetwork = network;
      ServiceConfig.instance._client = new SuiClient({ url: getFullnodeUrl(network) });
      
      // Update GraphQL client
      if (network === 'mainnet' || network === 'testnet') {
        ServiceConfig.instance.initGraphQLClient(network);
      } else {
        ServiceConfig.instance._graphqlClient = null;
      }
    }
    
    return ServiceConfig.instance;
  }
  
  /**
   * Initialize storage directory
   */
  private async initStorageDir() {
    try {
      await fs.mkdir(this._storageDir, { recursive: true });
      const verifiedDir = path.join(this._storageDir, 'verified-contracts');
      await fs.mkdir(verifiedDir, { recursive: true });
    } catch (error) {
      console.error(`Failed to create storage directories: ${error}`);
    }
  }
  
  /**
   * Initialize GraphQL client
   */
  private initGraphQLClient(network: 'mainnet' | 'testnet') {
    try {
      this._graphqlClient = new SuiGraphQLClient({ 
        url: network === 'mainnet' 
          ? 'https://sui-mainnet.mystenlabs.com/graphql'
          : 'https://sui-testnet.mystenlabs.com/graphql'
      });
    } catch (error) {
      console.warn(`Failed to initialize GraphQL client: ${error}`);
      this._graphqlClient = null;
    }
  }
  
  /**
   * Get current network environment
   */
  get currentNetwork(): NetworkEnvironment {
    return this._currentNetwork;
  }
  
  /**
   * Get SUI RPC client
   */
  get client(): SuiClient {
    return this._client;
  }
  
  /**
   * Get SUI GraphQL client
   */
  get graphqlClient(): SuiGraphQLClient | null {
    return this._graphqlClient;
  }
  
  /**
   * Get storage directory
   */
  get storageDir(): string {
    return this._storageDir;
  }
  
  /**
   * Update network environment
   */
  updateNetwork(network: NetworkEnvironment): void {
    this._currentNetwork = network;
    this._client = new SuiClient({ url: getFullnodeUrl(network) });
    
    // Update GraphQL client
    if (network === 'mainnet' || network === 'testnet') {
      this.initGraphQLClient(network);
    } else {
      this._graphqlClient = null;
    }
  }
} 
