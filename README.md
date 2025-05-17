# Sui MCP Server

[English](README.md) | [中文](README.zh-CN.md)

A Model Context Protocol (MCP) server for Sui blockchain integration, providing seamless Sui Move development, blockchain interaction, and debugging capabilities within Cursor IDE.

## Sui MCP Server Features

This project implements an MCP server specifically for Sui blockchain development and data querying, seamlessly integrating Sui's powerful features into MCP-compatible IDEs like Cursor.

### Sui Development Environment Management
- **Environment Switching**: Easily switch between testnet, mainnet, and devnet environments
- **Network Status Monitoring**: Track network health, version, and TPS
- **Network Time**: Get blockchain network time for time-dependent operations

### Smart Contract Development
- **Contract Interface Parser**: Parse and display human-readable Move module Interfaces
- **Contract Verification**: Verify and publish smart contract source code

### Blockchain Interaction
- **Wallet Management**: Create test wallets with pre-funded SUI tokens
- **Faucet Integration**: Request test tokens for development
- **Object Explorer**: Retrieve and inspect Sui objects
- **Transaction Builder**: Build transactions from high-level descriptions
- **Token Standards Support**: Recognize and parse different token standards

### Debugging & Optimization
- **Error Decoding**: Translate error codes into human-readable explanations with fix suggestions
- **Gas Analysis**: Analyze transaction gas usage and recommend optimizations

### Ecosystem Integration
- **Explorer Integration**: Generate links to Sui Explorer for transactions, addresses, and objects

## Installation

### Prerequisites
- Node.js 18+

### Setup

1. Clone the repository
```
git clone https://github.com/your-username/sui-mcp-server.git
cd sui-mcp-server
```

2. Install dependencies
```
npm install
```

3. Configure environment
```
cp .env.example .env
```
Edit the `.env` file according to your needs.

4. Build the server
```
npm run build
```

## Usage

### Starting the server
```
npm start
```

### Integration with Cursor IDE

Once properly configured, the Sui MCP server will automatically connect with Cursor IDE. To add the MCP server in Cursor:
1. Open Cursor
2. Go to `File -> Preferences -> Cursor Settings -> Features -> MCP Server`
3. Add a new MCP server pointing to this project's startup script

## Available MCP Tools

### Development Environment
- `sui_switch_env`: Switch between network environments
- `sui_network_status`: Check network status
- `sui_network_time`: Get current network time

### Smart Contract Development
- `sui_get_contract_interface_doc`: Extract and format contract Interface
- `sui_get_module_interface`: Get Interface for a specific module
- `sui_get_contract_source`: Retrieve contract source
- `sui_get_contract_interface`: Get complete contract documentation
- `sui_get_package_interface`: Get raw Interface for a smart contract package

### Chain Interaction
- `sui_create_new_wallet`: Create new wallets (works across networks)
- `sui_fund_dev_coins`: Request development coins
- `sui_get_object`: Get object details
- `sui_get_objects`: Get details of multiple Sui objects by their IDs
- `sui_get_owned_objects`: Get objects owned by a specific address
- `sui_build_transaction`: Build transactions
- `sui_get_transaction`: Get details of a specific transaction
- `sui_get_address_transactions`: Get transaction history for a specific address

### Token Management
- `sui_get_token_metadata`: Get metadata for a specific token type
- `sui_get_all_token_balances`: Get all token balances for a specific address

### Debugging & Optimization
- `sui_decode_error`: Decode error messages
- `sui_gas_advisor`: Analyze gas usage

### Ecosystem Integration
- `sui_explorer_lookup`: Get Sui Explorer links

## Example Usage in Cursor

```typescript
// Get Sui network status
const status = await mcp.callTool("sui_network_status", {
  random_string: "any"
});
console.log(status);

// Create a test wallet
const wallet = await mcp.callTool("sui_create_new_wallet", {
  network: "testnet"
});
console.log(wallet);

// Get contract Interface
const abi = await mcp.callTool("sui_get_contract_interface", {
  packageId: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  format: "markdown"
});
console.log(abi);

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
