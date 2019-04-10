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
- [stripe.com/jobs](http://stripe.com/jobs)

Note:

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

- Stdlib annotations from RDL by Jeff Foster and students
- Ruby parser from Github by @charliesom
- Steep by Soutaro
- Type profiler by Endo

---

- About Stripe

- **Adopting Sorbet at Stripe**

- Editor Tools for Sorbet

- Announcements

- Sorbet Tooling

---

### Usage stats at Stripe

- **7 month** roll out (June 2018 – December 2018)
- **100%** of files report constant-related errors
- **80%** of files report method-related errors
- **63%** of call sites have a type

---

### 100% of files report constant-related errors

```ruby
  # typed: false

  class Hello; end

  Helo.new
# ^^^^ error: Unable to resolve constant: `Helo`
```

<!--
Note:
The alternative to this would be to ignore the file entirely.
-->

---

### `# typed: false`

```ruby
# typed: false

def main
  [].to_hash

end
```

---

### `# typed: true`

```ruby
# typed: true

def main
  [].to_hash
# ^^^^^^^^^^ error: Method `to_hash` does not exist
end
```

---

### 80% of files report method-related errors

```ruby
# typed: true

def main
  [].to_hash
# ^^^^^^^^^^ error: Method `to_hash` does not exist
end
```

---

### Untyped call sites

```ruby
  # typed: true


  def foo(x)
    x.to_hash

  end
```

---

### Typed call sites

```ruby
  # typed: true

  sig {params(x: T::Array[[Symbol, String]])}
  def foo(x)
    x.to_hash
  # ^^^^^^^^^ error: Method `to_hash` does not exist
  end
```

---

### 63% of call sites have a type

```ruby
  # typed: true

  sig {params(x: T::Array[[Symbol, String]])}
  def foo(x)
    x.to_hash
  # ^^^^^^^^^ error: Method `to_hash` does not exist
  end
```

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

## Ruby 3 will have Types!

- We are very happy to be a part of its development
- See talks by Matz, Soutarosan and Endosan
- Stdlib will have official type definitions

---

## Sorbet open source?

- Yes! Soon.
- Already in Private Beta
  - 3 other core companies contributed code
  - 5 testing it as users
- Want in?
  - sorbet@stripe.com
  - Tell us about your LOC and number of contributors

Note:
- Coinbase
- Shopify
- SourceGraph

---

## Why not open source yet?

- Philosophy: Ship something good
- Add more beta folks in batches
- Mix of small, medium, and large codebases
- Once the experience is good for a batch, ship it
- This summer
- https://stripe.com/blog

Note:
If the conference organizers had done it the same time as last year we might
have something else to announce :)

---

## http://sorbet.org

We are releasing the docs today!

---

## Gemfile

```ruby
gem 'sorbet', :group => :development
gem 'sorbet-runtime'
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
## Files

```bash
sorbet/
# Default options to passed to sorbet on every run
├── config                      
└── rbi/
# Community writen type definition files for your gems
		├── sorbet-typed/
# Autogenerated type definitions for your gems (from reflection)
		├── gems/
# All definitions at runtime, but Sorbet couldn't see statically
		├── hidden-definitions/
# Constants which were still missing
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
