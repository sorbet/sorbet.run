import 'monaco-editor';
import {
  MonacoLanguageClient,
  CloseAction,
  ErrorAction,
  MonacoServices,
  createConnection,
} from 'monaco-languageclient';
import AnsiUp from 'ansi_up';

window.MonacoEnvironment = {
  getWorkerUrl: () => './editor.worker.bundle.js'
};

const ansi_up = new AnsiUp;

const LANGUAGE_ID = 'ruby';
monaco.languages.register({
    id: LANGUAGE_ID,
    extensions: ['.rb', '.rbi'],
    aliases: ['Ruby', 'ruby', 'rb'],
    mimetypes: ['application/ruby'],
});

// Need to implement:
//
// MessageReader
// {
//   onClose: (() => void) => void
//   onError: ((...) => void) => void
//   dispose: () => void
//   listen: ((message: {jsonrpc: string}) => void) => void
// }
//
// MessageWriter
// {
//   onClose: (() => void) => void
//   onError: ((...) => void) => void
//   write: (message: {jsonrpc: string}) => void
// }

let ruby = window.location.hash;
if (ruby) {
  ruby = decodeURIComponent(ruby);
  ruby = ruby.substr(1); // Cut off the #
} else {
  ruby = document.getElementById('editor').innerHTML;
}

const editor = monaco.editor.create(document.getElementById('editor'), {
  language: 'ruby',
  tabSize: 2,
  fontSize: '16px',
  theme: 'vs-dark',
  value: [
    'extend T::Helpers',
    '',
    'sig {params(x: Integer).returns(String)}',
    'def foo(x)',
    '  x.to_s',
    'end',
  ].join('\n'),
});

MonacoServices.install(editor);

const model = editor.getModel();
  model.onDidChangeContent((changeEvent) => {
  gtag('event', 'typecheck', {
    'event_category': 'editor',
    'event_label': model.getValue(),
  });
  typecheck();
  updateURL();
});

const output = document.getElementById('output');
let runId = 0;
let curId = 0;
const sorbetModuleCompile = fetch('sorbet-wasm.wasm').then(response =>
  response.arrayBuffer()
).then(bytes =>
  WebAssembly.compile(bytes)
)
let lastRuby = "";

let stdout = []
const print = function(line) {
  if (runId != curId) {
    return;
  }
  stdout.push(line);
};
var flush = function() {
  gtag('event', 'typecheck', {
    'event_category': 'error_lines',
    'event_label': stdout.length,
  });
  var errorLines = stdout.join("\n").match(/^[^ ]/mg);
  gtag('event', 'typecheck', {
    'event_category': 'errors',
    'event_label': errorLines ? errorLines.length : 0,
  });
  output.innerHTML = ansi_up.ansi_to_html(stdout.join("\n"));
  stdout = [];
}
var sorbet = null;

function compile() {
  if (sorbet) {
    // Already compiling or compiled
    return sorbet;
  }
  // For some unkonwn reason this varible has to be new everytime, and can't
  // be out of the closure
  const opts = {
    print: function(line) {
      print(line);
    },
    printErr: function(line) {
      line = line.replace(/.*\[error\] /, '')
      line = line.replace(/http:\/\/[^ ]*/, '')
      line = line.replace('git.corp.stripe.com/stripe-internal', 'github.com/stripe')
      print(line);
    },
    onAbort: function() {
      // On abort, throw away our WebAssembly instance and create a
      // new one. This can happen due to out-of-memory, C++ exceptions,
      // or other reasons; Throwing away and restarting should get us to a healthy state.
      sorbet = null;
      flush();
    },
    instantiateWasm: function(info, realRecieveInstanceCallBack) {
      sorbetModuleCompile
      .then(module =>
        WebAssembly.instantiate(module, info)
        .then(instance => realRecieveInstanceCallBack(instance, module))
        .catch(error => console.log(error))
      ).catch(function(error) {
          output.innerText = "Error loading sorbet.wasm. Maybe your adblock blocked it? Some of them are pretty aggressive on github.io domains. We promise we aren't mining crypto currencies on your computer."
      });
      return {}; // indicates lazy initialization
    },
  };

  sorbet = Sorbet(opts);
  return sorbet;
}

function typecheck() {
  setTimeout(function() {
    compile().then(runCPP);
  }, 1);
}

function runCPP(Module) {
  var ruby = editor.getModel().getValue();
  if (lastRuby == ruby) {
    return;
  }
  lastRuby = ruby;
  runId += 1;
  curId = runId;

  const t0 = performance.now();
  const f = Module.cwrap('typecheck', null, ['string']);
  f(ruby + "\n");
  var t1 = performance.now();

  gtag('event', 'timing_complete', {
    'event_category' : 'typecheck_time',
    'event_label' : t1 - t0,
    'name': 'typecheck_time',
    'value' : t1 - t0,
  });

  flush();
}

function updateURL() {
  var ruby = editor.getModel().getValue();
  window.location.hash = '#' + encodeURIComponent(ruby);
}
window.addEventListener('hashchange', function() {
  var ruby = window.location.hash;
  ruby = decodeURIComponent(ruby);
  ruby = ruby.substr(1); // Cut off the #
  var model = editor.getModel();
  if (model.getValue() != ruby) {
    model.setValue(ruby);
  }
});

let shown;
document.getElementById('menu').addEventListener("click", function() {
  var e = document.getElementById('examples');
  if (shown) {
    e.style.display = "none";
  } else {
    e.style.display = "block";
  }
  shown = !shown;
});

typecheck();
