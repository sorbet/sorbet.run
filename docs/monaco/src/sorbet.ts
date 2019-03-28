
declare var WebAssembly: any;
declare var Sorbet: any;

const sorbetWasmFile = fetch('../sorbet-wasm.wasm');

const sorbetWasmModule = (typeof WebAssembly.compileStreaming == "function") ?
  WebAssembly.compileStreaming(sorbetWasmFile) :
  sorbetWasmFile
  .then((response) => response.arrayBuffer())
  .then((bytes) => WebAssembly.compile(bytes));

let sorbet : any = null;
let reservedFunction : any = null;
let restartCallback : any = null;
export function setRestartCallback(cb: () => void) {
  restartCallback = cb;
}
const destroySorbet = () => {
  sorbet = null;
  reservedFunction = null;
  if (restartCallback) {
    restartCallback();
  }
}
export const compile = (cb: (message: string) => void) => {
  const send = (message: string) => {
    sorbet.ccall('lsp', null, ['number', 'string'], [reservedFunction, message]);
  }

  return new Promise<(message: string) => void>((resolve, reject) => {
    if (sorbet) {
      // Already compiling or compiled
      return resolve(send);
    }

    // For some unkonwn reason this varible has to be new everytime, and can't
    // be out of the closure
    const opts = {
      print: (line: string) => {
        console.log(line);
        destroySorbet();
      },
      printErr: (line: string) => {
        console.log(line);
        destroySorbet();
      },
      onAbort: () => {
        // On abort, throw away our WebAssembly instance and create a
        // new one. This can happen due to out-of-memory, C++ exceptions,
        // or other reasons; Throwing away and restarting should get us to a healthy state.
        destroySorbet();
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
      onRuntimeInitialized: () => {
        reservedFunction = sorbet.addFunction((arg: any) => {cb(sorbet.Pointer_stringify(arg))}, "vi");
        resolve(send);
      }
    };

    sorbet = Sorbet(opts);
  });
};

document.getElementById('menu')!.addEventListener('click', (ev: any) => {
  ev.target.classList.toggle('is-showing');
});
