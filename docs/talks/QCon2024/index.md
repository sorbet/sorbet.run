---
title: 'Refactoring Large, Stubborn Codebases'
author: 'Jake Zimmerman, Getty D. Ritter'
date: 'November 19, 2024'

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
backgroundTransition: 'none'

width: 960
height: 540
maxScale: 3.0
margin: 0.08

include-after:
- '<script src="js/toggle-theme.js"></script>'
---

-----

<h1 class="title">Refactoring Large, Stubborn Codebases</h1>

::::{.columns}
:::{.column width="27%"}
Jake Zimmerman\
Getty D. Ritter
:::
:::{.column width="73%"}
![][github-mark-light]![][github-mark-dark][`@jez`]\
![][github-mark-light]![][github-mark-dark][`@aisamanra`]
:::
::::

[November 19, 2024]{.date}

[`@jez`]: https://github.com/jez
[`@aisamanra`]: https://github.com/aisamanra
[github-mark-light]: img/light/github-mark.svg {style="height:30px; margin: 0 0.3em -5px;"}
[github-mark-dark]: img/dark/github-mark.svg {style="height:30px; margin: 0 0.3em -5px;"}

-----

## Complaints about stubborn codebases

- _Our code isn't modular enough!_

::: incremental

- _This dependency is 10 years out of date!_

- _We need to change how we talk to the database!_

- ...

:::

. . .

### → We can refactor to a happy state!

## Best to centralize the refactor ☀️

Have **one team** drive the refactor:

* **concentrates expertise**\
  most problems will be repeat problems

- **incentivizes automation**\
  fewer man-hours overall

- **avoids idle time**\
  no need to wait for each team to plan and prioritize

## Centralized migration needs two things:

<!-- TODO(jez) Better diagrams -->

:::: {.columns}
::: {.column width="45%"}
**Leverage** over the codebase

![](/img/LeveragePoint_Diagram.gif)
:::

::: {.column width="55%"}
Way to **ratchet** incremental progress

![](/img/Ratchet_rotation_allowed.jpg){height="180px"}
:::
::::

## Thesis

\

to successfully &nbsp; **refactor large, stubborn codebases**

you need to &nbsp; **have a point of leverage** &nbsp; and &nbsp; **pick good ratchets**

<!-- TODO(jez) Should you expand on these here? -->




\

\

## Agenda 🎯

\

- **Improving developer satisfaction with Sorbet**

- Making a Ruby monolith more modular

\

## {background-image="/img/sorbet.org.png"}

## 🥺 Stripe's developers were unhappy

::::{.columns}
:::{.column width="46%" }
"hard to understand"\
["waiting for tests is slow"]{.fragment}\
["only breaks in production"]{.fragment}\
["don't trust the docs"]{.fragment}\
["too much low-quality code"]{.fragment}
:::
:::{.column width="54%"}
&nbsp;\
&nbsp;\
&nbsp;\
&nbsp;\
&nbsp;
:::
::::

(sentiment from company-wide survey)

## 💡 Building Sorbet introduced leverage

::::{.columns}
:::{.column width="46%" }
"hard to understand"\
"waiting for tests is slow"\
"only breaks in production"\
"don't trust the docs"\
"too much low-quality code"
:::
:::{.column width="54%"}
[**→** IDE aids understanding]{.fragment}\
[**→** all code type checks in seconds]{.fragment}\
[**→** type checker catches bugs in CI]{.fragment}\
[**→** runtime makes types trustworthy]{.fragment}\
[**→** bad code is hard to type]{.fragment}
:::
::::

(sentiment from company-wide survey)

## Brief history of Sorbet 👨‍🏫

- Began fall 2017
- Stripe: **\~800** employees (200 -- 400 engineers)
- Initial project: 3 engineers, full time

Timeline

- **9 months** to build Sorbet...\
  ... but has served as the foundation for hundreds of
  codemods
- **3 months** to get to 75% adoption...\
  ...contained to just three engineers

## Ratcheting in Sorbet...

**`# typed:`** comment at the top of each file

::::{.columns}
:::{.column width="30%"}
`# typed:` **`false`**\
`# typed:` **`true`**\
`# typed:` **`strict`**
:::
:::{.column width="70%"}
→ just syntax and constants\
→ inference in methods\
→ every method needs a signature
:::
::::

... is **local**, **incremental**, and **actionable**

::: notes

Getting started just means flipping a single comment in the
file you're already working in.

Only get type errors once you start adding annotations.

Once you add **`# typed: true`**, your reviewer is going to
be really suspicious of downgrading to **`# typed: false`**
vs just using **`T.unsafe`** to regress one call
site---discourages backsliding

:::

## 💡 **local**, **incremental**, and **actionable**

Alternatives to `# typed:` comment:

- by folder or by team → too broad\
  (not local enough, not incremental enough)

- by method or by percent within a file → too granular\
  (noisy, hard to action)

## Thesis

Developer satisfaction improved because we:

::::{.columns style="gap: min(4vw, 0.5em);"}
:::{.column style="width:6%; text-align:right;"}
\
by\
and
:::
:::{.column width="94%"}
**refactored a large, stubborn codebase**\
**having a point of leverage** (Sorbet)\
**picking good ratchets** (`# typed:`)
:::
::::



## Agenda 🎯

\

- Improving developer satisfaction with Sorbet

- **Making a Ruby monolith more modular**

\


## TODO(gdritter)




<!-- vim:tw=60
-->
