---
title: 'Refactoring Stubborn Legacy Codebases'
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

<h1 class="title">Refactoring Stubborn Legacy Codebases</h1>

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

::: notes

I'm Jake. This is Getty. Doing large-scale code migrations
on Stripe's Ruby codebase is our full time job, and has been
for the better half of the last decade.

We're going to spend this session talking about how we
refactor stubborn, tangled, legacy codebases.

:::

-----

## {background-image="img/unhappy-codebases.png"}


## Unhappy codebases

- _Our code isn't modular enough!_

::: incremental

- _This dependency is 10 years out of date!_

- _We need to change how we talk to the database!_

- _Not enough code is typed!_

:::

. . .

### → We can refactor to a happy state!

::: notes

- monolith → tangled mess
- super old Sinatra gem, AWS gem, bazel version, etc.
- monolithic database → database per service
- still plenty of untyped ruby and python apps out there

:::

## Best to centralize the refactor ☀️

Have **one team** drive the refactor:

* **concentrates expertise**\
  most problems will be repeat problems

- **avoids idle time**\
  no need to wait for each team to plan and prioritize

- **incentivizes automation**\
  fewer man-hours overall

::: notes

Going to kind of take this as an assumption: not going to
spend too much time on it.

Instead, we're going to talk about what it takes to make
this approach successful.

:::

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

to successfully &nbsp; **refactor stubborn legacy codebases**

you need to &nbsp; **have a point of leverage** &nbsp; and &nbsp; **pick good ratchets**

<!-- TODO(jez) Should you expand on these here? -->

::: notes

Doing large-scale code migrations on Stripe's Ruby codebase
is our full time job, and has been for the better half of
the last decade.

We're going to spend this session talking about how we
refactor stubborn, tangled, legacy codebases.

:::



\

\

## Agenda 🎯

\

- **Improving developer satisfaction with Sorbet**

- Making a Ruby monolith more modular

\

## {background-image="/img/sorbet.org.png"}

::: notes

TODO(jez) Capabilities, IDE support, focus on performance

TODO(jez) Maybe replace with screenshot of sorbet.org?

:::

## 🥺 Stripe's codebase was unhappy

::::{.columns}
:::{.column width="46%" }
"hard to understand"\
["only breaks in production"]{.fragment}\
["don't trust the docs"]{.fragment}\
["too slow to run all tests locally"]{.fragment}\
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

::: notes

Every few months, we'd survey developers, asking "what gets
in the way of your productivity at Stripe?" Lots of answers.

We could have solved these individually (better docs, more
test coverage, faster tests) but we wanted LEVERAGE over the
codebase: "a small force that has a big impact."

Sorbet provided that leverage.

:::

## 💡 Building Sorbet introduced leverage

::::{.columns}
:::{.column width="46%" }
"hard to understand"\
"only breaks in production"\
"don't trust the docs"\
"too slow to run all tests locally"\
"too much low-quality code"
:::
:::{.column width="54%"}
[**→** IDE aids understanding]{.fragment}\
[**→** type checker catches bugs in CI]{.fragment}\
[**→** runtime makes types trustworthy]{.fragment}\
[**→** all code type checks in seconds]{.fragment}\
[**→** bad code is hard to type]{.fragment}
:::
::::

(sentiment from company-wide survey)

## Brief history of Sorbet 👨‍🏫

- Began fall 2017
- Stripe: **\~800** employees (200 -- 400 engineers)
- Initial project: 3 engineers, full time

Timeline

- Oct '17 -- kickoff
- May '18 -- blocking in CI
- Sep '18 -- 75% files opted into type checking

::: notes

About 9 months building Sorbet, another 3 months adopting
it.

:::

## Might be easier than you think?

::::{.columns}
:::{.column width="50%"}
9 months to build Sorbet...

[... but has served as the foundation for **hundreds of
massive codemods**!]{.fragment}
:::
:::{.column width="50%"}
3 months to adopt typing...

[... **contained to three engineers**, while everyone else
remains focused!]{.fragment}
:::
::::

::: notes

As a rule, people overrate how hard building program
analysis tools are.

"but remember: we centralized this migration!"

:::

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

::: notes

"all new methods"

"coverage percentage only goes up"

:::


## Thesis

Developer satisfaction improved because we:

::::{.columns style="gap: min(4vw, 0.5em);"}
:::{.column style="width:6%; text-align:right;"}
\
by\
and
:::
:::{.column width="94%"}
**refactored a stubborn legacy codebase**\
**having a point of leverage** (Sorbet)\
**picking good ratchets** (`# typed:`)
:::
::::



::: notes

Adopting static typing at Stripe succeeded in large part
because we cultivated a point of leverage (Sorbet) and we
locked in incremental progress the right ratchets.

:::

## Agenda 🎯

\

- Improving developer satisfaction with Sorbet

- **Making a Ruby monolith more modular**

\


## TODO(gdritter)




<!-- vim:tw=60
-->
