import {cancel, cancelable} from '../src/regrettable';
import {cancelableRandomAsync, randomAsync} from "./helpers";

const delegate = cancelable(async doSomethingAsync => {
    await doSomethingAsync();
});

// Line I will be executed:
const cancelablePropagatingRandomPromise = delegate(cancelableRandomAsync);

// Only line III will be executed:
cancel(cancelablePropagatingRandomPromise);

// Line I will be executed:
const cancelableNonPropagatingRandomPromise = delegate(/* non-cancelable version: */randomAsync);

cancelableNonPropagatingRandomPromise.then(randomNumber => {
    // Line IV:
    console.log("Got random number:", randomNumber);
});

// Lines II and III will both eventually be executed, but not line IV:
cancel(cancelableNonPropagatingRandomPromise);
