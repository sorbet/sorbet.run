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

##

<section data-background-image="/img/unhappy-codebases.png">
</section>

##

> This code isn't modular enough!

> We need to change how we talk to the database!

> Not enough code is typed!

... etc.

. . .

→ Need to **refactor tons of code**

## Assumption:

Making it **one team's** job to drive that refactor is a
great idea!

\

* centralizes expertise---most problems will be repeat problems
- no waiting for each team's to plan and prioritize
- incentivizes automation

##

This approach requires two things:

:::: {.columns}
::: {.column width="50%"}
**Leverage** over the codebase

![](/img/LeveragePoint_Diagram.gif)
:::

::: {.column width="50%"}
Some way to **ratchet** incremental progress

![](/img/Ratchet_rotation_allowed.jpg)
:::
::::

-----

<h1>Refactoring Stubborn Legacy Codebases</h1>

[Jake Zimmerman **`@jez`**\
Getty D. Ritter **`@aisamanra`**]{.author}

[November 19, 2024]{.date}

::: notes

I'm Jake. This is Getty. Doing large-scale code migrations
on Stripe's Ruby codebase is our full time job, and has been
for the better half of the last decade.

We're going to spend this session talking about how we
refactor stubborn, tangled, legacy codebases.

:::

-----

## Thesis

\

:::{style="text-align: center;"}
"Refactoring stubborn legacy codebases"

**==**

"Having a point of leverage" **+** "Picking the right ratchets"&nbsp;
:::

<!-- TODO(jez) Should you expand on these here? -->

\

\

## Agenda 🎯

- [Building and adopting Sorbet]{.fragment .highlight-blurple}

- Introducing modularity to Stripe's Ruby monolith

## Sorbet is Stripe's type checker for Ruby

```ruby
sig { params(x: Integer).returns(String) }
def int_to_str(x)
  x.to_s
end
```

::: notes

TODO(jez) Capabilities, IDE support, focus on performance

TODO(jez) Maybe replace with screenshot of sorbet.org?

:::

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

## 💡 Building Sorbet introduced leverage

::::{.columns}
:::{.column width="46%" }
"hard to understand"\
"only breaks in production"\
"don't trust the docs"\
"too slow to run all tests locally"\
"too much low-quality code"
:::
:::{.column .fragment width="54%"}
**→** IDE aids understanding\
**→** type checker catches bugs in CI\
**→** runtime makes types trustworthy\
**→** all code type checks in seconds\
**→** bad code is hard to type
:::
::::

::: notes

Every few months, we'd survey developers, asking "what gets
in the way of your productivity at Stripe?" Lots of answers.

We could have solved these individually (better docs, more
test coverage, faster tests) but we wanted LEVERAGE over the
codebase: "a small force that has a big impact."

Sorbet provided that leverage.

:::

## 📈 Introducing leverage is an investment

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

## 💡 Ratchet at the right granularity

→ **`# typed:`** comment at the top of each file

Alternatives:

- by folder, by team → too broad
- by method, by percent within a file → too granular

**`# typed:`** comment is **local**, **incremental**, and
**actionable**

::: notes

Getting started just means flipping a single comment in the
file you're already working in.

Only get type errors once you start adding annotations.

Once you add **`# typed: true`**, your reviewer is going to
be really suspicious of downgrading to **`# typed: false`**
vs just using **`T.unsafe`** to regress one call
site---discourages backsliding

:::

## Thesis

\

:::{style="text-align: center;"}
"Refactoring stubborn legacy codebases"

**==**

"Having a point of leverage" **+** "Picking the right ratchets"&nbsp;
:::

\

\

::: notes

Adopting static typing at Stripe succeeded in large part
because we cultivated a point of leverage (Sorbet) and we
locked in incremental progress the right ratchets.

:::

## Agenda 🎯

- Building and adopting Sorbet

- **Introducing modularity to Stripe's Ruby monolith**


## TODO(gdritter)




<!-- vim:tw=60
-->
