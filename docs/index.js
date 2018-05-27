(function() {
  var output = document.getElementById('output');
  var runId = 0;
  var curId = 0;
  var ansi_up = new AnsiUp;
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
    gtag('event', 'typecheck', {
      'event_category': 'errors',
      'event_label': stdout.join("\n").match(/^[^ ]/mg).length,
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
      }
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
    var f = Module.cwrap('typecheck', null, ['string']);
    f(ruby);
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
