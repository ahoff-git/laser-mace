"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  currentLogLevel: () => currentLogLevel,
  greetLaserMace: () => greetLaserMace,
  log: () => log,
  logLevels: () => logLevels,
  rng: () => rng,
  storage: () => storage
});
module.exports = __toCommonJS(src_exports);

// src/localStorage.ts
var storage = (() => {
  return {
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
    save: (key, value) => {
      log(logLevels.debug, `Saving key "${key}" with value:`, value);
      localStorage.setItem(key, JSON.stringify(value));
    },
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
    load: (key, defaultValue = null) => {
      const value = localStorage.getItem(key);
      if (value === null) {
        log(logLevels.warning, `No value found for key "${key}". Returning default value:`, defaultValue);
        return defaultValue;
      }
      try {
        log(logLevels.debug, `Value found for key "${key}". Returning value:`, value);
        return JSON.parse(value);
      } catch (err) {
        log(logLevels.error, `Failed to parse value for key "${key}":`, value, err);
        return value;
      }
    },
    /**
     * Lists all keys currently stored in localStorage.
     * 
     * @returns {string[]} - An array of keys currently in localStorage.
     * 
     * @example
     * const keys = storage.listKeys();
     * console.log(keys); // ['user', 'theme']
     */
    listKeys: () => {
      const keys = Object.keys(localStorage);
      log(logLevels.debug, `Available keys in localStorage:`, keys);
      return keys;
    }
  };
})();

// src/logging.ts
var logLevels = {
  off: 0,
  error: 1,
  warning: 2,
  debug: 3
};
var currentLogLevel = logLevels.debug;
function log(level, message, ...data) {
  if (currentLogLevel >= level) {
    const method = level === logLevels.error ? "error" : level === logLevels.warning ? "warn" : "log";
    console[method](message, ...data);
  }
}

// src/random.ts
function rng(low, high, decimals = null) {
  const lowDecimals = (low.toString().split(".")[1] || "").length;
  const highDecimals = (high.toString().split(".")[1] || "").length;
  const derivedDecimals = Math.max(lowDecimals, highDecimals);
  const randomValue = Math.random() * (high - low) + low;
  return decimals !== null ? parseFloat(randomValue.toFixed(decimals)) : parseFloat(randomValue.toFixed(derivedDecimals));
}

// src/test.ts
var greetLaserMace = () => {
  return "Hello from LaserMace!";
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  currentLogLevel,
  greetLaserMace,
  log,
  logLevels,
  rng,
  storage
});
