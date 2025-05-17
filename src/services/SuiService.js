"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuiService = void 0;
var ServiceConfig_js_1 = require("./config/ServiceConfig.js");
var NetworkService_js_1 = require("./NetworkService.js");
var ObjectService_js_1 = require("./ObjectService.js");
var TransactionService_js_1 = require("./TransactionService.js");
var ContractService_js_1 = require("./ContractService.js");
var WalletService_js_1 = require("./WalletService.js");
/**
 * Sui Service - Main service class
 * Serves as the entry point for all services
 */
var SuiService = /** @class */ (function () {
    /**
     * Constructor
     */
    function SuiService(network) {
        if (network === void 0) { network = 'testnet'; }
        // Initialize service configuration
        this.config = ServiceConfig_js_1.ServiceConfig.getInstance(network);
        // Initialize each service
        this.networkService = new NetworkService_js_1.NetworkService(network);
        this.objectService = new ObjectService_js_1.ObjectService(network);
        this.transactionService = new TransactionService_js_1.TransactionService(network);
        this.contractService = new ContractService_js_1.ContractService(network);
        this.walletService = new WalletService_js_1.WalletService(network);
    }
    /**
     * Initialize service
     */
    SuiService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Initialize all services in parallel
                    return [4 /*yield*/, Promise.all([
                            this.networkService.initialize(),
                            this.objectService.initialize(),
                            this.transactionService.initialize(),
                            this.contractService.initialize(),
                            this.walletService.initialize()
                        ])];
                    case 1:
                        // Initialize all services in parallel
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clean up service resources
     */
    SuiService.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Clean up all services in parallel
                    return [4 /*yield*/, Promise.all([
                            this.networkService.cleanup(),
                            this.objectService.cleanup(),
                            this.transactionService.cleanup(),
                            this.contractService.cleanup(),
                            this.walletService.cleanup()
                        ])];
                    case 1:
                        // Clean up all services in parallel
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(SuiService.prototype, "currentNetwork", {
        /**
         * Get current network environment
         */
        get: function () {
            return this.config.currentNetwork;
        },
        enumerable: false,
        configurable: true
    });
    // ===== Network service proxy methods =====
    /**
     * Switch network environment
     */
    SuiService.prototype.switchNetwork = function (network) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.networkService.switchNetwork(network)];
            });
        });
    };
    /**
     * Get network status
     */
    SuiService.prototype.getNetworkStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.networkService.getNetworkStatus()];
            });
        });
    };
    /**
     * Get network time
     */
    SuiService.prototype.getNetworkTime = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.networkService.getNetworkTime()];
            });
        });
    };
    /**
     * Get Explorer URL
     */
    SuiService.prototype.getExplorerUrl = function (type, identifier) {
        return this.networkService.getExplorerUrl(type, identifier);
    };
    // ===== Object service proxy methods =====
    /**
     * Get object details
     */
    SuiService.prototype.getObject = function (objectId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.objectService.getObject(objectId)];
            });
        });
    };
    /**
     * Batch retrieve objects
     */
    SuiService.prototype.getObjects = function (objectIds) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.objectService.getObjects(objectIds)];
            });
        });
    };
    /**
     * Get objects owned by an address
     */
    SuiService.prototype.getOwnedObjects = function (address, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.objectService.getOwnedObjects(address, options)];
            });
        });
    };
    // ===== Transaction service proxy methods =====
    /**
     * Get transaction details
     */
    SuiService.prototype.getTransaction = function (digest) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.transactionService.getTransaction(digest)];
            });
        });
    };
    /**
     * Analyze transaction gas usage
     */
    SuiService.prototype.analyzeGasUsage = function (digest) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.transactionService.analyzeGasUsage(digest)];
            });
        });
    };
    /**
     * Build transaction
     */
    SuiService.prototype.buildTransaction = function (type, params, gasConfig) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.transactionService.buildTransaction(type, params, gasConfig)];
            });
        });
    };
    /**
     * Decode error
     */
    SuiService.prototype.decodeError = function (errorCode) {
        return this.transactionService.decodeError(errorCode);
    };
    /**
     * Get address transaction history
     */
    SuiService.prototype.getAddressTransactions = function (address, limit, cursor) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.transactionService.getAddressTransactions(address, limit, cursor)];
            });
        });
    };
    // ===== Contract service proxy methods =====
    /**
     * Get module ABI
     */
    SuiService.prototype.getModuleABI = function (packageId, moduleName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.contractService.getModuleABI(packageId, moduleName)];
            });
        });
    };
    /**
     * Get package ABI
     */
    SuiService.prototype.getPackageABI = function (packageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.contractService.getPackageABI(packageId)];
            });
        });
    };
    /**
     * Generate ABI documentation
     */
    SuiService.prototype.generateABIDocumentation = function (packageId, format) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.contractService.generateABIDocumentation(packageId, format)];
            });
        });
    };
    /**
     * Get contract source
     */
    SuiService.prototype.getContractSource = function (packageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.contractService.getContractSource(packageId)];
            });
        });
    };
    /**
     * Get contract interface
     */
    SuiService.prototype.getContractInterface = function (packageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.contractService.getContractInterface(packageId)];
            });
        });
    };
    // ===== Wallet service proxy methods =====
    /**
     * Create test wallet
     */
    SuiService.prototype.createNewWallet = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.walletService.createNewWallet()];
            });
        });
    };
    /**
     * Request tokens from the faucet
     */
    SuiService.prototype.requestFaucetTokens = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.walletService.requestFaucetTokens(address)];
            });
        });
    };
    /**
     * Get token metadata
     */
    SuiService.prototype.getTokenMetadata = function (typeString) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.walletService.getTokenMetadata(typeString)];
            });
        });
    };
    /**
     * Get all token balances
     */
    SuiService.prototype.getAllTokenBalances = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.walletService.getAllTokenBalances(address)];
            });
        });
    };
    return SuiService;
}());
exports.SuiService = SuiService;
