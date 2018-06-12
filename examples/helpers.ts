import {cancelable} from '../src/regrettable';

// Normal async function cannot be canceled:
export async function randomAsync() {
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
export const cancelableRandomAsync = cancelable(randomAsync);
