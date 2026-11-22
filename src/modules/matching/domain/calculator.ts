export interface MatchingCandidate {
  id: string; name: string; specialty?: string | null; level?: string | null;
  skills: string[]; availability: string[]; averageRating: number;
}
export interface MatchingRequest { subject: string; level: string; requiredSkills: string[]; availability: string[] }

export function calculateCompatibility(candidate: MatchingCandidate, request: MatchingRequest) {
  const matchingSkills = candidate.skills.filter(skill => request.requiredSkills.some(required => required.toLowerCase() === skill.toLowerCase()));
  const skillOverlap = request.requiredSkills.length ? matchingSkills.length / request.requiredSkills.length : 0;
  const specialtyMatch = candidate.specialty?.toLowerCase().includes(request.subject.toLowerCase()) ? 1 : 0;
  const levelMatch = candidate.level?.toLowerCase() === request.level.toLowerCase() ? 1 : 0.5;
  const availabilityOverlap = request.availability.length && candidate.availability.length
    ? candidate.availability.filter(value => request.availability.includes(value)).length / request.availability.length : 0;
  const rating = Math.max(0, Math.min(5, candidate.averageRating)) / 5;
  const score = Math.round((skillOverlap * .40 + specialtyMatch * .20 + levelMatch * .15 + availabilityOverlap * .15 + rating * .10) * 100);
  return { candidate, score, matchingSkills, explanation: `${matchingSkills.length} matching skill${matchingSkills.length === 1 ? '' : 's'}, ${specialtyMatch ? 'specialty match' : 'no specialty match'}, rating ${candidate.averageRating.toFixed(1)}/5` };
}
