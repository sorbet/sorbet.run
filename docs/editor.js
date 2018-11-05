/* global ace, gtag, typecheck, updateURL */

(() => {
  // Remove leading '#'
  const hash = window.location.hash.slice(1);
  const ruby = hash
    ? decodeURIComponent(hash)
    : document.getElementById('editor').innerHTML;

  const editor = ace.edit('editor', {
    printMargin: false,
    value: ruby,
    tabSize: 2,
    fontSize: 16,
  });
  editor.setTheme('ace/theme/monokai');
  editor.session.setMode('ace/mode/ruby');
  editor.session.on('change', () => {
    gtag('event', 'typecheck', {
      event_category: 'editor',
      event_label: editor.getValue(),
    });
    typecheck();
    updateURL();
  });
  editor.commands.removeCommands(['gotoline']);
  editor.focus();

  const vimButton = document.getElementById('vim-button');
  vimButton.addEventListener('click', (ev) => {
    ev.preventDefault();
    editor.setKeyboardHandler('ace/keyboard/vim');
  });

  window.editor = editor;
})();
