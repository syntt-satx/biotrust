import { BiodiversityRecord, User } from '../types/index.js';

export class TrustScoreCalculator {
  /**
   * Computes a comprehensive trust score (0 - 100) for a biodiversity record
   * based on evidence completeness, submitter reputation, and multi-reviewer consensus.
   */
  public static calculate(record: Partial<BiodiversityRecord>, submitter?: User): { score: number; badge: 'High' | 'Medium' | 'Low'; breakdown: Record<string, number> } {
    let score = 0;
    const breakdown: Record<string, number> = {
      dnaEvidence: 0,
      scientificLiterature: 0,
      locationPrecision: 0,
      submitterReputation: 0,
      reviewerConsensus: 0
    };

    // 1. DNA Sample completeness (up to 25 pts)
    if (record.dnaSamples && record.dnaSamples.length > 0) {
      let dnaPts = 15; // base for having sample
      const hasAccession = record.dnaSamples.some(s => s.sequenceAccession && s.sequenceAccession.trim().length > 0);
      if (hasAccession) dnaPts += 10; // verified NCBI/GenBank accession
      breakdown.dnaEvidence = dnaPts;
      score += dnaPts;
    }

    // 2. Peer-reviewed Scientific Paper Attachment (up to 25 pts)
    if (record.researchPapers && record.researchPapers.length > 0) {
      let paperPts = 15; // base paper
      const hasDoi = record.researchPapers.some(p => p.doi && p.doi.trim().length > 0);
      if (hasDoi) paperPts += 10; // verified DOI
      breakdown.scientificLiterature = paperPts;
      score += paperPts;
    }

    // 3. Location and Habitat Data Precision (up to 15 pts)
    if (record.location) {
      let locPts = 5;
      if (record.location.latitude && record.location.longitude) locPts += 5;
      if (record.location.habitatType && record.location.region) locPts += 5;
      breakdown.locationPrecision = locPts;
      score += locPts;
    }

    // 4. Submitter Reputation (up to 15 pts)
    const rep = submitter ? submitter.reputationScore : 50;
    const repPts = Math.min(15, Math.round((rep / 100) * 15));
    breakdown.submitterReputation = repPts;
    score += repPts;

    // 5. Reviewer Consensus Agreement (up to 20 pts)
    if (record.verifications && record.verifications.length > 0) {
      const verifiedCount = record.verifications.filter(v => v.decision === 'Verified').length;
      const disputedCount = record.verifications.filter(v => v.decision === 'Disputed').length;

      let reviewerPts = Math.min(20, verifiedCount * 10);
      if (disputedCount > 0) {
        reviewerPts = Math.max(0, reviewerPts - (disputedCount * 10));
      }
      breakdown.reviewerConsensus = reviewerPts;
      score += reviewerPts;
    }

    const finalScore = Math.max(5, Math.min(100, score));
    let badge: 'High' | 'Medium' | 'Low' = 'Low';
    if (finalScore >= 75) {
      badge = 'High';
    } else if (finalScore >= 50) {
      badge = 'Medium';
    }

    return { score: finalScore, badge, breakdown };
  }
}
