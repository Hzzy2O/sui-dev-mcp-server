/**
 * Network environment type
 */
export type NetworkEnvironment = 'testnet' | 'mainnet' | 'devnet';

/**
 * Object data structure
 */
export interface SuiObject {
  objectId: string;
  version: string;
  digest: string;
  type: string;
  owner: string;
  content: Record<string, any>;
}

/**
 * Transaction data structure
 */
export interface SuiTransaction {
  digest: string;
  transaction: {
    data: {
      sender: string;
      gasData: {
        payment: Array<{ objectId: string }>;
        price: string;
        budget: string;
      };
    };
  };
  effects: {
    status: string;
    gasUsed: {
      computationCost: string;
      storageCost: string;
      storageRebate: string;
    };
    timestamp_ms: number;
  };
}

/**
 * Network status structure
 */
export interface NetworkStatus {
  isConnected: boolean;
  networkName: string;
  version: string;
  tps: number;
  latestCheckpointSequenceNumber?: string;
}

/**
 * Token metadata
 */
export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  description?: string;
  iconUrl?: string;
  totalSupply?: string;
  website?: string;
}

/**
 * Move module Interface related types
 */
export interface MoveStructTypeParameter {
  constraints?: string[] | any;
  isPhantom?: boolean;
}

export interface MoveStructInterface {
  name: string;
  abilities: string[] | any; // Compatible with SuiMoveAbilitySet
  fields: {
    name: string;
    type: string | any; // Compatible with SuiMoveNormalizedType
  }[];
  typeParameters: MoveStructTypeParameter[] | any[]; // Compatible with all possible forms
}

export interface MoveFunctionInterface {
  name: string;
  visibility: 'public' | 'friend' | 'private';
  isEntry: boolean;
  parameters: Array<string | any>; // Compatible with SuiMoveNormalizedType[]
  returns: Array<string | any>; // Compatible with SuiMoveNormalizedType[]
  typeParameters: {
    abilities: string[] | any;
  }[];
}

export interface MoveModuleInterface {
  name: string;
  fileFormatVersion: number;
  address: string;
  friends: string[];
  structs: MoveStructInterface[];
  exposedFunctions: MoveFunctionInterface[];
}

/**
 * Contract verification related types
 */
export interface ContractVerificationResult {
  success: boolean;
  packageId: string;
  verificationId?: string;
  status: 'completed' | 'failed' | 'pending';
  timestamp: string;
  error?: string;
  source?: {
    modules: {
      name: string;
      source: string;
    }[];
    manifest?: Record<string, any>;
  };
} 
