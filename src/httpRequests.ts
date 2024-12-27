import { log, logLevels } from "./logging";

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
export async function sendRequest<T>(
    url: string,
    payload: Record<string, unknown>
): Promise<T | undefined> {
    log(logLevels.debug, "Initiating request", ["network", "sendRequest"], { url, payload });

    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000); // Timeout in 5s

        log(logLevels.debug, "Sending payload to URL", ["network", "sendRequest"], { url });

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
            log(logLevels.error, "Request failed", ["network", "sendRequest"], { status: response.status });
            throw new Error(`Request failed with status ${response.status}`);
        }

        const result = await response.json();
        log(logLevels.debug, "Request succeeded", ["network", "debug", "sendRequest"], { result });

        return result;
    } catch (error) {
        log(logLevels.error, "Error during request", ["network", "error", "sendRequest"], error);
        return undefined;
    }
}
