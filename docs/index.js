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
  var lastRuby = "";

  var stdout = []
  var print = function(line) {
    if (runId != curId) {
      return;
    }
    stdout.push(line);
  };
  var flush = function() {
    gtag('event', 'typecheck', {
      'event_category': 'error_lines',
      'event_label': stdout.length,
    });
    var errorLines = stdout.join("\n").match(/^[^ ]/mg);
    gtag('event', 'typecheck', {
      'event_category': 'errors',
      'event_label': errorLines ? errorLines.length : 0,
    });
    output.innerHTML = ansi_up.ansi_to_html(stdout.join("\n"));
    stdout = [];
  }
  var sorbet = null;

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
      onAbort: function() {
        // On abort, throw away our WebAssembly instance and create a
        // new one. This can happen due to out-of-memory, C++ exceptions,
        // or other reasons; Throwing away and restarting should get us to a healthy state.
        sorbet = null;
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
    setTimeout(function() {
      compile().then(runCPP);
    }, 1);
  }

  function runCPP(Module) {
    var ruby = editor.getValue();
    if (lastRuby == ruby) {
      return;
    }
    lastRuby = ruby;
    runId += 1;
    curId = runId;

    var t0 = performance.now();
    var f = Module.cwrap('typecheck', null, ['string']);
    f(ruby);
    var t1 = performance.now();

    gtag('event', 'timing_complete', {
      'event_category' : 'typecheck_time',
      'event_label' : t1 - t0,
      'name': 'typecheck_time',
      'value' : t1 - t0,
    });

    flush();
  }

  function updateURL() {
    var ruby = editor.getValue();
    window.location.hash = '#' + ruby;
  }

  typecheck();

  window.typecheck = typecheck;
  window.updateURL = updateURL;
})();
