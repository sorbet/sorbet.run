"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vscode_ws_jsonrpc_1 = require("vscode-ws-jsonrpc");
var monaco_languageclient_1 = require("monaco-languageclient");
var mock_socket_1 = require("mock-socket");
var sorbet_1 = require("./sorbet");
var ruby_1 = require("./ruby");
ruby_1.register();
var element = document.getElementById('editor');
// Remove leading '#'
var hash = window.location.hash.slice(1);
var initialValue = hash ? decodeURIComponent(hash) : element.innerHTML;
element.innerHTML = '';
// create Monaco editor
var editor = monaco.editor.create(element, {
    value: initialValue,
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
sorbet_1.setRestartCallback(function () {
    window.location.reload();
});
function createLanguageClient(connection) {
    return new monaco_languageclient_1.MonacoLanguageClient({
        name: "Sample Language Client",
        clientOptions: {
            // use a language id as a document selector
            documentSelector: ['ruby'],
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
            sorbet_1.compile(function (response) {
                console.log('Write: ' + response);
                socket.send(response);
            }).then(function (send) {
                console.log('Read: ' + message);
                send(message);
            });
        });
    });
    return new mock_socket_1.WebSocket(url);
}
//# sourceMappingURL=client.js.map