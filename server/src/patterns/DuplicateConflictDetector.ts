import { BiodiversityRecord, Species } from '../types/index.js';

export interface DuplicateDetectionResult {
  hasDuplicateWarning: boolean;
  hasConflictWarning: boolean;
  warnings: string[];
}

export class DuplicateConflictDetector {
  /**
   * Haversine formula to compute distance in kilometers between two GPS coordinates
   */
  public static calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Evaluates a new or updated record against the existing record repository
   */
  public static analyze(
    targetRecord: Partial<BiodiversityRecord>,
    species: Species,
    existingRecords: BiodiversityRecord[]
  ): DuplicateDetectionResult {
    const warnings: string[] = [];
    let hasDuplicate = false;
    let hasConflict = false;

    if (!targetRecord.location || !targetRecord.location.latitude || !targetRecord.location.longitude) {
      return { hasDuplicateWarning: false, hasConflictWarning: false, warnings: [] };
    }

    const targetLat = targetRecord.location.latitude;
    const targetLon = targetRecord.location.longitude;
    const targetDate = new Date(targetRecord.submissionDate || new Date().toISOString()).getTime();

    for (const record of existingRecords) {
      // Don't compare with itself
      if (record.recordId === targetRecord.recordId) continue;

      const distKm = this.calculateDistanceKm(
        targetLat,
        targetLon,
        record.location.latitude,
        record.location.longitude
      );

      const recordDate = new Date(record.submissionDate).getTime();
      const dayDiff = Math.abs((targetDate - recordDate) / (1000 * 60 * 60 * 24));

      // Same species within 15 km within 30 days -> potential duplicate sighting
      if (record.speciesId === targetRecord.speciesId && distKm <= 15 && dayDiff <= 30) {
        hasDuplicate = true;
        warnings.push(
          `Potential duplicate sighting: An existing record (#${record.recordId.slice(0, 8)}) for "${species.commonName}" was recorded ${distKm.toFixed(1)} km away within ${Math.round(dayDiff)} days.`
        );
      }

      // Habitat conflict: e.g. marine species in desert or conflicting micro-habitats
      if (
        record.speciesId === targetRecord.speciesId &&
        distKm <= 50 &&
        record.location.habitatType !== targetRecord.location.habitatType &&
        record.status === 'VERIFIED'
      ) {
        hasConflict = true;
        warnings.push(
          `Habitat discordance: Verified observation #${record.recordId.slice(0, 8)} reported "${record.location.habitatType}", whereas this submission specifies "${targetRecord.location.habitatType}".`
        );
      }
    }

    return {
      hasDuplicateWarning: hasDuplicate,
      hasConflictWarning: hasConflict,
      warnings
    };
  }
}
