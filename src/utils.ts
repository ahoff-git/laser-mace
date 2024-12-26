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
