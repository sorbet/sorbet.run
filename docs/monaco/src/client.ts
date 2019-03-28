import { listen, MessageConnection } from 'vscode-ws-jsonrpc';
import {
  MonacoLanguageClient, CloseAction, ErrorAction,
  MonacoServices, createConnection
} from 'monaco-languageclient';
import { WebSocket, Server } from 'mock-socket';
import { compile, setRestartCallback } from './sorbet';
import { register } from './ruby';

register();

const element = document.getElementById('editor')!;

// create Monaco editor
const initialValue = () => {
  // Remove leading '#'
  const hash = window.location.hash.slice(1);
  if (hash) {
    return decodeURIComponent(hash);
  }
  return element.innerHTML;
};

const value = initialValue();
element.innerHTML = '';

let editor : any = null;
function createEditor() {
  editor = monaco.editor.create(element, {
    value: value,
    language: 'ruby',
    theme: 'vs-dark',
    minimap : {
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
}
setRestartCallback(createEditor);
createEditor();

window.addEventListener('hashchange', () => {
  // Remove leading '#'
  const hash = window.location.hash.substr(1);
  const ruby = decodeURIComponent(hash);
  if (editor.getValue() !== ruby) {
    editor.setValue(ruby);
  }
});

editor.onDidChangeModelContent((event : any) => {
  const contents = editor.getValue();
  window.location.hash = `#${encodeURIComponent(contents)}`;
});


// install Monaco language client services
MonacoServices.install(editor);

// create the web socket
const webSocket = createFakeWebSocket();
// listen when the web socket is opened
listen({
  webSocket,
  onConnection: connection => {
    // create and start the language client
    const languageClient = createLanguageClient(connection);
    const disposable = languageClient.start();
    connection.onClose(() => disposable.dispose());
  }
});

function createLanguageClient(connection: MessageConnection): MonacoLanguageClient {
  return new MonacoLanguageClient({
    name: "Sample Language Client",
    clientOptions: {
      // use a language id as a document selector
      documentSelector: ['ruby'],
      // disable the default error handler
      errorHandler: {
        error: () => ErrorAction.Continue,
        closed: () => CloseAction.DoNotRestart
      }
    },
    // create a language client connection from the JSON RPC connection on demand
    connectionProvider: {
      get: (errorHandler, closeHandler) => {
        return Promise.resolve(createConnection(connection, errorHandler, closeHandler))
      }
    }
  });
}

function createFakeWebSocket(): WebSocket {
  const url = 'ws://sorbet.run:8080';
  const mockServer = new Server(url);

  mockServer.on('connection', (socket : any) => {
    socket.on('message', (message : string) => {
      compile(response => {
        console.log('Write: ' + response);
        socket.send(response)
      }).then((send) => {
        console.log('Read: ' + message);
        send(message)
      });
    });
  });

  return new WebSocket(url);
}
