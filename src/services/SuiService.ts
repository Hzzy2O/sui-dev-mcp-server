import { NetworkEnvironment } from './types/index.js';
import { ServiceConfig } from './config/ServiceConfig.js';
import { NetworkService } from './NetworkService.js';
import { ObjectService } from './ObjectService.js';
import { TransactionService } from './TransactionService.js';
import { ContractService } from './ContractService.js';
import { WalletService } from './WalletService.js';

/**
 * Sui Service - Main service class
 * Serves as the entry point for all services
 */
export class SuiService {
  // Service references
  private networkService: NetworkService;
  private objectService: ObjectService;
  private transactionService: TransactionService;
  private contractService: ContractService;
  private walletService: WalletService;
  
  // Configuration
  private config: ServiceConfig;
  
  /**
   * Constructor
   */
  constructor(network: NetworkEnvironment = 'testnet') {
    // Initialize service configuration
    this.config = ServiceConfig.getInstance(network);
    
    // Initialize each service
    this.networkService = new NetworkService(network);
    this.objectService = new ObjectService(network);
    this.transactionService = new TransactionService(network);
    this.contractService = new ContractService(network);
    this.walletService = new WalletService(network);
  }
  
  /**
   * Get current network environment
   */
  get currentNetwork(): NetworkEnvironment {
    return this.config.currentNetwork;
  }
  
  // ===== Network service proxy methods =====
  
  /**
   * Switch network environment
   */
  async switchNetwork(network: NetworkEnvironment): Promise<{ success: boolean; network: NetworkEnvironment }> {
    return this.networkService.switchNetwork(network);
  }
  
  /**
   * Get network status
   */
  async getNetworkStatus() {
    return this.networkService.getNetworkStatus();
  }
  
  /**
   * Get network time
   */
  async getNetworkTime() {
    return this.networkService.getNetworkTime();
  }
  
  /**
   * Get Explorer URL
   */
  getExplorerUrl(type: 'transaction' | 'account' | 'object', identifier: string) {
    return this.networkService.getExplorerUrl(type, identifier);
  }
  
  // ===== Object service proxy methods =====
  
  /**
   * Get object details
   */
  async getObject(objectId: string) {
    return this.objectService.getObject(objectId);
  }
  
  /**
   * Batch retrieve objects
   */
  async getObjects(objectIds: string[]) {
    return this.objectService.getObjects(objectIds);
  }
  
  /**
   * Get objects owned by an address
   */
  async getOwnedObjects(address: string, options?: any) {
    return this.objectService.getOwnedObjects(address, options);
  }
  
  // ===== Transaction service proxy methods =====
  
  /**
   * Get transaction details
   */
  async getTransaction(digest: string) {
    return this.transactionService.getTransaction(digest);
  }
  
  /**
   * Analyze transaction gas usage
   */
  async analyzeGasUsage(digest: string) {
    return this.transactionService.analyzeGasUsage(digest);
  }
  
  /**
   * Execute a transaction
   * @param type Transaction type
   * @param params Transaction parameters
   * @param privateKey Private key for signing (required, will not be stored)
   * @param gasConfig Optional gas configuration
   * @returns Transaction data
   */
  async executeTransaction(
    type: 'transfer' | 'moveCall' | 'programmable', 
    params: Record<string, any>,
    privateKey: string,
    gasConfig?: any
  ) {
    return this.transactionService.executeTransaction(type, params, privateKey, gasConfig);
  }
  
  /**
   * Decode error
   */
  decodeError(errorCode: string) {
    return this.transactionService.decodeError(errorCode);
  }
  
  /**
   * Get address transaction history
   */
  async getAddressTransactions(address: string, limit?: number, cursor?: string, filter?: 'from' | 'to' | 'all' | 'package') {
    return this.transactionService.getAddressTransactions(address, limit, cursor, filter);
  }
  
  // ===== Contract service proxy methods =====
  
  /**
   * Get module Interface
   */
  async getModuleInterface(packageId: string, moduleName: string) {
    return this.contractService.getModuleInterface(packageId, moduleName);
  }
  
  /**
   * Get package Interface
   */
  async getPackageInterface(packageId: string) {
    return this.contractService.getPackageInterface(packageId);
  }
  
  /**
   * Generate Interface documentation
   */
  async generateInterfaceDocumentation(packageId: string, format?: 'markdown' | 'json') {
    return this.contractService.generateInterfaceDocumentation(packageId, format);
  }
  
  /**
   * Get contract source
   */
  async getContractSourcecode(packageId: string) {
    return this.contractService.getContractSourcecode(packageId);
  }
  
  // ===== Wallet service proxy methods =====
  
  /**
   * Create test wallet
   */
  async createNewWallet() {
    return this.walletService.createNewWallet();
  }
  
  /**
   * Request tokens from the faucet
   */
  async requestFaucetTokens(address: string) {
    return this.walletService.requestFaucetTokens(address);
  }
  
  /**
   * Get token metadata
   */
  async getTokenMetadata(typeString: string) {
    return this.walletService.getTokenMetadata(typeString);
  }
  
  /**
   * Get all token balances
   */
  async getAllTokenBalances(address: string) {
    return this.walletService.getAllTokenBalances(address);
  }
}
