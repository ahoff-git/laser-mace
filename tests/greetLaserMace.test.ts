import { greetLaserMace } from '../src/test';

describe('greetLaserMace', () => {
  it('returns the greeting string', () => {
    expect(greetLaserMace()).toBe('Hello from LaserMace!');
  });
});
