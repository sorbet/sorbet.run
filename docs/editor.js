(function() {
  var ruby = window.location.hash;
  if (ruby) {
    ruby = decodeURIComponent(ruby);
    ruby = ruby.substr(1); // Cut off the #
  } else {
    ruby = document.getElementById('editor').innerHTML;
  }

  require.config({ paths: { 'vs': 'third_party/monaco-editor/min/vs' }});
  require(['vs/editor/editor.main'], function() {
    var editor = monaco.editor.create(document.getElementById('editor'), {
      language: 'ruby',
      tabSize: 2,
      fontSize: '16px',
      theme: 'vs-dark',
      value: [
        'extend T::Helpers',
        '',
        'sig {params(x: Integer).returns(String)}',
        'def foo(x)',
        '  x.to_s',
        'end',
      ].join('\n'),
    });

    var model = editor.getModel();
      model.onDidChangeContent((changeEvent) => {
      gtag('event', 'typecheck', {
        'event_category': 'editor',
        'event_label': model.getValue(),
      });
      typecheck();
      updateURL();
    });

    window.editor = editor;
  });

  // editor.session.on("change", function() {
  //   gtag('event', 'typecheck', {
  //     'event_category': 'editor',
  //     'event_label': editor.getValue(),
  //   });
  //   typecheck();
  //   updateURL();
  // });
  // editor.session.on("load", function() {
  //   loadFromURL();
  // });
  // editor.commands.removeCommands(["gotoline"]);
  //
  // window.editor = editor;
})();
