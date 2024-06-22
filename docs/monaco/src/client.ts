import {Server, WebSocket} from 'mock-socket';
import {
  createConnection,
  MonacoLanguageClient,
  MonacoServices,
} from 'monaco-languageclient';
import {initVimMode} from 'monaco-vim';
import {listen, MessageConnection} from 'vscode-ws-jsonrpc';

import {createSorbet} from './sorbet';

import {register} from './ruby';
import {typecheck} from './output';

register();

const element = document.getElementById('editor')!;
element.addEventListener('click', (e) => {
  // Markdown links in editor tooltips use `#` as their target and use JS to open the actual link target,
  // so clicking them will clear window.location.hash and thus the editor.
  // Prevent that from happening.
  e.preventDefault();
});

// Remove leading '#'
const hash = window.location.hash.slice(1);
const initialRubyValue = hash
  ? decodeURIComponent(hash)
  : `# typed: true
extend T::Sig

sig {params(x: Integer).void}
def foo(x)
  puts(x + 1)
end

ffoo(0)
foo("not an int")`;
const rbiParam = new URLSearchParams(window.location.search).get('rbi');
const initialRbiValue = rbiParam
  ? rbiParam
  : `# typed: true
module Foo
  sig {void}
  def self.bar; end
end
`

// create Monaco editor
const rubyModel = monaco.editor.createModel(
  initialRubyValue,
  'ruby',
  monaco.Uri.parse('inmemory://model/default')
);
const rbiModel = monaco.editor.createModel(
  initialRbiValue,
  'ruby',
  monaco.Uri.parse('--rbi.rbi')
);
const editor = monaco.editor.create(element, {
  model: rubyModel,
  theme: 'vs-dark',
  scrollBeyondLastLine: false,
  formatOnType: true,
  autoIndent: true,
  fontSize: 16,
  minimap: {enabled: false},
  automaticLayout: true,
  lineNumbersMinChars: 0,
  wordBasedSuggestions: false,
  acceptSuggestionOnCommitCharacter: false,
});
(window as any).editor = editor; // Useful for prototyping in dev tools

// Allow toggling between Ruby and RBI code
(window as any).setEditorModel = (name: 'ruby' | 'rbi') => {
  switch(name) {
    case 'ruby': {
      editor.setModel(rubyModel);
      break;
    }
    case 'rbi': {
      editor.setModel(rbiModel);
      break;
    }
  }
}

editor.focus();

// Workaround to intercept "go to definition" and change model
const editorService = (editor as any)._codeEditorService;
const openEditorBase = editorService.openCodeEditor.bind(editorService);
editorService.openCodeEditor = async (input: any, source: any) => {
    const result = await openEditorBase(input, source);

    if (result === null) {
      const model = monaco.editor.getModel(input.resource);
      editor.setModel(model);
    }

    return result;
};

const useVimKeybindings = () => {
  const stored = window.localStorage.getItem('useVimKeybindings');
  if (stored == null) {
    return null;
  } else {
    return JSON.parse(stored) as boolean;
  }
};

let vimMode: any = null;
const toggleVimKeybindings = () => {
  const current = useVimKeybindings();
  window.localStorage.setItem('useVimKeybindings', '' + !current);
  // document.querySelector('html').classList.toggle('stripe-light');
  if (current) {
    vimMode.dispose();
  } else {
    vimMode = initVimMode(editor, document.getElementById('editor-statusbar'));
  }
};

// First load
const initialUseVimKeybindings = useVimKeybindings();
if (initialUseVimKeybindings === true) {
  vimMode = initVimMode(editor, document.getElementById('editor-statusbar'));
} else {
  window.localStorage.setItem('useVimKeybindings', 'false');
}

document.getElementById('vim-button')!.addEventListener('click', (ev) => {
  ev.preventDefault();
  toggleVimKeybindings();
});

window.addEventListener('hashchange', () => {
  // Remove leading '#'
  const hash = window.location.hash.substr(1);
  const ruby = decodeURIComponent(hash);
  if (editor.getValue() !== ruby) {
    editor.setValue(ruby);
  }
});

