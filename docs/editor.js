(function() {
  var ruby = window.location.hash;
  if (ruby) {
    ruby = decodeURI(ruby);
    ruby = ruby.substr(1); // Cut off the #
  } else {
    ruby = document.getElementById('editor').innerHTML;
  }

  var editor = ace.edit("editor", {
    printMargin: false,
    value: ruby,
  });
  editor.setTheme("ace/theme/monokai");
  editor.session.setMode("ace/mode/ruby");
  editor.session.on("change", function() {
    typecheck();
    updateURL();
  });
  editor.session.on("load", function() {
    loadFromURL();
  });

  window.editor = editor;
})();
