# Introductions

Note:

- jez: Carnegie Mellon grad, previous experience rolling out Flow at Stripe.
- pt: Stanford grad, Previously at Facebook on HHVM and Hack
- Talk about the other 6 folks

PT starts talking here

---

- **About Stripe**

- Adopting Sorbet at Stripe

- Editor Tools for Sorbet

- Announcements

- Sorbet Tooling

---

## Stripe

- Platform that developers use to accept payments
- 32 countries, millions of business worldwide
- Billions of dollars of processing volume annually
- More than 80% of American adults bought something on Stripe in 2017
- 1,700 people in 10 offices around the world
- Customers report 59% more developer productivity after deploying Stripe
- [stripe.com/jobs](https://stripe.com/jobs)

---

## Developer Productivity

- Testing
- Code
- Dev Env
- Abstractions
- Language Tools
- Docs
- Platform Teams
- Etc.

Note:

- I'm the Tech Lead

---

## Ruby at Stripe

- Ruby is the primary programming language
  - Enforced subset of Ruby (Rubocop!)
  - Not using Rails
- Most product code is in a monorepo (intentionally!)
  - ~10 macroservices with a few microservices
  - New code mostly goes into an existing service

Note:

- Millions of lines of Ruby

---

## Scale of Engineering at Stripe

- Millions of lines of code
- Hundreds of engineers
- Thousands of commits per day

Note:

- Top languages
- Most product engineers use Ruby.
- Next language is 2% - bash

---

## Collaborators

- **Jeff Foster** (PLUM) – RDL (type annotations for stdlib!)
- **@charliesome** (GitHub) – Ruby parser
- **@soutaro** – Steep
- **@mame** – Type profiler

---

- About Stripe

- **Adopting Sorbet at Stripe**

- Editor Tools for Sorbet

- Announcements

- Sorbet Tooling

---

### Sorbet at Stripe Breakdown

- **8 months** building from scratch (Oct 2017 – May 2018)
- **7 months** rolling out (Jun 2018 – Dec 2018)
- **4+ months** on editor and OSS tooling (Jan 2019 – ···)

---

### Sorbet at Stripe Breakdown

- <span style="visibility: hidden;">**8 months** building from scratch (Oct 2017 – May 2018)</span>
- **7 months** rolling out (Jun 2018 – Dec 2018)
- <span style="visibility: hidden;">**4+ months** on editor and OSS tooling (Jan 2019 – ···)</span>

Note:

When adopting Sorbet at Stripe, we focused on identifying errors, and then
catching those errors in as many places as possible.

Let's look at three (of them many) kinds of errors we caught.

---

### Uninitialized constant errors

```ruby

class Hello

end

def main
  puts Helo.new
end

main
```

```console



❯
```

---

### Uninitialized constant errors

```ruby

class Hello

end

def main
  puts Helo.new
end

main
```

```console
❯ ruby hello.rb
hello.rb:7:in `main': uninitialized constant Helo (NameError)
Did you mean?  Hello
        from hello.rb:12:in `<main>'
```

---

### Uninitialized constant errors

```ruby
# typed: false
class Hello

end

def main
  puts Helo.new
end

main
```

```console
❯ ruby hello.rb
hello.rb:7:in `main': uninitialized constant Helo (NameError)
Did you mean?  Hello
        from hello.rb:12:in `<main>'
```

---

### Uninitialized constant errors

```ruby
# typed: false
class Hello

end

def main
  puts Helo.new
end

main
```

```console
❯ srb
hello.rb:7: Unable to resolve constant `Helo`
     7 |  puts Helo.new
               ^^^^
```

---

### 🎉 100% of Ruby files at Stripe!

```ruby
# typed: false
class Hello

end

def main
  puts Helo.new
end

main
```

```console
❯ srb
hello.rb:7: Unable to resolve constant `Helo`
     7 |  puts Helo.new
               ^^^^
```

---

### Undefined method errors

```ruby
# typed: false
class Hello
  def greeting; 'Hello, world!'; end
end

def main
  puts Hello.new.greet
end

main
```

```console



❯
```

---

### Undefined method errors

```ruby
# typed: false
class Hello
  def greeting; 'Hello, world!'; end
end

def main
  puts Hello.new.greet
end

main
```

```console
❯ ruby hello.rb
hello.rb:7:in `main': undefined method `greet'
Did you mean?  greeting
        from hello.rb:10:in `<main>'
```

---

### Undefined method errors

```ruby
# typed: true
class Hello
  def greeting; 'Hello, world!'; end
end

def main
  puts Hello.new.greet
end

main
```

```console
❯ ruby hello.rb
hello.rb:7:in `main': undefined method `greet'
Did you mean?  greeting
        from hello.rb:10:in `<main>'
```

---

### Undefined method errors

```ruby
# typed: true
class Hello
  def greeting; 'Hello, world!'; end
end

def main
  puts Hello.new.greet
end

main
```

```console
❯ srb
hello.rb:7: Method greet does not exist on `Hello`
     7 |  puts Hello.new.greet
               ^^^^^^^^^^^^^^^
```

---

### 🎉 80% of Ruby files at Stripe!

```ruby
# typed: true
class Hello
  def greeting; 'Hello, world!'; end
end

def main
  puts Hello.new.greet
end

main
```

```console
❯ srb
hello.rb:7: Method greet does not exist on `Hello`
     7 |  puts Hello.new.greet
               ^^^^^^^^^^^^^^^
```

---

### Types of method arguments

```ruby
# typed: true
class Hello
  def greeting; 'Hello, world!'; end
end

def main(hello)
  puts hello.greet
end

main(Hello.new)
```

```console



❯
```

---

### Types of method arguments

```ruby
# typed: true
class Hello
  def greeting; 'Hello, world!'; end
end

def main(hello)
  puts hello.greet
end

main(Hello.new)
```

```console
❯ ruby hello.rb
hello.rb:7:in `main': undefined method `greet'
Did you mean?  greeting
        from hello.rb:10:in `<main>'
```

---

### Types of method arguments

```ruby
# typed: true
class Hello
  def greeting; 'Hello, world!'; end
end
sig {params(hello: Hello).void}
def main(hello)
  puts hello.greet
end

main(Hello.new)
```

```console
❯ ruby hello.rb
hello.rb:7:in `main': undefined method `greet'
Did you mean?  greeting
        from hello.rb:10:in `<main>'
```

---

### Types of method arguments

```ruby
# typed: true
class Hello
  def greeting; 'Hello, world!'; end
end
sig {params(hello: Hello).void}
def main(hello)
  puts hello.greet
end

main(Hello.new)
```

```console
❯ srb
hello.rb:7: Method greet does not exist on `Hello`
     7 |  puts hello.greet
               ^^^^^^^^^^^
```

---

### 🎉 63% of method call sites at Stripe!

```ruby
# typed: true
class Hello
  def greeting; 'Hello, world!'; end
end
sig {params(hello: Hello).void}
def main(hello)
  puts hello.greet
end

main(Hello.new)
```

```console
❯ srb
hello.rb:7: Method greet does not exist on `Hello`
     7 |  puts hello.greet
               ^^^^^^^^^^^
```

---

### ⏪ Recap: What we achieved

- **100%** of files: catch uninitialized constant errors
- **80%** of files: potentially catch `NoMethodError`s
  - **63%** of method call sites: definitely catch `NoMethodError`s

Note:

- ... and these are *only a subset* of the errors we can catch!
- Proud of our progress, versus our peers, and how early stage we are
- We like to think our progress is because of how well designed Sorbet is

---

### What our users said



---

### What we learned

- Sorbet is powerful enough to fit many needs
- Stripe engineers want even faster feedback cycles
- Adding types to a codebase takes time

---

- About Stripe

- Adopting Sorbet at Stripe

- **Editor Tools for Sorbet**

- Announcements

- Sorbet Tooling

---

### VSCode

![](img/vscode.png)

Note:
- Don't say LSP

---

### Typo

![](img/typo.gif)

---

### Jump To Definition

![](img/jump2Def.gif)

---

### Autocomplete and Docs

![](img/autocompleteAndDocs1.gif)

---

## Try it yourself!

https://sorbet.run

(Works best on desktop)

---

### Code Browsing (by Sourcegraph)

![](img/sourcegraph.gif)

Note:

- What website is this?
- It is github!
- Beauty of our backend is it is generic
- Our friends over at Sourcegraph already have LSP support
- We gave them access to the Sorbet sourcecode and they took our webasm pipeline
  and exposed our `--lsp` mode and magically it worked!

---

- About Stripe

- Adopting Sorbet at Stripe

- Editor Tools for Sorbet

- **Announcements**

- Sorbet Tooling

---

## 🎉 Ruby 3 & Types!

- Ruby 3 stdlib will have ship with type definitions
- We're collborating closely with the Ruby core team
- See talks by **@matz**, **@soutaro**, and **@mame**

---

## 🎉 Open source soon!

- Already in Private Beta
  - 3 other core companies contributed code
  - 5 testing it as users
- Want in?
  - <sorbet@stripe.com>
  - Describe your setup (LOC? number of contributors?)

Note:
- Coinbase
- Shopify
- SourceGraph

---

## Why not open source yet?

- Philosophy: Make experience great
  - Slowly expand private beta
  - Mix of small, medium, and large codebases
  - Once the experience is good for a batch, ship it
- Date: Summer 2019
- https://stripe.com/blog

Note:
If the conference organizers had done it the same time as last year we might
have something else to announce :)

