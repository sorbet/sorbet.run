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
backgroundTransition: 'none'

include-after:
- '<script src="js/toggle-theme.js"></script>'

---

##

:::: {.columns style="text-align: center;"}

::: {.column width="20%"}
![](img/sorbet-logo.svg){height="175px"}

Sorbet
:::

::: {.column width="7%"}

\

### +

:::

::: {.column width="33%"}
![](img/LLVMWyvernSmall.png){height="175px"}

LLVM
:::

::: {.column width="7%"}

\

### =

:::

::: {.column width="33%"}
![](img/sorbet-compiler-logo.svg){height="175px"}

the Sorbet Compiler
:::

::::

::: notes

"For those who don't know..."

:::

## Agenda

- Why does Stripe care about performance?

- Why build a compiler for Ruby?

- How does it work?

- How are we adopting it?


## Agenda

- **Why does Stripe care about performance?**

- Why build a compiler for Ruby?

- How does it work?

- How are we adopting it?


## 📈 Stripe is an API for building a business

- Accept payments
- Coordinate payouts
- Manage taxes
- ...

::: notes

Product for pretty much everything that has to do with your
business's money needs.

:::


## API speed is a feature ✨

- Stripe users want **lower latency**

- Stripe API runs on every checkout

::: notes

You're going to choose the faster API over the slower API if they're otherwise equal.

:::


## Agenda

- Why does Stripe care about performance?

- **Why build a compiler for Ruby?**

- How does it work?

- How are we adopting it?


## 💎 Stripe uses **Ruby** extensively

- Powers our most important services (Stripe API)

- Hundreds of engineers use Ruby daily

- Millions of lines of code (monorepo)

- Massive type coverage with Sorbet


## Visualizing API Latency

![](img/dark/request-breakdown-1.png)
![](img/light/request-breakdown-1.png)

::: notes

I/O is sizable, but is being tackled by other projects—compiler focuses on Ruby

:::


## Visualizing API Latency

![](img/dark/request-breakdown-2.png)
![](img/light/request-breakdown-2.png)


::: notes

Ruby portion is owned by dozens of teams

:::

##

![](img/dark/compiler-leverage-1.png)
![](img/light/compiler-leverage-1.png)

##

![](img/dark/compiler-leverage-2.png)
![](img/light/compiler-leverage-2.png)

::: notes

generous: hottest files take <1% of request duration

:::

##

![](img/dark/compiler-leverage-3.png)
![](img/light/compiler-leverage-3.png)

::: notes

"if the compiler works, it has the potential to speed up all
pieces"

high-leverage

:::

## Why AoT, not JIT?

**AoT**: ahead-of-time\
**JIT**: just-in-time

- Sorbet types speed up generated code

- AoT are simpler (implement, debug)

- Can still do both!

## Why not TruffleRuby or JRuby?

- No incremental migration

- Compiler works with existing Ruby VM

::: notes

targets Ruby C extensions

:::


## Agenda

- Why does Stripe care about performance?

- Why build a compiler for Ruby?

- **How does it work?**

- How are we adopting it?

::: notes

transition to trevor

:::

##

![](img/dark/sorbet-llvm-pipeline.png)
![](img/light/sorbet-llvm-pipeline.png)

::: notes

A typechecker for ruby with a powerful static analysis pass built by Stripe

A gradual type system, allowing users to locally opt-out of type checking

:::

## Example

```{.ruby}
  
  
  
  
def f(x)
  x.map {|v| v + 1}
end
```

## Sorbet Example

```{.ruby}
sig do
  params(x: T::Array[Integer])
  .returns(T::Array[Integer])
end
def f(x)
  x.map {|v| v + 1}
end
```

## Catching a type error

```{.ruby .hl-6}
sig do
  params(x: T::Array[Integer])
  .returns(T::Array[Integer])
end
def f(x)
  x.map {|v| v + 1}.to_s # static error!
end
```

::: notes

We introduced an error by producing an array of strings instead of an array of integers, and sorbet flags this statically

:::

##

![](img/dark/sorbet-llvm-pipeline.png)
![](img/light/sorbet-llvm-pipeline.png)


::: notes

The code generation pass adds about 10k lines of c++, runtime support adds 5k lines of c

:::

## LLVM

- Compiler backend toolkit
- Used by many compilers: clang, ghc, swift, ...

::: notes

LLVM intermediate representation is generated from a typechecked ruby program

:::

##

![](img/dark/sorbet-llvm-pipeline.png)
![](img/light/sorbet-llvm-pipeline.png)

::: notes

The output of the LLVM codgen pass is a native shared object

Shared objects produced by the sorbet compiler use the ruby vm's c api to
interact directly with the VM

:::

## The Ruby C API

::: {.columns}

:::: {.column width="20%" }

```{.ruby}
def foo(val)
  puts val
end
  
  
  
  
```

::::

:::

::: notes

Example of a ruby function, and an equivalent c extension.

:::

## The Ruby C API

::: {.columns}

:::: {.column width="20%" }

```{.ruby}
def foo(val)
  puts val
end
  
  
  
  
```

::::

:::: {.column width="5%" }
::::

:::: {.column width="70%" }

```{.c}
VALUE my_foo(VALUE self, VALUE val) {
  return rb_funcall(self, rb_intern("puts"), 1, val)
}
  
void Init_my_lib() {
  rb_define_method(rb_cObject, "foo", my_foo, 1);
}
```

::::

:::

