import { DataConnection } from 'peerjs';

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
 * currentLogLevel.value = logLevels.warning; // Show only warnings and errors
 */
declare const currentLogLevel: {
    value: number;
};
/**
 * Optional keywords for filtering log messages.
 *
 * - `filterKeywords`: Only log messages containing these keywords (empty means include all).
 * - `blockKeywords`: Do not log messages containing these keywords.
 */
declare const filterKeywords: string[];
declare const blockKeywords: string[];
/**
 * Logs a message to the console based on the specified log level.
 *
 * - Automatically uses `console.error`, `console.warn`, or `console.log` depending on the log level.
 * - Only logs messages if the specified `level` is less than or equal to the current `currentLogLevel`.
 * - Filters messages based on `filterKeywords` and `blockKeywords`.
 * - Automatically includes timestamps for better traceability.
 * - Makes a deep copy of the data before logging to prevent mutations.
 *
 * @param {number} [level=logLevels.debug] - The log level for the message (e.g., `logLevels.debug` or `logLevels.error`).
 * @param {string} message - The message to log.
 * @param {string[]} [keywords=[]] - Keywords associated with the message for filtering (optional).
 * @param {...unknown[]} data - Additional data to log (optional).
 *
 * @example
 * // Example 1: Log a debug message
 * log(logLevels.debug, "This is a debug message", ["network"], { someData: 42 });
 *
 * @example
 * // Example 2: Log an error message
 * log(logLevels.error, "Something went wrong", ["critical"], new Error("Oops!"));
 */
declare function log(level: number | undefined, message: string, keywords?: string[], ...data: unknown[]): void;

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
declare function randomItem<T>(collection: T[]): T;

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

interface ChronoTrigger {
    Start: () => void;
    Stop: () => void;
    setLoop: (loopFunction: (time: number) => void) => void;
    runAt: (fps: number, callback: () => void) => void;
    CurrentFPS: () => number;
}
declare const Crono: ChronoTrigger;

/**
 * Gets the key name associated with a specific value in an object.
 *
 * @param {Record<string, unknown>} obj - The object to search.
 * @param {unknown} value - The value to find the associated key for.
 * @returns {string} The key name if found, or "unknown" if not found.
 */
declare function getKeyNameByValue(obj: Record<string, unknown>, value: unknown): string;
/**
 * Expose a local variable to the global scope by magically extracting its name.
 * @param variableObj - An object containing the variable (e.g., { myVariable }).
 */
declare function expose<T>(variableObj: {
    [key: string]: T;
}): void;
/**
 * Safely retrieves the value of an HTML input element by its ID.
 * If the element is not found or is not an input element, logs a message and returns a default value.
 *
 * @param {string} id - The ID of the HTML element to retrieve.
 * @param {string | null} defaultValue - The default value to return if the element is not found or has no value.
 * @returns {string | null} The value of the input element if found, or the default value if not.
 *
 * @example
 * // Assuming <input id="username" value="JohnDoe" />
 * const username = getSafeValueById('username', 'DefaultUser'); // Returns "JohnDoe"
 *
 * // Assuming no element exists with ID "nonExistent"
 * const nonExistent = getSafeValueById('nonExistent', 'DefaultValue'); // Logs and returns "DefaultValue"
 */
declare function getSafeValueById(id: string, defaultValue?: string | null): string | null;
/**
 * Safely attaches a function to the `onclick` event of a DOM element by its ID.
 * If the element is not found, it logs an error message.
 * The provided function will be called with the specified parameters,
 * and an optional callback can handle the return value and additional parameters.
 *
 * @param {string} id - The ID of the HTML element to attach the event to.
 * @param {Function} fn - The function to execute on click.
 * @param {Array<any>} params - The parameters to pass to the function when invoked.
 * @param {Function} [callback] - Optional callback that receives the return value of `fn` and additional parameters.
 * @param {...any[]} callbackParams - Additional parameters to pass to the callback.
 *
 * @example
 * // Assuming <button id="submitButton">Submit</button>
 * attachOnClick(
 *   'submitButton',
 *   (name) => `Hello, ${name}`,
 *   ['John'],
 *   (result, extraParam) => console.log(result, extraParam),
 *   'Callback executed!'
 * );
 * // Clicking the button logs: "Hello, John" "Callback executed!"
 */