---

## 🎉 https://sorbet.org

We are releasing the docs today!

---

## 🎉 Open source tooling

Sneak peak:

```ruby
# Gemfile
gem 'sorbet', :group => :development
gem 'sorbet-runtime'
```

```bash
❯ srb init
...
```

```bash
❯ srb
No errors! Great job
```

Note:
- We are deploying using standard Ruby tooling

---

- About Stripe

- Adopting Sorbet at Stripe

- Editor Tools for Sorbet

- Announcements

- **Sorbet Tooling**

---

## Intialize

```bash
❯ srb init
👋 Hey there!
This script will get this project ready to use with Sorbet by
creating a `sorbet/` folder for your project. It will contain:

...

✅ Done!
This project is now set up for use with Sorbet.
```

---

## Typechecking

```bash
❯ srb
No errors! Great job.
```

---

## An Initialized Project

```bash
sorbet/
│ # Default options to passed to sorbet on every run
├── config
└── rbi/
    │ # Community-written type definition files for your gems
    ├── sorbet-typed/
    │ # Autogenerated type definitions for your gems
    ├── gems/
    │ # Things defined when run, but hidden statically
    ├── hidden-definitions/
    │ # Constants which were still missing
    └── todo.rbi
```

---

## `sorbet-typed` (by Coinbase)

