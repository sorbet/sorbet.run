Welcome! My name is Jake, I'm joined today by Getty, and for the better half of the last decade we've worked on Stripe's Ruby Infrastructure team, where we've spent a lot of time dealing with a large, stubborn Ruby codebase.

One thing we've noticed in that time, is that stubborn codebases rack up all sorts of complaints about them as time goes on.

For example, people say things like "our code isn't modular enough" because the it's hard to untangle one piece without it seeming like you have to untangle everything at once.

You'll find people noticing "this dependency is 10 years out of date" because that dependency is so pervasive, and over the years, different pieces of code have started to depend on every imaginable implementation detail of that dependency.

Another common observation is "we need to change how we talk to the database!" Maybe you need to retroactively shard the data somehow. Maybe you have multiple services all talking to one data store, but want to make each service have its own database. Maybe you're trying to change the database to make it faster. In a stubborn codebase, one of the most pervasive assumptions is that there's only ever be one way to talk to the database.

I could keep going on like this for hours listing about all sorts of complaints, but I'm sure you've got your own coming to mind right about now.

But on our team, we're pretty optimistic: we believe it's basically always possible to refactoring the codebase to fix these complaints.

Specifically, we believe that is almost always possible for **one team** to refactor the codebase to that better state. The alternative would be to just declare "this is the ideal end state" of some refactor, and then instruct individual teams or the entire organization to figure out how to get from here to there.

We're kind of going to take this as a given, that it's better to centralize large migrations to one team, but for context there are a couple reasons why we operate this way.

The first is that having one team drive a migration will concentrate expertise. If 10 teams go out and try to refactor their code, they're going to run into the same problem 10 times, and each have to figure out what to do about it. But with one team driving a refactor, by the second or third time that problem comes up, the team will be really good at figuring out how to deal with it.

And specifically, with all this expertise concentrated among the team, it makes automation easier. We want to incentivize automating the migration, because it'll mean that fewer man hours overall are spent running the migration, so the organization as a whole gets more stuff done.

And finally having one team drive a migration means it's way more likely to finish at all. Spreading the burden of a refactor across many teams means having to wait for each team to decide when or whether to get around to the work. Since the whole reason to do the refactor in the first place was probably to unblock some other work, that means a lot of time waiting for the work to finish. We may as well centralize the migration and go do the work instead of sitting around idle.

So what we really want to talk about today are two things that make a centralized migration successful.

The first is leverage over the codebase. Leverage is so much of a buzz word that people have forgotten what it means, but really it's about using a small driving force to have a large effect on a system. Without leverage over a codebase, there's no way that a small team can carry out a large refactor. So "how can I build that leverage" is our first talking point.

The second thing a centralized migration needs is some way to ratchet incremental progress. A centralized refactor is going to take fewer man hours overall, but it'll be spread over a long time overall. While the refactor is happening there's gonna be plenty of chances for our progress to be undone by accident unless there's a mechanism in place to prevent backsliding. And specifically, it's not enough to just have some way to ratchet progress: it has to be a **good ratchet**, and we'll talk about what makes a good ratchet later on.

So to say that one more time: our thesis in this talk is that to successfully refactor a large, stubborn codebase, you need to **have** a point of leverage and to **pick** good ratchets.

The rest of the talk we'll drive this point home by exploring two of the large refactors that the Ruby Infrastructure team at Stripe has run over the years. I'll start with a discussion of how we refactored Stripe's codebase to make developers happier using Sorbet, and then Getty will discuss how we're taking Stripe's Ruby monolith and making it more modular.

Before we get too far into the specifics, I want to introduce Sorbet. Sorbet is a fast, powerful type checker for Ruby that we built at Stripe. It's completely open source and has all sorts of docs in case you want to try it out on your own Ruby codebase. And it has three headline features:

First, it's fast. To our knowledge, Stripe's Ruby codebase is the largest in the world, which meant we had no choice but to make this type checker fast enough to handle a huge codebase.

Second, you can use it in your IDE. Not only will it show you errors, but you can use it to jump to definition, find all reference, get autocompletion results, and apply quick fixes, etc. We've found that while lots of people are still skeptical about introducing static typing, basically everyone likes fast, powerful editor tooling, so Sorbet's IDE integration is a critical part of pitching Sorbet to get adopted in untyped codebases.

