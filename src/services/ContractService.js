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
exports.ContractService = void 0;
var ServiceConfig_js_1 = require("./config/ServiceConfig.js");
/**
 * Contract Service
 * Handles smart contract ABI and interface related functionality
 */
var ContractService = /** @class */ (function () {
    function ContractService(network) {
        this.config = ServiceConfig_js_1.ServiceConfig.getInstance(network);
    }
    /**
     * Initialize service
     */
    ContractService.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * Clean up service resources
     */
    ContractService.prototype.cleanup = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * Parse Move module ABI interface
     */
    ContractService.prototype.getModuleABI = function (packageId, moduleName) {
        return __awaiter(this, void 0, void 0, function () {
            var abi, cacheKey, cachedAbi, normalizedModule, moduleAbi, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        cacheKey = "module_interface_".concat(packageId, "_").concat(moduleName, "_").concat(this.config.currentNetwork);
                        cachedAbi = this.config.cache.get(cacheKey);
                        abi = cachedAbi;
                        if (cachedAbi) {
                            return [2 /*return*/, cachedAbi];
                        }
                        return [4 /*yield*/, this.config.client.getNormalizedMoveModule({
                                package: packageId,
                                module: moduleName,
                            })];
                    case 1:
                        normalizedModule = _a.sent();
                        if (!normalizedModule) {
                            console.warn("Module not found: ".concat(packageId, "::").concat(moduleName));
                            return [2 /*return*/, null];
                        }
                        moduleAbi = {
                            name: normalizedModule.name,
                            fileFormatVersion: normalizedModule.fileFormatVersion,
                            address: packageId,
                            friends: (normalizedModule.friends || []).map(function (friend) {
                                if (typeof friend === 'string')
                                    return friend;
                                // Handle complex friend reference objects
                                if (typeof friend === 'object') {
                                    var friendObj = friend;
                                    return friendObj.address ? "".concat(friendObj.address, "::").concat(friendObj.name || '') : String(friendObj);
                                }
                                return String(friend);
                            }),
                            structs: Object.entries(normalizedModule.structs || {}).map(function (_a) {
                                var name = _a[0], struct = _a[1];
                                console.log("Processing struct: ".concat(name));
                                // Extract abilities as an array
                                var abilities = [];
                                // Handle different abilities formats
                                if (struct.abilities) {
                                    if (Array.isArray(struct.abilities)) {
                                        // If it's already an array, use it directly
                                        abilities = struct.abilities.map(function (a) { return String(a); });
                                    }
                                    else if (typeof struct.abilities === 'object' && struct.abilities.abilities && Array.isArray(struct.abilities.abilities)) {
                                        // If it's in the format {abilities: [...]}, extract the array
                                        abilities = struct.abilities.abilities.map(function (a) { return String(a); });
                                    }
                                    // For other formats, keep as empty array
                                }
                                return {
                                    name: name,
                                    abilities: abilities,
                                    fields: (struct.fields || []).map(function (field) { return ({
                                        name: field.name,
                                        type: typeof field.type === 'string' ? field.type : JSON.stringify(field.type),
                                    }); }),
                                    typeParameters: (struct.typeParameters || []).map(function (tp) { return ({
                                        constraints: tp.constraints || [],
                                        isPhantom: tp.isPhantom || false
                                    }); }),
                                };
                            }),
                            exposedFunctions: Object.entries(normalizedModule.exposedFunctions || {}).map(function (_a) {
                                var name = _a[0], func = _a[1];
                                return ({
                                    name: name,
                                    visibility: func.visibility,
                                    isEntry: func.isEntry || false,
                                    parameters: (func.parameters || []).map(function (param) {
                                        return typeof param === 'string' ? param : JSON.stringify(param);
                                    }),
                                    returns: (func.return || []).map(function (ret) {
                                        return typeof ret === 'string' ? ret : JSON.stringify(ret);
                                    }),
                                    typeParameters: (func.typeParameters || []).map(function (tp) { return ({
                                        abilities: tp || []
                                    }); }),
                                });
                            }),
                        };
                        // Cache and return
                        this.config.cache.set(cacheKey, moduleAbi, 3600); // Cache for 1 hour
                        return [2 /*return*/, moduleAbi];
                    case 2:
                        error_1 = _a.sent();
                        console.error("Failed to get module ABI: ".concat(error_1, ", abi: ").concat(abi));
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get ABI for all modules in a package
     */
    ContractService.prototype.getPackageABI = function (packageId) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cachedAbi, normalizedModules, moduleAbiPromises, moduleAbis, validModules, error_2;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        cacheKey = "package_interface_".concat(packageId, "_").concat(this.config.currentNetwork);
                        cachedAbi = this.config.cache.get(cacheKey);
                        if (cachedAbi) {
                            return [2 /*return*/, cachedAbi];
                        }
                        return [4 /*yield*/, this.config.client.getNormalizedMoveModulesByPackage({
                                package: packageId,
                            })];
                    case 1:
                        normalizedModules = _a.sent();
                        if (!normalizedModules) {
                            return [2 /*return*/, []];
                        }
                        moduleAbiPromises = Object.keys(normalizedModules).map(function (moduleName) {
                            return _this.getModuleABI(packageId, moduleName);
                        });
                        return [4 /*yield*/, Promise.all(moduleAbiPromises)];
                    case 2:
                        moduleAbis = _a.sent();
                        validModules = moduleAbis.filter(function (m) { return m !== null; });
                        // Cache and return
                        this.config.cache.set(cacheKey, validModules, 3600); // Cache for 1 hour
                        return [2 /*return*/, validModules];
                    case 3:
                        error_2 = _a.sent();
                        console.error("Failed to get package ABI: ".concat(error_2));
                        return [2 /*return*/, []];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate human-readable ABI documentation suitable for frontend display
     */
    ContractService.prototype.generateABIDocumentation = function (packageId_1) {
        return __awaiter(this, arguments, void 0, function (packageId, format) {
            var modules, markdown_1, _i, modules_1, module_1, _a, _b, friend, _c, _d, struct, _e, _f, field, fieldType, typeObj, _g, _h, func, entry, _j, _k, param, paramObj, paramType, struct, struct, _l, _m, ret, error_3;
            if (format === void 0) { format = 'markdown'; }
            return __generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        _o.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getPackageABI(packageId)];
                    case 1:
                        modules = _o.sent();
                        if (format === 'json') {
                            return [2 /*return*/, JSON.stringify(modules, null, 2)];
                        }
                        markdown_1 = '';
                        // Package header
                        markdown_1 += "# Package ".concat(packageId, " Documentation\n\n");
                        // Process each module
                        for (_i = 0, modules_1 = modules; _i < modules_1.length; _i++) {
                            module_1 = modules_1[_i];
                            // Module header
                            markdown_1 += "## Module ".concat(module_1.name, "\n\n");
                            // Add module address and other metadata
                            markdown_1 += "**Address:** `".concat(module_1.address, "`\n");
                            markdown_1 += "**File Format Version:** ".concat(module_1.fileFormatVersion, "\n\n");
                            // Process friends
                            if (module_1.friends && module_1.friends.length > 0) {
                                markdown_1 += '### Friends\n\n';
                                for (_a = 0, _b = module_1.friends; _a < _b.length; _a++) {
                                    friend = _b[_a];
                                    markdown_1 += "- ".concat(friend, "\n");
                                }
                                markdown_1 += '\n';
                            }
                            // Process structs
                            if (module_1.structs && module_1.structs.length > 0) {
                                markdown_1 += '### Structs\n\n';
                                for (_c = 0, _d = module_1.structs; _c < _d.length; _c++) {
                                    struct = _d[_c];
                                    // Struct header
                                    markdown_1 += "#### ".concat(struct.name, "\n\n");
                                    // Handle abilities
                                    markdown_1 += '**Abilities:** ';
                                    if (struct.abilities && Array.isArray(struct.abilities)) {
                                        markdown_1 += struct.abilities.join(', ') || 'None';
                                    }
                                    else {
                                        markdown_1 += 'None';
                                    }
                                    markdown_1 += '\n\n';
                                    // Process fields
                                    if (struct.fields && struct.fields.length > 0) {
                                        markdown_1 += '**Fields:**\n';
                                        for (_e = 0, _f = struct.fields; _e < _f.length; _e++) {
                                            field = _f[_e];
                                            fieldType = field.type;
                                            try {
                                                typeObj = JSON.parse(field.type);
                                                if (typeObj.Struct) {
                                                    fieldType = "".concat(typeObj.Struct.module, "::").concat(typeObj.Struct.name);
                                                    if (typeObj.Struct.typeArguments && typeObj.Struct.typeArguments.length > 0) {
                                                        fieldType += '<...>'; // Simplify generic parameters
                                                    }
                                                }
                                                else if (typeof typeObj === 'string') {
                                                    fieldType = typeObj;
                                                }
                                            }
                                            catch (e) {
                                                // If parsing fails, keep original
                                            }
                                            markdown_1 += "- `".concat(field.name, "`: ").concat(fieldType, "\n");
                                        }
                                        markdown_1 += '\n';
                                    }
                                    // Add type parameters
                                    if (struct.typeParameters && struct.typeParameters.length > 0) {
                                        markdown_1 += '**Type Parameters:**\n';
                                        struct.typeParameters.forEach(function (typeParam, index) {
                                            var constraints = 'None';
                                            if (typeParam.constraints && Array.isArray(typeParam.constraints)) {
                                                constraints = typeParam.constraints.join(', ') || 'None';
                                            }
                                            markdown_1 += "- Type".concat(index, ": Constraints=").concat(constraints, ", Phantom=").concat(typeParam.isPhantom ? 'Yes' : 'No', "\n");
                                        });
                                        markdown_1 += '\n';
                                    }
                                }
                            }
                            // Process functions
                            if (module_1.exposedFunctions && module_1.exposedFunctions.length > 0) {
                                markdown_1 += '### Functions\n\n';
                                for (_g = 0, _h = module_1.exposedFunctions; _g < _h.length; _g++) {
                                    func = _h[_g];
                                    entry = func.isEntry ? ' (entry)' : '';
                                    markdown_1 += "#### ".concat(func.name).concat(entry, "\n\n");
                                    markdown_1 += "**Visibility:** ".concat(func.visibility, "\n");
                                    markdown_1 += "**Entry Function:** ".concat(func.isEntry ? 'Yes' : 'No', "\n\n");
                                    // Parse and simplify parameter types
                                    if (func.parameters && func.parameters.length > 0) {
                                        markdown_1 += '**Parameters:**\n';
                                        for (_j = 0, _k = func.parameters; _j < _k.length; _j++) {
                                            param = _k[_j];
                                            try {
                                                paramObj = JSON.parse(param);
                                                paramType = '';
                                                // Format parameters for better readability
                                                if (paramObj.MutableReference) {
                                                    if (paramObj.MutableReference.Struct) {
                                                        struct = paramObj.MutableReference.Struct;
                                                        paramType = "&mut ".concat(struct.module, "::").concat(struct.name);
                                                    }
                                                    else {
                                                        paramType = "&mut ".concat(JSON.stringify(paramObj.MutableReference));
                                                    }
                                                }
                                                else if (paramObj.Reference) {
                                                    if (paramObj.Reference.Struct) {
                                                        struct = paramObj.Reference.Struct;
                                                        paramType = "& ".concat(struct.module, "::").concat(struct.name);
                                                    }
                                                    else {
                                                        paramType = "& ".concat(JSON.stringify(paramObj.Reference));
                                                    }
                                                }
                                                else if (paramObj.Struct) {
                                                    paramType = "".concat(paramObj.Struct.module, "::").concat(paramObj.Struct.name);
                                                }
                                                else {
                                                    paramType = param;
                                                }
                                                markdown_1 += "- ".concat(paramType, "\n");
                                            }
                                            catch (e) {
                                                // If JSON parsing fails, use original parameter
                                                markdown_1 += "- ".concat(param, "\n");
                                            }
                                        }
                                        markdown_1 += '\n';
                                    }
                                    // Process returns
                                    if (func.returns && func.returns.length > 0) {
                                        markdown_1 += '**Returns:**\n';
                                        for (_l = 0, _m = func.returns; _l < _m.length; _l++) {
                                            ret = _m[_l];
                                            markdown_1 += "- ".concat(ret, "\n");
                                        }
                                        markdown_1 += '\n';
                                    }
                                    else {
                                        markdown_1 += '**Returns:** None\n\n';
                                    }
                                    // Handle type parameters
                                    if (func.typeParameters && func.typeParameters.length > 0) {
                                        markdown_1 += '**Type Parameters:**\n';
                                        func.typeParameters.forEach(function (typeParam, index) {
                                            var constraints = 'None';
                                            if (typeParam.abilities && Array.isArray(typeParam.abilities)) {
                                                constraints = typeParam.abilities.join(', ');
                                            }
                                            markdown_1 += "- T".concat(index, ": ").concat(constraints, "\n");
                                        });
                                        markdown_1 += '\n';
                                    }
                                }
                            }
                        }
                        return [2 /*return*/, markdown_1];
                    case 2:
                        error_3 = _o.sent();
                        console.error('Error generating ABI documentation:', error_3);
                        return [2 /*return*/, "Failed to generate documentation: ".concat(error_3)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get contract source code
     * @param packageId Package ID
     * @returns Contract source information
     */
    ContractService.prototype.getContractSource = function (packageId) {
        return __awaiter(this, void 0, void 0, function () {
            var packageObject, modules, content, moduleNames, normalizedModules, _i, moduleNames_1, moduleName, moduleAbi, source, _a, _b, struct, abilities, _c, _d, field, _e, _f, func, visibility, entry, compilerVersion, error_4;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.config.client.getObject({
                                id: packageId,
                                options: { showContent: true, showBcs: true }
                            })];
                    case 1:
                        packageObject = _g.sent();
                        if (!(packageObject === null || packageObject === void 0 ? void 0 : packageObject.data) || !packageObject.data.content) {
                            throw new Error("Package not found: ".concat(packageId));
                        }
                        modules = [];
                        content = packageObject.data.content;
                        // Check if it's a package type (movePackage is a common type in Sui)
                        if (content.dataType && content.dataType !== 'movePackage' && content.dataType !== 'package') {
                            throw new Error("Object is not a Move package: ".concat(packageId));
                        }
                        moduleNames = [];
                        // Try different ways to access module names based on API version
                        if (content.modules && typeof content.modules === 'object') {
                            // Direct access to modules object
                            moduleNames.push.apply(moduleNames, Object.keys(content.modules));
                        }
                        else if (content.package && content.package.modules && typeof content.package.modules === 'object') {
                            // Access through package property
                            moduleNames.push.apply(moduleNames, Object.keys(content.package.modules));
                        }
                        if (!(moduleNames.length === 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.config.client.getNormalizedMoveModulesByPackage({
                                package: packageId,
                            })];
                    case 2:
                        normalizedModules = _g.sent();
                        if (normalizedModules) {
                            moduleNames.push.apply(moduleNames, Object.keys(normalizedModules));
                        }
                        _g.label = 3;
                    case 3:
                        _i = 0, moduleNames_1 = moduleNames;
                        _g.label = 4;
                    case 4:
                        if (!(_i < moduleNames_1.length)) return [3 /*break*/, 7];
                        moduleName = moduleNames_1[_i];
                        return [4 /*yield*/, this.getModuleABI(packageId, moduleName)];
                    case 5:
                        moduleAbi = _g.sent();
                        if (moduleAbi) {
                            source = "module ".concat(packageId, "::").concat(moduleName, " {\n");
                            // Add struct definitions
                            if (moduleAbi.structs && moduleAbi.structs.length > 0) {
                                for (_a = 0, _b = moduleAbi.structs; _a < _b.length; _a++) {
                                    struct = _b[_a];
                                    abilities = '';
                                    if (struct.abilities && struct.abilities.length > 0) {
                                        abilities = " has ".concat(struct.abilities.join(', '));
                                    }
                                    source += "    struct ".concat(struct.name).concat(abilities, " {\n");
                                    // Add fields
                                    if (struct.fields && struct.fields.length > 0) {
                                        for (_c = 0, _d = struct.fields; _c < _d.length; _c++) {
                                            field = _d[_c];
                                            source += "        ".concat(field.name, ": ").concat(field.type, ",\n");
                                        }
                                    }
                                    source += "    }\n\n";
                                }
                            }
                            // Add function definitions
                            if (moduleAbi.exposedFunctions && moduleAbi.exposedFunctions.length > 0) {
                                for (_e = 0, _f = moduleAbi.exposedFunctions; _e < _f.length; _e++) {
                                    func = _f[_e];
                                    visibility = func.visibility === 'private' ? '' : " ".concat(func.visibility);
                                    entry = func.isEntry ? ' entry' : '';
                                    source += "   ".concat(visibility).concat(entry, " fun ").concat(func.name, "(");
                                    // Add parameters
                                    if (func.parameters && func.parameters.length > 0) {
                                        source += func.parameters.map(function (param, index) { return "arg".concat(index, ": ").concat(param); }).join(', ');
                                    }
                                    source += ')';
                                    // Add return type if any
                                    if (func.returns && func.returns.length > 0) {
                                        if (func.returns.length === 1) {
                                            source += ": ".concat(func.returns[0]);
                                        }
                                        else {
                                            source += ": (".concat(func.returns.join(', '), ")");
                                        }
                                    }
                                    // Add function body placeholder
                                    source += " {\n        // Function implementation not available\n    }\n\n";
                                }
                            }
                            source += '}\n';
                            modules.push({
                                name: moduleName,
                                source: source,
                            });
                        }
                        _g.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7:
                        // If no modules were found, add a placeholder
                        if (modules.length === 0) {
                            modules.push({
                                name: 'module_info',
                                source: "// Package ".concat(packageId, " exists on-chain, but module details couldn't be fully parsed.\n// Use the Sui SDK or CLI to interact with this package.")
                            });
                        }
                        compilerVersion = 'Unknown';
                        if (content.buildInfo && typeof content.buildInfo === 'object' && 'compilerVersion' in content.buildInfo) {
                            compilerVersion = content.buildInfo.compilerVersion;
                        }
                        return [2 /*return*/, {
                                packageId: packageId,
                                modules: modules,
                                compilerVersion: compilerVersion,
                            }];
                    case 8:
                        error_4 = _g.sent();
                        console.error('Error retrieving contract source:', error_4);
                        return [2 /*return*/, {
                                packageId: packageId,
                                modules: [],
                            }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get contract interface information
     * @param packageId Package ID
     * @returns Contract interface information
     */
    ContractService.prototype.getContractInterface = function (packageId) {
        return __awaiter(this, void 0, void 0, function () {
            var packageAbi, modules, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getPackageABI(packageId)];
                    case 1:
                        packageAbi = _a.sent();
                        modules = packageAbi.map(function (module) {
                            var exposed_functions = module.exposedFunctions.map(function (func) {
                                return {
                                    name: func.name,
                                    visibility: func.visibility,
                                    parameters: func.parameters,
                                    returns: func.returns || [],
                                };
                            });
                            return {
                                name: module.name,
                                exposed_functions: exposed_functions,
                            };
                        });
                        return [2 /*return*/, {
                                packageId: packageId,
                                modules: modules,
                            }];
                    case 2:
                        error_5 = _a.sent();
                        console.error('Error retrieving contract interface:', error_5);
                        return [2 /*return*/, {
                                packageId: packageId,
                                modules: [],
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ContractService;
}());
exports.ContractService = ContractService;
