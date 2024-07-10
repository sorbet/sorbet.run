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
exports.createSorbet = void 0;
var sorbetWasmFile = fetch('../sorbet-wasm.wasm');
var sorbetWasmModule = (typeof WebAssembly.compileStreaming == 'function') ?
    WebAssembly.compileStreaming(sorbetWasmFile) :
    sorbetWasmFile.then(function (response) { return response.arrayBuffer(); })
        .then(function (bytes) { return WebAssembly.compile(bytes); });
// Since instantiateWasm requires an empty object as a return value,
// we can't make it async. So, instead, we put the async stuff here
// so we can use nice async/await syntax.
function instantiateWasmImpl(imports, successCallback) {
    return __awaiter(this, void 0, void 0, function () {
        var mod, instance, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, sorbetWasmModule];
                case 1:
                    mod = _a.sent();
                    return [4 /*yield*/, WebAssembly.instantiate(mod, imports)];
                case 2:
                    instance = _a.sent();
                    successCallback(instance, mod);
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
/**
 * Creates a new Sorbet instances. Calls errorCallback if Sorbet quits or
 * fails to start up.
 */
function createSorbet(onPrint, onAbort) {
    var opts = {
        print: onPrint,
        printErr: onPrint,
        // On abort, throw away our WebAssembly instance and create a
        // new one. This can happen due to out-of-memory, C++ exceptions,
        // or other reasons; Throwing away and restarting should get us to a
        // healthy state.
        onAbort: onAbort,
        instantiateWasm: function (imports, successCallback) {
            instantiateWasmImpl(imports, successCallback).catch(onAbort);
            return {}; // indicates lazy initialization
        },
    };
    // We have to manually return a promise for backwards compatibility. Old
    // versions of emscripten used to return the Module itself which has a
    // `.then` property, instead of a Promise object, which would cause infinite
    // loops.
    //
    // We can drop the explict `new Promise` below after we've started publishing
    // versions of Sorbet build with a more recent emscripten.
    return new Promise(function (resolve, reject) {
        Sorbet(opts).then(function (sorbet) {
            // NOTE: DO *NOT* `resolve(sorbet)`!
            // You will cause an infinite asynchronous loop. It will not be
            // debuggable, and will lock up the browser. See:
            // https://github.com/emscripten-core/emscripten/issues/5820
            // We wrap it in an object to be safe.
            resolve({ sorbet: sorbet });
        });
    });
}
exports.createSorbet = createSorbet;
//# sourceMappingURL=sorbet.js.map