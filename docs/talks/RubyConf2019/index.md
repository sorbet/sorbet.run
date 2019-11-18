# Sorbet

## A type checker for Ruby 3 you can use today!

<img style="max-width: 350px; position: absolute; right: 0;" src="img/sorbet-logo-white-sparkles.svg">

<br>

Dmitry Petrashko – [@DarkDimius](https://twitter.com/DarkDimius)

Jake Zimmerman – [@jez_io](https://twitter.com/jez_io)

Note:

List of team members?

---

- **About Stripe**

- Why we built a type checker for Ruby

- The growing Sorbet community

---

## What is Stripe? 🤔

&nbsp;

> Stripe is a software platform for running a business
> online.

Note:

Startups you've never heard of as well as huge companies
like Facebook and Lyft use our APIs to accept payments from
anywhere and run their business online.

We really try to remove the barriers that make it hard to
start and operate a business. Our long term goal is to
increase the size of the internet economy because our
software has made it so much easier to run a business
online.

**Favorite part**: our users are developers

---

## 🔎 About Stripe

- More than **2,000 employees**

- Engineers in San Francisco, Seattle, Dublin, Singapore,
  and more...

- **We're hiring!** (interns and full time)

Note:

Come chat with us after!

---

## 🚀 Stripe prioritizes developer productivity

- "Break down obstacles to getting things done"

- Let them focus on product

Note:

- Local dev flow
- CI
- Universal abstractions / libraries
- Work with not against the tools
- Impact multiplier

---

## Stripe uses Ruby extensively 💎

- Ruby is our primary programming language

- Hundreds of engineers

- Millions of lines of code (monorepo)

- Thousands of changes to the monorepo per day

---

## 🗣 Context: Dev Productivity Survey

Responses from biannual eng-wide survey:

1. Too long to get feedback

2. Too long to grasp unfamiliar code

3. Too easy to accidentally break things

Note:

Run surveys every 6 months to find common pain points

---

## ➡️  What are our options?

- **Do nothing**: Opportunity cost (productivity, breakages)

- **Treat the symptoms of existing code**: New symptoms pop up

- **Rewrite everything**: 100s of engineers, all-or-nothing

- **Rewrite some things**: 10s(?) of engineers, partial impact

- **Type checker**: 3 engineers, incremental value in months

---

## ➡️  What are our options?

- <span style="opacity: 0.3;">**Do nothing**: Opportunity cost (productivity, breakages)</span>

- <span style="opacity: 0.3;">**Treat the symptoms of existing code**: New symptoms pop up</span>

- <span style="opacity: 0.3;">**Rewrite everything**: 100s of engineers, all-or-nothing</span>

- <span style="opacity: 0.3;">**Rewrite some things**: 10s(?) of engineers, partial impact</span>

- **Type checker**: 3 engineers, incremental value in months

---

## ... so we built Sorbet 🎉

- **Oct 2017** – Kickoff

- **Feb 2018** – First typed code

- **June 2018** – Enforced in CI for every Stripe engineer

- <span style="opacity: 0.3;">... lots of other stuff ...</span>

- **Jun 2019** – Open source!

Note:

Incremental value in months with only 3 people.

Rest of company didn't have to change or stop using Ruby.

---

- About Stripe

- **The problems we wanted Sorbet to solve**

- The growing Sorbet community

Note:

switch dmitry -> jez

---

## The problems we wanted Sorbet to solve

1. Too long to grasp unfamiliar code

2. Too long to get feedback

3. Too easy to accidentally break things


---

## 1. Too long to grasp unfamiliar code

```ruby
def self.find_card_similarity(merchant:)

  similarity_data = SimilarityDB.fetch(merchant)

  similarity_data ||= []

  process_similarity_data(similarity_data, merchant)
end
```

Hundreds of engineers means ~all code is unfamiliar

---

## 1. Too long to grasp unfamiliar code

```ruby
def self.find_card_similarity(merchant:)
  # Is `merchant` a string ID, or a Models::Merchant instance?
  similarity_data = SimilarityDB.fetch(merchant)

  similarity_data ||= []

  process_similarity_data(similarity_data, merchant)
end
```

Hundreds of engineers means ~all code is unfamiliar


---

## 1. Too long to grasp unfamiliar code

```ruby
def self.find_card_similarity(merchant:)
  # Is `merchant` a string ID, or a Models::Merchant instance?
  similarity_data = SimilarityDB.fetch(merchant)
  # Is `similarity_data` ever actually falsy? Why?
  similarity_data ||= []

  process_similarity_data(similarity_data, merchant)
end
```

Hundreds of engineers means ~all code is unfamiliar

---

## 2. Too long to get feedback

- **All tests, locally**: days
- **All tests, in CI**: 10 – 20 minutes
- **One keystroke**: ~50 milliseconds

Already have massively parallel distributed CI test runner

Note:

If you know the tests that might fail, you can run those
locally (~seconds – ~minutes).

But a huge strength of a monorepo is confidence from running
**all** the tests.

---

## 3. Too easy to break things

```ruby
def self.find_card_similarity(merchant:)
  # Is `merchant` a string ID, or a Models::Merchant instance?
  similarity_data = SimilarityDB.fetch(merchant)
  # Is `similarity_data` ever actually falsy? Why?
  similarity_data ||= []

  process_similarity_data(similarity_data, merchant)
end
```

"I want to change this code!"

... is it enough if the **tests** pass?

... is it enough if the QA / canary **deploys** have no errors?

Note:

Some code paths only tested monthly! (Subscriptions)

Some code paths only tested yearly! (Taxes)

---

## 🤔 Does Sorbet fix these things?

→ Demo

([sorbet.run](https://sorbet.run))

---

<iframe style="position: fixed; top: 0; right: 0; left: 0; bottom: 0; width: 100%; height: 100%;" src="https://sorbet.run/#%23%20typed%3A%20true%0A%0Amodule%20Risk%3A%3AMerchantSimilarity%0A%0A%0A%0A%0A%20%20def%20self.find_card_similarity(merchant%3A)%0A%20%20%20%20similarity_data%20%3D%20SimilarityDB.fetch(merchant)%0A%20%20%20%20similarity_data%20%7C%7C%3D%20%5B%5D%0A%0A%20%20%20%20result%20%3D%20process_similarity_data(similarity_data%2C%20merchant)%0A%20%20%20%20result%0A%20%20end%0A%0A%0A%0A%0A%0A%0A%0A%20%20sig%20do%0A%20%20%20%20params(%0A%20%20%20%20%20%20similarity_data%3A%20T%3A%3AArray%5BRawSimilarityData%5D%2C%0A%20%20%20%20%20%20merchant%3A%20String%0A%20%20%20%20)%0A%20%20%20%20.returns(SimilarityRecord)%0A%20%20end%0A%20%20def%20self.process_similarity_data(similarity_data%2C%20merchant)%0A%20%20%20%20raise%20%22Unimplemented%22%0A%20%20end%0Aend%0A%0Amodule%20Risk%3A%3AMerchantSimilarity%0A%20%20module%20SimilarityDB%0A%20%20%20%20%23%20Loads%20similarity%20data%20from%20the%20database%20for%20%60merchant%60%0A%20%20%20%20%23%0A%20%20%20%20%23%20Returns%20%60nil%60%20if%20no%20similarity%20data%20has%20been%20registered%20for%20this%20merchant%20yet.%0A%20%20%20%20sig%20%7Bparams(merchant%3A%20String).returns(T.nilable(T%3A%3AArray%5BRawSimilarityData%5D))%7D%0A%20%20%20%20def%20self.fetch(merchant)%0A%20%20%20%20%20%20raise%20%22Unimplemented%22%0A%20%20%20%20end%0A%20%20end%0Aend%0A%0A%0Amodule%20Risk%3A%3AMerchantSimilarity%0A%20%20class%20RawSimilarityData%20%3C%20T%3A%3AStruct%0A%20%20%20%20%23%20Unimplemented%0A%20%20end%0A%0A%20%20class%20SimilarityRecord%20%3C%20T%3A%3AStruct%0A%20%20%20%20prop%20%3Amerchant%2C%20Models%3A%3AMerchant%0A%20%20%20%20prop%20%3Aaccount_application%2C%20Models%3A%3AAccountApplication%0A%20%20%20%20prop%20%3Aintersection_count%2C%20Integer%0A%20%20end%0Aend%0A%0Aclass%20Models%3A%3AMerchant%0A%20%20%23%20Unimplemented%0Aend%0A%0Aclass%20Models%3A%3AAccountApplication%0A%20%20%23%20Unimplemented%0Aend%0A%0Aclass%20Module%0A%20%20include%20T%3A%3ASig%0Aend"></iframe>

---

## Recap: Key benefits of Sorbet 💡

1. Too long to grasp unfamiliar code
  - → Types make code easier to grasp
2. Too long to get feedback
  - → Sorbet is as fast as you can type
3. Too easy to accidentally break things
  - → One more tool to reduce brittle code

---

- About Stripe

- The problems we wanted Sorbet to solve

- **The growing Sorbet community**

Note:

switch jez -> dmitry

---

## 🎉 Ruby 3 & Types!

- Ruby 3 stdlib will ship with type definitions.

- We're collaborating closely with the Ruby core team

- See more details in talks by Matz, Yusuke Endoh and us @ RubyKaigi 2019

---

## Contributions 📈

- **800** pull requests commits since open source

- **135** total contributors
  - 10: current / former sorbet team
  - 30: Stripe employees
  - 85: non-Stripe employees

---

## Open source contributions

- **@alexsnaps**
  - Parser support for Ruby 2.5
- **@iliabylich**
  - Parser support for Ruby 2.6
- **@univerio**
  - Docs for Ruby stdlib into Sorbet's RBIs

... and many more!

---

## Gem support

- 117 pull requests: types for Ruby stdlib

- 114 pull requests: types for gems

- 23 external contributors to [sorbet-typed]
  - 85% of commits from community contributors!

[sorbet-typed]: https://github.com/sorbet/sorbet-typed

Note:

fun fact: dmitry doesn't have a single commit to
sorbet-typed :P

---

## Related projects

- [sorbet-rails]
  - All-in-one support for Rails with Sorbet
- [Sord]
  - Generates Sorbet types from YARD annotations
- [Parlour]
  - Framework for writing Sorbet plugins

[sorbet-rails]: https://github.com/chanzuckerberg/sorbet-rails
[Sord]: https://github.com/AaronC81/sord
[Parlour]: https://github.com/AaronC81/parlour

---

## What people say

---

![](img/jerry-dude-types-are-so-amazing.png)

---

![](img/oss-malmberg-missed-it-so-much.png)

---

![](img/jmduke-kid-on-christmas-morning.png)

---

TODO roadmap / what's next / goals

call to action of some sort?


---

## What's next? 🚀

- Invest heavily in editor tools

- Make it even faster

- Implement most-needed language features

---

# Questions❓

---

## Thanks for coming!

- We're hiring ([stripe.com/jobs](https://stripe.com/jobs))

- Feel free to chat with us after


<!-- vim:tw=60
-->
