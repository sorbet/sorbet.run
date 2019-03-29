import {Server, WebSocket} from 'mock-socket';
import {createConnection, MonacoLanguageClient, MonacoServices} from 'monaco-languageclient';
import {listen, MessageConnection} from 'vscode-ws-jsonrpc';

import {createSorbet} from './sorbet';

import {register} from './ruby';

register();

const element = document.getElementById('editor')!;

// Remove leading '#'
const hash = window.location.hash.slice(1);
const initialValue = hash ? decodeURIComponent(hash) : element.innerHTML;
element.innerHTML = '';

// create Monaco editor
const model = monaco.editor.createModel(
    initialValue, 'ruby', monaco.Uri.parse('inmemory://model/default'));
const editor = monaco.editor.create(element, {
  model: model,
  theme: 'vs-dark',
  scrollBeyondLastLine: false,
  formatOnType: true,
  autoIndent: true,
  fontSize: 16,
});

window.addEventListener('hashchange', () => {
  // Remove leading '#'
  const hash = window.location.hash.substr(1);
  const ruby = decodeURIComponent(hash);
  if (editor.getValue() !== ruby) {
    editor.setValue(ruby);
  }
});

editor.onDidChangeModelContent((event: any) => {
  const contents = editor.getValue();
  window.location.hash = `#${encodeURIComponent(contents)}`;
});


// install Monaco language client services
MonacoServices.install(editor);

function startLanguageServer() {
  console.log('Starting language server.');
  // create the web socket
  const webSocket = createFakeWebSocket();
  // listen when the web socket is opened
  listen({
    webSocket,
    onConnection: connection => {
      // create and start the language client
      const languageClient = createLanguageClient(connection);
      const disposable = languageClient.start();
      connection.onClose(() => {
        // vscode-ws-jsonrpc will try to re-connect to the server,
        // but it tries to talk over the closed WebSocket and fails.
        // Thus, we dispose of the language client, and let `instantiateSorbet`
        // (below) create a new language client.
        disposable.dispose();
      })
    }
  });
}

function createLanguageClient(connection: MessageConnection):
    MonacoLanguageClient {
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
            createConnection(connection, errorHandler, closeHandler))
      }
    }
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
  ({sorbet} = await createSorbet(() => {
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
   }));
  startLanguageServer();
}

mockServer.on('connection', (s: any) => {
  socket = s;

  const processLSPResponse = sorbet.addFunction((arg: any) => {
    const message = sorbet.Pointer_stringify(arg);
    console.log('Write: ' + message);
    socket.send(message)
  }, 'vi');

  socket.on('message', (message: string) => {
    console.log('Read: ' + message);
    sorbet.ccall(
        'lsp', null, ['number', 'string'], [processLSPResponse, message]);
  });
});

instantiateSorbet();
