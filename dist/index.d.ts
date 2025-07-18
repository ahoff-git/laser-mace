import PeerInternal from 'peerjs';

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
declare function getRndColor(): string;
declare function getColorPair(): {
    c1: string;
    c2: string;
};
declare function colorFrmRange(c1: string, c2: string, percent: number): string;
/**
* Determines whether a hex color is light or dark and returns a contrasting color (black or white).
* @param hexColor - The hex color string (e.g., "#FFFFFF" or "FFFFFF").
* @returns A string representing the contrasting color ("#000000" for black or "#FFFFFF" for white).
*/
declare function getContrastingColor(hexColor: string): string;

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
 * Merges a plain or computed property collection with a method for retrieving changes since a given timestamp.
 *
 * @template T - The base object shape.
 */
type LazyState<T extends Record<string, any>> = T & {
    /**
   * Returns all properties that have changed since the given timestamp.
   *
   * @param since - A timestamp in milliseconds.
   * @returns An object containing only the properties updated since `since`.
   */
    getChanges(since: number): Partial<T>;
};
/**
 * Describes the definition of the lazy state object.
 * Each property can be:
 * - A plain value: `null`, string, number, or object.
 * - `[CacheMode, ComputeFunction, Expiration?, Dependencies?]`: A computed property.
 */
type LazyStateDefinition<T extends Record<string, any>> = {
    [K in keyof T]: [CacheMode, (context: T) => Promise<T[K]> | T[K], number?, (keyof T)[]?] | T[K];
};
/**
 * Creates a lazy state object that includes plain and computed properties, returning a `LazyState<T>`.
 *
 * @template T - The type of the state object.
 * @param definitions - An object defining plain or computed properties:
 *  - Plain values: `null`, string, number, or object.
 *  - `[CacheMode, ComputeFunction, Expiration?, Dependencies?]` for computed properties, with optional caching and dependencies.
 *  *    - `CacheMode`: Determines how the computed property is cached. Options:
 *      - `"always"`: Recompute the value every time it is accessed.
 *      - `"once"`: Compute the value once and cache it permanently.
 *      - `"timed"`: Cache the value for a specific duration.
 *    - `ComputeFunction`: A function that computes the property value based on the current state.
 *    - `Expiration` (optional): For `"timed"` mode, specifies the cache duration in milliseconds.
 *    - `Dependencies` (optional): A list of dependent property keys that invalidate this cache when updated.
 * @returns A `LazyState<T>` proxy with read/write plain properties, read-only computed ones, and a `getChanges(since: number)` method.
 *
 * @example
 * const state = createLazyState<{
 *   firstName: string;
 *   age: number;
 *   metadata: Record<string, any>;
 *   fullName: string;
 *   location: Promise<string>;
 * }>({
 *   firstName: "John",
 *   age: 30,
 *   metadata: {},
 *   fullName: ["once", (ctx) => `${ctx.firstName} (age ${ctx.age})`],
 *   location: ["timed", async () => "Seattle", 5000],
 * });
 *
 * console.log(state.getChanges(Date.now() - 10000));
 */
declare function createLazyState<T extends Record<string, any>>(definitions: LazyStateDefinition<T>): LazyState<T>;