https://github.com/sorbet/sorbet-typed/

> A central repository for sharing type defintions for Ruby gems

---

## DSL Extension (by Shopify)

```ruby
attribute my_id, :integer
```

becomes

```ruby
sig {returns(T.nilable(Integer))}
def my_id; end

sig {returns(T::Boolean)}
def my_id?; end

sig {params(new_value: T.nilable(Integer)).void}
def my_id=(new_value); end
```

Note:
- You can teach sorbet about your DSL

---

## Implementation

```ruby
attribute my_id, :integer
```

```bash
❯ srb tc --dsl-plugins plugins.yaml
```

```yaml
# plugins.yaml
attribute: my_id.rb
```

```ruby
# my_id.rb
prop, type = ARGV[5].gsub("attribute ", "").delete(":").split(",")

puts "sig {returns(T.nilable(#{type.upcase}))}"
puts "def #{prop}; end"
...
```

```ruby
sig {returns(T.nilable(Integer))}
def my_id; end
...
```

---

## Typechecking Rails

```
❯ rails new blog
```

<div style="height:400px">
![](img/rails_new.png)
</div>

---

## It typechecks!

```bash
❯ git grep -h typed: | sort | uniq -c
    2 # typed: false
  120 # typed: true
```

---

## Typechecking Rails

- Only needed 7 hand-written type signatures
- 1 new feature
- Most other signatures are autogenerated by reflection

---

## Closing

- Editors under active development
- Already in private beta with 8 folks
- Open sourcing soon™
- Using gems for deployment
- Rails works

---

# Thank you!

Brace yourselves, Sorbet is coming
