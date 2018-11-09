# Team effort

- **Dmitry**: PhD Compiler architecture & a bit of type theory @ next major version of Scala Compiler (3.0)
- **Nelson**: One of the longest tenured engineers at Stripe. Great knowledge of Ruby and MRI internals
- **Paul**: Previously at Facebook on HHVM and Hack
- **Jake**: Joined team in August, a lot of experience with Flow
- **James**: developed Salesforce Apex and worked on the Scala compiler 
- We are currently hiring for this team

---

## Outline

- Assumptions that Sorbet is developed under
- State of Sorbet at Stripe
- Evolution of Sorbet type system
- New things in Sorbet since last meeting

---

# Assumptions

Note: 
 - Sorbet is built with these constraints in mind.
 - Removing any of those constraints would have led us to different choices.

---

## Assumptions: MRI

 - Stripe runs on MRI
 - MRI is great and we don't want to replace it
 - Nor do we want to run a patched version

---
## Assumptions: untyped code is here to stay

 - We do not intend to force prototype-grade code to be typed
 - We intend to interoperate with gems
 - We do not enforce typing on our users: they choose

---
## Assumptions: users choose strictness level

  - One of our levels is "disabled". 
  - And it's the default.
  - Thus in order to get internal adoption, we needed to be useful with minimal initial investment effort

---
## Assumptions: gems exist
 - We support a way to add external signatures for gems, similar to that used by Typescript
 - A scalable way to collaborate and type the ecosystem

Notes:
 - DefinitelyTyped is the 9th repo in github by number of commiters per month
 
---
## Assumptions: Recap
- We could have gotten some of them wrong. We likely did.
- We already know a couple of areas where we plan to just let you tell us what to do:
  - we plan to implement structural types based on your asks
  - syntax: Matz, just tell us what you want - we'll support it.



---

# State of Sorbet at Stripe

---
## State of Sorbet at Stripe: Users

- Hundreds of users, who voluntarily use us every day.
- Different use-cases

---
## Use-cases: refactoring
<img src="img/refactoring.png"></img> 

---
## Use-cases: interfaces
<img src="img/interfacing.png"></img>

---
## Use-cases: understanding
<img src="img/exploration.png"></img> 

---
## Use-cases: debugging
<img src="img/breakage.png"></img> 

---
## Users
At this point:
 - Many people learn what code does by adding types
 - Before modifying any existing code, they add types


And that's not because we told them to, but because they find it easier to achieve their goal with Sorbet as a tool.


---
## Users

<img src="img/human-sigs.png"></img>

---
## Typed files

```
# typed: true
```
enables typechecking in that file.
---
## State of Sorbet at Stripe: Typed files
 - we have built the ability to indicate what files can be typed into Sorbet
 - we have sent PRs to our users to type files in bulk and allowed them to accept/reject them.

---
## State of Sorbet at Stripe: Typed files

<img src="img/typed-files.png"></img>

---
## State of Sorbet at Stripe: Typed callsites
 - we've built a mode into sorbet that tells most impactful methods to type.
    - we typed a few hundred of most commonly-used functions manually
 - (currently) we are building tools to type the long tail
    - dynamic type profiling
    - static analysis (see demo later)

---
## State of Sorbet at Stripe: Typed callsites

<img src="img/typed-calls.png"></img>

---
## State of Sorbet at Stripe

Over last 6 month, Sorbet was rapidly adopted at Stripe:
 - users are happy and feel that it's useful for them
 - \>74% of files are being typechecked
 - \>50% of callsites in those files are checked for correctness

---
# History of the type system

---
## What principles did we start with

Take the minimal thing, and start adding features based on patterns that we see in our codebase.

---
## First pattern: control flow sensitivity

simple case:
```ruby
  def test_return(s)
    if s.nil?
      return 0
    end

    s.length
  end
```

Most typesystems can't typecheck this

---
## Control flow sensitivity

more contrieved example:
```ruby
def or_zero(a)
  b = !a.is_a?(Integer)
  if b
    0
  else
    a
  end
end
```

---

## Second pattern: generic classes

