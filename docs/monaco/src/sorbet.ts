declare var WebAssembly: any;
// This comes from a <script> tag in the page.
// Might be nice to change it to an explicit import.
declare var Sorbet: any;

const sorbetWasmFile = fetch('../sorbet-wasm.wasm');

const sorbetWasmModule = (typeof WebAssembly.compileStreaming == 'function') ?
    WebAssembly.compileStreaming(sorbetWasmFile) :
    sorbetWasmFile.then((response) => response.arrayBuffer())
        .then((bytes) => WebAssembly.compile(bytes));

// Since instantiateWasm requires an empty object as a return value,
// we can't make it async. So, instead, we put the async stuff here
// so we can use nice async/await syntax.
async function instantiateWasmImpl(imports: any, successCallback: any): Promise<void> {
  try {
    const mod = await sorbetWasmModule;
    const instance = await WebAssembly.instantiate(mod, imports);
    successCallback(instance, mod);
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
export function createSorbet(onPrint: (line: string) => void, onAbort: (error: any) => void):
    Promise<{sorbet: any}> {
  const opts = {
    print: onPrint,
    printErr: onPrint,
    // On abort, throw away our WebAssembly instance and create a
    // new one. This can happen due to out-of-memory, C++ exceptions,
    // or other reasons; Throwing away and restarting should get us to a
    // healthy state.
    onAbort,
    instantiateWasm: (imports: any, successCallback: any) => {
      instantiateWasmImpl(imports, successCallback).catch(onAbort);
      return {};  // indicates lazy initialization
    },
  };

  // We have to manually return a promise for backwards compatibility. Old
  // versions of emscripten used to return the Module itself which has a
  // `.then` property, instead of a Promise object, which would cause infinite
  // loops.
  //
  // We can drop the explict `new Promise` below after we've started publishing
  // versions of Sorbet build with a more recent emscripten.
  return new Promise<any>((resolve, reject) => {
    Sorbet(opts).then((sorbet: any) => {
      // NOTE: DO *NOT* `resolve(sorbet)`!
      // You will cause an infinite asynchronous loop. It will not be
      // debuggable, and will lock up the browser. See:
      // https://github.com/emscripten-core/emscripten/issues/5820
      // We wrap it in an object to be safe.
      resolve({sorbet});
    });
  });
}
