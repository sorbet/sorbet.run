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
var mock_socket_1 = require("mock-socket");
var monaco_languageclient_1 = require("monaco-languageclient");
var monaco_vim_1 = require("monaco-vim");
var vscode_ws_jsonrpc_1 = require("vscode-ws-jsonrpc");
var sorbet_1 = require("./sorbet");
var ruby_1 = require("./ruby");
var output_1 = require("./output");
// @ts-ignore
var browser_1 = require("@ruby/wasm-wasi/dist/browser");
// import {File, WASI, OpenFile, ConsoleStdout} from '@bjorn3/browser_wasi_shim';
ruby_1.register();
var element = document.getElementById('editor');
element.addEventListener('click', function (e) {
    // Markdown links in editor tooltips use `#` as their target and use JS to open the actual link target,
    // so clicking them will clear window.location.hash and thus the editor.
    // Prevent that from happening.
    e.preventDefault();
});
// Remove leading '#'
var hash = window.location.hash.slice(1);
var initialValue = hash
    ? decodeURIComponent(hash)
    : "# typed: true\nextend T::Sig\n\nsig {params(x: Integer).void}\ndef foo(x)\n  puts(x + 1)\nend\n\nffoo(0)\nfoo(\"not an int\")";
// create Monaco editor
var model = monaco.editor.createModel(initialValue, 'ruby', monaco.Uri.parse('inmemory://model/default'));
var editor = monaco.editor.create(element, {
    model: model,
    theme: 'vs-dark',
    scrollBeyondLastLine: false,
    formatOnType: true,
    autoIndent: true,
    fontSize: 16,
    minimap: { enabled: false },
    automaticLayout: true,
    lineNumbersMinChars: 0,
    wordBasedSuggestions: false,
    acceptSuggestionOnCommitCharacter: false,
});
window.editor = editor; // Useful for prototyping in dev tools
editor.focus();
var useVimKeybindings = function () {
    var stored = window.localStorage.getItem('useVimKeybindings');
    if (stored == null) {
        return null;
    }
    else {
        return JSON.parse(stored);
    }
};
var vimMode = null;
var toggleVimKeybindings = function () {
    var current = useVimKeybindings();
    window.localStorage.setItem('useVimKeybindings', '' + !current);
    // document.querySelector('html').classList.toggle('stripe-light');
    if (current) {
        vimMode.dispose();
    }
    else {
        vimMode = monaco_vim_1.initVimMode(editor, document.getElementById('editor-statusbar'));
    }
};
// First load
var initialUseVimKeybindings = useVimKeybindings();
if (initialUseVimKeybindings === true) {
    vimMode = monaco_vim_1.initVimMode(editor, document.getElementById('editor-statusbar'));
}
else {
    window.localStorage.setItem('useVimKeybindings', 'false');
}
document.getElementById('vim-button').addEventListener('click', function (ev) {
    ev.preventDefault();
    toggleVimKeybindings();
});
window.addEventListener('hashchange', function () {
    // Remove leading '#'
    var hash = window.location.hash.substr(1);
    var ruby = decodeURIComponent(hash);
    if (editor.getValue() !== ruby) {
        editor.setValue(ruby);
    }
});
var createIssueButton = document.getElementById('create-issue-from-example');
createIssueButton.addEventListener('click', function (ev) {
    var template = "\n#### Input\n\n[\u2192 View on sorbet.run](" + window.location.href + ")\n\n```ruby\n" + editor.getValue() + "\n```\n\n#### Observed output\n\n```\n" + document.querySelector('#output').innerText + "\n```\n\n<!-- TODO: For issues where `srb tc` differs from the behavior of `sorbet-runtime`, please include the observed runtime output. -->\n\n#### Expected behavior\n\n<!-- TODO: Briefly explain what the expected behavior should be on this example. -->\n\n- - -\n\n<!-- TODO: If there is any additional information you'd like to include, include it here. -->\n";
    var body = encodeURIComponent(template);
    ev.target.href = "https://github.com/sorbet/sorbet/issues/new?body=" + body + "&labels=bug,unconfirmed&template=bug.md";
});
var vm = null;
function vminit() {
    return __awaiter(this, void 0, void 0, function () {
        var response, module;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fetch('./ruby-web.wasm')];
                case 1:
                    response = _a.sent();
                    console.log(response);
                    return [4 /*yield*/, WebAssembly.compileStreaming(response)];
                case 2:
                    module = _a.sent();
                    console.log(module);
                    return [4 /*yield*/, browser_1.DefaultRubyVM(module)];
                case 3:
                    (vm = (_a.sent()).vm);
                    console.log(vm);
                    return [2 /*return*/];
            }
        });
    });
}
vminit();
function surround(s) {
    var program = "\n  require \"js\"\n  require \"/bundle/setup\"\n  require \"sorbet-runtime\"\n  extend T::Sig\n  div = JS.global[:document].getElementById(\"rubyoutput\")\n  def div.write(s)\n    self[:innerText] = self[:innerText].to_s + s\n  end\n  $stdout = div\n  begin\n    " + s + "\n  rescue => e\n    puts e.to_s\n  end\n  ";
    return program;
}
editor.onDidChangeModelContent(function (event) {
    var contents = editor.getValue();
    window.location.hash = "#" + encodeURIComponent(contents)
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29');
    output_1.typecheck(contents, new URLSearchParams(window.location.search).getAll('arg'));
    var prog = surround(contents);
    console.log('evaluation', prog);
    document.getElementById('rubyoutput').innerText = '';
    vm.eval(surround(contents));
});
var lastValue = editor.getValue();
output_1.typecheck(lastValue, new URLSearchParams(window.location.search).getAll('arg'));
var prog = surround(lastValue);
console.log('evaluation', prog);
vm.eval(prog);
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
                // Thus, we dispose of the language client, and let `instantiateSorbet`
                // (below) create a new language client.
                disposable.dispose();
            });
        },
    });
}
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
            },
        },
    });
}
var url = 'ws://sorbet.run:8080';
function createFakeWebSocket() {
    return new mock_socket_1.WebSocket(url);
}
/**
 * Main procedure:
 * 1. Create mock server.
 * 2. Create Sorbet instance.
 * 3. Create language server and client.
 * If Sorbet crashes, close the socket to dispose of the language server and
 * client and repeat 2 and 3.
 */
