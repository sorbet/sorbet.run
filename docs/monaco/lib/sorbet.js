"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
var sorbetWasmFile = fetch('../sorbet-wasm.wasm');
var sorbetWasmModule = (typeof WebAssembly.compileStreaming == 'function') ?
    WebAssembly.compileStreaming(sorbetWasmFile) :
    sorbetWasmFile.then(function (response) { return response.arrayBuffer(); })
        .then(function (bytes) { return WebAssembly.compile(bytes); });
function NOP() { }
var SorbetServer = /** @class */ (function () {
    // Enforce construction via the static function.
    function SorbetServer() {
        this._destroyed = false;
        this.onResponse = NOP;
        this.onError = NOP;
    }
    SorbetServer.create = function (responseCallback, errorCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var sorbetServer;
            return __generator(this, function (_a) {
                sorbetServer = new SorbetServer();
                sorbetServer.onResponse = responseCallback;
                sorbetServer.onError = errorCallback;
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var opts = {
                            print: sorbetServer._print.bind(sorbetServer),
                            printErr: sorbetServer._printErr.bind(sorbetServer),
                            // On abort, throw away our WebAssembly instance and create a
                            // new one. This can happen due to out-of-memory, C++ exceptions,
                            // or other reasons; Throwing away and restarting should get us to a
                            // healthy state.
                            onAbort: sorbetServer._destroy.bind(sorbetServer),
                            instantiateWasm: function (info, realReceiveInstanceCallBack) {
                                instantiateWasmImpl(info, realReceiveInstanceCallBack).catch(reject);
                                return {}; // indicates lazy initialization
                            },
                            onRuntimeInitialized: function () {
                                resolve(sorbetServer);
                            }
                        };
                        // Since instantiateWasm requires an empty object as a return value,
                        // we can't make it async. So, instead, we put the async stuff here
                        // so we an use nice async/await syntax.
                        function instantiateWasmImpl(info, realReceiveInstanceCallBack) {
                            return __awaiter(this, void 0, void 0, function () {
                                var mod, instance, error_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 3, , 4]);
                                            return [4 /*yield*/, sorbetWasmModule];
                                        case 1:
                                            mod = _a.sent();
                                            return [4 /*yield*/, WebAssembly.instantiate(mod, info)];
                                        case 2:
                                            instance = _a.sent();
                                            realReceiveInstanceCallBack(instance, mod);
                                            return [3 /*break*/, 4];
                                        case 3:
                                            error_1 = _a.sent();
                                            console.log('Error loading sorbet.wasm. Maybe your adblock blocked it? Some of them are pretty aggressive on github.io domains. We promise we aren\'t mining crypto currencies on your computer.\n' +
                                                error_1);
                                            throw error_1;
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            });
                        }
                        sorbetServer._sorbet = Sorbet(opts);
                    })];
            });
        });
    };
    SorbetServer.prototype._print = function (line) {
        console.log(line);
        this._destroy();
    };
    SorbetServer.prototype._printErr = function (line) {
        console.log(line);
        this._destroy();
    };
    SorbetServer.prototype._destroy = function () {
        if (!this._destroyed) {
            this._destroyed = true;
            this.onError('Sorbet shut down.');
        }
    };
    SorbetServer.prototype.sendMessage = function (msg) {
        var _this = this;
        if (this._destroyed) {
            throw new Error('Sorbet server is not running.');
        }
        // Lazily initialize Emscripten-side of the response callback.
        if (!this._onResponseEmscripten) {
            this._onResponseEmscripten = this._sorbet.addFunction(function (arg) { _this.onResponse(_this._sorbet.Pointer_stringify(arg)); }, 'vi');
        }
        this._sorbet.ccall('lsp', null, ['number', 'string'], [this._onResponseEmscripten, msg]);
    };
    return SorbetServer;
}());
exports.default = SorbetServer;
document.getElementById('menu').addEventListener('click', function (ev) {
    ev.target.classList.toggle('is-showing');
});
//# sourceMappingURL=sorbet.js.map