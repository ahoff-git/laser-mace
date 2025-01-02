import { log, logLevels } from "./logging";

/**
 * Generates a random number within the specified range, supporting precision.
 * 
 * - If `decimals` is provided, the result is rounded to that many decimal places.
 * - If `decimals` is not provided, the precision is derived from the decimal places of the `low` and `high` inputs.
 * 
 * @param {number} low - The minimum value (inclusive) of the range.
 * @param {number} high - The maximum value (exclusive) of the range.
 * @param {number | null} [decimals=null] - The number of decimal places to round to. If not provided, precision is derived automatically.
 * @returns {number} - A random number between `low` and `high`, rounded to the specified or derived precision.
 * 
 * @example
 * // Example 1: Whole number output
 * rng(1, 10); // Could return 7
 * 
 * @example
 * // Example 2: Fixed decimal places
 * rng(1.5, 3.5, 2); // Could return 2.78
 * 
 * @example
 * // Example 3: Automatically derived precision
 * rng(0.001, 0.1); // Could return 0.023 (3 decimal places derived)
 */
export function rng(low: number, high: number, decimals: number | null = null): number {
    const lowDecimals = (low.toString().split(".")[1] || "").length;
    const highDecimals = (high.toString().split(".")[1] || "").length;
    const derivedDecimals = Math.max(lowDecimals, highDecimals); // Derive max precision

    const randomValue = Math.random() * (high - low) + low;

    // If decimals is explicitly set, use it; otherwise, use derived precision
    return decimals !== null
        ? parseFloat(randomValue.toFixed(decimals))
        : parseFloat(randomValue.toFixed(derivedDecimals));
}

/**
 * Selects a random item from an array of a specific type.
 *
 * Utilizes the `rng` function to generate a random index within the bounds of the array.
 *
 * @template T - The type of elements in the array.
 * @param {T[]} collection - The array to select a random item from.
 * @returns {T} - A randomly selected item from the array.
 *
 * @throws {Error} Throws an error if the collection is empty.
 *
 * @example
 * // Example 1: Random item from a number array
 * const numbers = [1, 2, 3, 4, 5];
 * const randomNum = randomItem(numbers); // TypeScript infers: number
 *
 * @example
 * // Example 2: Random item from a string array
 * const fruits = ["apple", "banana", "cherry"];
 * const randomFruit = randomItem(fruits); // TypeScript infers: string
 */
export function randomItem<T>(collection: T[]): T {
    if (collection.length === 0) {
        log(logLevels.error, "Cannot select a random item from an empty array.", ['randomItem'], collection);
    }
    return collection[Math.floor(rng(0, collection.length-1))];
}
