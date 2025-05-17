import { ServiceConfig } from './config/ServiceConfig.js';
import { NetworkEnvironment, MoveModuleInterface } from './types/index.js';

/**
 * Contract Service
 * Handles smart contract Interface and interface related functionality
 */
export class ContractService {
  private config: ServiceConfig;
  
  constructor(network?: NetworkEnvironment) {
    this.config = ServiceConfig.getInstance(network);
  }
  
  /**
   * Parse Move module Interface information
   */
  async getModuleInterface(packageId: string, moduleName: string): Promise<MoveModuleInterface | null> {
    try {
      
      // Get normalized Move module
      const normalizedModule = await this.config.client.getNormalizedMoveModule({
        package: packageId,
        module: moduleName,
      });
      
      if (!normalizedModule) {
        console.warn(`Module not found: ${packageId}::${moduleName}`);
        return null;
      }
      
      // Convert to Interface format
      const moduleInterface: MoveModuleInterface = {
        name: normalizedModule.name,
        fileFormatVersion: normalizedModule.fileFormatVersion,
        address: packageId,
        friends: (normalizedModule.friends || []).map(friend => {
          if (typeof friend === 'string') return friend;
          // Handle complex friend reference objects
          if (typeof friend === 'object') {
            const friendObj = friend as any;
            return friendObj.address ? `${friendObj.address}::${friendObj.name || ''}` : String(friendObj);
          }
          return String(friend);
        }),
        structs: Object.entries(normalizedModule.structs || {}).map(([name, struct]) => {
          console.log(`Processing struct: ${name}`);
          
          // Extract abilities as an array
          let abilities: string[] = [];
          
          // Handle different abilities formats
          if (struct.abilities) {
            if (Array.isArray(struct.abilities)) {
              // If it's already an array, use it directly
              abilities = struct.abilities.map(a => String(a));
            } else if (typeof struct.abilities === 'object' && struct.abilities.abilities && Array.isArray(struct.abilities.abilities)) {
              // If it's in the format {abilities: [...]}, extract the array
              abilities = struct.abilities.abilities.map((a: any) => String(a));
            }
            // For other formats, keep as empty array
          }
          
          return {
            name,
            abilities,
            fields: (struct.fields || []).map(field => ({
              name: field.name,
              type: typeof field.type === 'string' ? field.type : JSON.stringify(field.type),
            })),
            typeParameters: (struct.typeParameters || []).map(tp => ({
              constraints: tp.constraints || [],
              isPhantom: tp.isPhantom || false
            })),
          };
        }),
        exposedFunctions: Object.entries(normalizedModule.exposedFunctions || {}).map(([name, func]) => ({
          name,
          visibility: func.visibility as 'public' | 'friend' | 'private',
          isEntry: func.isEntry || false,
          parameters: (func.parameters || []).map(param => 
            typeof param === 'string' ? param : JSON.stringify(param)
          ),
          returns: (func.return || []).map(ret => 
            typeof ret === 'string' ? ret : JSON.stringify(ret)
          ),
          typeParameters: (func.typeParameters || []).map(tp => ({
            abilities: tp || []
          })),
        })),
      };
      
      return moduleInterface;
    } catch (error) {
      console.error(`Failed to get module Interface: ${error}`);
      return null;
    }
  }
  
  /**
   * Get Interface for all modules in a package
   */
  async getPackageInterface(packageId: string): Promise<MoveModuleInterface[]> {
    try {
      
      // Get all modules in the package
      const normalizedModules = await this.config.client.getNormalizedMoveModulesByPackage({
        package: packageId,
      });
      
      if (!normalizedModules) {
        return [];
      }
      
      // Convert all modules to Interface format
      const moduleInterfacePromises = Object.keys(normalizedModules).map(moduleName => 
        this.getModuleInterface(packageId, moduleName)
      );
      
      const moduleInterfaces = await Promise.all(moduleInterfacePromises);
      
      // Filter out null values
      const validModules = moduleInterfaces.filter((m): m is MoveModuleInterface => m !== null);
      
      return validModules;
    } catch (error) {
      console.error(`Failed to get package Interface: ${error}`);
      return [];
    }
  }
  
