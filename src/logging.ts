/**
 * Defines the available log levels for controlling console output.
 * 
 * - `off`: Disables all logs.
 * - `error`: Logs only errors.
 * - `warning`: Logs warnings and errors.
 * - `debug`: Logs everything (debug, warnings, and errors).
 */
export const logLevels = {
    off: 0,
    error: 1,
    warning: 2,
    debug: 3,
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
export let currentLogLevel = logLevels.debug;

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
export function log(level: number, message: string, ...data: unknown[]) {
    if (currentLogLevel >= level) {
        const method = level === logLevels.error ? "error" 
                     : level === logLevels.warning ? "warn" 
                     : "log";
        console[method](message, ...data);
    }
}