```ruby
["1", "2", "3"].each{|s| takes_string(s)}
```

---

## Generic system that we chose:

- I worked on Scala generics before. Though they didn't fit.
- Among generic systems, I feel like the one in C# fits Ruby best
- We went with C#-ish generics, but with runtime erasure
- We support co-, contra- and in- variance
- We support reducing kindness (e.g. `File` is a `IO<String>` and thus has different kind than parent)
- Users don't need to think about this: it "just works"

---

## Generic methods

```ruby
["1", "2", "3"].map{|s| Integer(s) }.map { |i| i + 1}
```

---
## Generic system that we chose:
 - type variables & type constraints for upper & lower bounds
 - minimal constraint solver tuned for our use of Ruby library
 - "just works" in experience of our users: having huge number of examples helped tremendously

---
## Self types
 - Introduced to model `Object#dup` and similar methods

---

# Major changes in last 6 months

---
## Supporting (most) metaprogramming

We've built a script that finds all metaprogrammed classes and functions:

- load all code into MRI
- use runtime introspection to see what classes exist & what methods they define
- store those definitions in a shim file
- substract set of files that Sorbet sees from this shim file

---

## Auto-fixes for common errors

---

```ruby
foo[0]
```

```
test/suggest_t_must.rb:4: Method `[]` 
does not exist on `NilClass` component of `T.nilable(String)`
     4 |foo[0]
        ^^^^^^
  Autocorrect: Use `-a` to autocorrect
    test/suggest_t_must.rb:4: Replace with `T.must(foo)`
     4 |foo[0]
        ^^^
```

Note: 
  - T.must(a) strips `nil` from the type.

---

## AutoLoader

- 3 years ago Stripe gave a talk on How to Load 1M Lines of Ruby in 5s:  https://www.youtube.com/watch?v=lKMOETQAdzs
- It was based on pre-computation of dependencies in Ruby
- In order for this pre-computation to run in ~1m it had a lot of artisanal caching and optimizations
- Sorbet replaced this old static analysis, generating the same data in mere seconds


---

## Signatures are lazy.

---

```ruby
class A
 extend T::Helpers
 sig(b: B).returns(B) # NameError: forward reference to B. 
 def foo(b); b; end
end

class B
 extend T::Helpers
 sig(a: A).returns(A)
 def bar(a); a; end
end
```

---

```ruby
class A
 extend T::Helpers
 sig {params(b: B).returns(B)} # safe!
 def foo(b); b; end
end

class B
 extend T::Helpers
 sig {params(a: A).returns(A)}
 def bar(a); a; end
end
```

---

## Suggesting signatures
 - dynamic type profiling
 - static analysis

---

## Suggesting signatures: type profiling

Idea: Instrument code in production or tests, see what types are passed, log them, aggregate them.

---
## Suggesting signatures: type profiling

- Pros: can ascribe some time to every function that was ever executed
- Cons: builds over-precise types. e.g  for
```ruby
def is_christmas?; ...; end # we observe FalseClass
```

---

## Suggesting signatures: static analysis

Idea: see what _could_ be returned from the method, and what requirements should arguments satisfy for the method to typecheck

---
## Suggesting signatures: static analysis

- Pros: is conservative. The types that it returns are correct. Currently, can 3x number of signatures that we have.
- Cons: could be more general than the actual usage of method. e.g. for
```
def add_strings(a, b); a + b; end; # could take String, Integer, Time, Float, Rational, Complex,...
```

---
## Suggesting signatures

- Neither approach is perfect
- We're currently building both
- The plan is to:
   - use runtime profiling and manually verify some signatures
   - then propagate them with static analysis

---

## Demo:



---
## Our Questions:

  - Do our decisions looks reasonable? 
  - What do you think we should change to fit your requirements better?

---

# Thank you!

<a href="mailto:sorbet@stripe.com">sorbet@stripe.com</a>

<img class="logo" src="img/logo.png"></img>

Note:

- Thank you to the conference organizers for letting us speak here today. 
- Thanks Ruby for the great language that we all build on.
- With that, thank you so much for listening to us and taking that.
- Arigatou gozaimasu