  /**
   * Generate human-readable Interface documentation suitable for frontend display
   */
  async generateInterfaceDocumentation(
    packageId: string, 
    format: 'markdown' | 'json' = 'markdown'
  ): Promise<string> {
    try {
      const modules = await this.getPackageInterface(packageId);
      
      if (format === 'json') {
        return JSON.stringify(modules, null, 2);
      }
      
      // Generate Markdown format documentation
      let markdown = '';
      
      // Package header
      markdown += `# Package ${packageId} Documentation\n\n`;
      
      // Process each module
      for (const module of modules) {
        // Module header
        markdown += `## Module ${module.name}\n\n`;
        
        // Add module address and other metadata
        markdown += `**Address:** \`${module.address}\`\n`;
        markdown += `**File Format Version:** ${module.fileFormatVersion}\n\n`;
        
        // Process friends
        if (module.friends && module.friends.length > 0) {
          markdown += '### Friends\n\n';
          
          for (const friend of module.friends) {
            markdown += `- ${friend}\n`;
          }
          
          markdown += '\n';
        }
        
        // Process structs
        if (module.structs && module.structs.length > 0) {
          markdown += '### Structs\n\n';
          
          for (const struct of module.structs) {
            // Struct header
            markdown += `#### ${struct.name}\n\n`;
            
            // Handle abilities
            markdown += '**Abilities:** ';
            if (struct.abilities && Array.isArray(struct.abilities)) {
              markdown += struct.abilities.join(', ') || 'None';
            } else {
              markdown += 'None';
            }
            markdown += '\n\n';
            
            // Process fields
            if (struct.fields && struct.fields.length > 0) {
              markdown += '**Fields:**\n';
              
              for (const field of struct.fields) {
                // Simplify type display for better readability
                let fieldType = field.type;
                try {
                  // Try to parse JSON type
                  const typeObj = JSON.parse(field.type);
                  if (typeObj.Struct) {
                    fieldType = `${typeObj.Struct.module}::${typeObj.Struct.name}`;
                    if (typeObj.Struct.typeArguments && typeObj.Struct.typeArguments.length > 0) {
                      fieldType += '<...>'; // Simplify generic parameters
                    }
                  } else if (typeof typeObj === 'string') {
                    fieldType = typeObj;
                  }
                } catch (e) {
                  // If parsing fails, keep original
                }
                
                markdown += `- \`${field.name}\`: ${fieldType}\n`;
              }
              
              markdown += '\n';
            }
            
            // Add type parameters
            if (struct.typeParameters && struct.typeParameters.length > 0) {
              markdown += '**Type Parameters:**\n';
              struct.typeParameters.forEach((typeParam, index) => {
                let constraints = 'None';
                
                if (typeParam.constraints && Array.isArray(typeParam.constraints)) {
                  constraints = typeParam.constraints.join(', ') || 'None';
                }
                
                markdown += `- Type${index}: Constraints=${constraints}, Phantom=${typeParam.isPhantom ? 'Yes' : 'No'}\n`;
              });
              markdown += '\n';
            }
          }
        }
        
        // Process functions
        if (module.exposedFunctions && module.exposedFunctions.length > 0) {
          markdown += '### Functions\n\n';
          
          for (const func of module.exposedFunctions) {
            const entry = func.isEntry ? ' (entry)' : '';
            
            markdown += `#### ${func.name}${entry}\n\n`;
            markdown += `**Visibility:** ${func.visibility}\n`;
            markdown += `**Entry Function:** ${func.isEntry ? 'Yes' : 'No'}\n\n`;
            
            // Parse and simplify parameter types
            if (func.parameters && func.parameters.length > 0) {
              markdown += '**Parameters:**\n';
              for (const param of func.parameters) {
                try {
                  // Try to parse JSON
                  const paramObj = JSON.parse(param);
                  let paramType = '';
                  
                  // Format parameters for better readability
                  if (paramObj.MutableReference) {
                    if (paramObj.MutableReference.Struct) {
                      const struct = paramObj.MutableReference.Struct;
                      paramType = `&mut ${struct.module}::${struct.name}`;
                    } else {
                      paramType = `&mut ${JSON.stringify(paramObj.MutableReference)}`;
                    }
                  } else if (paramObj.Reference) {
                    if (paramObj.Reference.Struct) {
                      const struct = paramObj.Reference.Struct;
                      paramType = `& ${struct.module}::${struct.name}`;
                    } else {
                      paramType = `& ${JSON.stringify(paramObj.Reference)}`;
                    }
                  } else if (paramObj.Struct) {
                    paramType = `${paramObj.Struct.module}::${paramObj.Struct.name}`;
                  } else {
                    paramType = param;
                  }
                  
                  markdown += `- ${paramType}\n`;
                } catch (e) {
                  // If JSON parsing fails, use original parameter
                  markdown += `- ${param}\n`;
                }
              }
              markdown += '\n';
            }
            
            // Process returns
            if (func.returns && func.returns.length > 0) {
              markdown += '**Returns:**\n';
              for (const ret of func.returns) {
                markdown += `- ${ret}\n`;
              }
              markdown += '\n';
            } else {
              markdown += '**Returns:** None\n\n';
            }
            
            // Handle type parameters
            if (func.typeParameters && func.typeParameters.length > 0) {
              markdown += '**Type Parameters:**\n';
              func.typeParameters.forEach((typeParam, index) => {
                let constraints = 'None';
                
                if (typeParam.abilities && Array.isArray(typeParam.abilities)) {
                  constraints = typeParam.abilities.join(', ');
                }
                
                markdown += `- T${index}: ${constraints}\n`;
              });
              markdown += '\n';
            }
          }
        }
      }
      
      return markdown;
    } catch (error) {
      console.error('Error generating Interface documentation:', error);
      return `Failed to generate documentation: ${error}`;
    }
  }

