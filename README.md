# Laser-Mace

Laser-Mace is your go-to quirky utility library, packed with tools to add functionality and flavor to your projects. Whether you need game logic utilities, lazy state management, randomization tools, or a funky logger, Laser-Mace has you covered.

## Features

### General Utilities
- **greetLaserMace()**: A simple function to greet you from the world of Laser-Mace.
    ```javascript
    console.log(greetLaserMace());
    // Output: "Hello from LaserMace!"
    ```

### Game Logic
- **Crono (ChronoTrigger)**: A game loop manager with FPS control.
    - `Start()`: Begin the game loop.
    - `Stop()`: Halt the loop.
    - `setLoop(loopFunction)`: Define the loop function.
    - `runAt(fpsTarget, callback)`: Run a callback at a specified FPS.
    - `CurrentFPS()`: Get the current frames per second.

### State Management
- **createLazyState(definitions)**: Efficiently manage state with caching strategies (e.g., "always", "once", "timed").

### Randomization
- **rng(low, high, decimals)**: Generate random numbers with optional decimal precision.
- **randomItem(collection)**: Pick a random item from an array.

### Logging
- **log(level, message, keywords, ...data)**: Advanced logging with log levels and keyword-based filters.
- Log levels:
    - `off`
    - `error`
    - `warning`
    - `debug`

### Storage
- **storage.save(key, value)**: Save data to `localStorage`.
- **storage.load(key, defaultValue)**: Load data from `localStorage` with a fallback.
- **storage.listKeys()**: List all keys in `localStorage`.

### Miscellaneous Utilities
- **sendRequest(url, payload)**: Make HTTP requests with JSON payloads.
- **getKeyNameByValue(obj, value)**: Retrieve an object's key by its value.
- **attachOnClick(id, fn, params, callback)**: Bind functions to elements by their `id`.

## Installation

```bash
npm install laser-mace
```

## Usage

```javascript
import { greetLaserMace, Crono, createLazyState, rng } from 'laser-mace';

// Greet from Laser-Mace
console.log(greetLaserMace());

// Use Crono for a game loop
Crono.setLoop((time) => {
    console.log(`Game running at: ${Crono.CurrentFPS()} FPS`);
});
Crono.Start();

// Random number generator
console.log(rng(1, 100));

// Create and manage lazy state
const state = createLazyState({
    example: ["timed", () => Date.now(), 5000],
});
console.log(state.example);
```

## Contributing

Got a crazy idea? Open a PR and let’s build the Laser-Mace universe together.

## License

MIT – Go wild.

---

Laser-Mace: Because every project deserves a little fun and chaos.
