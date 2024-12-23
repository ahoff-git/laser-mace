/**
 * A utility module for interacting with browser localStorage with added logging support.
 *
 * Provides methods to save, load, and list keys in localStorage. Logs actions at configurable levels.
 */
declare const storage: {
    /**
     * Saves a value to localStorage under the specified key.
     *
     * @param {string} key - The key under which the value will be stored.
     * @param {any} value - The value to store. Objects will be automatically stringified to JSON.
     *
     * @example
     * storage.save('user', { name: 'Alice', age: 30 });
     * storage.save('theme', 'dark');
     */
    save: (key: string, value: any) => void;
    /**
     * Loads a value from localStorage.
     *
     * - If the key does not exist, the provided `defaultValue` is returned.
     * - If the stored value is valid JSON, it is parsed and returned.
     * - If parsing fails, the raw string is returned.
     *
     * @param {string} key - The key of the value to retrieve.
     * @param {any} [defaultValue=null] - The default value to return if the key doesn't exist.
     * @returns {any} - The parsed value if JSON, the raw string if not JSON, or the default value if the key doesn't exist.
     *
     * @example
     * const theme = storage.load('theme', 'light'); // Returns 'dark' if saved, or 'light' if not found
     * const user = storage.load('user'); // Returns { name: 'Alice', age: 30 }
     */
    load: (key: string, defaultValue?: any) => any;
    /**
     * Lists all keys currently stored in localStorage.
     *
     * @returns {string[]} - An array of keys currently in localStorage.
     *
     * @example
     * const keys = storage.listKeys();
     * console.log(keys); // ['user', 'theme']
     */
    listKeys: () => string[];
};

/**
 * Defines the available log levels for controlling console output.
 *
 * - `off`: Disables all logs.
 * - `error`: Logs only errors.
 * - `warning`: Logs warnings and errors.
 * - `debug`: Logs everything (debug, warnings, and errors).
 */
declare const logLevels: {
    off: number;
    error: number;
    warning: number;
    debug: number;
};
/**
 * The current log level for controlling console output.
 *
 * Set this to one of the values in `logLevels` (e.g., `logLevels.debug` or `logLevels.off`)
 * to dynamically control which logs are displayed.
 *
 * @example
 * currentLogLevel = logLevels.warning; // Show only warnings and errors
 */
declare let currentLogLevel: number;
/**
 * Logs a message to the console based on the specified log level.
 *
 * - Automatically uses `console.error`, `console.warn`, or `console.log` depending on the log level.
 * - Only logs messages if the specified `level` is less than or equal to the current `currentLogLevel`.
 *
 * @param {number} level - The log level for the message (e.g., `logLevels.debug` or `logLevels.error`).
 * @param {string} message - The message to log.
 * @param {...unknown[]} data - Additional data to log (optional).
 *
 * @example
 * // Example 1: Log a debug message
 * log(logLevels.debug, "This is a debug message", { someData: 42 });
 *
 * @example
 * // Example 2: Log an error message
 * log(logLevels.error, "Something went wrong", new Error("Oops!"));
 */
declare function log(level: number, message: string, ...data: unknown[]): void;

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
declare function rng(low: number, high: number, decimals?: number | null): number;

/**
 * Returns a fun greeting message from LaserMace.
 *
 * This function can be used as a placeholder, test greeting, or just to spread some LaserMace-themed cheer!
 *
 * @returns {string} - A greeting message saying "Hello from LaserMace!".
 *
 * @example
 * // Example usage:
 * const message = greetLaserMace();
 * console.log(message); // "Hello from LaserMace!"
 */
declare const greetLaserMace: () => string;

type CacheMode = "always" | "once" | "timed";
/**
 * Describes the definition of the lazy state object.
 * Each property can be:
 * - `null`: A plain state property that can be updated directly.
 * - `[CacheMode, ComputeFunction, Expiration?, Dependencies?]`: A computed property.
 */
type LazyStateDefinition<T extends Record<string, any>> = {
    [K in keyof T]: [CacheMode, (context: T) => Promise<T[K]> | T[K], number?, (keyof T)[]?] | null;
};
/**
 * Creates a lazy state object with defined plain and computed properties.
 *
 * @template T - The type of the state object.
 * @param definitions - An object that defines the properties of the lazy state:
 *  - `null` for plain state properties.
 *  - `[CacheMode, ComputeFunction, Expiration?, Dependencies?]` for computed properties:
 *    - `CacheMode`: Determines how the computed property is cached. Options:
 *      - `"always"`: Recompute the value every time it's accessed.
 *      - `"once"`: Compute the value once and cache it permanently.
 *      - `"timed"`: Cache the value for a specific duration.
 *    - `ComputeFunction`: A function that computes the property value based on the current state.
 *    - `Expiration` (optional): For `"timed"` mode, specifies the cache duration in milliseconds.
 *    - `Dependencies` (optional): A list of dependent property keys that invalidate this cache when updated.
 * @returns A proxy object representing the lazy state with:
 *  - Writable plain properties.
 *  - Read-only computed properties.
 *
 * @example
 * const state = createLazyState<{
 *   firstName: string;
 *   lastName: string;
 *   fullName: string;
 *   location: Promise<string>;
 * }>({
 *   firstName: null, // Plain state
 *   lastName: null, // Plain state
 *   fullName: ["once", (context) => `${context.firstName} ${context.lastName}`], // Computed property
 *   location: ["timed", async () => "Seattle", 5000], // Computed property with caching
 * });
 *
 * state.firstName = "John";
 * state.lastName = "Doe";
 * console.log(state.fullName); // "John Doe"
 * console.log(await state.location); // "Seattle"
 */
declare function createLazyState<T extends Record<string, any>>(definitions: LazyStateDefinition<T>): T;

export { createLazyState, currentLogLevel, greetLaserMace, log, logLevels, rng, storage };
