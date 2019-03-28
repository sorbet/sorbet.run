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
var mock_socket_1 = require("mock-socket");
var monaco_languageclient_1 = require("monaco-languageclient");
var vscode_ws_jsonrpc_1 = require("vscode-ws-jsonrpc");
var sorbet_1 = require("./sorbet");
var ruby_1 = require("./ruby");
ruby_1.register();
var element = document.getElementById('editor');
// NOTE: Important to define this variable up here due to function hoisting.
// Persist the server in this variable so it does not get garbage collected.
var mockServer = null;
// Remove leading '#'
var hash = window.location.hash.slice(1);
var initialValue = hash ? decodeURIComponent(hash) : element.innerHTML;
element.innerHTML = '';
// create Monaco editor
var model = monaco.editor.createModel(initialValue, 'ruby', monaco.Uri.parse('inmemory://model/default'));
var editor = monaco.editor.create(element, {
    model: model,
    theme: 'vs-dark',
    scrollBeyondLastLine: false,
    formatOnType: true,
    autoIndent: true,
<<<<<<< HEAD
=======
    lightbulb: { enabled: true },
>>>>>>> Restart Sorbet when it dies.
    fontSize: 16,
});
window.addEventListener('hashchange', function () {
    // Remove leading '#'
    var hash = window.location.hash.substr(1);
    var ruby = decodeURIComponent(hash);
    if (editor.getValue() !== ruby) {
        editor.setValue(ruby);
    }
});
editor.onDidChangeModelContent(function (event) {
    var contents = editor.getValue();
    window.location.hash = "#" + encodeURIComponent(contents);
});
// install Monaco language client services
monaco_languageclient_1.MonacoServices.install(editor);
function startLanguageServer() {
    console.log('Starting language server.');
    // create the web socket
    var webSocket = createFakeWebSocket();
    // listen when the web socket is opened
    vscode_ws_jsonrpc_1.listen({
        webSocket: webSocket,
        onConnection: function (connection) {
            // create and start the language client
            var languageClient = createLanguageClient(connection);
            var disposable = languageClient.start();
            connection.onClose(function () {
                // vscode-ws-jsonrpc will try to re-connect to the server,
                // but it tries to talk over the closed WebSocket and fails.
                // Thus, we dispose of the language client and start a new language
                // client instead.
                disposable.dispose();
                startLanguageServer();
            });
        }
    });
}
startLanguageServer();
function createLanguageClient(connection) {
    return new monaco_languageclient_1.MonacoLanguageClient({
        name: 'Sample Language Client',
        clientOptions: {
            // use a language id as a document selector
            documentSelector: ['ruby'],
        },
        // create a language client connection from the JSON RPC connection on
        // demand
        connectionProvider: {
            get: function (errorHandler, closeHandler) {
                return Promise.resolve(monaco_languageclient_1.createConnection(connection, errorHandler, closeHandler));
            }
        }
    });
}
function createFakeWebSocket() {
    var _this = this;
    var url = 'ws://sorbet.run:8080';
    if (!mockServer) {
        mockServer = new mock_socket_1.Server(url);
        mockServer.on('connection', function (socket) { return __awaiter(_this, void 0, void 0, function () {
            var sorbet_2, bufferedMessages_1, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        sorbet_2 = null;
                        bufferedMessages_1 = [];
                        // Socket doesn't buffer messages before a listener is attached.
                        socket.on('message', function (message) {
                            console.log('Read: ' + message);
                            if (!sorbet_2) {
                                // Sorbet is still initializing.
                                bufferedMessages_1.push(message);
                            }
                            else {
                                sorbet_2.sendMessage(message);
                            }
                        });
                        return [4 /*yield*/, sorbet_1.default.create(function (response) {
                                console.log('Write: ' + response);
                                socket.send(response);
                            }, function () {
                                // Sorbet crashed.
                                socket.close();
                            })];
                    case 1:
                        sorbet_2 = _a.sent();
                        // Send any messages that buffered during startup.
                        while (bufferedMessages_1.length > 0) {
                            sorbet_2.sendMessage(bufferedMessages_1.shift());
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        e_1 = _a.sent();
                        // Initialization failed. Close socket.
                        socket.close();
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    }
    return new mock_socket_1.WebSocket(url);
}
//# sourceMappingURL=client.js.map