  /**
   * Get contract source code
   * @param packageId Package ID
   * @returns Contract source information
   */
  async getContractSourcecode(packageId: string): Promise<{
    packageId: string;
    modules: {
      name: string;
      source: string;
    }[];
    compilerVersion?: string;
  }> {
    try {
      // Try to get the package metadata and bytecode
      const packageObject = await this.config.client.getObject({
        id: packageId,
        options: { showContent: true, showBcs: true }
      });
      
      if (!packageObject?.data || !packageObject.data.content) {
        throw new Error(`Package not found: ${packageId}`);
      }
      
      // Get the Move package data
      const modules = [];
      const content = packageObject.data.content as any; // Type cast to any to handle dynamic structure
      
      // Check if it's a package type (movePackage is a common type in Sui)
      if (content.dataType && content.dataType !== 'movePackage' && content.dataType !== 'package') {
        throw new Error(`Object is not a Move package: ${packageId}`);
      }
      
      // Get modules list from the package
      const moduleNames: string[] = [];
      
      // Try different ways to access module names based on API version
      if (content.modules && typeof content.modules === 'object') {
        // Direct access to modules object
        moduleNames.push(...Object.keys(content.modules));
      } else if (content.package && content.package.modules && typeof content.package.modules === 'object') {
        // Access through package property
        moduleNames.push(...Object.keys(content.package.modules));
      }
      
      // If we couldn't get module names, try another approach
      if (moduleNames.length === 0) {
        // Try to get normalized modules for the package
        const normalizedModules = await this.config.client.getNormalizedMoveModulesByPackage({
          package: packageId,
        });
        
        if (normalizedModules) {
          moduleNames.push(...Object.keys(normalizedModules));
        }
      }
      
      // For each module, get its Interface and reconstruct a source-like representation
      for (const moduleName of moduleNames) {
        const moduleInterface = await this.getModuleInterface(packageId, moduleName);
        
        if (moduleInterface) {
          // Create a simplified source representation from the Interface
          let source = `module ${packageId}::${moduleName} {\n`;
          
          // Add struct definitions
          if (moduleInterface.structs && moduleInterface.structs.length > 0) {
            for (const struct of moduleInterface.structs) {
              // Add abilities if any
              let abilities = '';
              if (struct.abilities && struct.abilities.length > 0) {
                abilities = ` has ${struct.abilities.join(', ')}`;
              }
              
              source += `    struct ${struct.name}${abilities} {\n`;
              
              // Add fields
              if (struct.fields && struct.fields.length > 0) {
                for (const field of struct.fields) {
                  source += `        ${field.name}: ${field.type},\n`;
                }
              }
              
              source += `    }\n\n`;
            }
          }
          
          // Add function definitions
          if (moduleInterface.exposedFunctions && moduleInterface.exposedFunctions.length > 0) {
            for (const func of moduleInterface.exposedFunctions) {
              // Add visibility and entry modifier
              const visibility = func.visibility === 'private' ? '' : ` ${func.visibility}`;
              const entry = func.isEntry ? ' entry' : '';
              
              source += `   ${visibility}${entry} fun ${func.name}(`;
              
              // Add parameters
              if (func.parameters && func.parameters.length > 0) {
                source += func.parameters.map((param, index) => `arg${index}: ${param}`).join(', ');
              }
              
              source += ')';
              
              // Add return type if any
              if (func.returns && func.returns.length > 0) {
                if (func.returns.length === 1) {
                  source += `: ${func.returns[0]}`;
                } else {
                  source += `: (${func.returns.join(', ')})`;
                }
              }
              
              // Add function body placeholder
              source += ` {\n        // Function implementation not available\n    }\n\n`;
            }
          }
          
          source += '}\n';
          
          modules.push({
            name: moduleName,
            source,
          });
        }
      }
      
      // If no modules were found, add a placeholder
      if (modules.length === 0) {
        modules.push({
          name: 'module_info',
          source: `// Package ${packageId} exists on-chain, but module details couldn't be fully parsed.\n// Use the Sui SDK or CLI to interact with this package.`
        });
      }
      
      // Try to get compiler version from build info if available
      let compilerVersion = 'Unknown';
      if (content.buildInfo && typeof content.buildInfo === 'object' && 'compilerVersion' in content.buildInfo) {
        compilerVersion = content.buildInfo.compilerVersion as string;
      }
      
      return {
        packageId,
        modules,
        compilerVersion,
      };
    } catch (error) {
      console.error('Error retrieving contract source:', error);
      return {
        packageId,
        modules: [],
      };
    }
  }

} 
