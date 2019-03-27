(() => {
  const initialValue = () => {
    // Remove leading '#'
    const hash = window.location.hash.slice(1);
    if (hash) {
      return decodeURIComponent(hash);
    }

    return document.getElementById('editor').innerHTML;
  };

  const value = initialValue();
  document.getElementById('editor').innerHTML = null;

  LANGUAGE_ID = 'ruby';

  var editor = monaco.editor.create(document.getElementById('editor'), {
		value: value,
		language: LANGUAGE_ID,
    theme: 'vs-dark',
    minimap : {
      enabled: false,
    },
    scrollBeyondLastLine: false,
    formatOnType: true,
    autoIndent: true,
    lightbulb: {
        enabled: true
    },
	});

  window.editor = editor;
  monaco.languages.registerCompletionItemProvider(LANGUAGE_ID, {
    provideCompletionItems: function (model, position, token) {
      debugger;
    },
    resolveCompletionItem: function (item, token) {
      debugger;
    }
  });
  monaco.languages.registerDocumentRangeFormattingEditProvider(LANGUAGE_ID, {
    provideDocumentRangeFormattingEdits: function (model, range, options, token) {
      debugger;
    }
  });
  monaco.languages.registerDocumentSymbolProvider(LANGUAGE_ID, {
    provideDocumentSymbols: function (model, token) {
      debugger;
    }
  });
  monaco.languages.registerHoverProvider(LANGUAGE_ID, {
    provideHover: function (model, position, token) {
      debugger;
    }
  });
})();
