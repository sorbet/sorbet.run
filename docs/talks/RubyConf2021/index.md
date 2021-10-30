---
title: 'Compiling Ruby to Native Code with Sorbet and LLVM'
author: 'Jake Zimmerman (**`@jez`**)<br>Trevor Elliott (**`@elliottt`**)'
date: 'November 10, 2021'

revealjs-url: 'https://unpkg.com/reveal.js@^4'

css:
- 'css/stripe.css'
- 'css/line-highlights.css'

# These are all strings because they'll be interpolated into
# JS and then become JS values.
progress: 'true'
controls: 'false'
history: 'true'
hideAddressBar: 'true'
hideInactiveCursor: 'false'
# The template auto-wraps this one in quotes
transition: 'none'
# This is a quoted string: needs to still have quotes when
# it's interpolated into JS. It's also escaped so that
# pandoc doesn't turn them into curly quotes.
slideNumber: '\"c/t\"'

include-after:
- '<script src="js/toggle-theme.js"></script>'
---

## Slides made with Markdown

Normal text

- Bullets
    - Bullets

::: notes

- Speakers notes, with **Markdown**.

:::

## 🐍 Python

```{.python .hl-1 .hl-4 .hl-5}
import requests

# This does a thing
def foo():
    return 'bar'

def hello():
    print('Another function')
```

## 🚀 Haskell

```haskell
import Foo.Bar

data Maybe a
  = Just a
  | Nothing

foo :: a -> Maybe a
foo x = Just x
```

## 🧭 Elements

```js
var style = {
  base: {
    color: '#303238',
    fontSize: '16px',
    fontFamily: '"Open Sans", sans-serif',
    fontSmoothing: 'antialiased',
    '::placeholder': {
      color: '#CFD7DF',
    },
  },
};
```

<!-- vim:tw=60
-->
