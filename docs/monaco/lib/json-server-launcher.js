"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var path = require("path");
var rpc = require("vscode-ws-jsonrpc");
var server = require("vscode-ws-jsonrpc/lib/server");
var lsp = require("vscode-languageserver");
var json_server_1 = require("./json-server");
function launch(socket) {
    var reader = new rpc.WebSocketMessageReader(socket);
    var writer = new rpc.WebSocketMessageWriter(socket);
    var asExternalProccess = process.argv.findIndex(function (value) { return value === '--external'; }) !== -1;
    if (asExternalProccess) {
        // start the language server as an external process
        var extJsonServerPath = path.resolve(__dirname, 'ext-json-server.js');
        var socketConnection = server.createConnection(reader, writer, function () { return socket.dispose(); });
        var serverConnection = server.createServerProcess('JSON', 'node', [extJsonServerPath]);
        server.forward(socketConnection, serverConnection, function (message) {
            if (rpc.isRequestMessage(message)) {
                if (message.method === lsp.InitializeRequest.type.method) {
                    var initializeParams = message.params;
                    initializeParams.processId = process.pid;
                }
            }
            return message;
        });
    }
    else {
        // start the language server inside the current process
        json_server_1.start(reader, writer);
    }
}
exports.launch = launch;
//# sourceMappingURL=json-server-launcher.js.map