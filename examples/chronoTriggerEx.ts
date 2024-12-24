// --- Example Usage in a Game Project ---
import { CT } from '../dist/';

CT.setLoop(() => {
    let playerX = 0;
    let frameCount = 0;

    // Runs 60 times per second
    CT.runAt(60, () => {
        playerX += 1;
        console.log(`Player X position: ${playerX}`);
    });

    // Runs 30 times per second
    CT.runAt(30, () => {
        frameCount++;
        console.log(`Frame count: ${frameCount}`);
    });

    // This part runs as fast as possible
    console.log('Running game logic at max speed');

    // Log the current FPS
    console.log(`Current FPS: ${CT.CurrentFPS()}`);
});

CT.Start();