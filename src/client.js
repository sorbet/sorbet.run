/* global Sorbet */

import * as rpc from 'vscode-jsonrpc';
import {
  MonacoLanguageClient,
  ErrorAction,
  CloseAction,
  createConnection,
} from 'monaco-languageclient';
import {sorbetModuleCompile} from './compile';

let sorbet = null;

const stdout = [];
let runId = 0;
let curId = 0;

const print = (line) => {
  if (runId !== curId) {
    return;
  }
  stdout.push(line);
};

const compile = () => {
  if (sorbet) {
    // Already compiling or compiled
    return sorbet;
  }
  // For some unkonwn reason this varible has to be new everytime, and can't
  // be out of the closure
  const opts = {
    print,
    printErr: (line) => {
      let filteredLine = line;
      filteredLine = filteredLine.replace(/.*\[error\] /, '');
      filteredLine = filteredLine.replace(/http:\/\/[^ ]*/, '');
      filteredLine = filteredLine.replace(
        'git.corp.stripe.com/stripe-internal',
        'github.com/stripe'
      );
      print(filteredLine);
    },
    onAbort() {
      // On abort, throw away our WebAssembly instance and create a new one.
      // This can happen due to out-of-memory, C++ exceptions, or other
      // reasons; Throwing away and restarting should get us to a healthy
      // state.
      sorbet = null;
      // TODO(jez) Call the writer onError handler here.
    },
    instantiateWasm(info, realRecieveInstanceCallBack) {
      sorbetModuleCompile
        .then((module) =>
          WebAssembly.instantiate(module, info)
            .then((instance) => realRecieveInstanceCallBack(instance, module))
            .catch((error) => console.log(error))
        )
        .catch((error) => {
          // TODO(jez) call the writer onError handler here
          console.error(
            "Error loading sorbet.wasm. Maybe your adblock blocked it? Some of them are pretty aggressive on github.io domains. We promise we aren't mining crypto currencies on your computer."
          );
        });
      return {}; // indicates lazy initialization
    },
  };

  sorbet = Sorbet(opts);
  return sorbet;
};

const processRequest = (message) => (Module) => {
  runId += 1;
  curId = runId;

  console.log('before');
  const f = Module.cwrap('processRequest', null, ['string']);
  console.log('here');
  f(JSON.stringify(message));

  console.log(stdout);
};

export const getClient = () => {
  const compiled = compile();

  const listeners = [];
  // const flushOut = (output) => {
  //   listeners.forEach((listener) => {
  //     listener({jsonrpc: output});
  //   });
  // };

  const connection = rpc.createMessageConnection(
    // Reader
    {
      onClose: (handleClose) => {
        console.log('onClose', handleClose);
      },
      onError: (handleError) => {
        console.log('onError', handleError);
      },
      dispose: () => {},
      listen: (listener) => {
        listeners.push(listener);
      },
    },
    {
      onClose: (handleClose) => {
        console.log('onClose', handleClose);
      },
      onError: (handleError) => {
        console.log('onError', handleError);
      },
      write: (message) => {
        console.log('write');
        console.log(message);
        compiled.then(processRequest(message));
        // TODO(jez) call flushOut after
      },
    }
  );

  return new MonacoLanguageClient({
    name: 'Sorbet LSP',
    clientOptions: {
      documentSelector: ['json'],
      errorHandler: {
        error: () => ErrorAction.Continue,
        closed: () => CloseAction.DoNotRestart,
      },
    },
    connectionProvider: {
      get: (errorHandler, closeHandler) => {
        return Promise.resolve(
          createConnection(connection, errorHandler, closeHandler)
        );
      },
    },
  });
};
