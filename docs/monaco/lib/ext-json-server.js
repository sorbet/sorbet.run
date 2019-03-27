"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
var vscode_jsonrpc_1 = require("vscode-jsonrpc");
var json_server_1 = require("./json-server");
var reader = new vscode_jsonrpc_1.StreamMessageReader(process.stdin);
var writer = new vscode_jsonrpc_1.StreamMessageWriter(process.stdout);
json_server_1.start(reader, writer);
//# sourceMappingURL=ext-json-server.js.map