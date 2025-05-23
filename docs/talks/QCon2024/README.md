# docs/talks/QCon2024

These are the slides for the talk the Sorbet team gave at RubyConf 2021, using
[Reveal.js](https://revealjs.com/#/).

It uses Pandoc and the Reveal.js to generate presentations as HTML pages.

## Dependencies

There are no other dependencies other than [Pandoc]. Optional functionality to
watch the file system and rebuild on changes requires [Watchman]. Optional
functionality to serve and preview the files locally uses [Python 3].

- [Pandoc], a universal document converter
- [Watchman], a file watching service
- [Python 3], for `http.server`

[Pandoc]: http://pandoc.org/
[Watchman]: https://facebook.github.io/watchman/
[Python 3]: https://docs.python.org/3/library/http.server.html

Installation instructions vary depending on your system.
See the linked websites for more information, or just try this:

```shell
brew install pandoc
brew install watchman
```

## Usage

1.  Write your content in `index.md`
    - Start a new slide with `#`
1.  Run `make watch` to build the site and watch for changes.

    The sample presentation is already built. If you just want to preview it and
    don't want to install Watchman, run `python -m http.server` in `src/`.

1.  View the presentation at <http://127.0.0.1:8000>.

Read the [Makefile's documentation][Makefile] for more commands.

[Makefile]: ./Makefile

To use speaker notes, you **must** either serve the presentation from HTTPS or
use the loopback address, i.e., <http://127.0.0.1:8000>. [Read more about why
and alternatives here][https].

[https]: https://letsencrypt.org/docs/certificates-for-localhost/

This template supports both **light** and **dark**. The default is dark. To
switch to the light theme, click the title on the title slide. The presentation
writes the most recent preference into local storage, so even if you refresh it
will be saved.

You can generate a PDF from your slides (in Chrome) by tacking `?print-pdf` onto
the URL and using the browser's print diaglog:

- <http://127.0.0.1:8000/?print-pdf>

Note the query string must come **before** the `#slide-number`.

## License

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](https://jez.io/MIT-LICENSE.txt)
