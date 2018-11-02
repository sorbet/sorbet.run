/* global monaco */

// TODO(jez) Why can't ESLint find this import?
// eslint-disable-next-line import/no-unresolved
import 'monaco-editor';
import {MonacoServices} from 'monaco-languageclient';
import AnsiUp from 'ansi_up';

import {typecheck} from './typecheck';
import {getClient} from './client';

window.MonacoEnvironment = {
  getWorkerUrl: () => './editor.worker.bundle.js',
};

const ansiUp = new AnsiUp();

const output = document.getElementById('output');
const flushOut = (stdout) => {
  output.innerHTML = ansiUp.ansi_to_html(stdout);
};

const flushErr = (stderr) => {
  output.innerHTML = stderr;
};

const typecheckOne = typecheck(flushOut, flushErr);

const LANGUAGE_ID = 'ruby';
monaco.languages.register({
  id: LANGUAGE_ID,
  extensions: ['.rb', '.rbi'],
  aliases: ['Ruby', 'ruby', 'rb'],
  mimetypes: ['application/ruby'],
});

const editor = monaco.editor.create(document.getElementById('editor'), {
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

MonacoServices.install(editor);

const model = editor.getModel();
model.onDidChangeContent((changeEvent) => {
  console.log(changeEvent);
  typecheckOne(model.getValue());
});

const languageClient = getClient();
languageClient.start();

typecheckOne(model.getValue());
