"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vscode_ws_jsonrpc_1 = require("vscode-ws-jsonrpc");
var monaco_languageclient_1 = require("monaco-languageclient");
var mock_socket_1 = require("mock-socket");
var sorbet_1 = require("./sorbet");
var element = document.getElementById('editor');
// create Monaco editor
var initialValue = function () {
    // Remove leading '#'
    var hash = window.location.hash.slice(1);
    if (hash) {
        return decodeURIComponent(hash);
    }
    return element.innerHTML;
};
var value = initialValue();
element.innerHTML = '';
var editor = monaco.editor.create(element, {
    value: value,
    language: 'ruby',
    theme: 'vs-dark',
    minimap: {
        enabled: false,
    },
    scrollBeyondLastLine: false,
    formatOnType: true,
    autoIndent: true,
    lightbulb: {
        enabled: true
    },
});
window.addEventListener('hashchange', function () {
    // Remove leading '#'
    var hash = window.location.hash.substr(1);
    var ruby = decodeURIComponent(hash);
    if (editor.getValue() !== ruby) {
        editor.setValue(ruby);
    }
});
// install Monaco language client services
monaco_languageclient_1.MonacoServices.install(editor);
// create the web socket
var webSocket = createFakeWebSocket();
// listen when the web socket is opened
vscode_ws_jsonrpc_1.listen({
    webSocket: webSocket,
    onConnection: function (connection) {
        // create and start the language client
        var languageClient = createLanguageClient(connection);
        var disposable = languageClient.start();
        connection.onClose(function () { return disposable.dispose(); });
    }
});
function createLanguageClient(connection) {
    return new monaco_languageclient_1.MonacoLanguageClient({
        name: "Sample Language Client",
        clientOptions: {
            // use a language id as a document selector
            documentSelector: ['json'],
            // disable the default error handler
            errorHandler: {
                error: function () { return monaco_languageclient_1.ErrorAction.Continue; },
                closed: function () { return monaco_languageclient_1.CloseAction.DoNotRestart; }
            }
        },
        // create a language client connection from the JSON RPC connection on demand
        connectionProvider: {
            get: function (errorHandler, closeHandler) {
                return Promise.resolve(monaco_languageclient_1.createConnection(connection, errorHandler, closeHandler));
            }
        }
    });
}
function createFakeWebSocket() {
    var url = 'ws://sorbet.run:8080';
    var mockServer = new mock_socket_1.Server(url);
    mockServer.on('connection', function (socket) {
        socket.on('message', function (message) {
            console.log('compiling');
            sorbet_1.compile(function (response) {
                console.log('receved ' + response);
                socket.send(response);
            }).then(function (send) {
                console.log('sending ' + message);
                send(message);
            });
        });
    });
    return new mock_socket_1.WebSocket(url);
}
//# sourceMappingURL=client.js.map