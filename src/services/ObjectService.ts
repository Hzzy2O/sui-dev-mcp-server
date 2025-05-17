import { ServiceConfig } from './config/ServiceConfig.js';
import { SuiObject, NetworkEnvironment } from './types/index.js';

/**
 * Object Service
 * Handles Sui object query related functionality
 */
export class ObjectService {
  private config: ServiceConfig;
  
  constructor(network?: NetworkEnvironment) {
    this.config = ServiceConfig.getInstance(network);
  }
  
  /**
   * Get object details
   */
  async getObject(objectId: string): Promise<SuiObject> {
    try {
      
      const response = await this.config.client.getObject({
        id: objectId,
        options: { showContent: true, showOwner: true, showType: true },
      });

      if (!response.data) {
        throw new Error(`Object not found: ${objectId}`);
      }

      const suiObject = {
        objectId: response.data.objectId,
        version: response.data.version?.toString() || '0',
        digest: response.data.digest || '',
        type: response.data.type || 'unknown',
        owner: JSON.stringify(response.data.owner || 'unknown'),
        content: response.data.content || {},
      };
      
      return suiObject;
    } catch (error) {
      throw new Error(
        `Failed to get object: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
  
  /**
   * Batch retrieve objects
   */
  async getObjects(objectIds: string[]): Promise<SuiObject[]> {
    try {
      // Process multiple object requests in parallel using Promise.all
      const objects = await Promise.all(
        objectIds.map(id => this.getObject(id))
      );
      
      return objects;
    } catch (error) {
      throw new Error(
        `Failed to get objects: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
  
  /**
   * Get all objects owned by an address
   */
  async getOwnedObjects(
    address: string, 
    options: { 
      limit?: number; 
      cursor?: string;
      filter?: {
        type?: string;
      }
    } = {}
  ): Promise<{
    data: SuiObject[];
    nextCursor: string | null;
    hasNextPage: boolean;
  }> {
    try {
      const { limit = 50, cursor, filter } = options;
      
      // Build filter conditions
      const filterOptions: any = {};
      if (filter?.type) {
        filterOptions.MatchAll = [
          { StructType: filter.type }
        ];
      }
      
      // Call API
      const response = await this.config.client.getOwnedObjects({
        owner: address,
        options: { showContent: true, showType: true, showOwner: true },
        cursor: cursor || undefined,
        limit,
        filter: Object.keys(filterOptions).length > 0 ? filterOptions : undefined
      });
      
      // Convert response format
      const objects = response.data.map(item => {
        const data = item.data;
        if (!data) {
          // Skip invalid data
          return {
            objectId: 'unknown',
            version: '0',
            digest: '',
            type: 'unknown',
            owner: 'unknown',
            content: {},
          };
        }
        
        return {
          objectId: data.objectId,
          version: data.version?.toString() || '0',
          digest: data.digest || '',
          type: data.type || 'unknown',
          owner: JSON.stringify(data.owner || 'unknown'),
          content: data.content || {},
        };
      });
      
      return {
        data: objects,
        nextCursor: response.nextCursor || null,
        hasNextPage: response.hasNextPage
      };
    } catch (error) {
      throw new Error(
        `Failed to get owned objects: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
} 
