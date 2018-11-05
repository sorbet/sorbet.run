/* global ace, gtag, typecheck */

(() => {
  const initialValue = () => {
    // Remove leading '#'
    const hash = window.location.hash.slice(1);
    if (hash) {
      return decodeURIComponent(hash);
    }

    const lastContents = window.localStorage.getItem('lastContents');
    if (lastContents) {
      return lastContents;
    }

    return document.getElementById('editor').innerHTML;
  };

  const editor = ace.edit('editor', {
    printMargin: false,
    value: initialValue(),
    tabSize: 2,
    fontSize: 16,
  });

  editor.setTheme('ace/theme/monokai');
  editor.session.setMode('ace/mode/ruby');
  editor.commands.removeCommands(['gotoline']);
  editor.focus();

  const updateAfterChange = () => {
    const contents = editor.getValue();
    window.location.hash = `#${encodeURIComponent(contents)}`;
    window.localStorage.setItem('lastContents', contents);
  };

  editor.session.on('change', () => {
    gtag('event', 'typecheck', {
      event_category: 'editor',
      event_label: editor.getValue(),
    });

    typecheck();
    updateAfterChange();
  });

  const vimButton = document.getElementById('vim-button');
  vimButton.addEventListener('click', (ev) => {
    ev.preventDefault();

    if (window.localStorage.getItem('vim')) {
      window.localStorage.removeItem('vim');
      editor.setKeyboardHandler('');
    } else {
      window.localStorage.setItem('vim', true);
      editor.setKeyboardHandler('ace/keyboard/vim');
    }
  });

  // Remember Vim keybindings on load
  if (window.localStorage.getItem('vim')) {
    window.localStorage.setItem('vim', true);
    editor.setKeyboardHandler('ace/keyboard/vim');
  }

  window.editor = editor;
})();
