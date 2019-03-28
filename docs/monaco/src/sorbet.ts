
declare var WebAssembly: any;
declare var Sorbet: any;

const sorbetWasmFile = fetch('../sorbet-wasm.wasm');

const sorbetWasmModule = (typeof WebAssembly.compileStreaming == 'function') ?
    WebAssembly.compileStreaming(sorbetWasmFile) :
    sorbetWasmFile.then((response) => response.arrayBuffer())
        .then((bytes) => WebAssembly.compile(bytes));

function NOP() {}
export default class SorbetServer {
  public static async create(
      responseCallback: (response: string) => any,
      errorCallback: (error: any) => any): Promise<SorbetServer> {
    const sorbetServer = new SorbetServer();
    sorbetServer.onResponse = responseCallback;
    sorbetServer.onError = errorCallback;

    return new Promise<SorbetServer>((resolve, reject) => {
      const opts = {
        print: sorbetServer._print.bind(sorbetServer),
        printErr: sorbetServer._printErr.bind(sorbetServer),
        // On abort, throw away our WebAssembly instance and create a
        // new one. This can happen due to out-of-memory, C++ exceptions,
        // or other reasons; Throwing away and restarting should get us to a
        // healthy state.
        onAbort: sorbetServer._destroy.bind(sorbetServer),
        instantiateWasm: (info: any, realReceiveInstanceCallBack: any) => {
          instantiateWasmImpl(info, realReceiveInstanceCallBack).catch(reject);
          return {};  // indicates lazy initialization
        },
        onRuntimeInitialized: () => {
          resolve(sorbetServer);
        }
      };

      // Since instantiateWasm requires an empty object as a return value,
      // we can't make it async. So, instead, we put the async stuff here
      // so we an use nice async/await syntax.
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

      sorbetServer._sorbet = Sorbet(opts);
    });
  }

  private _destroyed: boolean = false;
  private _sorbet: any;
  public onResponse: (response: string) => any = NOP;
  public onError: (error: any) => any = NOP;
  private _onResponseEmscripten: any;

  // Enforce construction via the static function.
  private constructor() {}

  private _print(line: string) {
    console.log(line);
    this._destroy();
  }

  private _printErr(line: string) {
    console.log(line);
    this._destroy();
  }

  private _destroy() {
    if (!this._destroyed) {
      this._destroyed = true;
      this.onError('Sorbet shut down.');
    }
  }

  public sendMessage(msg: string) {
    if (this._destroyed) {
      throw new Error('Sorbet server is not running.');
    }

    // Lazily initialize Emscripten-side of the response callback.
    if (!this._onResponseEmscripten) {
      this._onResponseEmscripten = this._sorbet.addFunction(
          (arg: any) => {this.onResponse(this._sorbet.Pointer_stringify(arg))},
          'vi');
    }

    this._sorbet.ccall(
        'lsp', null, ['number', 'string'], [this._onResponseEmscripten, msg]);
  }
}

document.getElementById('menu')!.addEventListener('click', (ev: any) => {
  ev.target.classList.toggle('is-showing');
});
