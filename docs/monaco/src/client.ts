import {Server, WebSocket} from 'mock-socket';
import {createConnection, MonacoLanguageClient, MonacoServices} from 'monaco-languageclient';
import {listen, MessageConnection} from 'vscode-ws-jsonrpc';

import SorbetServer from './sorbet';

import {register} from './ruby';

register();

const element = document.getElementById('editor')!;
// NOTE: Important to define this variable up here due to function hoisting.
// Persist the server in this variable so it does not get garbage collected.
let mockServer: Server|null = null;

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
  minimap: {
    enabled: false,
  },
  scrollBeyondLastLine: false,
  formatOnType: true,
  autoIndent: true,
  lightbulb: {enabled: true},
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
        // Thus, we dispose of the language client and start a new language
        // client instead.
        disposable.dispose();
        startLanguageServer();
      })
    }
  });
}

startLanguageServer();

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

function createFakeWebSocket(): WebSocket {
  const url = 'ws://sorbet.run:8080';
  if (!mockServer) {
    mockServer = new Server(url);

    mockServer.on('connection', async (socket: any) => {
      try {
        let sorbet: SorbetServer|null = null;
        const bufferedMessages: string[] = [];
        // Socket doesn't buffer messages before a listener is attached.
        socket.on('message', function(message: string) {
          console.log('Read: ' + message);
          if (!sorbet) {
            // Sorbet is still initializing.
            bufferedMessages.push(message);
          } else {
            sorbet.sendMessage(message);
          }
        });
        sorbet = await SorbetServer.create(
            function(response) {
              console.log('Write: ' + response);
              socket.send(response);
            },
            function() {
              // Sorbet crashed.
              socket.close();
            });

        // Send any messages that buffered during startup.
        while (bufferedMessages.length > 0) {
          sorbet.sendMessage(bufferedMessages.shift()!);
        }
      } catch (e) {
        // Initialization failed. Close socket.
        socket.close();
      }
    });
  }

  return new WebSocket(url);
}