var mockServer = new mock_socket_1.Server(url);
// Sorbet singleton.
var sorbet = null;
// Active socket. The language server communicates to the client via the
// socket. Only one socket is active at a time.
var socket = null;
function instantiateSorbet() {
    return __awaiter(this, void 0, void 0, function () {
        var errorCalled, onPrint, onError;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    errorCalled = false;
                    onPrint = function (msg) { return console.log(msg); };
                    onError = function (event) {
                        console.log({ event: event });
                        // If Sorbet crashes, try creating Sorbet again.
                        // Avoid acting on multiple errors from the same Sorbet instance.
                        if (errorCalled) {
                            return;
                        }
                        errorCalled = true;
                        if (socket) {
                            // Tell the language client + server to shut down.
                            socket.close();
                            socket = null;
                        }
                        sorbet = null;
                        instantiateSorbet();
                    };
                    return [4 /*yield*/, sorbet_1.createSorbet(onPrint, onError)];
                case 1:
                    (sorbet = (_a.sent()).sorbet);
                    startLanguageServer();
                    return [2 /*return*/];
            }
        });
    });
}
mockServer.on('connection', function (s) {
    socket = s;
    var processLSPResponse = sorbet.addFunction(function (arg) {
        var message = (typeof sorbet.UTF8ToString == 'function')
            ? sorbet.UTF8ToString(arg)
            : sorbet.Pointer_stringify(arg);
        console.log('Write: ' + message);
        socket.send(message);
    }, 'vi');
    socket.on('message', function (message) {
        console.log('Read: ' + message);
        sorbet.ccall('lsp', null, ['number', 'string'], [processLSPResponse, message]);
    });
});
instantiateSorbet();
//# sourceMappingURL=client.js.map