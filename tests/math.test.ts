import { createRollingAverage } from '../src/math';

describe('createRollingAverage', () => {
  it('calculates rolling average correctly', () => {
    const avg = createRollingAverage(3);
    avg.add(1);
    expect(avg.getAverage()).toBeCloseTo(1);
    avg.add(2);
    expect(avg.getAverage()).toBeCloseTo(1.5);
    avg.add(3);
    expect(avg.getAverage()).toBeCloseTo(2);
    avg.add(4);
    expect(avg.getAverage()).toBeCloseTo(3);
  });
});
