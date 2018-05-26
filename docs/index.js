(function() {
  var output = document.getElementById('output');
  var runId = 0;
  var curId = 0;
  var ansi_up = new AnsiUp;
  var sorbetModuleCompile = fetch('sorbet.wasm').then(response =>
    response.arrayBuffer()
  ).then(bytes =>
    WebAssembly.compile(bytes)
  )

  var stdout = []
  var print = function(line) {
    if (runId != curId) {
      return;
    }
    stdout.push(line);
  };
  var flush = function() {
    output.innerHTML = ansi_up.ansi_to_html(stdout.join("\n"));
    stdout = [];
  }
  var sorbet = null;
  var typecheckOnLoad = false;

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  function compile() {
    if (sorbet) {
      // Already compiling or compiled
      return sorbet;
    }
    // For some unkonwn reason this varible has to be new everytime, and can't
    // be out of the closure
    var opts = {
      print: function(line) {
        print(line);
      },

      printErr: function(line) {
        line = line.replace(/.*\[error\] /, '')
        line = line.replace(/http:\/\/[^ ]*/, '')
        line = line.replace('git.corp.stripe.com/stripe-internal', 'github.com/stripe')
        print(line);
      },
      instantiateWasm: function(info, realRecieveInstanceCallBack) {
        sorbetModuleCompile
        .then(module =>
          WebAssembly.instantiate(module, info)
          .then(instance => realRecieveInstanceCallBack(instance, module))
          .catch(error => console.error(error))
        )
        return {}; // indicates lazy initialization
      },
    };

    sorbet = Sorbet(opts);
    return sorbet;
  }

  function typecheck() {
    debounce(function() {
      typecheckOnLoad = true;
      compile().then(compileCB);
    }, 250)();
  }

  function compileCB(Module) {
    if (!typecheckOnLoad) {
      return;
    }
    typecheckOnLoad = false;
    // We somehow use up the WASM instance by calling this function so we have
    // to null it out and recompile
    sorbet = null;

    runId += 1;
    curId = runId;
    var f = Module.cwrap('typecheck', null, ['string']);
    var ruby = editor.getValue();
    f(ruby);

    flush();

    // Eagerly compile a new copy
    compile();
  }

  function updateURL() {
    var ruby = editor.getValue();
    window.location.hash = '#' + ruby;
  }

  window.typecheck = typecheck;
  window.updateURL = updateURL;
})();
