# Regrettable
A JS/TS async operations cancellation module over native promises (does not exist yet).

## Background
Itay is using Bluebird promises in his project. While he enjoys the API in general, the main 
reason for not switching to native promises is its sound and useful cancellation API.

He loves using async/await but cannot use Node's native support for async functions - 
it breaks the cancellation propagation of Bluebird promises.

Since he is also using TypeScript (for many reasons), a solution was found in 
[cancelable-awaiter](https://www.npmjs.com/package/cancelable-awaiter) that makes Bluebird 
cancellation work in conjunction with async functions - as long as they are transpiled by 
TypeScript instead of being used natively.

There is willingness from Node/v8 [Citation Needed]() to expose hooks that enable 
experimentation with cancellation APIs for (at least) async functions over native promises 
(i.e. without a dependency on Bluebird).

## Motivation
Itay would like to switch to native promises as long as he gets reasonable cancellation 
features. His idea is to create a module that depends on a minimal set of hooks that may 
be later exposed by Node and provide a minimal viable API for aborting async operations.

An additional requirement is that the hooks could be added to TypeScript **_today_** 
(similar to the way the `cancelable-awaiter` module enabled cancellation propagation) 
so that he can switch to native promises right away and, hopefully, in the future switch to
down-level async functions when similar hooks will be exposed by Node.

## API by example
This is a draft of how the API should work, using simple examples:
