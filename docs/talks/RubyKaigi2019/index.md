# Introductions

Note:

- jez: Carnegie Mellon grad, previous experience rolling out Flow at Stripe.
- pt: Stanford grad, Previously at Facebook on HHVM and Hack
PT starts talking here

---

- **About Stripe**

- Adopting Sorbet at Stripe

- Editor tools for Sorbet

- The Road to Open Source

---

## Stripe

- Platform that developers use to accept payments
- 32 countries, millions of business worldwide
- Billions of dollars of processing volume annually
- 80% of adults in US bought something on Stripe last year
- 1,700 people in 10 offices around the world
- If you're running an internet business, check us out
- stripe.com/jobs

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

- Context
- Not overhead

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

## Other ruby typing

- RDL by Jeff Foster and students
- Adopted GitHub Ruby parser by @charliesom

Note:

- Diamondback Ruby
- RDL Jeff Foster Maryland
- Charlie Somerville at GitHub

---

- About Stripe

- **Adopting Sorbet at Stripe**

- Editor tools for Sorbet

- The Road to Open Source

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
Notes:
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

- **Editor tools for Sorbet**

- The Road to Open Source

---

### VSCode

![](img/vscode.png)

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

<div style="height: 400px">
![](img/qrcode.png)
</div>

---

### Code Browsing (by Sourcegraph)

![](img/sourcegraph.gif)

Note:

- Beauty of LSP support is it is cross editor
- Our friends over at Sourcegraph already have LSP support
- We gave them access to the Sorbet sourcecode and they took our webasm pipeline
  and exposed our `--lsp` mode and magically it worked!

---

- About Stripe

- Adopting Sorbet at Stripe

- Editor tools for Sorbet

- **The Road to Open Source**

---

## Ruby 3 will have Types!

- We are very happy to be a part of its development
- See talks by Matz, Soutarosan and Endosan
- Will not have inline definitions
- Will have have side `.rbi` files
- Close to but not quite Ruby format
- Sorbet will understand both `.rbi` formats

---

## Sorbet open source?

- Yes! Soon.
- Already in Private Beta
  - 3 other companies contributed code
  - 5 testing it as users
- Want in?
  - sorbet@stripe.com

---

## Announcement: Docs!

http://sorbet.org

---

## Gemfile

```ruby
  gem 'sorbet', :group => :development
  gem 'sorbet-runtime'
```

---

## `srb init`

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
## `srb`

```bash
❯ srb
No errors! Great job.
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
sig { returns(T.nilable(::Integer)) }
def my_id; end

sig { returns(T.any(::TrueClass, ::FalseClass)) }
def my_id?; end

sig { params(new_value: T.nilable(::Integer)).void }
def my_id=(new_value); end
```

---

## Rails ActiveRecord

```ruby
class Product < ApplicationRecord
  attribute :shop_id, :big_integer
  attribute :name, :string
  attribute :created_at, :datetime
  attribute :updated_at, :datetime

  belongs_to :shop, inverse_of: :products
  has_many :variants
end
```

---
## Implementation
```ruby
gen :bird
```
```ruby
method_name = ARGV[5].gsub("gen ", "").delete(":")
constant_name = method_name.dup
constant_name[0] = constant_name[0].upcase

puts "def #{method_name}; end"
puts "#{constant_name} = true"
```
```ruby
def bird; end
Bird = true
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
   2 # typed: autogenerated
   2 # typed: false
  82 # typed: true
  17 # typed: strict
  19 # typed: strong
```

---

## New feature: `bind`

```ruby
class Rails::Application
  sig do
    params(
        blk: T.proc.bind(Rails::Application).void
    )
    .void
  end
  def configure(&blk); end
end
```

---

## Typechecking Rails

- Only needed 7 hand-written type signatures
- 1 new feature
- Most other signatures are autogenerated by reflection

---

## Roadmap

TODO

---

## Closing

- Already in private beta
- Open sourcing RealSoonNow
- Editors under active development
- Roadmap

---

# Thank you!

sorbet@stripe.com
