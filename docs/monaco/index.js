/* global AnsiUp, gtag, Sorbet, editor */

(() => {
  const sorbetWasmFile = fetch('../sorbet-wasm.wasm');

 const sorbetWasmModule = (typeof WebAssembly.compileStreaming == "function") ?
    WebAssembly.compileStreaming(sorbetWasmFile) :
    sorbetWasmFile
      .then((response) => response.arrayBuffer())
      .then((bytes) => WebAssembly.compile(bytes));

  let sorbet = null;
  const compile = () => {
    if (sorbet) {
      // Already compiling or compiled
      return sorbet;
    }
    // For some unkonwn reason this varible has to be new everytime, and can't
    // be out of the closure
    const opts = {
      print: (line) => {
        console.log(line);
      },
      printErr: (line) => {
        console.log(line);
      },
      onAbort: () => {
        // On abort, throw away our WebAssembly instance and create a
        // new one. This can happen due to out-of-memory, C++ exceptions,
        // or other reasons; Throwing away and restarting should get us to a healthy state.
        sorbet = null;
      },
      instantiateWasm: (info, realRecieveInstanceCallBack) => {
        sorbetWasmModule
          .then((module) =>
            WebAssembly.instantiate(module, info)
              .then((instance) => realRecieveInstanceCallBack(instance, module))
              .catch((error) => {
                console.log(error);
              })
          )
          .catch((error) => {
            console.log("Error loading sorbet.wasm. Maybe your adblock blocked it? Some of them are pretty aggressive on github.io domains. We promise we aren't mining crypto currencies on your computer.\n" + error);
          });
        return {}; // indicates lazy initialization
      },
    };

    sorbet = Sorbet(opts);
    reservedFunction = sorbet.addFunction((arg) => {window.lspCallback(sorbet.Pointer_stringify(arg))}, "vi");
    window.callLSP = (message) => {
      sorbet.ccall('lsp', null, ['number', 'string'], [reservedFunction, message]);
    }
    return sorbet;
  };
  compile();

  window.addEventListener('hashchange', () => {
    // Remove leading '#'
    const hash = window.location.hash.substr(1);
    const ruby = decodeURIComponent(hash);
    if (editor.getValue() !== ruby) {
      editor.setValue(ruby);
      editor.clearSelection();
    }
  });

  document.getElementById('menu').addEventListener('click', (ev) => {
    ev.target.classList.toggle('is-showing');
  });
})();
