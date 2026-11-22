import { describe, expect, it } from 'vitest';
import { calculateCompatibility } from './calculator';
describe('calculateCompatibility', () => {
  it('returns a bounded transparent score', () => {
    const result = calculateCompatibility(
      { id:'1', name:'Maya', specialty:'Computer Science', level:'L2', skills:['React','Node'], availability:['Mon AM'], averageRating:4 },
      { subject:'Computer Science', level:'L2', requiredSkills:['React','SQL'], availability:['Mon AM'] }
    );
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.matchingSkills).toEqual(['React']);
  });
});
