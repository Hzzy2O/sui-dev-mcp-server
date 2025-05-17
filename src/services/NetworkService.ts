import { ServiceConfig } from './config/ServiceConfig.js';
import { NetworkEnvironment, NetworkStatus } from './types/index.js';

/**
 * Network Service
 * Handles network switching and status related functionality
 */
export class NetworkService {
  private config: ServiceConfig;
  
  constructor(network?: NetworkEnvironment) {
    this.config = ServiceConfig.getInstance(network);
  }
  
  /**
   * Switch network environment
   */
  async switchNetwork(network: NetworkEnvironment): Promise<{
    success: boolean;
    network: NetworkEnvironment;
  }> {
    try {
      if (network === this.config.currentNetwork) {
        return {
          success: true,
          network: this.config.currentNetwork,
        };
      }
      
      // Update configuration to use new network
      this.config.updateNetwork(network);
      
      console.log(`Switched to network: ${network}`);
      
      return {
        success: true,
        network,
      };
    } catch (error) {
      console.error('Error switching network:', error);
      
      return {
        success: false,
        network: this.config.currentNetwork, // Return current network since switch failed
      };
    }
  }
  
  /**
   * Get current network status
   */
  async getNetworkStatus(): Promise<NetworkStatus> {
    try {
      
      const [checkpointSeq, systemState] = await Promise.all([
        this.config.client.getLatestCheckpointSequenceNumber(),
        this.config.client.getLatestSuiSystemState(),
      ]);

      // Calculate approximate TPS
      const referenceTransactionCount = parseInt(
        systemState.activeValidators[0]?.nextEpochStake ||
          '0'
      );
      const tps = Math.max(1, Math.floor(referenceTransactionCount / 86400)); // Very rough approximation
      
      const status = {
        isConnected: true,
        networkName: this.config.currentNetwork,
        version: systemState.protocolVersion,
        tps,
        latestCheckpointSequenceNumber: checkpointSeq,
      };
      
      return status;
    } catch (error) {
      return {
        isConnected: false,
        networkName: this.config.currentNetwork,
        version: 'unknown',
        tps: 0,
      };
    }
  }
  
  /**
   * Get current network time
   */
  async getNetworkTime(): Promise<{ timestamp: number }> {
    try {
      // Get latest checkpoint for timestamp
      const checkpoint = await this.config.client.getLatestCheckpointSequenceNumber();
      const checkpointData = await this.config.client.getCheckpoint({ id: checkpoint });
      
      return {
        timestamp: Number(checkpointData.timestampMs) || Date.now()
      };
    } catch (error) {
      console.error('Failed to get network time:', error);
      // Fallback to local time
      return {
        timestamp: Date.now()
      };
    }
  }
  
  /**
   * Get network explorer URL for an account or transaction or object
   */
  getExplorerUrl(type: 'object' | 'account' | 'transaction', id: string): string {
    // Determine correct explorer URL based on network
    const baseUrl = 'https://suiscan.xyz';
    const network = this.config.currentNetwork;
    
    // Create the appropriate URL path
    switch (type) {
      case 'account':
        return `${baseUrl}/${network}/account/${id}/portfolio`;
      case 'transaction':
        return `${baseUrl}/${network}/tx/${id}`;
      case 'object':
        return `${baseUrl}/${network}/object/${id}`;
      default:
        return baseUrl;
    }
  }
}