And finally, Sorbet is gradual, which means that it's designed to be able to take a completely untyped Ruby codebase and introduce Sorbet piece by piece. It adds value even if you only use it a little bit, and gets better the more you lean into it.

But we didn't build Sorbet because we felt like it. We built it because in 2017, Stripe's developers were very unhappy with the state of the codebase. Every six months at Stripe we run a survey of all developers and ask them to talk about what they're happy and unhappy with.

They said things like "the code is hard to understand" because given the size of the codebase, there was always some corner of it that would be foreign to you.

Another complaint was that we had so many tests that it was no longer possible to run them all locally. You had to push your change and wait 5 or 10 minutes before learning whether you broke something.

Despite that sheer volume of tests, people still noticed that it was common to have things break only in production, not getting caught by tests!

That meant that people couldn't trust the docs, because it was by following the docs that the production problems happened in the first place.

And overall, people complained that it seemed like the code in general was poor quality and haphazard, leading to this vicious cycle.

We set out to fix this by refactoring the code.

Step one: we needed a point of leverage and **this** is why we built Sorbet: to provide that leverage. Building Sorbet represented a comparatively small force (we'll talk about how small in a minute) but one which let us make a huge impact on the codebase. Going through our previous complaints:

Building Sorbet made the codebase easier to understand, because it could power an IDE that let people navigate through the codebase more precisely than before.

Where before people spent all their time waiting for tests, now they had a tool that that could run locally in just a few seconds and showed them a list of problems before having to push to CI.

Simply having type checking eliminated whole class of errors from production, like "you typo'd the name of a class" is a runtime exception that just doesn't happen at Stripe anymore. Other kinds of errors aren't quite gone but are incredibly rare, like "you typo'd a method name," and these get more rare as people write more type annotations.

These type annotations then became a sort of machine-checked documentation, especially so because the annotations are also checked at runtime, meaning that the type annotations are incredibly trustworthy. If you open up a file and see a type signature on a method, there is every reason to believe it, unlike any nearby comments.

And somewhat more subtly, Sorbet set a baseline for code quality. Specifically: if it's hard or annoying to write a type annotation for a method, chances are that's because the method is complicated and poor quality. Finding a way to add types often means simplifying the code outright.

So clearly Sorbet let us make a huge positive impact on the codebase—but you might ask: "was it really a small effort?"

We started working on Sorbet in the fall of 2017, at a time when there were a couple hundreds engineers at Stripe. It took 9 months to build Sorbet, and then another 3 months to get 75% of files opted into type checking. That's probably less time than you might have thought! In 2017 if you had asked me to guess how long it'd take, I'd have been answering in years, not months.

This is kind of a whole nother rant, but in general one thing I've learned: you're probably overestimating how hard it is to build new, language-level static analysis tooling. At the end of the day, type checkers are still just programs, and I bet that if you're here, you're good at writing programs! Even if you don't go all the way to building a type checker, building a new lint rule or building some static analysis pass with your programming language's toolchain is something that people consider out of reach when they absolutely don't have to.

So that's enough on leverage, let's talk about ratcheting. In Sorbet, the way ratcheting works is that there's a `# typed:` comment at the top of every file, specifying the typed level.

At typed false, Sorbet only validates syntax and resolves constant names.

At typed true, Sorbet also runs type inference in methods using whatever type annotations it has, if any.

And at typed strict, every method needs an explicit signature, even if the signature declares that the method is effectively untyped.

The `# typed` level behaves like a ratchet because it's easy to go up a level (just change the comment, fix the errors, and you're set), but there's friction preventing the level sliding back down. At Stripe, that friction came from code review: if you try to make a PR that drops the `# typed` level of a file, your reviewer is going to grill you on why you've chosen to do that, instead of just fixing or even silencing the individual type errors.

Thanks to the power of `iframe` and WebAssembly, I can actually walk you through an example of this process.

