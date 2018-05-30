(function() {
  var ruby = window.location.hash;
  if (ruby) {
    ruby = decodeURIComponent(ruby);
    ruby = ruby.substr(1); // Cut off the #
  } else {
    ruby = document.getElementById('editor').innerHTML;
  }

  var editor = ace.edit("editor", {
    printMargin: false,
    value: ruby,
    tabSize: 2,
  });
  editor.setTheme("ace/theme/monokai");
  editor.session.setMode("ace/mode/ruby");
  editor.session.on("change", function() {
    gtag('event', 'typecheck', {
      'event_category': 'editor',
      'event_label': editor.getValue(),
    });
    typecheck();
    updateURL();
  });
  editor.session.on("load", function() {
    loadFromURL();
  });
  editor.commands.removeCommands(["gotoline"]);

  window.editor = editor;
})();
