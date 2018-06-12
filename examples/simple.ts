import {cancel} from '../src/regrettable';
import {cancelableRandomAsync, randomAsync} from "./helpers";

// Line I will be executed:
const cancelableRandomPromise = cancelableRandomAsync();

// Only line III will be executed:
cancel(cancelableRandomPromise);

// Line I will be executed:
const randomPromise = randomAsync();

// Does nothing (TBD - or throws, or issues warning):
cancel(randomPromise);
// Lines II and III will both eventually be executed.
