import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { config } from 'dotenv';
import { z } from 'zod';
import { SuiService } from './services/SuiService.js';
import { NetworkEnvironment } from './services/types/index.js';
import { isValidTransactionDigest } from "@mysten/sui/utils";

// Load environment variables
config();

// Initialize Sui services with network from environment variable or fallback to testnet
const defaultNetwork = (process.env.SUI_NETWORK || 'testnet') as NetworkEnvironment;
const suiService = new SuiService(defaultNetwork);

// Create server instance
const server = new Server(
  {
    name: "sui-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define schemas for validation
const NetworkEnvSchema = z.enum(['testnet', 'mainnet', 'devnet']);

const AddressSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid Sui address format'),
});

const ObjectIdSchema = z.object({
  objectId: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid Sui object ID format'),
});

const ObjectIdsSchema = z.object({
  objectIds: z.array(z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid Sui object ID format')),
});

const OwnedObjectsSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid Sui address format'),
  options: z.record(z.any()).optional(),
});

const TokenSchema = z.object({
  coinType: z.string(),
});

const TokenBalancesSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid Sui address format'),
});

const TransactionDetailsSchema = z.object({
  digest: z.string(),
});

const AddressTransactionsSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid Sui address format'),
  limit: z.number().optional(),
  cursor: z.string().optional(),
  filter: z.enum(['from', 'to', 'all', 'package']).optional(),
});

const TransactionSchema = z.object({
  digest: z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{43,44}$/, 'Invalid transaction digest format'),
});

const ExecuteTransactionSchema = z.object({
  type: z.enum(['transfer', 'moveCall', 'programmable']),
  params: z.record(z.any()),
  privateKey: z.string().describe('Private key for signing (required, will not be stored)'),
  gasConfig: z.object({
    budget: z.number().optional(),
    price: z.number().optional(),
  }).optional(),
});

const WalletSchema = z.object({
  network: NetworkEnvSchema.optional(),
});

const FundAccountSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid Sui address format'),
  network: NetworkEnvSchema.optional(),
});

const ErrorDecodeSchema = z.object({
  errorCode: z.string(),
});

const ExplorerLookupSchema = z.object({
  type: z.enum(['transaction', 'account', 'object']),
  identifier: z.string(),
});

const PackageIdSchema = z.object({
  packageId: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid package ID format'),
});

const ModuleInfoSchema = z.object({
  packageId: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid package ID format'),
  moduleName: z.string(),
});

