# Cursor编辑器Sui开发插件MVP设计方案

## 核心功能模块

### 1. 实时链交互增强
- **网络状态悬浮提示**：
  - 调用SuiService.getNetworkStatus()
  - 在编辑器状态栏显示TPS/版本/连通状态
  - 鼠标悬停显示完整网络指标
- **交易模拟器侧边栏**：
  - 集成TransactionService.executeTransaction()
  - 可视化构建Transfer/MoveCall交易
  - 带实时Gas预估的沙盒环境

### 2. Move智能合约工具链
- **ABI文档即时生成**：
  - 绑定ContractService.generateABIDocumentation()
  - 在.move文件右键生成Markdown格式ABI
  - 支持光标悬停查看函数签名
- **Gas预估内联提示**：
  - 接入TransactionService.analyzeGasUsage()
  - 在调用链方法时显示预估Gas消耗
  - 根据最新网络状态动态更新

### 3. 对象资源管理器
- **快捷对象查看**：
  - 集成ObjectService.getOwnedObjects()
  - Ctrl+点击objectID直接显示元数据
  - 支持对象依赖关系可视化
- **地址资产看板**：
  - 调用WalletService.getAllTokenBalances()
  - 侧边栏显示当前地址的资产组合
  - 支持快速复制对象ID

## 技术实现路径
1. **插件架构**：
   - 基于VS Code Extension API开发
   - 通过IPC与本地mcp-server通信
   - 状态管理复用ServiceConfig单例

2. **API集成层**：
   - 包装SuiService方法为RPC命令
   - 交易构建器使用TransactionBlock序列化

3. **UI组件**：
   - Webview实现交易模拟器面板
   - HoverProvider实现悬浮提示
   - TreeView实现对象资源管理器

## 避免功能冲突
- 禁用基础代码补全（由Cursor原生功能处理）
- 排除基础语法检查（依赖Move Analyzer）
- 不重复实现部署流程（集成sui-cli）