const createIssueButton = document.getElementById('create-issue-from-example');
createIssueButton!.addEventListener('click', function(ev) {
  const template = `
#### Input

[→ View on sorbet.run](${window.location.href})

\`\`\`ruby
${editor.getValue()}
\`\`\`

#### Observed output

\`\`\`
${(document.querySelector('#output') as HTMLPreElement).innerText}
\`\`\`

<!-- TODO: For issues where \`srb tc\` differs from the behavior of \`sorbet-runtime\`, please include the observed runtime output. -->

#### Expected behavior

<!-- TODO: Briefly explain what the expected behavior should be on this example. -->

- - -

<!-- TODO: If there is any additional information you'd like to include, include it here. -->
`;

  const body = encodeURIComponent(template);
  (ev.target as HTMLAnchorElement).href = `https://github.com/sorbet/sorbet/issues/new?body=${body}&labels=bug,unconfirmed&template=bug.md`;
});

const typecheckArgs = () => {
  return new URLSearchParams(window.location.search).getAll('arg')
    .concat(['--rbi', rbiModel.getValue()]);
}

editor.onDidChangeModelContent((event: any) => {
  const contents = rubyModel.getValue();
  const rbi = rbiModel.getValue();

  switch(editor.getModel()) {
    case rubyModel: {
      window.location.hash = `#${encodeURIComponent(contents)
        .replace(/\(/g, '%28')
        .replace(/\)/g, '%29')}`;
      break;
    }
    case rbiModel: {
      const url = new URL(window.location.href);
      url.searchParams.set('rbi', rbi)
      window.history.replaceState({}, '', url.toString());
      break;
    }
  }

  typecheck(
    contents,
    typecheckArgs()
  );
});
typecheck(
  editor.getValue(),
  typecheckArgs()
);

// install Monaco language client services
MonacoServices.install(editor);

function startLanguageServer() {
  console.log('Starting language server.');
  // create the web socket
  const webSocket = createFakeWebSocket();
  // listen when the web socket is opened
  listen({
    webSocket,
    onConnection: (connection) => {
      // create and start the language client
      const languageClient = createLanguageClient(connection);
      const disposable = languageClient.start();
      connection.onClose(() => {
        // vscode-ws-jsonrpc will try to re-connect to the server,
        // but it tries to talk over the closed WebSocket and fails.
        // Thus, we dispose of the language client, and let `instantiateSorbet`
        // (below) create a new language client.
        disposable.dispose();
      });
    },
  });
}

function createLanguageClient(
  connection: MessageConnection
): MonacoLanguageClient {
  return new MonacoLanguageClient({
    name: 'Sample Language Client',
    clientOptions: {
      // use a language id as a document selector
      documentSelector: ['ruby'],
    },
    // create a language client connection from the JSON RPC connection on
    // demand
    connectionProvider: {
      get: (errorHandler, closeHandler) => {
        return Promise.resolve(
          createConnection(connection, errorHandler, closeHandler)
        );
      },
    },
  });
}

const url = 'ws://sorbet.run:8080';
function createFakeWebSocket(): WebSocket {
  return new WebSocket(url);
}

/**
 * Main procedure:
 * 1. Create mock server.
 * 2. Create Sorbet instance.
 * 3. Create language server and client.
 * If Sorbet crashes, close the socket to dispose of the language server and
 * client and repeat 2 and 3.
 */
const mockServer = new Server(url);
// Sorbet singleton.
let sorbet: any = null;
// Active socket. The language server communicates to the client via the
// socket. Only one socket is active at a time.
let socket: any = null;

async function instantiateSorbet() {
  let errorCalled = false;
  const onPrint = (msg: string) => console.log(msg);
  const onError = (event: any) => {
    console.log({event});
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
  ({sorbet} = await createSorbet(onPrint, onError));
  startLanguageServer();
}

mockServer.on('connection', (s: any) => {
  socket = s;

  const processLSPResponse = sorbet.addFunction((arg: any) => {
    const message =
      (typeof sorbet.UTF8ToString == 'function')
        ? sorbet.UTF8ToString(arg)
        : sorbet.Pointer_stringify(arg);
    console.log('Write: ' + message);
    socket.send(message);
  }, 'vi');

  socket.on('message', (message: string) => {
    console.log('Read: ' + message);
    sorbet.ccall(
      'lsp',
      null,
      ['number', 'string'],
      [processLSPResponse, message]
    );
  });
});

instantiateSorbet();
