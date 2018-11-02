export const sorbetModuleCompile = fetch('sorbet-wasm.wasm')
  .then((response) => response.arrayBuffer())
  .then((bytes) => WebAssembly.compile(bytes));
