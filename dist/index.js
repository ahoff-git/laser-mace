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
  Crono: () => Crono,
  blockKeywords: () => blockKeywords,
  createLazyState: () => createLazyState,
  currentLogLevel: () => currentLogLevel,
  filterKeywords: () => filterKeywords,
  getKeyNameByValue: () => getKeyNameByValue,
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
      log(logLevels.debug, `Saving key "${key}" with value:`, ["localStorage", "save"], value);
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
        log(logLevels.warning, `No value found for key "${key}". Returning default value:`, ["localStorage", "load"], defaultValue);
        return defaultValue;
      }
      try {
        log(logLevels.debug, `Value found for key "${key}". Returning value:`, ["localStorage", "load"], value);
        return JSON.parse(value);
      } catch (err) {
        log(logLevels.error, `Failed to parse value for key "${key}":`, ["localStorage", "load"], value, err);
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
      log(logLevels.debug, `Available keys in localStorage:`, ["localStorage", "listKeys"], keys);
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
var currentLogLevel = { value: logLevels.debug };
var filterKeywords = [];
var blockKeywords = [];
function log(level, message, keywords = [], ...data) {
  if (currentLogLevel.value < level)
    return;
  if (blockKeywords.some((keyword) => keywords.includes(keyword)))
    return;
  if (filterKeywords.length > 0 && !filterKeywords.some((keyword) => keywords.includes(keyword)))
    return;
  const method = level === logLevels.error ? "error" : level === logLevels.warning ? "warn" : "log";
  const keywordInfo = keywords.length > 0 ? ` [Keywords: ${keywords.join(", ")}]` : "";
  console[method](`${message}${keywordInfo}`, ...data);
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

// src/lazyState.ts
function createLazyState(definitions) {
  const internalState = {};
  const cache = {};
  const timestamps = {};
  const invalidateDependentCaches = (key) => {
    for (const [depKey, definition] of Object.entries(definitions)) {
      if (definition && definition[3]?.includes(key)) {
        delete cache[depKey];
        delete timestamps[depKey];
      }
    }
  };
  const resolveValue = (computeFn) => {
    const value = computeFn(proxy);
    return value instanceof Promise ? value : value;
  };
  const proxy = new Proxy({}, {
    get(_, prop) {
      if (typeof prop !== "string" || !(prop in definitions)) {
        throw new Error(`Property '${String(prop)}' is not defined.`);
      }
      const definition = definitions[prop];
      if (definition === null) {
        return internalState[prop];
      }
      const [mode, computeFn, expirationMs] = definition;
      if (mode === "always") {
        return resolveValue(computeFn);
      }
      if (mode === "once") {
        if (!(prop in cache)) {
          cache[prop] = resolveValue(computeFn);
        }
        return cache[prop];
      }
      if (mode === "timed") {
        const now = Date.now();
        const lastUpdated = timestamps[prop] || 0;
        if (!(prop in cache) || now - lastUpdated > (expirationMs || 0)) {
          cache[prop] = resolveValue(computeFn);
          timestamps[prop] = now;
        }
        return cache[prop];
      }
      throw new Error(`Invalid cache mode: ${mode}`);
    },
    set(_, prop, value) {
      if (typeof prop !== "string" || !(prop in definitions)) {
        throw new Error(`Property '${String(prop)}' is not defined.`);
      }
      const definition = definitions[prop];
      if (definition === null) {
        internalState[prop] = value;
        invalidateDependentCaches(prop);
        return true;
      }
      throw new Error(`Cannot set value for computed property '${prop}'`);
    },
    ownKeys() {
      return Reflect.ownKeys(definitions);
    },
    has(_, prop) {
      return typeof prop === "string" && prop in definitions;
    },
    getOwnPropertyDescriptor(_, prop) {
      if (typeof prop === "string" && prop in definitions) {
        return {
          enumerable: true,
          configurable: true
        };
      }
      return void 0;
    }
  });
  return proxy;
}

// src/chronoTrigger.ts
function createChronoTrigger() {
  const lastRunTimes = /* @__PURE__ */ new Map();
  let loop = null;
  let running = false;
  let fps = 0;
  let lastFrameTime = 0;
  const Start = () => {
    if (typeof loop !== "function") {
      throw new Error("CT.Loop must be defined before calling CT.Start()");
    }
    running = true;
    const frame = (time) => {
      if (running) {
        if (lastFrameTime > 0) {
          const delta = time - lastFrameTime;
          fps = Math.round(1e3 / delta);
        }
        lastFrameTime = time;
        loop(time);
        requestAnimationFrame(frame);
      }
    };
    requestAnimationFrame(frame);
  };
  const Stop = () => {
    running = false;
  };
  const setLoop = (loopFunction) => {
    loop = loopFunction;
  };
  const runAt = (fpsTarget, callback) => {
    if (!lastRunTimes.has(fpsTarget)) {
      lastRunTimes.set(fpsTarget, 0);
    }
    const now = performance.now();
    const interval = 1e3 / fpsTarget;
    if (fpsTarget > fps && fps > 0) {
      log(logLevels.warning, `Requested FPS (${fpsTarget}) exceeds current game FPS (${fps}). Performance may degrade.`, ["runAt, Crono"]);
    }
    if (now - (lastRunTimes.get(fpsTarget) || 0) >= interval) {
      lastRunTimes.set(fpsTarget, now);
      callback();
    }
  };
  const CurrentFPS = () => fps;
  return { Start, Stop, setLoop, runAt, CurrentFPS };
}
var Crono = createChronoTrigger();

// src/utils.ts
function getKeyNameByValue(obj, value) {
  return Object.entries(obj).find(([, v]) => v === value)?.[0] || "unknown";
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Crono,
  blockKeywords,
  createLazyState,
  currentLogLevel,
  filterKeywords,
  getKeyNameByValue,
  greetLaserMace,
  log,
  logLevels,
  rng,
  storage
});
