# Sui MCP 服务器

[English](README.md) | [中文](README.zh-CN.md)

Sui 区块链集成的模型上下文协议 (MCP) 服务器，提供无缝的 Sui Move 开发、区块链交互和调试功能，可在 Cursor IDE 中使用。

## Sui MCP 服务器功能

该项目实现了专门用于 Sui 区块链开发和数据查询的 MCP 服务器，将 Sui 的强大功能无缝集成到兼容 MCP 的 IDE（如 Cursor）中。

### Sui 开发环境管理
- `sui_switch_env`：轻松在测试网、主网和开发网环境之间切换
- `sui_network_status`：跟踪网络健康状况、版本和 TPS
- `sui_network_time`：获取区块链网络时间，用于时间依赖的操作

### 智能合约开发
- `sui_get_contract_interface_doc`：提取和格式化合约 Interface
- `sui_get_module_interface`：获取特定模块的 Interface
- `sui_get_contract_source`：检索合约源代码
- `sui_get_contract_interface`：获取完整的合约文档
- `sui_get_package_interface`：获取智能合约包的原始 Interface

### 区块链交互
- `sui_create_new_wallet`：创建新钱包（可跨网络使用）
- `sui_fund_dev_coins`：请求开发币
- `sui_get_object`：获取对象详情
- `sui_get_objects`：通过ID获取多个Sui对象的详情
- `sui_get_owned_objects`：获取特定地址拥有的对象
- `sui_build_transaction`：构建交易
- `sui_get_transaction`：获取特定交易的详情
- `sui_get_address_transactions`：获取特定地址的交易历史记录

### 代币管理
- `sui_get_token_metadata`：获取特定代币类型的元数据
- `sui_get_all_token_balances`：获取特定地址的所有代币余额

### 调试和优化
- `sui_decode_error`：解码错误消息
- `sui_gas_advisor`：分析 Gas 使用情况

### 生态系统集成
- `sui_explorer_lookup`：获取 Sui Explorer 链接

## 安装

### 先决条件
- Node.js 18+

### 设置

1. 克隆仓库
```
git clone https://github.com/your-username/sui-mcp-server.git
cd sui-mcp-server
```

2. 安装依赖
```
npm install
```

3. 配置环境
```
cp .env.example .env
```
根据需要编辑 `.env` 文件。

4. 构建服务器
```
npm run build
```

## 使用方法

### 启动服务器
```
npm start
```

### 与 Cursor IDE 集成

一旦正确配置，Sui MCP 服务器将自动与 Cursor IDE 连接。要在 Cursor 中添加 MCP 服务器：
1. 打开 Cursor
2. 前往 `文件 -> 首选项 -> Cursor 设置 -> 功能 -> MCP 服务器`
3. 添加指向此项目启动脚本的新 MCP 服务器

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 许可证

该项目根据 MIT 许可证授权 - 有关详细信息，请参阅 LICENSE 文件。 
