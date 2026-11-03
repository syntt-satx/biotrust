import { BiodiversityRecord, RecordStatus, VerificationReview, User } from '../types/index.js';

export class StateTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StateTransitionError';
  }
}

export class VerificationStateMachine {
  /**
   * Submits a DRAFT record to enter the UNDER_REVIEW stage.
   */
  public static submit(record: BiodiversityRecord, assignedReviewerIds: string[]): RecordStatus {
    if (record.status !== 'DRAFT') {
      throw new StateTransitionError(`Cannot submit record: Current status is '${record.status}', expected 'DRAFT'.`);
    }

    if (!record.speciesId) {
      throw new StateTransitionError('Cannot submit record without linking a valid species.');
    }

    if (!record.description || record.description.trim().length < 10) {
      throw new StateTransitionError('Submission requires a descriptive observation summary (minimum 10 characters).');
    }

    if (!record.location || !record.location.region) {
      throw new StateTransitionError('Submission requires valid location and habitat metadata.');
    }

    record.status = 'UNDER_REVIEW';
    record.assignedReviewers = assignedReviewerIds;
    return record.status;
  }

  /**
   * Applies a peer review decision to a record currently UNDER_REVIEW.
   */
  public static applyReview(
    record: BiodiversityRecord,
    review: VerificationReview,
    reviewer: User
  ): { newStatus: RecordStatus; consensusReached: boolean } {
    if (record.status !== 'UNDER_REVIEW') {
      throw new StateTransitionError(`Record #${record.recordId} is '${record.status}'. Reviews can only be submitted for 'UNDER_REVIEW' records.`);
    }

    // Disallow self-review
    if (record.submittedBy === reviewer.userId) {
      throw new StateTransitionError('Conflict of Interest: Submitter cannot peer-review their own record.');
    }

    // Check if this reviewer already submitted a review on current version
    const existingIdx = record.verifications.findIndex(v => v.reviewerId === reviewer.userId);
    if (existingIdx >= 0) {
      record.verifications[existingIdx] = review;
    } else {
      record.verifications.push(review);
    }

    // Branching logic:
    if (review.decision === 'Disputed') {
      record.status = 'DISPUTED';
      return { newStatus: 'DISPUTED', consensusReached: false };
    }

    if (review.decision === 'RequestInfo') {
      // Revert to DRAFT so scientist can address reviewer notes in next version (v2/v3)
      record.status = 'DRAFT';
      if (!record.reviewerNotes) record.reviewerNotes = [];
      record.reviewerNotes.push(`[${reviewer.name} - Request Info]: ${review.comments}`);
      return { newStatus: 'DRAFT', consensusReached: false };
    }

    // Decision === 'Verified': Check multi-reviewer consensus
    const verifiedReviews = record.verifications.filter(v => v.decision === 'Verified');
    if (verifiedReviews.length >= record.requiredConsensus) {
      record.status = 'VERIFIED';
      return { newStatus: 'VERIFIED', consensusReached: true };
    }

    return { newStatus: 'UNDER_REVIEW', consensusReached: false };
  }

  /**
   * Publishes a VERIFIED record, making it visible to the public.
   */
  public static publish(record: BiodiversityRecord): RecordStatus {
    if (record.status !== 'VERIFIED') {
      throw new StateTransitionError(
        `BioTrust Golden Rule Violation: Cannot publish record with status '${record.status}'. Records must achieve VERIFIED consensus first.`
      );
    }

    record.status = 'PUBLISHED';
    return record.status;
  }

  /**
   * Updates an existing draft, generating a new version snapshot.
   */
  public static bumpVersion(
    record: BiodiversityRecord,
    changesSummary: string,
    updatedByUserId: string
  ): number {
    if (record.status !== 'DRAFT') {
      throw new StateTransitionError('Only records in DRAFT state can be edited with version increments.');
    }

    // Snapshot previous version
    record.versionHistory.push({
      version: record.version,
      timestamp: new Date().toISOString(),
      updatedBy: updatedByUserId,
      description: record.description,
      location: { ...record.location },
      dnaSamplesCount: record.dnaSamples ? record.dnaSamples.length : 0,
      researchPapersCount: record.researchPapers ? record.researchPapers.length : 0,
      changesSummary
    });

    record.version += 1;
    return record.version;
  }
}
