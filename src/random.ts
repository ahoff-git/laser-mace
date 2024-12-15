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