Here we've got a Ruby file. It's trying to open a file, write a line to it, an close it, while printing a warning message if that process fails. The first step of adopting Sorbet is to put `# typed: false` at the top. As soon as we do that, Sorbet tells us that this `IoError` constant doesn't exist. This was a super common class of problem we found while rolling out Sorbet: the happy path works, but the error path is a ticking time bomb that hasn't been tripped in production yet.

You'll notice that in this `rescue` clause, which is the way Ruby writes `try` / `catch` exception handling blocks, the snippet doesn't re-raise the caught exception: it was trying to silence the error and print a warning so that control could continue. But because of this typo, the first time an `IOError` is actually raised, we're going to hit this typo and the Ruby VM will raise an (uncaught!) `NameError` for the unknown constant name.

Fixing this is pretty easy, thanks to Sorbet's quick fix code action: the error message shows us that there's a fix available, and we can use the IDE to accept the suggested fix. This is how a ratchet works: it's easy to turn the crank in the right direction, and once we've fixed all the errors, we can lock in that incremental progress.

But we're not done yet: let's see what happens when we kick it up to `# typed: true`. This time, we see that the `log` method doesn't actually exist: in Ruby, the name of the method to write a line of text is called `puts`, so we can fix that one too.

But earlier I said it's not enough to just have a ratchet when refactoring: you have to have good ratchets. Sorbet's typed comments are good because they're local, incremental, and actionable. To see what I mean, let's consider some alternative ways we could have ratcheted our progress adopting Sorbet.

Instead of by file, we could have done by folder. This would not have been local: it would have been hard to confirm, when looking at a piece of code, whether Sorbet would apply to it—you'd have to traipse up through the directory hierarchy to find some config file and see whether that slice of the codebase opted into typing.

Also, doing it by folder would not have been incremental enough. It's a huge lift to have to add signatures to literally every method in a folder before locking in that progress, vs just adding signatures a single file.

Another alternative would have been to use some sort of "type coverage" percentage, like "60% of the lines in this file are covered by the type checker," and then couple this with some check that the coverage percentage can only go up. This ratchet is hard to action. For one, just deleting typed code makes the coverage percentage drop. Ideally, deleting code never penalizes you.

Another problem is that if you need to call a method owned by some other team who haven't added types to their code yet, it's kind of punishing for you to be blocked from calling their method until you go add types to it on their behalf. So because of this, coverage percentage ratchets are hard to action.

By contrast, the `# typed` comment is local (just check the top of the current file), incremental (only have to think about the file you have open), and actionable (because all the problems you'll encounter by upgrading a file will be within your power to fix).

I actually want to drill in a little more on what makes `# typed` comments actionable. An actionable ratchet is high signal, low noise. If the ratchet points to the problem, it should be the root cause, and within your power to fix. This is why Sorbet reports constant resolution errors at `# typed: false` but no method errors at `# typed: true`. In this snippet, the parent class does not exist

The ratchet should only stop you from doing bad things and things that are within your power to fix. This is why "method does not exist" errors are at `# typed: true`, not `# typed: false`. In this example, the call to `method_on_parent` might actually be okay, but it's currently being masked by the fact that Sorbet can't resolve the parent class.

The idea is that we fix all the `# typed: false` errors first, because those are the most pressing. Only after that do we deal with the `# typed: true` errors, because those rely on being rid of any problems causing constants to fail to resolve.

So let's not get ahead of ourselves and start with `false`. Now the only error is the constant resolution error, we'll fix that, and pause to notice that at this point, we *could* lock in this incremental progress right now!

But we'll keep going and push it back up to `true`. Now, notice that the error has changed: instead of saying "method does not exist," it says "not enough arguments!" That's a high-signal error, vs the noisy error that you'd have gotten if we'd tried to lump all method-related errors together with constant-related errors. The `# typed` level makes for an actionable ratchet mid-migration.


So to sum that up, developer satisfaction improved because we refactored a large, stubborn codebase by building Sorbet to be a point of leverage, and picking `# typed:` comments to be a good ratchet.

Next, I'm going to hand it off to Getty, and he's going to talk about the same ideas, but in the context of making Stripe's Ruby monolith more modular. So while the ideas are the same, some of the specific choices of how to cultivate leverage and what ratchets to pick are way more subtle and non-obvious. He'll tell you all it.


<!-- vim:tw=0
-->
