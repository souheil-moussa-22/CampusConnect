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

  it('redistributes the skill weight when no required skills are specified', () => {
    const candidate = {
      id:'1', name:'Maya', specialty:'Computer Science', level:'L2', skills:['React'], availability:['Mon AM'], averageRating:4,
    };
    const request = { subject:'Computer Science', level:'L2', availability:['Mon AM'] };

    const result = calculateCompatibility(candidate, request);
    const emptySkillsResult = calculateCompatibility(candidate, { ...request, requiredSkills: [] });

    expect(result.score).toBe(97);
    expect(emptySkillsResult.score).toBe(result.score);
    expect(result.matchingSkills).toEqual([]);
  });
});
