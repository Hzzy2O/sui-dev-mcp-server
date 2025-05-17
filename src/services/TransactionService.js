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
exports.TransactionService = void 0;
var ServiceConfig_js_1 = require("./config/ServiceConfig.js");
var transactions_1 = require("@mysten/sui/transactions");
/**
 * Transaction Service
 * Handles transaction query and building related functionality
 */
var TransactionService = /** @class */ (function () {
    function TransactionService(network) {
        this.config = ServiceConfig_js_1.ServiceConfig.getInstance(network);
    }
    /**
     * Initialize service
     */
    TransactionService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * Clean up service resources
     */
    TransactionService.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get transaction details
     */
    TransactionService.prototype.getTransaction = function (digest) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cachedTransaction, response, transaction, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        cacheKey = "transaction_".concat(digest, "_").concat(this.config.currentNetwork);
                        cachedTransaction = this.config.cache.get(cacheKey);
                        if (cachedTransaction) {
                            return [2 /*return*/, cachedTransaction];
                        }
                        return [4 /*yield*/, this.config.client.getTransactionBlock({
                                digest: digest,
                                options: {
                                    showEffects: true,
                                    showInput: true,
                                    showEvents: true,
                                },
                            })];
                    case 1:
                        response = _a.sent();
                        transaction = response;
                        this.config.cache.set(cacheKey, transaction);
                        return [2 /*return*/, transaction];
                    case 2:
                        error_1 = _a.sent();
                        throw new Error("Failed to get transaction: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analyze transaction gas usage
     */
    TransactionService.prototype.analyzeGasUsage = function (digest) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cachedAnalysis, tx, effects, _a, computationCost, storageCost, storageRebate, totalGasCost, analysis, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        cacheKey = "gas_".concat(digest, "_").concat(this.config.currentNetwork);
                        cachedAnalysis = this.config.cache.get(cacheKey);
                        if (cachedAnalysis) {
                            return [2 /*return*/, cachedAnalysis];
                        }
                        return [4 /*yield*/, this.config.client.getTransactionBlock({
                                digest: digest,
                                options: { showEffects: true },
                            })];
                    case 1:
                        tx = _b.sent();
                        effects = tx.effects;
                        if (!effects || !effects.gasUsed) {
                            throw new Error('Transaction effects not available');
                        }
                        _a = effects.gasUsed, computationCost = _a.computationCost, storageCost = _a.storageCost, storageRebate = _a.storageRebate;
                        totalGasCost = (BigInt(computationCost) +
                            BigInt(storageCost) -
                            BigInt(storageRebate)).toString();
                        analysis = {
                            computationCost: computationCost,
                            storageCost: storageCost,
                            storageRebate: storageRebate,
                            totalGasCost: totalGasCost,
                        };
                        this.config.cache.set(cacheKey, analysis);
                        return [2 /*return*/, analysis];
                    case 2:
                        error_2 = _b.sent();
                        throw new Error("Failed to analyze gas usage: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Build transaction
     */
    TransactionService.prototype.buildTransaction = function (type, params, gasConfig) {
        return __awaiter(this, void 0, void 0, function () {
            var tx_1, _a, packageId, module_1, functionName;
            return __generator(this, function (_b) {
                try {
                    tx_1 = new transactions_1.Transaction();
                    if (type === 'transfer') {
                        // Transfer transaction
                        if (!params.recipient || !params.amount) {
                            throw new Error('Transfer requires recipient and amount');
                        }
                        tx_1.transferObjects([tx_1.gas], // In an actual implementation, this would be the actual token objects
                        tx_1.pure(params.recipient));
                    }
                    else if (type === 'moveCall') {
                        // Call Move function
                        if (!params.target || !params.arguments) {
                            throw new Error('MoveCall requires target and arguments');
                        }
                        _a = params.target.split('::'), packageId = _a[0], module_1 = _a[1], functionName = _a[2];
                        tx_1.moveCall({
                            target: "".concat(packageId, "::").concat(module_1, "::").concat(functionName),
                            arguments: params.arguments.map(function (arg) { return tx_1.pure(arg); })
                        });
                    }
                    // Set gas budget
                    if (gasConfig === null || gasConfig === void 0 ? void 0 : gasConfig.budget) {
                        tx_1.setGasBudget(gasConfig.budget);
                    }
                    // Return serialized transaction
                    return [2 /*return*/, tx_1.serialize()];
                }
                catch (error) {
                    throw new Error("Failed to build transaction: ".concat(error));
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Decode error
     */
    TransactionService.prototype.decodeError = function (errorCode) {
        // Common Sui error codes and their explanations
        var errorMap = {
            InsufficientGas: {
                description: 'Transaction ran out of gas',
                fix: 'Increase gas budget or optimize transaction',
            },
            MoveAbort: {
                description: 'Move code aborted execution',
                fix: 'Check your Move code logic and preconditions',
            },
            InsufficientCoinBalance: {
                description: 'Insufficient coin balance for operation',
                fix: 'Ensure wallet has enough funds or reduce amount',
            },
            InvalidSignature: {
                description: 'Transaction signature is invalid',
                fix: 'Check keypair and signing process',
            },
            InvalidObjectOwner: {
                description: 'Object not owned by sender',
                fix: 'Verify object ownership before transaction',
            },
        };
        var error = errorMap[errorCode] || {
            description: 'Unknown error code',
            fix: 'Check Sui documentation or community forums',
        };
        return {
            code: errorCode,
            description: error.description,
            possibleFix: error.fix,
        };
    };
    /**
     * Get address transaction history
     */
    TransactionService.prototype.getAddressTransactions = function (address_1) {
        return __awaiter(this, arguments, void 0, function (address, limit, cursor) {
            var result_1, txData, graphQLError_1, cacheKey, cachedResult, response, result, error_3;
            var _a, _b;
            if (limit === void 0) { limit = 10; }
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        if (!this.config.graphqlClient) return [3 /*break*/, 4];
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.config.graphqlClient.query({
                                query: "\n              query GetTransactions($address: String!, $cursor: String, $limit: Int) {\n                address(address: $address) {\n                  transactions: transactionBlocks(first: $limit, after: $cursor) {\n                    pageInfo {\n                      hasNextPage\n                      endCursor\n                    }\n                    nodes {\n                      digest\n                      timestampMs\n                      sender {\n                        address\n                      }\n                      effects {\n                        status\n                        gasUsed {\n                          computationCost\n                          storageCost\n                          storageRebate\n                        }\n                      }\n                    }\n                  }\n                }\n              }\n            ",
                                variables: {
                                    address: address,
                                    limit: limit,
                                    cursor: cursor
                                }
                            })];
                    case 2:
                        result_1 = _c.sent();
                        txData = (_b = (_a = result_1 === null || result_1 === void 0 ? void 0 : result_1.data) === null || _a === void 0 ? void 0 : _a.address) === null || _b === void 0 ? void 0 : _b.transactions;
                        if ((txData === null || txData === void 0 ? void 0 : txData.nodes) && (txData === null || txData === void 0 ? void 0 : txData.pageInfo)) {
                            return [2 /*return*/, {
                                    data: txData.nodes,
                                    nextCursor: txData.pageInfo.hasNextPage ? txData.pageInfo.endCursor : undefined,
                                    hasNextPage: !!txData.pageInfo.hasNextPage
                                }];
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        graphQLError_1 = _c.sent();
                        console.warn("GraphQL query failed: ".concat(graphQLError_1, ". Falling back to RPC."));
                        return [3 /*break*/, 4];
                    case 4:
                        cacheKey = "address_txs_".concat(address, "_").concat(limit, "_").concat(cursor || 'start', "_").concat(this.config.currentNetwork);
                        cachedResult = this.config.cache.get(cacheKey);
                        if (cachedResult) {
                            return [2 /*return*/, cachedResult];
                        }
                        return [4 /*yield*/, this.config.client.queryTransactionBlocks({
                                filter: {
                                    FromAddress: address
                                },
                                options: {
                                    showEffects: true,
                                    showInput: true
                                },
                                cursor: cursor || undefined,
                                limit: limit
                            })];
                    case 5:
                        response = _c.sent();
                        result = {
                            data: response.data,
                            nextCursor: response.nextCursor || undefined,
                            hasNextPage: response.hasNextPage
                        };
                        this.config.cache.set(cacheKey, result);
                        return [2 /*return*/, result];
                    case 6:
                        error_3 = _c.sent();
                        throw new Error("Failed to get address transactions: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Subscribe to events
     * @param filter Event filter parameters
     * @param callback Function to be called when events are received
     */
    TransactionService.prototype.subscribeToEvents = function (filter, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    console.log("Subscribing to events with filter:", filter);
                    // In a real implementation, this would use websocket subscription
                    // For now, just return a mock unsubscribe function
                    return [2 /*return*/, {
                            unsubscribe: function () {
                                console.log('Unsubscribed from events');
                            }
                        }];
                }
                catch (error) {
                    console.error('Failed to subscribe to events:', error);
                    throw new Error("Event subscription failed: ".concat(error instanceof Error ? error.message : String(error)));
                }
                return [2 /*return*/];
            });
        });
    };
    return TransactionService;
}());
exports.TransactionService = TransactionService;
