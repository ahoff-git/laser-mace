type CacheMode = "always" | "once" | "timed";

/**
 * Describes the definition of the lazy state object.
 * Each property can be:
 * - A plain value: `null`, string, number, or object.
 * - `[CacheMode, ComputeFunction, Expiration?, Dependencies?]`: A computed property.
 */
type LazyStateDefinition<T extends Record<string, any>> = {
  [K in keyof T]:
    | [CacheMode, (context: T) => Promise<T[K]> | T[K], number?, (keyof T)[]?]
    | T[K];
};

/**
 * Creates a lazy state object with defined plain and computed properties.
 *
 * @template T - The type of the state object.
 * @param definitions - An object that defines the properties of the lazy state:
 *  - Plain values: `null`, string, number, or object.
 *  - `[CacheMode, ComputeFunction, Expiration?, Dependencies?]` for computed properties:
 *    - `CacheMode`: Determines how the computed property is cached. Options:
 *      - `"always"`: Recompute the value every time it is accessed.
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
 *   age: number;
 *   metadata: Record<string, any>;
 *   fullName: string;
 *   location: Promise<string>;
 * }>({
 *   firstName: "John", // Plain state
 *   age: 30, // Plain state
 *   metadata: {}, // Plain state
 *   fullName: ["once", (context) => `${context.firstName} (age ${context.age})`], // Computed property
 *   location: ["timed", async () => "Seattle", 5000], // Computed property with caching
 * });
 */
export function createLazyState<T extends Record<string, any>>(
  definitions: LazyStateDefinition<T>
): T {
  const internalState: Partial<T> = {};
  const cache: Partial<Record<keyof T, T[keyof T] | Promise<T[keyof T]>>> = {};
  const timestamps: Partial<Record<keyof T, number>> = {};

  // Initialize plain state properties
  for (const [key, definition] of Object.entries(definitions)) {
    if (definition !== null && !Array.isArray(definition)) {
      internalState[key as keyof T] = definition as T[keyof T];
    }
  }

  // Invalidates caches of dependent properties when a plain property changes.
  const invalidateDependentCaches = (key: keyof T): void => {
    for (const [depKey, definition] of Object.entries(definitions)) {
      if (Array.isArray(definition) && definition[3]?.includes(key)) {
        delete cache[depKey as keyof T];
        delete timestamps[depKey as keyof T];
      }
    }
  };

  const resolveValue = (
    computeFn: (context: T) => Promise<T[keyof T]> | T[keyof T]
  ): T[keyof T] | Promise<T[keyof T]> => {
    const value = computeFn(proxy as T);
    return value instanceof Promise ? value : value; // Let the caller handle the promise
  };

  // Proxy to handle plain and computed properties dynamically.
  const proxy = new Proxy({} as T, {
    get(_, prop: string | symbol) {
      if (typeof prop !== "string" || !(prop in definitions)) {
        throw new Error(`Property '${String(prop)}' is not defined.`);
      }

      const definition = definitions[prop as keyof T];

      if (definition !== null && !Array.isArray(definition)) {
        // Plain state property
        return internalState[prop as keyof T];
      }

      const [mode, computeFn, expirationMs] = definition as [
        CacheMode,
        (context: T) => Promise<T[keyof T]> | T[keyof T],
        number?,
        (keyof T)[]?
      ];

      if (mode === "always") {
        return resolveValue(computeFn);
      }

      if (mode === "once") {
        if (!(prop in cache)) {
          cache[prop as keyof T] = resolveValue(computeFn);
        }
        return cache[prop as keyof T];
      }

      if (mode === "timed") {
        const now = Date.now();
        const lastUpdated = timestamps[prop as keyof T] || 0;

        if (!(prop in cache) || now - lastUpdated > (expirationMs || 0)) {
          cache[prop as keyof T] = resolveValue(computeFn);
          timestamps[prop as keyof T] = now;
        }
        return cache[prop as keyof T];
      }

      throw new Error(`Invalid cache mode: ${mode}`);
    },
    set(_, prop: string | symbol, value: any): boolean {
      if (typeof prop !== "string" || !(prop in definitions)) {
        throw new Error(`Property '${String(prop)}' is not defined.`);
      }

      const definition = definitions[prop as keyof T];

      if (definition !== null && !Array.isArray(definition)) {
        // Update plain state
        internalState[prop as keyof T] = value;
        invalidateDependentCaches(prop as keyof T);
        return true;
      }

      throw new Error(`Cannot set value for computed property '${prop}'`);
    },
    ownKeys() {
      return Reflect.ownKeys(definitions);
    },
    has(_, prop: string | symbol) {
      return typeof prop === "string" && prop in definitions;
    },
    getOwnPropertyDescriptor(_, prop: string | symbol) {
      if (typeof prop === "string" && prop in definitions) {
        return {
          enumerable: true,
          configurable: true,
        };
      }
      return undefined;
    },
  });

  return proxy;
}