declare function attachOnClick(id: string, fn: (...args: any[]) => any, params: any[], callback?: (result: any, ...callbackParams: any[]) => void, ...callbackParams: any[]): void;

/**
 * Sends a POST request to a specified URL with the given payload.
 *
 * @template T - The expected response type.
 * @param {string} url - The endpoint to which the request is sent.
 * @param {Record<string, unknown>} payload - The data to be sent in the request body.
 * @returns {Promise<T | undefined>} A promise resolving to the response of the request, or `undefined` if an error occurs.
 *
 * @example
 * // Example usage:
 * const response = await sendRequest<MyResponseType>("https://api.example.com/data", { key: "value" });
 * if (response) {
 *     console.log("Success:", response);
 * }
 */
declare function sendRequest<T>(url: string, payload: Record<string, unknown> | undefined): Promise<T | undefined>;

type HandlerFunction = (...args: any[]) => void;
interface HandlerObject {
    durable: boolean;
    func: HandlerFunction;
    args: any[];
}
interface Handlers {
    OnMsg: HandlerObject[];
    OnConnect: HandlerObject[];
    OnDisconnect: HandlerObject[];
    OnConnectionUpdate: HandlerObject[];
    OnCheckIn: HandlerObject[];
    OnStatusChange: HandlerObject[];
    OnPeerConnectionStringSet: HandlerObject[];
    OnLeaderChange: HandlerObject[];
    OnMyLeaderStatusChange: HandlerObject[];
}
type PeerNetStatusObj = {
    Phase: number;
    Text: string;
};
type PeerNetObjType = {
    SetRoom: (roomName: string) => void;
    SetHandler: (handlerName: keyof Handlers, functionToCall: HandlerFunction, ...args: any[]) => void;
    GetPeerId: () => string | null;
    _SendMsgToOperator: (msg: any) => void;
    ForceCheckin: () => void;
    SetHandleMessage: (func: (senderConn: DataConnectionPlus, msg: MsgType) => void) => void;
    GetActivePeers: () => Map<string, DataConnectionPlus>;
    GetPeers: () => Map<string, DataConnectionPlus>;
    SetOperatorURL: (url: string) => void;
    ResetName: (newName: string) => void;
    Send: (targetConn: DataConnectionPlus, msg: MsgType) => void;
    Disconnect: (roomName: string) => void;
    Connect: (roomName: string, playerName: string) => void;
    GetDisplayName: () => string;
    IsLeader: () => boolean;
    GetOrderNumber: () => number | undefined;
};
type DataConnectionPlus = {
    ConnId: string;
    IsLeader: boolean | null;
    DisplayName: string | null;
    PeerConnectionString: string | null;
    LastMsgDT: number | null;
    PeerConnection: DataConnection | null;
    Active: boolean;
    Room: string | null;
    Status: PeerConnectionStatus;
    OrderNumber: number | undefined;
};
type PeerConnectionStatus = "Awaiting-Introduction" | "Unknown" | "Disconnected" | "Introduced" | undefined;
type MsgType = {
    Type: string;
    Data?: any;
};
declare function PeerNetObj(operatorURL: string): PeerNetObjType;

declare function getRandomName(separator?: string): string;

export { Crono, DataConnectionPlus, MsgType, PeerNetObj, PeerNetObjType, PeerNetStatusObj, attachOnClick, blockKeywords, createLazyState, currentLogLevel, expose, filterKeywords, getKeyNameByValue, getRandomName, getSafeValueById, greetLaserMace, log, logLevels, randomItem, rng, sendRequest, storage };
