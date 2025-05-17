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
exports.ObjectService = void 0;
var ServiceConfig_js_1 = require("./config/ServiceConfig.js");
/**
 * Object Service
 * Handles Sui object query related functionality
 */
var ObjectService = /** @class */ (function () {
    function ObjectService(network) {
        this.config = ServiceConfig_js_1.ServiceConfig.getInstance(network);
    }
    /**
     * Initialize service
     */
    ObjectService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * Clean up service resources
     */
    ObjectService.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get object details
     */
    ObjectService.prototype.getObject = function (objectId) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cachedObject, response, suiObject, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        cacheKey = "object_".concat(objectId, "_").concat(this.config.currentNetwork);
                        cachedObject = this.config.cache.get(cacheKey);
                        if (cachedObject) {
                            return [2 /*return*/, cachedObject];
                        }
                        return [4 /*yield*/, this.config.client.getObject({
                                id: objectId,
                                options: { showContent: true, showOwner: true, showType: true },
                            })];
                    case 1:
                        response = _b.sent();
                        if (!response.data) {
                            throw new Error("Object not found: ".concat(objectId));
                        }
                        suiObject = {
                            objectId: response.data.objectId,
                            version: ((_a = response.data.version) === null || _a === void 0 ? void 0 : _a.toString()) || '0',
                            digest: response.data.digest || '',
                            type: response.data.type || 'unknown',
                            owner: JSON.stringify(response.data.owner || 'unknown'),
                            content: response.data.content || {},
                        };
                        this.config.cache.set(cacheKey, suiObject);
                        return [2 /*return*/, suiObject];
                    case 2:
                        error_1 = _b.sent();
                        throw new Error("Failed to get object: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Batch retrieve objects
     */
    ObjectService.prototype.getObjects = function (objectIds) {
        return __awaiter(this, void 0, void 0, function () {
            var objects, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all(objectIds.map(function (id) { return _this.getObject(id); }))];
                    case 1:
                        objects = _a.sent();
                        return [2 /*return*/, objects];
                    case 2:
                        error_2 = _a.sent();
                        throw new Error("Failed to get objects: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get all objects owned by an address
     */
    ObjectService.prototype.getOwnedObjects = function (address_1) {
        return __awaiter(this, arguments, void 0, function (address, options) {
            var _a, limit, cursor, filter, filterOptions, response, objects, error_3;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = options.limit, limit = _a === void 0 ? 50 : _a, cursor = options.cursor, filter = options.filter;
                        filterOptions = {};
                        if (filter === null || filter === void 0 ? void 0 : filter.type) {
                            filterOptions.MatchAll = [
                                { StructType: filter.type }
                            ];
                        }
                        return [4 /*yield*/, this.config.client.getOwnedObjects({
                                owner: address,
                                options: { showContent: true, showType: true, showOwner: true },
                                cursor: cursor || undefined,
                                limit: limit,
                                filter: Object.keys(filterOptions).length > 0 ? filterOptions : undefined
                            })];
                    case 1:
                        response = _b.sent();
                        objects = response.data.map(function (item) {
                            var _a;
                            var data = item.data;
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
                                version: ((_a = data.version) === null || _a === void 0 ? void 0 : _a.toString()) || '0',
                                digest: data.digest || '',
                                type: data.type || 'unknown',
                                owner: JSON.stringify(data.owner || 'unknown'),
                                content: data.content || {},
                            };
                        });
                        return [2 /*return*/, {
                                data: objects,
                                nextCursor: response.nextCursor || null,
                                hasNextPage: response.hasNextPage
                            }];
                    case 2:
                        error_3 = _b.sent();
                        throw new Error("Failed to get owned objects: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ObjectService;
}());
exports.ObjectService = ObjectService;
