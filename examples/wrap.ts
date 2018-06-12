import {cancel, cancelable} from '../src/regrettable';
import {randomAsync} from "./helpers";

// Line I will be executed:
const randomPromise = randomAsync();

const wrappedRandomPromise = cancelable(randomPromise);

wrappedRandomPromise.then(randomNumber => {
    // Line V:
    console.log("Got random number:", randomNumber);
});

// Lines II and III will both eventually be executed, but not line V:
cancel(wrappedRandomPromise);
