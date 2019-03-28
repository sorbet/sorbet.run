"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sorbetWasmFile = fetch('../sorbet-wasm.wasm');
var sorbetWasmModule = (typeof WebAssembly.compileStreaming == "function") ?
    WebAssembly.compileStreaming(sorbetWasmFile) :
    sorbetWasmFile
        .then(function (response) { return response.arrayBuffer(); })
        .then(function (bytes) { return WebAssembly.compile(bytes); });
var sorbet = null;
var reservedFunction = null;
var restartCallback = null;
function setRestartCallback(cb) {
    restartCallback = cb;
}
exports.setRestartCallback = setRestartCallback;
var destroySorbet = function () {
    sorbet = null;
    reservedFunction = null;
    if (restartCallback) {
        restartCallback();
    }
};
exports.compile = function (cb) {
    var send = function (message) {
        sorbet.ccall('lsp', null, ['number', 'string'], [reservedFunction, message]);
    };
    return new Promise(function (resolve, reject) {
        if (sorbet) {
            // Already compiling or compiled
            return resolve(send);
        }
        // For some unkonwn reason this varible has to be new everytime, and can't
        // be out of the closure
        var opts = {
            print: function (line) {
                console.log(line);
                destroySorbet();
            },
            printErr: function (line) {
                console.log(line);
                destroySorbet();
            },
            onAbort: function () {
                // On abort, throw away our WebAssembly instance and create a
                // new one. This can happen due to out-of-memory, C++ exceptions,
                // or other reasons; Throwing away and restarting should get us to a healthy state.
                destroySorbet();
            },
            instantiateWasm: function (info, realRecieveInstanceCallBack) {
                sorbetWasmModule
                    .then(function (module) {
                    return WebAssembly.instantiate(module, info)
                        .then(function (instance) { return realRecieveInstanceCallBack(instance, module); })
                        .catch(function (error) {
                        console.log(error);
                    });
                })
                    .catch(function (error) {
                    console.log("Error loading sorbet.wasm. Maybe your adblock blocked it? Some of them are pretty aggressive on github.io domains. We promise we aren't mining crypto currencies on your computer.\n" + error);
                });
                return {}; // indicates lazy initialization
            },
            onRuntimeInitialized: function () {
                reservedFunction = sorbet.addFunction(function (arg) { cb(sorbet.Pointer_stringify(arg)); }, "vi");
                resolve(send);
            }
        };
        sorbet = Sorbet(opts);
    });
};
document.getElementById('menu').addEventListener('click', function (ev) {
    ev.target.classList.toggle('is-showing');
});
//# sourceMappingURL=sorbet.js.map