/* global Sorbet */

import {sorbetModuleCompile} from './compile';

let sorbet = null;

let stdout = [];
let runId = 0;
let curId = 0;

const print = (line) => {
  if (runId !== curId) {
    return;
  }
  stdout.push(line);
};

const flush = (flushOut) => {
  flushOut(stdout.join('\n'));
  stdout = [];
};

const compile = (flushOut, flushErr) => {
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
      flush(flushOut);
    },
    instantiateWasm(info, realRecieveInstanceCallBack) {
      sorbetModuleCompile
        .then((module) =>
          WebAssembly.instantiate(module, info)
            .then((instance) => realRecieveInstanceCallBack(instance, module))
            .catch((error) => console.log(error))
        )
        .catch((error) => {
          flushErr(
            "Error loading sorbet.wasm. Maybe your adblock blocked it? Some of them are pretty aggressive on github.io domains. We promise we aren't mining crypto currencies on your computer."
          );
        });
      return {}; // indicates lazy initialization
    },
  };

  sorbet = Sorbet(opts);
  return sorbet;
};

let lastRuby = '';
const runTypecheck = (flushOut, contents) => (Module) => {
  if (lastRuby === contents) {
    return;
  }
  lastRuby = contents;
  runId += 1;
  curId = runId;

  const f = Module.cwrap('typecheck', null, ['string']);
  f(`${contents}\n`);

  flush(flushOut);
};

export const typecheck = (flushOut, flushErr) => {
  const compiled = compile(flushOut, flushErr);
  return (contents) => {
    compiled.then(runTypecheck(flushOut, contents));
  };
};
