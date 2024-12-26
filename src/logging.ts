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
export const currentLogLevel = {value: logLevels.debug};

/**
 * Optional keywords for filtering log messages.
 *
 * - `filterKeywords`: Only log messages containing these keywords (empty means include all).
 * - `blockKeywords`: Do not log messages containing these keywords.
 */
export const filterKeywords: string[] = [];
export const blockKeywords: string[] = [];

/**
 * Logs a message to the console based on the specified log level.
 * 
 * - Automatically uses `console.error`, `console.warn`, or `console.log` depending on the log level.
 * - Only logs messages if the specified `level` is less than or equal to the current `currentLogLevel`.
 * - Filters messages based on `filterKeywords` and `blockKeywords`.
 * 
 * @param {number} level - The log level for the message (e.g., `logLevels.debug` or `logLevels.error`).
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
export function log(level: number, message: string, keywords: string[] = [], ...data: unknown[]) {
    if (currentLogLevel.value < level) return;

    // Handle blockKeywords
    if (blockKeywords.some(keyword => keywords.includes(keyword))) return;

    // Handle filterKeywords
    if (filterKeywords.length > 0 && !filterKeywords.some(keyword => keywords.includes(keyword))) return;

    const method = level === logLevels.error ? "error" 
                 : level === logLevels.warning ? "warn" 
                 : "log";

    const keywordInfo = keywords.length > 0 ? ` [Keywords: ${keywords.join(", ")}]` : "";
    console[method](`${message}${keywordInfo}`, ...data);
}
