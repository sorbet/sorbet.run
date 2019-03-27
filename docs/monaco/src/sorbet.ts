
declare var WebAssembly: any;
declare var Sorbet: any;

const sorbetWasmFile = fetch('../sorbet-wasm.wasm');

const sorbetWasmModule = (typeof WebAssembly.compileStreaming == "function") ?
  WebAssembly.compileStreaming(sorbetWasmFile) :
  sorbetWasmFile
  .then((response) => response.arrayBuffer())
  .then((bytes) => WebAssembly.compile(bytes));

let sorbet : any = null;
export const compile = (cb: (message: string) => void) => {
  if (sorbet) {
    // Already compiling or compiled
    return sorbet;
  }
  // For some unkonwn reason this varible has to be new everytime, and can't
  // be out of the closure
  const opts = {
    print: (line: string) => {
      console.log(line);
    },
    printErr: (line: string) => {
      console.log(line);
    },
    onAbort: () => {
      // On abort, throw away our WebAssembly instance and create a
      // new one. This can happen due to out-of-memory, C++ exceptions,
      // or other reasons; Throwing away and restarting should get us to a healthy state.
      sorbet = null;
    },
    instantiateWasm: (info: any, realRecieveInstanceCallBack: any) => {
      sorbetWasmModule
        .then((module: any) =>
          WebAssembly.instantiate(module, info)
          .then((instance: any) => realRecieveInstanceCallBack(instance, module))
          .catch((error: any) => {
            console.log(error);
          })
        )
        .catch((error: any) => {
          console.log("Error loading sorbet.wasm. Maybe your adblock blocked it? Some of them are pretty aggressive on github.io domains. We promise we aren't mining crypto currencies on your computer.\n" + error);
        });
      return {}; // indicates lazy initialization
    },
  };

  sorbet = Sorbet(opts);
  const reservedFunction = sorbet.addFunction((arg: number) => {cb(sorbet.Pointer_stringify(arg))}, "vi");
  return (message: string) => {
    sorbet.ccall('lsp', null, ['number', 'string'], [reservedFunction, message]);
  }
};

document.getElementById('menu')!.addEventListener('click', (ev: any) => {
  ev.target.classList.toggle('is-showing');
});
