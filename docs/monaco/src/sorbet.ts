declare var WebAssembly: any;
declare var Sorbet: any;

const sorbetWasmFile = fetch('../sorbet-wasm.wasm');

const sorbetWasmModule = (typeof WebAssembly.compileStreaming == 'function') ?
    WebAssembly.compileStreaming(sorbetWasmFile) :
    sorbetWasmFile.then((response) => response.arrayBuffer())
        .then((bytes) => WebAssembly.compile(bytes));

// Since instantiateWasm requires an empty object as a return value,
// we can't make it async. So, instead, we put the async stuff here
// so we can use nice async/await syntax.
async function instantiateWasmImpl(
    info: any, realReceiveInstanceCallBack: any): Promise<void> {
  try {
    const mod = await sorbetWasmModule;
    const instance = await WebAssembly.instantiate(mod, info);
    realReceiveInstanceCallBack(instance, mod);
  } catch (error) {
    console.log(
        'Error loading sorbet.wasm. Maybe your adblock blocked it? Some of them are pretty aggressive on github.io domains. We promise we aren\'t mining crypto currencies on your computer.\n' +
        error);
    throw error;
  }
}

/**
 * Creates a new Sorbet instances. Calls errorCallback if Sorbet quits or
 * fails to start up.
 */
export function createSorbet(onPrint: (line: string) => void, onError: (error: any) => void):
    Promise<{sorbet: any}> {
  let sorbet: any;
  return new Promise<any>((resolve) => {
    const opts = {
      print: (line: string) => {
        onPrint(line);
      },
      printErr: (line: string) => {
        onPrint(line);
      },
      // On abort, throw away our WebAssembly instance and create a
      // new one. This can happen due to out-of-memory, C++ exceptions,
      // or other reasons; Throwing away and restarting should get us to a
      // healthy state.
      onAbort: onError,
      instantiateWasm: (info: any, realReceiveInstanceCallBack: any) => {
        instantiateWasmImpl(info, realReceiveInstanceCallBack)
            .catch(onError);
        return {};  // indicates lazy initialization
      },
      onRuntimeInitialized: () => {
        // NOTE: DO *NOT* `resolve(sorbet)`!
        // You will cause an infinite asynchronous loop. It will not be
        // debuggable, and will lock up the browser. See:
        // https://github.com/emscripten-core/emscripten/issues/5820
        // We wrap it in an object to be safe.
        resolve({sorbet: sorbet});
      }
    };

    sorbet = Sorbet(opts);
  });
}

document.getElementById('menu')!.addEventListener('click', (ev: any) => {
  ev.target.classList.toggle('is-showing');
});
