"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceConfig = void 0;
var node_cache_1 = __importDefault(require("node-cache"));
var path = __importStar(require("path"));
var os = __importStar(require("os"));
var fs = __importStar(require("fs/promises"));
var client_1 = require("@mysten/sui/client");
var graphql_1 = require("@mysten/sui/graphql");
/**
 * Service Configuration Class
 * Provides global configuration and shared resources
 */
var ServiceConfig = /** @class */ (function () {
    /**
     * Private constructor
     */
    function ServiceConfig(network) {
        if (network === void 0) { network = 'testnet'; }
        // SUI GraphQL client
        this._graphqlClient = null;
        this._currentNetwork = network;
        this._client = new client_1.SuiClient({ url: (0, client_1.getFullnodeUrl)(network) });
        this._cache = new node_cache_1.default({ stdTTL: 60 }); // Default cache TTL of 60 seconds
        this._storageDir = path.join(os.tmpdir(), 'sui-explorer-storage');
        // Initialize storage directory
        this.initStorageDir().catch(function (err) {
            console.warn("Failed to initialize storage directory: ".concat(err));
        });
        // GraphQL client only for mainnet and testnet
        if (network === 'mainnet' || network === 'testnet') {
            this.initGraphQLClient(network);
        }
    }
    /**
     * Get singleton instance
     */
    ServiceConfig.getInstance = function (network) {
        if (!ServiceConfig.instance) {
            ServiceConfig.instance = new ServiceConfig(network);
        }
        else if (network && network !== ServiceConfig.instance._currentNetwork) {
            // If a new network environment is specified, update the client
            ServiceConfig.instance._currentNetwork = network;
            ServiceConfig.instance._client = new client_1.SuiClient({ url: (0, client_1.getFullnodeUrl)(network) });
            // Update GraphQL client
            if (network === 'mainnet' || network === 'testnet') {
                ServiceConfig.instance.initGraphQLClient(network);
            }
            else {
                ServiceConfig.instance._graphqlClient = null;
            }
        }
        return ServiceConfig.instance;
    };
    /**
     * Initialize storage directory
     */
    ServiceConfig.prototype.initStorageDir = function () {
        return __awaiter(this, void 0, void 0, function () {
            var verifiedDir, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, fs.mkdir(this._storageDir, { recursive: true })];
                    case 1:
                        _a.sent();
                        verifiedDir = path.join(this._storageDir, 'verified-contracts');
                        return [4 /*yield*/, fs.mkdir(verifiedDir, { recursive: true })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error("Failed to create storage directories: ".concat(error_1));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initialize GraphQL client
     */
    ServiceConfig.prototype.initGraphQLClient = function (network) {
        try {
            this._graphqlClient = new graphql_1.SuiGraphQLClient({
                url: network === 'mainnet'
                    ? 'https://sui-mainnet.mystenlabs.com/graphql'
                    : 'https://sui-testnet.mystenlabs.com/graphql'
            });
        }
        catch (error) {
            console.warn("Failed to initialize GraphQL client: ".concat(error));
            this._graphqlClient = null;
        }
    };
    Object.defineProperty(ServiceConfig.prototype, "cache", {
        /**
         * Get cache instance
         */
        get: function () {
            return this._cache;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ServiceConfig.prototype, "currentNetwork", {
        /**
         * Get current network environment
         */
        get: function () {
            return this._currentNetwork;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ServiceConfig.prototype, "client", {
        /**
         * Get SUI RPC client
         */
        get: function () {
            return this._client;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ServiceConfig.prototype, "graphqlClient", {
        /**
         * Get SUI GraphQL client
         */
        get: function () {
            return this._graphqlClient;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ServiceConfig.prototype, "storageDir", {
        /**
         * Get storage directory
         */
        get: function () {
            return this._storageDir;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Update network environment
     */
    ServiceConfig.prototype.updateNetwork = function (network) {
        this._currentNetwork = network;
        this._client = new client_1.SuiClient({ url: (0, client_1.getFullnodeUrl)(network) });
        // Update GraphQL client
        if (network === 'mainnet' || network === 'testnet') {
            this.initGraphQLClient(network);
        }
        else {
            this._graphqlClient = null;
        }
    };
    return ServiceConfig;
}());
exports.ServiceConfig = ServiceConfig;
