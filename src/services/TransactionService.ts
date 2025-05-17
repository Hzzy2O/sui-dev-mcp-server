import { ServiceConfig } from './config/ServiceConfig.js';
import { SuiTransaction, NetworkEnvironment } from './types/index.js';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { toBase64 } from '@mysten/sui/utils';

/**
 * Transaction Service
 * Handles transaction query and building related functionality
 */
export class TransactionService {
  private config: ServiceConfig;
  
  constructor(network?: NetworkEnvironment) {
    this.config = ServiceConfig.getInstance(network);
  }
 
  /**
   * Get transaction details
   */
  async getTransaction(digest: string): Promise<SuiTransaction> {
    try {
      
      const response = await this.config.client.getTransactionBlock({
        digest,
        options: {
          showEffects: true,
          showInput: true,
          showEvents: true,
        },
      });

      const transaction = response as unknown as SuiTransaction;
      return transaction;
    } catch (error) {
      throw new Error(
        `Failed to get transaction: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
  
  /**
   * Analyze transaction gas usage
   */
  async analyzeGasUsage(
    digest: string
  ): Promise<{
    computationCost: string;
    storageCost: string;
    storageRebate: string;
    totalGasCost: string;
  }> {
    try {
      
      const tx = await this.config.client.getTransactionBlock({
        digest,
        options: { showEffects: true },
      });

      const effects = tx.effects;
      if (!effects || !effects.gasUsed) {
        throw new Error('Transaction effects not available');
      }

      const { computationCost, storageCost, storageRebate } = effects.gasUsed;
      const totalGasCost = (
        BigInt(computationCost) +
        BigInt(storageCost) -
        BigInt(storageRebate)
      ).toString();

      const analysis = {
        computationCost,
        storageCost,
        storageRebate,
        totalGasCost,
      };
      
      return analysis;
    } catch (error) {
      throw new Error(
        `Failed to analyze gas usage: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
  
  /**
   * Execute transaction
   * @param type - Type of transaction
   * @param params - Transaction parameters 
   * @param privateKey - Private key for signing (required, will not be stored)
   * @param gasConfig - Optional gas configuration
   * @returns Transaction data
   */
  async executeTransaction(
    type: 'transfer' | 'moveCall' | 'programmable',
    params: Record<string, any>,
    privateKey: string,
    gasConfig?: {
      budget?: number;
      price?: number;
    }
  ): Promise<any> {
    try {
      // Create a new transaction block
      const tx = new Transaction();
      
      if (type === 'transfer') {
        // Transfer transaction
        if (!params.recipient || !params.amount) {
          throw new Error('Transfer requires recipient and amount');
        }
        
        tx.transferObjects(
          [tx.gas], // In an actual implementation, this would be the actual token objects
          tx.pure(params.recipient)
        );
      } else if (type === 'moveCall') {
        // Call Move function
        if (!params.target || !params.arguments) {
          throw new Error('MoveCall requires target and arguments');
        }
        
        // Assume target format is "package::module::function"
        const [packageId, module, functionName] = params.target.split('::');
        
        tx.moveCall({
          target: `${packageId}::${module}::${functionName}`,
          arguments: params.arguments.map((arg: any) => tx.pure(arg)),
          typeArguments: params.typeArguments || []
        });
      } else if (type === 'programmable') {
        // Programmable Transaction Block
        return await this.buildProgrammableTransaction(params, privateKey, gasConfig);
      }
      
      // Set gas budget
      if (gasConfig?.budget) {
        tx.setGasBudget(gasConfig.budget);
      }
      
      // Build transaction bytes
      const txBytes = await tx.build({ client: this.config.client });
      
      // Since privateKey is now required, create keypair and sign transaction
      let keyPair: Ed25519Keypair;
      
      // Check if private key is in the suiprivkey1 format
      if (privateKey.startsWith('suiprivkey1')) {
        // Directly use the Bech32 encoded private key
        keyPair = Ed25519Keypair.fromSecretKey(privateKey);
      } else {
        // Treat as hex format
        // Create keypair from private key (remove 0x prefix if present)
        const privateKeyHex = privateKey.replace(/^0x/, '');
        
        // Convert hex string to byte array
        const privateKeyBytes = new Uint8Array(
          privateKeyHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
        );
        
        // Create keypair from secret key
        keyPair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
      }
      
      // Convert txBytes from base64 to Uint8Array for signing
      // @ts-ignore - Bypassing type checking for Buffer conversion
      const tx_buffer = Buffer.from(txBytes, 'base64');
      const txBytesData = new Uint8Array(tx_buffer);
      
      // Sign the transaction
      const signatureResult = await keyPair.signPersonalMessage(txBytesData);
      
      // Get the signer's address
      const signerAddress = keyPair.getPublicKey().toSuiAddress();
      
      // Optional: If the transaction should be executed immediately, do so
      let transactionDigest: string | undefined;
      
      if (params.executeImmediately) {
        try {
          // Submit the transaction with signature
          const executeResult = await this.config.client.executeTransactionBlock({
            transactionBlock: txBytes,
            signature: signatureResult.signature,
            options: { showEffects: true }
          });
          
          // Extract the digest from the execution result
          transactionDigest = executeResult.digest;
        } catch (execError) {
          console.error('Failed to execute transaction:', execError);
          // Continue without execution - just return the signed transaction
        }
      }
      
      // Return serialized transaction
      return {
        txBytes,
        signature: signatureResult.signature,
        signatureScheme: 'ED25519',
        signer: signerAddress,
        digest: transactionDigest // Will be undefined if not executed
      };
    } catch (error) {
      throw new Error(`Failed to execute transaction: ${error}`);
    }
  }
  
  /**
   * Build a signed programmable transaction block with multiple operations
   * @param params - Transaction parameters including operations
   * @param privateKey - Private key for signing (required, will not be stored)
   * @param gasConfig - Optional gas configuration
   * @returns Signed transaction data ready for execution
   */
  async buildProgrammableTransaction(
    params: Record<string, any>,
    privateKey: string,
    gasConfig?: {
      budget?: number;
      price?: number;
    }
  ): Promise<any> {
    try {
      if (!privateKey) {
        throw new Error('Private key is required for signing transaction');
      }

      let keyPair: Ed25519Keypair;
      
      // Check if private key is in the suiprivkey1 format
      if (privateKey.startsWith('suiprivkey1')) {
        // Directly use the Bech32 encoded private key
        keyPair = Ed25519Keypair.fromSecretKey(privateKey);
      } else {
        // Treat as hex format
        // Create keypair from private key (remove 0x prefix if present)
        const privateKeyHex = privateKey.replace(/^0x/, '');
        
        // Convert hex string to byte array
        const privateKeyBytes = new Uint8Array(
          privateKeyHex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
        );
        
        // Create keypair from secret key
        keyPair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
      }
      
      // Get the signer's address
      const signerAddress = keyPair.getPublicKey().toSuiAddress();
      
      console.log('Using derived sender address:', signerAddress);
      
      // Build the transaction block
      const tx = new Transaction();
      
      // Set sender
      tx.setSender(signerAddress);
      
      // Process each transaction operation
      if (params.transactions && Array.isArray(params.transactions)) {
        for (const operation of params.transactions) {
          const { kind } = operation;
          
          switch (kind) {
            case 'moveCall':
              if (!operation.target) {
                throw new Error('MoveCall requires target field');
              }
              
              // Parse the target string
              const [packageId, module, func] = operation.target.split('::');
              
              // Prepare arguments
              const args = operation.arguments || [];
              const typeArgs = operation.typeArguments || [];
              
              // Make the move call
              tx.moveCall({
                target: `${packageId}::${module}::${func}`,
                arguments: args.map((arg: any) => {
                  // If arg is a Result reference, pass as is
                  if (typeof arg === 'object' && arg !== null && 'Result' in arg) {
                    return arg;
                  }
                  // Otherwise wrap it with pure
                  return tx.pure(arg);
                }),
                typeArguments: typeArgs
              });
              break;
              
            case 'transferObjects':
              if (!operation.objects) {
                throw new Error('TransferObjects requires objects');
              }
              
              if (!operation.recipientAddress) {
                throw new Error('TransferObjects requires recipientAddress');
              }
              
              // Handle objects - could be direct objects or results from previous operations
              const objects = operation.objects.map((obj: any) => {
                if (typeof obj === 'object' && obj !== null && 'Result' in obj) {
                  // This is a reference to a previous operation result
                  return obj;
                } else {
                  // This is a direct object reference
                  return tx.object(obj);
                }
              });
              
              // Transfer the objects
              tx.transferObjects(
                objects, 
                tx.pure.address(operation.recipientAddress)
              );
              break;
              
            case 'splitCoins':
              if (!operation.coin) {
                throw new Error('SplitCoins requires coin');
              }
              
              const coin = typeof operation.coin === 'object' && operation.coin !== null && 'Result' in operation.coin
                ? operation.coin // Result reference
                : tx.object(operation.coin); // Object ID
              
              // Ensure amounts are wrapped with pure
              const amounts = (operation.amounts || []).map((amt: any) => tx.pure(amt));
              tx.splitCoins(coin, amounts);
              break;
              
            case 'mergeCoins':
              if (!operation.destinationCoin || !operation.sourceCoins) {
                throw new Error('MergeCoins requires destinationCoin and sourceCoins');
              }
              
              const destCoin = typeof operation.destinationCoin === 'object' 
                && operation.destinationCoin !== null 
                && 'Result' in operation.destinationCoin
                ? operation.destinationCoin
                : tx.object(operation.destinationCoin);
              
              const sourceCoins = operation.sourceCoins.map((coin: any) => {
                if (typeof coin === 'object' && coin !== null && 'Result' in coin) {
                  return coin;
                }
                return tx.object(coin);
              });
              
              tx.mergeCoins(destCoin, sourceCoins);
              break;
              
            default:
              throw new Error(`Unsupported operation kind: ${kind}`);
          }
        }
      }
      
      // Set gas budget
      if (gasConfig?.budget) {
        tx.setGasBudget(gasConfig.budget);
      }
      
      // Set gas price if provided
      if (gasConfig?.price) {
        tx.setGasPrice(gasConfig.price);
      }
      
      // Build the transaction block
      const builtTx = await tx.build({ client: this.config.client });
      
      // First sign the transaction bytes
      const signatureSchemeName = 'ED25519';
      
      const signatureData = await keyPair.signTransaction(builtTx);
      const signatureBase64 = signatureData.signature;
      
      // For debugging, show the data we're working with
      console.log('Transaction bytes length:', builtTx.length);
      console.log('Public key (base64):', keyPair.getPublicKey().toBase64());
      console.log('Signature (base64):', signatureBase64);
      
      let transactionDigest: string | undefined;
      let txBytesBase64 = toBase64(builtTx);
      
      // Execute transaction if requested
      if (params.executeImmediately) {
        try {
          // Execute the transaction with our signature
          console.log('Executing transaction...');
          const executeResult = await this.config.client.executeTransactionBlock({
            transactionBlock: txBytesBase64,
            signature: [signatureBase64],
            options: { 
              showEffects: true,
              showEvents: true 
            }
          });
          
          transactionDigest = executeResult.digest;
          console.log('Transaction executed with digest:', transactionDigest);
          
          return {
            txBytes: txBytesBase64,
            signature: signatureBase64,
            signatureScheme: signatureSchemeName,
            signer: signerAddress,
            digest: transactionDigest,
            effects: executeResult.effects
          };
        } catch (execError) {
          console.error('Failed to execute transaction:', execError);
          // Fall through to non-execution path
        }
      }
      
      // Return transaction details whether execution was attempted or not
      return {
        txBytes: txBytesBase64,
        signature: signatureBase64, 
        signatureScheme: signatureSchemeName,
        signer: signerAddress,
        digest: transactionDigest
      };
    } catch (error) {
      console.error('Transaction building error:', error);
      throw new Error(`Failed to build programmable transaction: ${error}`);
    }
  }
  
  /**
   * Decode Sui error codes
   */
  async decodeError(errorCode: string): Promise<{ 
    title: string; 
    description: string;
  }> {
    try {
      // Common Sui error codes and their meanings
      const errorMap: Record<string, { title: string; description: string }> = {
        'InsufficientGas': {
          title: 'Insufficient Gas',
          description: 'The transaction did not have enough gas to complete execution.'
        },
        'ObjectNotFound': {
          title: 'Object Not Found',
          description: 'The requested object was not found in the Sui network.'
        },
        'InvalidSignature': {
          title: 'Invalid Signature',
          description: 'The provided signature is invalid or does not match the expected signer.'
        },
        'MoveTypeError': {
          title: 'Move Type Error',
          description: 'There was a type error in the Move code execution.'
        },
        'MoveRuntimeError': {
          title: 'Move Runtime Error',
          description: 'A runtime error occurred during Move code execution.'
        },
        'MoveAbort': {
          title: 'Move Abort',
          description: 'The Move code execution was aborted.'
        },
        'MovePrimitiveRuntimeError': {
          title: 'Move Primitive Runtime Error',
          description: 'A primitive runtime error occurred during Move code execution.'
        },
        'AlreadySharedError': {
          title: 'Already Shared Error',
          description: 'The object is already shared and cannot be shared again.'
        },
        'PreviouslySharedError': {
          title: 'Previously Shared Error',
          description: 'The object was previously shared.'
        },
        'AuthorityValidatorError': {
          title: 'Authority Validator Error',
          description: 'There was an error validating the transaction authority.'
        },
        'InvalidTransactionError': {
          title: 'Invalid Transaction Error',
          description: 'The transaction format or data is invalid.'
        },
        'InvalidCoinParameter': {
          title: 'Invalid Coin Parameter',
          description: 'One or more coin parameters in the transaction are invalid.'
        },
        'GasInsufficientError': {
          title: 'Gas Insufficient Error',
          description: 'The gas budget for the transaction is insufficient.'
        }
      };
      
      // Check if we have a predefined error
      if (errorCode in errorMap) {
        return errorMap[errorCode];
      }
      
      // For unknown errors, provide a generic response
      return {
        title: 'Unknown Error',
        description: `Unknown error code: ${errorCode}`
      };
    } catch (error) {
      throw new Error(
        `Failed to decode error: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
  
  /**
   * Get transactions for an address
   */
  async getAddressTransactions(
    address: string,
    limit: number = 10,
    cursor?: string,
    filter: 'from' | 'to' | 'all' | 'package' = 'from'
  ): Promise<{
    data: any[];
    nextCursor?: string;
    hasNextPage: boolean;
  }> {
    try {

      // Try GraphQL method first (if available)
      if (this.config.graphqlClient) {
        try {
          const graphqlResult = await this.fetchTransactionsViaGraphQL(address, limit, cursor, filter);
          if (graphqlResult) {
            return graphqlResult;
          }
        } catch (graphQLError) {
          // GraphQL failed, falling back to RPC
        }
      }

      // Fall back to RPC method
      const rpcResult = await this.fetchTransactionsViaRPC(address, limit, cursor, filter);
      return rpcResult;
      
    } catch (error) {
      throw new Error(
        `Failed to get address transactions: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * Fetch transactions using GraphQL API
   * @private
   */
  private async fetchTransactionsViaGraphQL(
    address: string,
    limit: number,
    cursor?: string,
    filter: 'from' | 'to' | 'all' | 'package' = 'from'
  ): Promise<{
    data: any[];
    nextCursor?: string;
    hasNextPage: boolean;
  } | null> {
    try {
      // Build GraphQL query based on filter type
      let query = '';
      
      // Construct the appropriate query based on filter type
      if (filter === 'from') {
        query = `
          query GetTransactions($address: String!, $cursor: String, $limit: Int) {
            address(address: $address) {
              transactions: transactionBlocks(first: $limit, after: $cursor) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  digest
                  sender {
                    address
                  }
                  effects {
                    status
                  }
                }
              }
            }
          }
        `;
      } else if (filter === 'to') {
        query = `
          query GetTransactionsToAddress($address: String!, $cursor: String, $limit: Int) {
            address(address: $address) {
              transactionBlocks(first: $limit, after: $cursor) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  digest
                  sender {
                    address
                  }
                  effects {
                    status
                  }
                }
              }
            }
          }
        `;
      } else if (filter === 'all') {
        query = `
          query GetAllTransactions($address: String!, $cursor: String, $limit: Int) {
            address(address: $address) {
              transactionBlocks(first: $limit, after: $cursor) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  digest
                  sender {
                    address
                  }
                  effects {
                    status
                  }
                }
              }
            }
          }
        `;
      } else if (filter === 'package') {
        query = `
          query GetPackageTransactions($address: String!, $cursor: String, $limit: Int) {
            object(address: $address) {
              transactions: transactionBlocks(first: $limit, after: $cursor) {
                pageInfo {
                  hasNextPage
                  endCursor
                }
                nodes {
                  digest
                  sender {
                    address
                  }
                  effects {
                    status
                  }
                }
              }
            }
          }
        `;
      }
      
      if (!this.config.graphqlClient) {
        return null;
      }
      
      const result = await this.config.graphqlClient.query({
        query,
        variables: {
          address,
          limit,
          cursor
        }
      }) as any;
      
      // Extract results based on the filter type
      let txData: any = null;
      let nodes: any[] = [];
      let pageInfo: any = null;
      
      if (filter === 'from') {
        txData = result?.data?.address?.transactions;
      } else if (filter === 'to' || filter === 'all') {
        txData = result?.data?.address?.transactionBlocks;
      } else if (filter === 'package') {
        txData = result?.data?.object?.transactions;
      }
      
      // Process data if available
      if (txData && txData.nodes) {
        nodes = txData.nodes;
        pageInfo = txData.pageInfo;
        
        if (nodes.length > 0 && pageInfo) {
          return {
            data: nodes,
            nextCursor: pageInfo.hasNextPage ? pageInfo.endCursor : undefined,
            hasNextPage: !!pageInfo.hasNextPage
          };
        }
      }
      
      return null;
    } catch (error) {
      // In case of GraphQL errors, return null to fallback to RPC
      return null;
    }
  }

  /**
   * Fetch transactions using RPC API
   * @private
   */
  private async fetchTransactionsViaRPC(
    address: string,
    limit: number,
    cursor?: string,
    filter: 'from' | 'to' | 'all' | 'package' = 'from'
  ): Promise<{
    data: any[];
    nextCursor?: string;
    hasNextPage: boolean;
  }> {
    try {
      // For package filter, try the preferred format first
      if (filter === 'package') {
        try {
          const response = await this.config.client.queryTransactionBlocks({
            filter: {
              MoveFunction: {
                package: address
              }
            },
            options: {
              showEffects: true,
              showInput: true
            },
            cursor: cursor || undefined,
            limit
          });
          
          return {
            data: response.data,
            nextCursor: response.nextCursor || undefined,
            hasNextPage: response.hasNextPage
          };
        } catch (packageError) {
          // Preferred format failed, try alternative
          // Use type assertion to handle property that might not be in the type definition
          const response = await this.config.client.queryTransactionBlocks({
            filter: {
              // @ts-ignore - Use Package filter as fallback since some API versions support it
              Package: address
            },
            options: {
              showEffects: true,
              showInput: true
            },
            cursor: cursor || undefined,
            limit
          });
          
          return {
            data: response.data,
            nextCursor: response.nextCursor || undefined,
            hasNextPage: response.hasNextPage
          };
        }
      }
      
      // For other filter types
      const filterMap: any = {
        from: { FromAddress: address },
        to: { ToAddress: address },
        all: { FromAddress: address }, // Simplified to sender for 'all' filter
      };
      
      const response = await this.config.client.queryTransactionBlocks({
        filter: filterMap[filter],
        options: {
          showEffects: true,
          showInput: true
        },
        cursor: cursor || undefined,
        limit
      });
      
      return {
        data: response.data,
        nextCursor: response.nextCursor || undefined,
        hasNextPage: response.hasNextPage
      };
    } catch (rpcError) {
      // If RPC fails, return empty result
      return {
        data: [],
        nextCursor: undefined,
        hasNextPage: false
      };
    }
  }
}
