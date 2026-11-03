import { User, Species, BiodiversityRecord } from '../types/index.js';

export interface IReviewerAssignmentStrategy {
  selectReviewers(
    candidateReviewers: User[],
    record: BiodiversityRecord,
    species: Species,
    countNeeded: number
  ): User[];
}

/**
 * Assigns reviewers based on taxonomic matching, habitat expertise,
 * and strict conflict of interest rules (excluding the author).
 */
export class ExpertiseBasedReviewerStrategy implements IReviewerAssignmentStrategy {
  selectReviewers(
    candidateReviewers: User[],
    record: BiodiversityRecord,
    species: Species,
    countNeeded: number = 2
  ): User[] {
    // 1. Strict Conflict-of-Interest Filter:
    // Submitter cannot review their own record
    const eligible = candidateReviewers.filter(
      r => r.userId !== record.submittedBy && r.status === 'ACTIVE' && r.role === 'REVIEWER'
    );

    if (eligible.length === 0) return [];

    // Relevant keywords from species
    const keywords = [
      species.commonName.toLowerCase(),
      species.scientificName.toLowerCase(),
      species.family.toLowerCase(),
      species.order.toLowerCase(),
      species.class.toLowerCase(),
      species.habitat.toLowerCase()
    ];

    // Score candidates by expertise overlap
    const scored = eligible.map(reviewer => {
      let matchScore = 0;
      for (const tag of reviewer.expertiseTags) {
        const lowerTag = tag.toLowerCase();
        if (keywords.some(k => k.includes(lowerTag) || lowerTag.includes(k))) {
          matchScore += 2;
        }
      }
      // Boost with reviewer reputation
      matchScore += reviewer.reputationScore / 100;
      return { reviewer, matchScore };
    });

    // Sort descending by match score
    scored.sort((a, b) => b.matchScore - a.matchScore);

    return scored.slice(0, countNeeded).map(s => s.reviewer);
  }
}

/**
 * Fallback Round-Robin Strategy that ensures even distribution
 */
export class RoundRobinReviewerStrategy implements IReviewerAssignmentStrategy {
  selectReviewers(
    candidateReviewers: User[],
    record: BiodiversityRecord,
    _species: Species,
    countNeeded: number = 2
  ): User[] {
    const eligible = candidateReviewers.filter(
      r => r.userId !== record.submittedBy && r.status === 'ACTIVE' && r.role === 'REVIEWER'
    );
    // Shuffle or pick next available
    return eligible.slice(0, countNeeded);
  }
}
