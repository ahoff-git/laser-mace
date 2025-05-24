import { rng, randomItem, getContrastingColor } from '../src/random';

describe('rng', () => {
  it('generates numbers within range', () => {
    const value = rng(1, 2);
    expect(value).toBeGreaterThanOrEqual(1);
    expect(value).toBeLessThan(2);
  });
});

describe('randomItem', () => {
  it('returns an item from the array', () => {
    const arr = [1, 2, 3];
    const item = randomItem(arr);
    expect(arr).toContain(item);
  });
});

describe('getContrastingColor', () => {
  it('returns black for light colors and white for dark', () => {
    expect(getContrastingColor('#FFFFFF')).toBe('#000000');
    expect(getContrastingColor('#000000')).toBe('#FFFFFF');
  });
});