::: notes

Example of a ruby function, and an equivalent c extension.

:::


## Compiling the example

```{.ruby}

sig do
  params(x: T::Array[Integer])
  .returns(T::Array[Integer])
end
def f(x)
  x.map {|v| v + 1}
end




```

## Compiling the example

```{.ruby}
# compiled: true
sig do
  params(x: T::Array[Integer])
  .returns(T::Array[Integer])
end
def f(x)
  x.map {|v| v + 1}
end




```

::: notes

We'll use some pseudo-code to illustrate the transformations the compiler will apply

Note that the compiler is not source-to-source, this example is just to give an
idea of the sorts of transformations the compiler applies

:::

## The Compiler's View

```{.ruby .hl-7 .hl-9}
# compiled: true
# sig do
#   params(x: T::Array[Integer])
#   .returns(T::Array[Integer])
# end
def f(x)
  raise unless x.is_a?(Array)
  t = x.map {|v| v + 1}
  raise unless t.is_a?(Array)
  t
end
```

::: notes

The signature is checked unconditionally at runtime, and produce assumptions for us to reuse later. Parameter and return value validation moves into the function body.

The check for `x` is now specialized to `Array`.

The return value has been named, and its runtime type-check is also specialized to `Array`.

:::

## Avoiding VM Dispatch

```{.ruby .hl-4}
# compiled: true
def f(x)
  raise unless x.is_a?(Array)
  t = rb_ary_collect(x) do |v|
    v + 1
  end
  raise unless t.is_a?(Array)
  t
end



```

::: notes

At this point we know that `x` is an `Array`, and can dispatch directly to the implementation of `map`

This is hand-wavy: setting up the block for the call to `rb_ary_collect` takes more work than this

Really stress that method dispatch is expensive

:::

## Inlining **`rb_ary_collect`**

```{.ruby}
# compiled: true
def f(x)
  raise unless x.is_a?(Array)
  t = []; i = 0; len = x.length
  while i < len
    t << <callblock>(x[i]) {|v| v + 1}
    i += 1
  end
  raise unless t.is_a?(Array)
  t
end
```

::: notes

We can inline the definition of `rb_ary_collect` constructing the array directly instead

There's a lot hidden by `<callblock>`:
  - function body extracted
  - vm setup for the call

:::

## Inlining the block

```{.ruby}
# compiled: true
def f(x)
  raise unless x.is_a?(Array)
  t = []; i = 0; len = x.length
  while i < len
    t << x[i] + 1
    i += 1
  end
  raise unless t.is_a?(Array)
  t
end
```

::: notes

There's no longer any need for the block to be called, and we can inline it in the body of the loop

:::

## Avoiding VM Dispatch
```{.ruby .hl-4 .hl-6}
# compiled: true
def f(x)
  raise unless x.is_a?(Array)
  t = []; i = 0; len = x.length
  while i < len
    t << x[i] + 1
    i += 1
  end
  raise unless t.is_a?(Array)
  t
end
```

::: notes

* We can further inline other calls to methods on `x`, inlining the calls to `length` and `[]`, and the `<<` method on `t`

:::

## Removing redundant type tests

```{.ruby .hl-9}
# compiled: true
def f(x)
  raise unless x.is_a?(Array)
  t = []; i = 0; len = x.length
  while i < len
    t << x[i] + 1
    i += 1
  end
  raise unless t.is_a?(Array)
  t
end
```

::: notes

* We know that `t` will always be an array, so we can remove the check on the return value

:::

## Final version

```{.ruby}
# compiled: true
def f(x)
  raise unless x.is_a?(Array)
  t = []; i = 0; len = x.length
  while i < len
    t << x[i] + 1
    i += 1
  end
  
  t
end
```

::: notes

Re-iterate that this is not a source-to-source transformation

Recap work saved: fewer vm dispatches, no block calls, fewer type checks

:::

## Agenda

- Why does Stripe care about performance?

- Why build a compiler for Ruby?

- How does it work?

- **How are we adopting it?**

::: notes

switch to jez

:::


## Goals for adoption

1️⃣ Plan for when things go wrong

2️⃣ Compare performance on real traffic

3️⃣ Must be incremental

::: notes

incremental == iteration speed

:::


## 1️⃣ Plan for when things go wrong

- Compiler test cases

- Entire Stripe test suite

- Pre-production (staging environment)

- Blue/green deploys

- Separate host set to kill traffic fast

::: notes

multiple lines of defense

:::

## 2️⃣ Performance on real traffic

![](img/dark/api-fleet.png)
![](img/light/api-fleet.png)


## 3️⃣ Must be incremental

→ Measure with **Stackprof**

![](img/dark/stackprof.png)
![](img/light/stackprof.png)


::: notes

Compiling file with `A` is more important than `B`

Existing Stackprof tooling!

:::

## What's next? 💭

📈 **Increase adoption**\
　 (fraction running compiled)

⏱ **Profile and optimize**\
　 (improve compiled performance)

::: notes

note quite worth sharing concrete performance numbers yet, because we've been
focused on adoption

:::

## Questions? 🙋

:::: {.columns}

::: {.column width="50%"}
*btw, we have stickers!*

![](img/sorbet-logo.svg){height="150px"}
![](img/sorbet-compiler-logo.svg){height="150px"}
:::

::: {.column width="50%"}
*also, we're hiring!*

→ [stripe.com/jobs](https://stripe.com/jobs)
:::
::::


\