const ContractInterfaceSchema = z.object({
  packageId: z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid package ID format'),
  format: z.enum(['json', 'markdown']).optional(),
});

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  // Get current network for tool descriptions
  const currentNetwork = suiService.currentNetwork;
  
  return {
    tools: [
      // === Sui Network Tool - Combines network operations ===
      {
        name: "sui_network",
        description: `Manage Sui network settings and get network information (current network: ${currentNetwork})`,
        inputSchema: {
          type: "object",
          properties: {
            action: {
              type: "string",
              enum: ["switchEnv", "status", "time"],
              description: "The network action to perform"
            },
            network: {
              type: "string",
              enum: ["testnet", "mainnet", "devnet"],
              description: `Target network environment (for switchEnv action, current: ${currentNetwork})`
            },
          },
          required: ["action"],
        },
      },

      // === Sui Wallet Tool - Combines wallet operations ===
      {
        name: "sui_wallet",
        description: `Manage Sui wallets and tokens (current network: ${currentNetwork})`,
        inputSchema: {
          type: "object",
          properties: {
            action: {
              type: "string",
              enum: ["createWallet", "requestFunds", "getTokenMetadata", "getTokenBalances"],
              description: "The wallet action to perform"
            },
            network: {
              type: "string",
              enum: ["testnet", "mainnet", "devnet"],
              description: `Target network for wallet operations (current: ${currentNetwork})`
            },
            address: {
              type: "string",
              pattern: "^0x[a-fA-F0-9]{64}$",
              description: "Sui address for operations that require it"
            },
            coinType: {
              type: "string",
              description: "Type string identifier for the token (for getTokenMetadata)"
            },
          },
          required: ["action"],
        },
      },

      // === Sui Objects Tool - Combines object operations ===
      {
        name: "sui_objects",
        description: `Query and manage Sui objects (current network: ${currentNetwork})`,
        inputSchema: {
          type: "object",
          properties: {
            action: {
              type: "string",
              enum: ["getObject", "getObjects", "getOwnedObjects"],
              description: "The object action to perform"
            },
            objectId: {
              type: "string",
              pattern: "^0x[a-fA-F0-9]{64}$",
              description: "Object ID for single object operations"
            },
            objectIds: {
              type: "array",
              items: {
                type: "string",
                pattern: "^0x[a-fA-F0-9]{64}$"
              },
              description: "Array of object IDs for batch operations"
            },
            address: {
              type: "string",
              pattern: "^0x[a-fA-F0-9]{64}$",
              description: "Address to query owned objects"
            },
            options: {
              type: "object",
              description: "Optional filtering and pagination options"
            },
          },
          required: ["action"],
        },
      },
      
      // === Sui Transactions Tool - Combines transaction operations ===
      {
        name: "sui_transactions",
        description: `Execute and query Sui transactions (current network: ${currentNetwork})`,
        inputSchema: {
          type: "object",
          properties: {
            action: {
              type: "string",
              enum: ["executeTransaction", "getTransaction", "getAddressTransactions", "analyzeGas", "decodeError"],
              description: "The transaction action to perform"
            },
            type: {
              type: "string",
              enum: ["transfer", "moveCall", "programmable"],
              description: "Type of transaction to execute (for executeTransaction)"
            },
            params: {
              type: "object",
              description: "Transaction parameters for executeTransaction"
            },
            privateKey: {
              type: "string",
              description: "Private key for signing (for executeTransaction, will not be stored)"
            },
            gasConfig: {
              type: "object",
              properties: {
                budget: {
                  type: "number",
                  description: "Gas budget for the transaction"
                },
                price: {
                  type: "number",
                  description: "Gas price for the transaction"
                },
              },
              description: "Optional gas configuration for executeTransaction"
            },
            digest: {
              type: "string",
              description: "Transaction digest for queries"
            },
            address: {
              type: "string",
              pattern: "^0x[a-fA-F0-9]{64}$",
              description: "Address for transaction history queries"
            },
            errorCode: {
              type: "string",
              description: "Error code to decode"
            },
            limit: {
              type: "number",
              description: "Maximum number of transactions to return"
            },
            cursor: {
              type: "string",
              description: "Pagination cursor for fetching next set of results"
            },
            filter: {
              type: "string",
              enum: ["from", "to", "all", "package"],
              description: "Filter type for transactions"
            },
          },
          required: ["action"],
        },
      },
      
      // === Sui Smart Contracts Tool - Combines contract operations ===
      {
        name: "sui_contracts",
        description: `Interact with Sui smart contracts (current network: ${currentNetwork})`,
        inputSchema: {
          type: "object",
          properties: {
            action: {
              type: "string",
              enum: ["getContractInterface", "getModuleInterface", "getContractSourcecode", "getContractDocumentation"],
              description: "The contract action to perform"
            },
            packageId: {
              type: "string",
              pattern: "^0x[a-fA-F0-9]{64}$",
              description: "Package ID of the contract"
            },
            moduleName: {
              type: "string",
              description: "Name of the module (for getModuleInterface)"
            },
            format: {
              type: "string",
              enum: ["json", "markdown"],
              description: "Output format for documentation"
            },
          },
          required: ["action", "packageId"],
        },
      },
      
      // === Sui Explorer Tool - Provides explorer links ===
      {
        name: "sui_explorer",
        description: `Get Sui Explorer links for objects, addresses, or transactions (current network: ${currentNetwork})`,
        inputSchema: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["object", "account", "transaction"],
              description: "Type of entity to look up"
            },
            identifier: {
              type: "string",
              description: "Identifier (object ID, account address, or transaction digest)"
            },
          },
          required: ["type", "identifier"],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // === Sui Network Tool ===
  if (name === "sui_network") {
    try {
      const action = args?.action;
      if (!action) {
        throw new Error("Action is required");
      }
      
      if (action === "switchEnv") {
        const { network } = z.object({ network: NetworkEnvSchema }).parse(args);
        const result = await suiService.switchNetwork(network);
        
        return {
          content: [{ 
            type: "text", 
            text: `Switched to Sui ${result.network} network successfully.`
          }],
        };
      }
      
      if (action === "status") {
        const status = await suiService.getNetworkStatus();
        
        return {
          content: [{ 
            type: "text", 
            text: `Network: ${status.networkName}\n` +
                  `Connection: ${status.isConnected ? 'Connected' : 'Disconnected'}\n` +
                  `Protocol Version: ${status.version}\n` +
                  `TPS: ~${status.tps}\n` +
                  `Latest Checkpoint: ${status.latestCheckpointSequenceNumber || 'Unknown'}`
          }],
        };
      }
      
      if (action === "time") {
        const { timestamp } = await suiService.getNetworkTime();
        const date = new Date(timestamp);
        
        return {
          content: [{ 
            type: "text", 
            text: `Current network time: ${date.toISOString()}\n` +
                  `Timestamp (ms): ${timestamp}`
          }],
        };
      }
      
      throw new Error(`Unknown action: ${action}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid input: ${error.errors.map(e => e.message).join(", ")}`);
      }
      throw error;
    }
  }

  // === Sui Wallet Tool ===
  if (name === "sui_wallet") {
    try {
      const action = args?.action;
      if (!action) {
        throw new Error("Action is required");
      }
      
      if (action === "createWallet") {
        const { network } = WalletSchema.parse(args);
        
        if (network) {
          await suiService.switchNetwork(network);
        }
        
        const wallet = await suiService.createNewWallet();
        
        return {
          content: [{ 
            type: "text", 
            text: `Created new wallet on ${network || suiService.currentNetwork}:\n` +
                  `Address: ${wallet.address}\n` +
                  `Mnemonic: ${wallet.mnemonic}\n` +
                  `Private Key: ${wallet.privateKey}\n` +
                  `Note: Please securely store your mnemonic and private key. They cannot be recovered if lost.`
          }],
        };
      }
      
      if (action === "requestFunds") {
        const { address, network } = FundAccountSchema.parse(args);
        
        // Check for mainnet explicitly
        if (network === 'mainnet' || (!network && suiService.currentNetwork === 'mainnet')) {
          return {
            content: [{ 
              type: "text", 
              text: `Cannot request faucet tokens on mainnet. Please switch to testnet or devnet.`
            }],
          };
        }
        
        if (network) {
          await suiService.switchNetwork(network);
        }
        
        const result = await suiService.requestFaucetTokens(address);
        
        return {
          content: [{ 
            type: "text", 
            text: result.success 
              ? `Address ${address} funded: ${result.message || `Successfully requested faucet tokens on ${network || suiService.currentNetwork}.`}`
              : `Failed to request faucet tokens: ${result.message || 'Unknown error'}`
          }],
        };
      }
      
      if (action === "getTokenMetadata") {
        const { coinType } = TokenSchema.parse(args);
        const metadata = await suiService.getTokenMetadata(coinType);
        
        if (!metadata) {
          return {
            content: [{ 
              type: "text", 
              text: `No metadata found for token type: ${coinType}`
            }],
          };
        }
        
        return {
          content: [{ 
            type: "text", 
            text: `Token Metadata for ${coinType}:\n` +
                  `Name: ${metadata.name || 'Unknown'}\n` +
                  `Symbol: ${metadata.symbol || 'Unknown'}\n` +
                  `Description: ${metadata.description || 'None'}\n` +
                  `Decimals: ${metadata.decimals || 0}\n` +
                  `Icon URL: ${metadata.iconUrl || 'None'}\n`
          }],
        };
      }
      
      if (action === "getTokenBalances") {
        const { address } = TokenBalancesSchema.parse(args);
        const balances = await suiService.getAllTokenBalances(address);
        
        let responseText = `Token Balances for ${address}:\n`;
        
        balances.forEach(balance => {
          const symbol = balance.metadata?.symbol || 'Unknown';
          const formatted = balance.totalBalance.toString();
          responseText += `- ${symbol}: ${formatted} (${balance.coinType})\n`;
        });
        
        return {
          content: [{ 
            type: "text", 
            text: responseText
          }],
        };
      }
      
      throw new Error(`Unknown action: ${action}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid input: ${error.errors.map(e => e.message).join(", ")}`);
      }
      throw error;
    }
  }

  // === Sui Objects Tool ===
  if (name === "sui_objects") {
    try {
      const action = args?.action;
      if (!action) {
        throw new Error("Action is required");
      }
      
      if (action === "getObject") {
        const { objectId } = ObjectIdSchema.parse(args);
        const object = await suiService.getObject(objectId);
        
        return {
          content: [{ 
            type: "text", 
            text: `Object: ${objectId}\n` +
                  `Type: ${object.type}\n` +
                  `Owner: ${object.owner}\n` +
                  `Version: ${object.version}\n` +
                  `Content: ${JSON.stringify(object.content, null, 2)}`
          }],
        };
      }
      
      if (action === "getObjects") {
        const { objectIds } = ObjectIdsSchema.parse(args);
        const objects = await suiService.getObjects(objectIds);
        
        return {
          content: [{ 
            type: "text", 
            text: `Retrieved ${objects.length} objects:\n` +
                  JSON.stringify(objects, null, 2)
          }],
        };
      }
      
      if (action === "getOwnedObjects") {
        const { address, options } = OwnedObjectsSchema.parse(args);
        const ownedObjects = await suiService.getOwnedObjects(address, options);
        
        return {
          content: [{ 
            type: "text", 
            text: `Objects owned by ${address}:\n` +
                  `Total: ${ownedObjects.data.length}\n` +
                  JSON.stringify(ownedObjects, null, 2)
          }],
        };
      }
      
      throw new Error(`Unknown action: ${action}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid input: ${error.errors.map(e => e.message).join(", ")}`);
      }
      throw error;
    }
  }
  
  // === Sui Transactions Tool ===
  if (name === "sui_transactions") {
    try {
      const action = args?.action;
      if (!action) {
        throw new Error("Action is required");
      }
      
      if (action === "executeTransaction") {
        const { type, params, privateKey, gasConfig } = ExecuteTransactionSchema.parse(args);
        
        // Execute the transaction with the provided private key
        const txBlock = await suiService.executeTransaction(type, params, privateKey, gasConfig);
        
        let responseText = `Transaction executed successfully:\nType: ${type}\n`;
        
        if (type === 'programmable') {
          responseText += `Transaction Block: ${JSON.stringify(txBlock.txBytes, null, 2)}\n\n`;
          
          if (txBlock.digest) {
            responseText += `Transaction Digest: ${txBlock.digest}\n`;
            responseText += `Explorer URL: ${suiService.getExplorerUrl('transaction', txBlock.digest)}\n\n`;
          }
          
          responseText += `Note: This programmable transaction contains ${params.transactions?.length || 0} operations.`;
        } else {
          responseText += `Transaction Block: ${JSON.stringify(txBlock, null, 2)}\n\n`;
          
          if (txBlock.digest) {
            responseText += `Transaction Digest: ${txBlock.digest}\n`;
            responseText += `Explorer URL: ${suiService.getExplorerUrl('transaction', txBlock.digest)}\n\n`;
          }
        }
        
        return {
          content: [{ 
            type: "text", 
            text: responseText
          }],
        };
      }
      
      if (action === "getTransaction") {
        const { digest } = TransactionDetailsSchema.parse(args);
        const transaction = await suiService.getTransaction(digest);
        
        return {
          content: [{ 
            type: "text", 
            text: `Transaction Details for ${digest}:\n` +
                  `Sender: ${transaction.transaction?.data?.sender || 'Unknown'}\n` +
                  `Status: ${transaction.effects?.status || 'Unknown'}\n` +
                  `Timestamp: ${transaction.effects?.timestamp_ms ? new Date(transaction.effects.timestamp_ms).toISOString() : 'Unknown'}\n` +
                  `Details: ${JSON.stringify(transaction, null, 2)}`
          }],
        };
      }
      
      if (action === "getAddressTransactions") {
        const { address, limit, cursor, filter } = AddressTransactionsSchema.parse(args);
        const transactions = await suiService.getAddressTransactions(address, limit, cursor, filter);
        
        return {
          content: [{ 
            type: "text", 
            text: `Transactions for address ${address}:\n` +
                  `Count: ${transactions.data.length}\n` +
                  `Has Next Page: ${transactions.hasNextPage ? 'Yes' : 'No'}\n` +
                  `Next Cursor: ${transactions.nextCursor || 'None'}\n` +
                  `Data: ${JSON.stringify(transactions.data, null, 2)}`
          }],
        };
      }
      
      if (action === "analyzeGas") {
        const { digest } = TransactionSchema.parse(args);
        const gasAnalysis = await suiService.analyzeGasUsage(digest);
        
        return {
          content: [{ 
            type: "text", 
            text: `Gas Analysis for Transaction ${digest}:\n` +
                  `Computation Cost: ${gasAnalysis.computationCost} MIST\n` +
                  `Storage Cost: ${gasAnalysis.storageCost} MIST\n` +
                  `Storage Rebate: ${gasAnalysis.storageRebate} MIST\n` +
                  `Total Gas Cost: ${gasAnalysis.totalGasCost} MIST\n\n` +
                  `Recommendations:\n` +
                  `- For this type of transaction, consider a gas budget of ${
                    BigInt(gasAnalysis.totalGasCost) * BigInt(12) / BigInt(10)
                  } MIST\n` +
                  `- Group related operations to minimize storage costs\n` +
                  `- Consider batching multiple operations if applicable`
          }],
        };
      }
      
      if (action === "decodeError") {
        const { errorCode } = ErrorDecodeSchema.parse(args);
        const decoded = await suiService.decodeError(errorCode);
        
        return {
          content: [{ 
            type: "text", 
            text: `Error: ${decoded.title}\n` +
                  `Description: ${decoded.description}\n` +
                  `Possible Fix: ${decoded.description ? 'See description for guidance' : 'Unknown'}`
          }],
        };
      }
      
      throw new Error(`Unknown action: ${action}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid input: ${error.errors.map(e => e.message).join(", ")}`);
      }
      throw error;
    }
  }
  
  // === Sui Smart Contracts Tool ===
  if (name === "sui_contracts") {
    try {
      const action = args?.action;
      if (!action) {
        throw new Error("Action is required");
      }
      
      if (action === "getContractInterface") {
        const { packageId } = PackageIdSchema.parse(args);
        const packageInterface = await suiService.getPackageInterface(packageId);
        
        return {
          content: [{ 
            type: "text", 
            text: `Package Interface for ${packageId}:\n` +
                  JSON.stringify(packageInterface, null, 2)
          }],
        };
      }
      
      if (action === "getModuleInterface") {
        const { packageId, moduleName } = ModuleInfoSchema.parse(args);
        const moduleInterface = await suiService.getModuleInterface(packageId, moduleName);
        
        if (!moduleInterface) {
          return {
            content: [{ 
              type: "text", 
              text: `Module not found: ${packageId}::${moduleName}`
            }],
          };
        }
        
        return {
          content: [{ 
            type: "text", 
            text: JSON.stringify(moduleInterface, null, 2)
          }],
        };
      }
      
      if (action === "getContractSourcecode") {
        const { packageId } = PackageIdSchema.parse(args);
        const sourceInfo = await suiService.getContractSourcecode(packageId);
        
        if (sourceInfo.modules.length === 0) {
          return {
            content: [{ 
              type: "text", 
              text: `Contract ${packageId} is verification failed.`
            }],
          };
        }
        
        let sourceText = `# Contract Source: ${packageId}\n`;
        if (sourceInfo.compilerVersion) {
          sourceText += `Compiler Version: ${sourceInfo.compilerVersion}\n`;
        }
        sourceText += '\n';
        
        for (const module of sourceInfo.modules) {
          sourceText += `## ${module.name}\n\n`;
          sourceText += "```move\n";
          sourceText += module.source;
          sourceText += "\n```\n\n";
        }
        
        return {
          content: [{ 
            type: "text", 
            text: sourceText
          }],
        };
      }
      
      if (action === "getContractDocumentation") {
        const { packageId, format } = ContractInterfaceSchema.parse(args);
        const documentation = await suiService.generateInterfaceDocumentation(
          packageId, 
          format ? format as 'markdown' | 'json' : 'markdown'
        );
        
        return {
          content: [{ 
            type: "text", 
            text: documentation
          }],
        };
      }
      
      throw new Error(`Unknown action: ${action}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid input: ${error.errors.map(e => e.message).join(", ")}`);
      }
      throw error;
    }
  }
  
  // === Sui Explorer Tool ===
  if (name === "sui_explorer") {
    try {
      const { type, identifier } = ExplorerLookupSchema.parse(args);
      const url = suiService.getExplorerUrl(type, identifier);
      
      return {
        content: [{ 
          type: "text", 
          text: `Sui Explorer URL for ${type} ${identifier}:\n${url}`
        }],
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Invalid input: ${error.errors.map(e => e.message).join(", ")}`);
      }
      throw error;
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

export async function startServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