interface ChronoTrigger {
    Start: () => void;
    Stop: () => void;
    setLoop: (loopFunction: (time: number) => void) => void;
    runAt: (fps: number, callback: () => void) => void;
    CurrentFPS: () => number;
    AverageFPS: () => number;
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
 * Defines a computed property on an object with a specified name and getter function.
 *
 * @template T - The type of the target object.
 * @param target - The object on which the property is to be defined.
 * @param name - The name of the property to define.
 * @param getter - A function that computes and returns the value of the property.
 *
 * @example
 * const obj = {};
 * defineComputedProperty(obj, 'dynamicValue', () => Math.random());
 * console.log(obj.dynamicValue); // Calls the getter and returns a random number
 */
declare function defineComputedProperty<T>(target: T, name: string, getter: () => any): void;
/**
 * Defines multiple computed properties on an object using a list of [name, getter] pairs.
 *
 * @template T - The type of the target object.
 * @param target - The object on which the properties are to be defined.
 * @param properties - An array of [name, getter] pairs, where:
 *   - `name`: The name of the property.
 *   - `getter`: A function that computes and returns the value of the property.
 *
 * @example
 * const obj = {};
 * defineComputedProperties(obj, [
 *   ['width', () => 100],
 *   ['height', () => 200],
 * ]);
 * console.log(obj.width, obj.height); // Calls the getters
 */
declare function defineComputedProperties<T>(target: T, properties: [string, () => any][]): void;
declare function removeByIdInPlace(array: any[], idToRemove: any): void;

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

type DataConnection = ConstructorParameters<typeof PeerInternal>[0] extends any ? ReturnType<typeof PeerInternal.prototype.connect> : never;
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
declare function newPeerNet(params?: {
    url?: string;
    handleMessageFunc?: (senderConn: DataConnectionPlus, msg: MsgType) => void;
}): PeerNetObjType | null;
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

type DrawOptions = {
    color?: string;
    transparency?: number;
    rotationAngle?: number;
    rotationOrigin?: "center" | "corner";
    anchor?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
    fontSize?: number;
    textAlign?: "left" | "right" | "center";
    verticalAlign?: "top" | "middle" | "bottom";
    offsetX?: number;
    offsetY?: number;
    showAnchor?: boolean;
    returnDetails?: boolean;
};
type TextDrawOptions = GeneralDrawOptions & {
    fontSize?: number;
    textAlign?: "left" | "right" | "center";
    verticalAlign?: "top" | "middle" | "bottom";
};
type ShapeDetails = {
    center: {
        x: number;
        y: number;
    };
    min: {
        x: number;
        y: number;
    };
    max: {
        x: number;
        y: number;
    };
    anchor: {
        x: number;
        y: number;
    };
    topLeft: {
        x: number;
        y: number;
    };
    topRight: {
        x: number;
        y: number;
    };
    bottomLeft: {
        x: number;
        y: number;
    };
    bottomRight: {
        x: number;
        y: number;
    };
    topCenter: {
        x: number;
        y: number;
    };
    bottomCenter: {
        x: number;
        y: number;
    };
    leftCenter: {
        x: number;
        y: number;
    };
    rightCenter: {
        x: number;
        y: number;
    };
    dimensions: {
        width: number;
        height: number;
    };
};
type ShapeDetailsWithOptions = ShapeDetails & (DrawOptions | TextDrawOptions);
type BoundingBox = {
    center: {
        x: number;
        y: number;
    };
    min: {
        x: number;
        y: number;
    };
    max: {
        x: number;
        y: number;
    };
    anchor: {
        x: number;
        y: number;
    };
    topLeft: {
        x: number;
        y: number;
    };
    topRight: {
        x: number;
        y: number;
    };
    bottomLeft: {
        x: number;
        y: number;
    };
    bottomRight: {
        x: number;
        y: number;
    };
    topCenter: {
        x: number;
        y: number;
    };
    bottomCenter: {
        x: number;
        y: number;
    };
    leftCenter: {
        x: number;
        y: number;
    };
    rightCenter: {
        x: number;
        y: number;
    };
    dimensions: {
        width: number;
        height: number;
    };
} | undefined;
type GeneralDrawOptions = {
    color?: string;
    transparency?: number;
    rotationAngle?: number;
    rotationOrigin?: "center" | "corner";
    anchor?: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center";
    offsetX?: number;
    offsetY?: number;
    showAnchor?: boolean;
    returnDetails?: boolean;
};
type CanvasBuddy = {
    drawCircle: (x: number, y: number, radius: number, options?: DrawOptions) => ShapeDetails | undefined;
    drawSquare: (x: number, y: number, width: number, options?: DrawOptions) => ShapeDetails | undefined;
    drawText: (text: string, x: number, y: number, options?: DrawOptions) => ShapeDetails | undefined;
    markBoundingBoxLocations: (boundingBox: ShapeDetails, excludeKeys?: Array<ShapeDetails>) => void;
    eraseArea: (x: number, y: number, width: number, height: number) => void;
    clearCanvas: () => void;
    clearBoundingBox: (boundingBox: ShapeDetails) => void;
    calculateBoundingBox: (x: number, y: number, width: number, height: number, options: GeneralDrawOptions, isCircle?: boolean) => ShapeDetails | undefined;
    width: number;
    height: number;
    top: number;
    left: number;
    right: number;
    bottom: number;
};
declare function calculateBoundingBox(x: number, y: number, width: number, height: number, options?: GeneralDrawOptions, isCircle?: boolean): ShapeDetails | undefined;
declare function createCanvasBuddy(canvas: HTMLCanvasElement): CanvasBuddy;

type SortingDirection = 'asc' | 'desc';
type SortableItem = {
    [key: string]: any;
};
/**
 * Sorts a collection of objects, values, or numbers based on a specified property or directly.
 *
 * @param collection - The array of objects, strings, or numbers to sort.
 * @param sortingDirection - The direction to sort ('asc' for ascending, 'desc' for descending).
 * @param sortProperty - The property of each object to sort by (optional, used only for object collections).
 * @param ignoreSymbols - An array of symbols to ignore during sorting (applies to string values only).
 * @param caseInsensitive - Whether to perform case-insensitive sorting (optional, defaults to false).
 * @returns A new array sorted based on the specified property and rules, or directly for value collections.
 * @throws {Error} If ignoreSymbols is not an array of strings.
 */
declare function customSort(collection: (SortableItem | string | number)[], sortingDirection: SortingDirection, sortProperty?: string, ignoreSymbols?: string[], caseInsensitive?: boolean): (SortableItem | string | number)[];

type Point = {
    x: number;
    y: number;
};

type Vect = Point & {
    s: number;
    percentageComplete: number;
};
declare function getPositionAtCompletion(vects: Vect[], completion: number): Point;

declare function dist(obj1: Point, obj2: Point): number;
declare function sumOfDistances(points: Point[]): number;
declare function squareOverlap(boxA: BoundingBox, boxB: BoundingBox): boolean;

interface Vector extends Point {
    angle: number;
    speed: number;
    mass: number;
}
interface Box extends Point {
    width: number;
    height: number;
}
declare function getBaseVect(x?: number, y?: number, angle?: number, speed?: number, mass?: number): Vector;
declare function vectSum(obj1: Vector, obj2: Vector): {
    angle: number;
    mag: number;
    speed: number;
};
declare function vectSumAndSet(obj1: Vector, obj2: Vector): Vector;
declare function setupVector(): {
    sum: typeof vectSum;
    sumAndSet: typeof vectSumAndSet;
    getAngle: (obj1: Point, obj2: Point) => number;
    getBaseVect: typeof getBaseVect;
    keepInBox: (vect: Vector, box: Box) => boolean;
    wrapAngle: (angle: number) => number;
    moveObj: (obj: Vector) => void;
    moveObjBack: (obj: Vector) => void;
    standards: {
        [key: string]: Vector;
    };
};

declare function createRollingAverage(rollingWindowSize: number, maxDeltaPercent?: number): {
    add(value: number): void;
    getAverage(): number;
};

interface ScreenSize {
    width: number;
    height: number;
}
interface Offset {
    x: number;
    y: number;
}
interface ScreenSizer {
    screenSize: ScreenSize;
    gameOffset: Offset;
    gameElements: HTMLCanvasElement[];
    center: Offset;
    setGameElement(element: HTMLElement): void;
    setGameElements(listOfIds: string[]): void;
    orientationChangeCallback(newScreenSize: ScreenSize): void;
    handleOrientation(): void;
    getMaxSize(element?: HTMLElement): ScreenSize;
    getScreenSize(): ScreenSize;
    biggestSquare(): void;
    resizeGame(screenSize?: ScreenSize): void;
    centerGame(padX: number, padY: number): void;
    getCenter(): Offset;
    addEventListeners(): void;
    removeEventListeners(): void;
    /** Handler bound to `handleOrientation` for resize events */
    resizeHandler: (event: Event) => void;
    /** Handler bound to `handleOrientation` for orientation change events */
    orientationHandler: (event: Event) => void;
    resizeGameElementsOnResizeEvent: boolean;
    resizeGameElementsOnOrientationEvent: boolean;
}
declare const screenSizer: ScreenSizer;

type Predicate<T extends object> = (ctx: T, version?: any) => boolean;
/**
 * Wraps a predicate in per-context memoization.
 * Results are cached by context object and optional version value.
 */
declare function memo<T extends object>(predicate: (ctx: T) => boolean): Predicate<T>;
/**
 * Logical AND combinator for predicates.
 * All predicates must evaluate to true for the result to be true.
 * The combined result is memoized per context and version.
 */
declare function and<T extends object>(...predicates: Array<Predicate<T>>): Predicate<T>;
/**
 * Logical OR combinator for predicates.
 * Returns true if any predicate is true.
 * The combined result is memoized per context and version.
 */
declare function or<T extends object>(...predicates: Array<Predicate<T>>): Predicate<T>;
/**
 * Logical NOT combinator for predicates.
 * The result is memoized per context and version.
 */
declare function not<T extends object>(predicate: Predicate<T>): Predicate<T>;
declare function createFSM<T extends object>(config: {
    statuses: Record<string, Predicate<T>>;
}): {
    evaluate(ctx: T, version?: any): string[];
};

export { BoundingBox, Box, CanvasBuddy, Crono, DataConnectionPlus, DrawOptions, GeneralDrawOptions, MsgType, PeerNetObj, PeerNetObjType, PeerNetStatusObj, Point, Predicate, ShapeDetails, ShapeDetailsWithOptions, TextDrawOptions, Vect, Vector, and, attachOnClick, blockKeywords, calculateBoundingBox, colorFrmRange, createCanvasBuddy, createFSM, createLazyState, createRollingAverage, currentLogLevel, customSort, defineComputedProperties, defineComputedProperty, dist, expose, filterKeywords, getColorPair, getContrastingColor, getKeyNameByValue, getPositionAtCompletion, getRandomName, getRndColor, getSafeValueById, greetLaserMace, log, logLevels, memo, newPeerNet, not, or, randomItem, removeByIdInPlace, rng, screenSizer, sendRequest, setupVector, squareOverlap, storage, sumOfDistances };
