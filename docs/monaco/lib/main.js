"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2018 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
require('./page');
require('monaco-editor-core');
require('setimmediate');
self.MonacoEnvironment = {
    getWorkerUrl: function () { return './monaco/lib/editor.worker.bundle.js'; },
};
require('./client');
//# sourceMappingURL=main.js.map