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
var sorbet_1 = require("./sorbet");
var ansi_up_1 = require("ansi_up");
var output = document.getElementById('output');
var ansiUp = new ansi_up_1.default();
ansiUp.use_classes = true;
var runId = 0;
var curId = 0;
var stdout = [];
var flush = function () {
    gtag('event', 'typecheck', {
        event_category: 'error_lines',
        event_label: stdout.length,
    });
    var errorLines = stdout.join('\n').match(/^[^ ]/gm);
    gtag('event', 'typecheck', {
        event_category: 'errors',
        event_label: errorLines ? errorLines.length : 0,
    });
    output.innerHTML = ansiUp.ansi_to_html(stdout.join('\n'));
    stdout = [];
};
var lastRuby = '';
var runCpp = function (Module, ruby) {
    if (lastRuby === ruby) {
        return;
    }
    lastRuby = ruby;
    runId += 1;
    curId = runId;
    var t0 = performance.now();
    var f = Module.cwrap('typecheck', null, ['string']);
    f(ruby + "\n");
    var t1 = performance.now();
    gtag('event', 'timing_complete', {
        event_category: 'typecheck_time',
        event_label: t1 - t0,
        name: 'typecheck_time',
        value: t1 - t0,
    });
    flush();
};
exports.typecheck = function (ruby) {
    setTimeout(function () {
        if (sorbet) {
            runCpp(sorbet, ruby);
        }
    }, 1);
};
// Sorbet singleton.
var sorbet = null;
function instantiateSorbet() {
    return __awaiter(this, void 0, void 0, function () {
        var errorCalled, onError, onPrint;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    errorCalled = false;
                    onError = function (event) {
                        console.log(event);
                        // If Sorbet crashes, try creating Sorbet again.
                        // Avoid acting on multiple errors from the same Sorbet instance.
                        if (errorCalled) {
                            return;
                        }
                        errorCalled = true;
                        sorbet = null;
                        instantiateSorbet();
                    };
                    onPrint = function (line) {
                        if (runId !== curId) {
                            return;
                        }
                        var replaced = line
                            .replace(/http:\/\/[^ ]*/, '')
                            //      .replace(/http:\/\/go\/e\//, 'https://stripe.dev/sorbet/docs/error-reference#%s')
                            .replace('git.corp.stripe.com/stripe-internal', 'github.com/stripe')
                            .replace('-e:', 'editor.rb:');
                        stdout.push(replaced);
                    };
                    return [4 /*yield*/, sorbet_1.createSorbet(onPrint, onError)];
                case 1:
                    (sorbet = (_a.sent()).sorbet);
                    exports.typecheck(monaco.editor.getModels()[0].getValue());
                    return [2 /*return*/];
            }
        });
    });
}
instantiateSorbet();
//# sourceMappingURL=output.js.map