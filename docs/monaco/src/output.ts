import {createSorbet} from './sorbet';
import AnsiUp from 'ansi_up';

declare var gtag: any;

const output = document.getElementById('output')!;
const ansiUp = new AnsiUp();
ansiUp.use_classes = true;

let runId = 0;
let curId = 0;
let stdout:string[] = [];
const flush = () => {
  gtag('event', 'typecheck', {
    event_category: 'error_lines',
    event_label: stdout.length,
  });
  const errorLines = stdout.join('\n').match(/^[^ ]/gm);
  gtag('event', 'typecheck', {
    event_category: 'errors',
    event_label: errorLines ? errorLines.length : 0,
  });
  output.innerHTML = ansiUp.ansi_to_html(stdout.join('\n'));
  stdout = [];
};

let lastRuby = '';
const runCpp = (Module: any, ruby: string) => {
  if (lastRuby === ruby) {
    return;
  }
  lastRuby = ruby;
  runId += 1;
  curId = runId;

  const t0 = performance.now();
  const f = Module.cwrap('typecheck', null, ['string']);
  f(`${ruby}\n`);
  const t1 = performance.now();

  gtag('event', 'timing_complete', {
    event_category: 'typecheck_time',
    event_label: t1 - t0,
    name: 'typecheck_time',
    value: t1 - t0,
  });

  flush();
};

export const typecheck = (ruby: string) => {
  setTimeout(() => {
    if (sorbet) {
      runCpp(sorbet, ruby)
    }
  }, 1);
};

// Sorbet singleton.
let sorbet: any = null;
async function instantiateSorbet() {
  let errorCalled = false;
  const onError = (event: any) => {
    console.log(event);
    // If Sorbet crashes, try creating Sorbet again.
    // Avoid acting on multiple errors from the same Sorbet instance.
    if (errorCalled) {
      return;
    }

    errorCalled = true;
    sorbet = null;
    instantiateSorbet();
  };
  const onPrint = (line: string) => {
    if (runId !== curId) {
      return;
    }
    const replaced = line
      .replace(/http:\/\/[^ ]*/, '')
      .replace('git.corp.stripe.com/stripe-internal', 'github.com/stripe')
      .replace('-e:', 'editor.rb:');
    stdout.push(replaced);
  };
  ({sorbet} = await createSorbet(onPrint, onError));
  typecheck(monaco.editor.getModels()[0].getValue());
}
instantiateSorbet();
