import { log, logLevels } from "./index";

/**
 * Gets the key name associated with a specific value in an object.
 * 
 * @param {Record<string, unknown>} obj - The object to search.
 * @param {unknown} value - The value to find the associated key for.
 * @returns {string} The key name if found, or "unknown" if not found.
 */
export function getKeyNameByValue(obj: Record<string, unknown>, value: unknown): string {
    return Object.entries(obj).find(([, v]) => v === value)?.[0] || "unknown";
}

/**
 * Expose a local variable to the global scope by magically extracting its name.
 * @param variableObj - An object containing the variable (e.g., { myVariable }).
 */
export function expose<T>(variableObj: { [key: string]: T }): void {
    const [name, value] = Object.entries(variableObj)[0]; // Extract the first key-value pair
    (window as any)[name] = value; // Attach to the global scope
  }

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
export function getSafeValueById(id: string, defaultValue: string | null = null): string | null {
    const element = document.getElementById(id) as HTMLInputElement | null;

    if (element && 'value' in element) {
        return element.value;
    } else {
        log(
            logLevels.warning,
            `Element with ID "${id}" not found or does not have a value property. Returning default: "${defaultValue}"`,
            ["DOM", "getSafeValueById"],
            { id, defaultValue }
        );
        return defaultValue;
    }
}

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
export function attachOnClick(
    id: string,
    fn: (...args: any[]) => any,
    params: any[],
    callback?: (result: any, ...callbackParams: any[]) => void,
    ...callbackParams: any[]
  ): void {
    const element = document.getElementById(id);
    log(
        logLevels.debug,
        `Attempting to attach an onclick event to element with ID "${id}".`,
        ["attachOnClick", "eventBinding"],
        { id, params, callbackParams }
      );

    if (element) {
      element.onclick = () => {
        const result = fn(...params);
  
        if (callback) {
          callback(result, ...callbackParams);
        }
      };
    } else {
      console.error(`Element with ID "${id}" not found.`);
    }
  }
  
  