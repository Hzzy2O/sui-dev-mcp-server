"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.WalletService = void 0;
var ServiceConfig_js_1 = require("./config/ServiceConfig.js");
var faucet_1 = require("@mysten/sui/faucet");
var ed25519_1 = require("@mysten/sui/keypairs/ed25519");
var bip39_1 = require("@scure/bip39");
var english_1 = require("@scure/bip39/wordlists/english");
/**
 * Wallet Service
 * Handles wallet and account related functionality
 */
var WalletService = /** @class */ (function () {
    function WalletService(network) {
        // Registry of known token standards
        this.tokenRegistry = new Map();
        this.config = ServiceConfig_js_1.ServiceConfig.getInstance(network);
        this.initTokenRegistry();
    }
    /**
     * Initialize token registry
     */
    WalletService.prototype.initTokenRegistry = function () {
        // Set native SUI token
        this.tokenRegistry.set('0x2::sui::SUI', {
            name: 'Sui',
            symbol: 'SUI',
            decimals: 9,
            description: 'The native token of the Sui network',
            iconUrl: 'https://assets.coingecko.com/coins/images/26375/large/sui_asset.jpeg',
        });
    };
    /**
     * Initialize service
     */
    WalletService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * Clean up service resources
     */
    WalletService.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * Create a new wallet
     */
    WalletService.prototype.createNewWallet = function () {
        return __awaiter(this, void 0, void 0, function () {
            var mnemonic, keypair, address, privateKey;
            return __generator(this, function (_a) {
                try {
                    mnemonic = (0, bip39_1.generateMnemonic)(english_1.wordlist, 256);
                    keypair = ed25519_1.Ed25519Keypair.deriveKeypair(mnemonic);
                    address = keypair.getPublicKey().toSuiAddress();
                    privateKey = keypair.getSecretKey();
                    return [2 /*return*/, {
                            address: address,
                            mnemonic: mnemonic,
                            privateKey: privateKey
                        }];
                }
                catch (error) {
                    throw new Error("Failed to create wallet: ".concat(error instanceof Error ? error.message : String(error)));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Request tokens from a faucet
     */
    WalletService.prototype.requestFaucetTokens = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var transferredGasObjects, amount, error_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        // Check if trying to get tokens on mainnet (not allowed)
                        if (this.config.currentNetwork === 'mainnet') {
                            throw new Error('Cannot request faucet tokens on mainnet');
                        }
                        // In a real implementation, this would use the Sui SDK to request from faucet
                        // Note: This is a mock implementation that simulates the actual SDK call
                        console.log("Requesting ".concat(this.config.currentNetwork, " tokens for address: ").concat(address));
                        return [4 /*yield*/, (0, faucet_1.requestSuiFromFaucetV0)({
                                host: (0, faucet_1.getFaucetHost)(this.config.currentNetwork),
                                recipient: address,
                            })];
                    case 1:
                        transferredGasObjects = (_c.sent()).transferredGasObjects;
                        amount = (_a = transferredGasObjects[0]) === null || _a === void 0 ? void 0 : _a.amount;
                        return [2 /*return*/, {
                                success: true,
                                amount: amount,
                                txHash: (_b = transferredGasObjects[0]) === null || _b === void 0 ? void 0 : _b.transferTxDigest,
                                message: "".concat(this.config.currentNetwork.charAt(0).toUpperCase() +
                                    this.config.currentNetwork.slice(1), " faucet tokens successfully requested (").concat(amount / 1000000000, " SUI)"),
                            }];
                    case 2:
                        error_1 = _c.sent();
                        console.error('Error requesting faucet tokens:', error_1);
                        return [2 /*return*/, {
                                success: false,
                                message: error_1 instanceof Error ? error_1.message : 'Unknown error occurred',
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get token metadata
     */
    WalletService.prototype.getTokenMetadata = function (typeString) {
        return __awaiter(this, void 0, void 0, function () {
            var normalizedType, parts, metadata;
            return __generator(this, function (_a) {
                try {
                    // First check local cache
                    if (this.tokenRegistry.has(typeString)) {
                        return [2 /*return*/, this.tokenRegistry.get(typeString) || null];
                    }
                    normalizedType = typeString.replace(/<.*>/, '');
                    // Check if it's in cache after normalization
                    if (this.tokenRegistry.has(normalizedType)) {
                        return [2 /*return*/, this.tokenRegistry.get(normalizedType) || null];
                    }
                    // In a real implementation, try to fetch from on-chain
                    try {
                        parts = normalizedType.split('::');
                        if (parts.length === 3) {
                            metadata = {
                                name: parts[2], // Use type name as token name
                                symbol: parts[2],
                                decimals: 9, // Assume 9 decimals like SUI
                            };
                            // Cache for future use
                            this.tokenRegistry.set(normalizedType, metadata);
                            return [2 /*return*/, metadata];
                        }
                        // Fall back to minimal metadata
                        return [2 /*return*/, {
                                name: 'Unknown Token',
                                symbol: 'UNKNOWN',
                                decimals: 9,
                                description: 'Token metadata not available',
                            }];
                    }
                    catch (innerError) {
                        console.warn("Failed to fetch metadata for ".concat(typeString, ":"), innerError);
                        // Return basic fallback
                        return [2 /*return*/, {
                                name: 'Unknown Token',
                                symbol: 'UNKNOWN',
                                decimals: 9,
                                description: 'Token metadata not available',
                            }];
                    }
                }
                catch (error) {
                    console.error('Error retrieving token metadata:', error);
                    return [2 /*return*/, null];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get all token balances for an address
     */
    WalletService.prototype.getAllTokenBalances = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cachedBalances, allCoins, balancesByType, _i, _a, coin, coinType, entry, balance, result, error_2;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        cacheKey = "token_balances_".concat(address, "_").concat(this.config.currentNetwork);
                        cachedBalances = this.config.cache.get(cacheKey);
                        if (cachedBalances) {
                            return [2 /*return*/, cachedBalances];
                        }
                        return [4 /*yield*/, this.config.client.getAllCoins({
                                owner: address,
                            })];
                    case 1:
                        allCoins = _b.sent();
                        balancesByType = new Map();
                        // Process each coin
                        for (_i = 0, _a = allCoins.data; _i < _a.length; _i++) {
                            coin = _a[_i];
                            coinType = coin.coinType;
                            // Initialize entry if not exists
                            if (!balancesByType.has(coinType)) {
                                balancesByType.set(coinType, {
                                    coinType: coinType,
                                    coinObjectCount: 0,
                                    totalBalance: 0n,
                                    lockedBalance: 0n,
                                });
                            }
                            entry = balancesByType.get(coinType);
                            entry.coinObjectCount++;
                            balance = BigInt(coin.balance || '0');
                            entry.totalBalance += balance;
                            // Calculate locked balance (if applicable)
                            // This is simplified; in real implementation it would check stake, etc.
                        }
                        return [4 /*yield*/, Promise.all(Array.from(balancesByType.values()).map(function (balance) { return __awaiter(_this, void 0, void 0, function () {
                                var metadata;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this.getTokenMetadata(balance.coinType)];
                                        case 1:
                                            metadata = _a.sent();
                                            return [2 /*return*/, __assign(__assign({}, balance), { metadata: metadata || undefined })];
                                    }
                                });
                            }); }))];
                    case 2:
                        result = _b.sent();
                        // Cache the result (short TTL since balances change often)
                        this.config.cache.set(cacheKey, result, 60); // Cache for 1 minute
                        return [2 /*return*/, result];
                    case 3:
                        error_2 = _b.sent();
                        console.error('Error retrieving token balances:', error_2);
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return WalletService;
}());
exports.WalletService = WalletService;
