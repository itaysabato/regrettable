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
be later exposed by Node and provide a minimal viable API for canceling async operations.

An additional requirement is that the hooks could be added to TypeScript **_today_** 
(similar to the way the `cancelable-awaiter` module enabled cancellation propagation) 
so that he can switch to native promises right away and, hopefully, in the future switch to
native async functions when similar hooks will be exposed by Node.

**Note:** TypeScript implementation must work in ES5 compliant browsers as well.

## API by example
This is a draft of how the API should work, using simple examples.

### Opt-in
Cancellation of async functions is opt-in: 

```typescript
import {cancelable, cancel} from 'regrettable';

// Normal async function cannot be canceled:
async function randomAsync() {
    // Line I:
    console.log("Generating a random number...");

    try {
        const randomNumber = await Math.random();
        // Line II:
        console.log("Generated a random number:", randomNumber);

        return randomNumber;
    }
    finally {
        // Line III:
        console.log("Cleaning up...");
    }
}

// Same as randomAsync but can be canceled:
const cancelableRandomAsync = cancelable(randomAsync);

// Line I will be executed:
const cancelableRandomPromise = cancelableRandomAsync();

// Only line III will be executed:
cancel(cancelableRandomPromise);

// Line I will be executed:
const randomPromise = randomAsync();

// Does nothing (TBD - or throws, or issues warning):
cancel(randomPromise);
// Lines II and III will both eventually be executed.
```

### Propagation
When cancelable functions are composed, the cancel signal propagates upstream:

```typescript
const delegate = cancelable(async doSomethingAsync => {
    await doSomethingAsync();
});

// Line I will be executed:
const cancelablePropagatingRandomPromise = delegate(cancelableRandomAsync);

// Only line III will be executed:
cancel(cancelablePropagatingRandomPromise);
```

However, since cancellations are opt-in, the cancel signal **_does not propagate_**
to non-cancellable functions. Instead, it simply suppresses subsequent `onFulfilled` and
`onRejected` (**_and_** `onFinally`) callbacks:

```typescript
// Line I will be executed:
const cancelableNonPropagatingRandomPromise = delegate(/* non-cancelable version: */randomAsync);

cancelableNonPropagatingRandomPromise.then(randomNumber => {
    // Line IV:
    console.log("Got random number:", randomNumber);
});

// Lines II and III will both eventually be executed, but not line IV:
cancel(cancelableNonPropagatingRandomPromise);
```

### Promises are not cancelable
Though, in the examples above, we repeatedly invoked statements such as `cancel(promise)`
the fact is that the promises themselves were not canceled (as they are merely placeholders
for values) but the underlying async function that produced them directly was canceled.

By default, calling `cancel(promise)` with an arbitrary promise instance would have no
effect (TBD - perhaps a warning or an error). As a convenience, one can _wrap_ a
promise with a cancelable async function in the following way:

```typescript
const wrappedRandomPromise = cancelable(randomPromise);

wrappedRandomPromise.then(randomNumber => {
    // Line V:
    console.log("Got random number:", randomNumber);
});

// Lines II and III will both eventually be executed, but not line V:
cancel(wrappedRandomPromise);
```

Note that the above code does not make `randomPromise` truly cancelable in any sense,
it simply _wraps_ the promise in order to allow the consumer to "unregister" from it.

## Required Hooks
The API presented above could be implemented, provided the following hooks are exposed:

```typescript
export type asyncFunctionHooks = {
    /**
     * Called right before an async function returns a its promise (retPromise).
     * If a promise (or anything else) is returned, it will replace the retPromise
     * as the return value of the async function.
     *
     * @param retPromise The promise about to be returned by the async function.
     * @param controller A unique controller object coupled with the underlying async function.
     * @return A replacement promise for retPromise or undefined to keep it.
     */
    onReturn(retPromise: Promise<any>, controller: Controller): Promise<any> | undefined

    /**
     * Called when an async function pauses execution and awaits a value or a promise.
     * If a promise (or anything else) is returned, it will replace the awaitedValue as
     * the subject of awaiting.
     *
     * Note that when the async function returns a value (which can also be a promise
     * that is pending) this hook will be called as well.
     *
     * @param controller The unique controller object coupled with the underlying async function.
     * @param awaitedValue The value or promise that will be awaited for.
     * @return A replacement promise or value for awaitedValue or undefined to keep it.
     */
    onAwait(controller: Controller, awaitedValue: any): any
}

export type Controller = {
    /**
     * Basically the same effect Generator.prototype.return has on generator functions.
     */
    return(value?: any): {done?: boolean, value?: any}
}

```

## FAQ
**_TBD_**
