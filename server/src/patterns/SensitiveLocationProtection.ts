import { LocationData, MaskedLocationData, Species, UserRole } from '../types/index.js';

export class SensitiveLocationProtection {
  /**
   * Determines if a species requires coordinate obfuscation to prevent poaching/exploitation.
   */
  public static requiresProtection(species: Species): boolean {
    const criticalThreats = ['Critically Endangered', 'Endangered', 'Vulnerable', 'Extinct in the Wild'];
    return species.isProtected || criticalThreats.includes(species.threatLevel);
  }

  /**
   * Masks coordinates for public consumption if species is protected or threatened.
   */
  public static filterLocation(
    location: LocationData,
    species: Species,
    userRole?: UserRole
  ): LocationData | MaskedLocationData {
    // Authorized roles have full access to raw research coordinates
    const authorizedRoles: UserRole[] = ['SCIENTIST', 'REVIEWER', 'ORGANIZATION', 'GOVERNMENT', 'ADMIN'];
    
    if (userRole && authorizedRoles.includes(userRole)) {
      return location;
    }

    // If public user and species needs protection, mask coordinates
    if (this.requiresProtection(species)) {
      // Obfuscate to nearest degree (~111 km resolution)
      const approxLat = (Math.round(location.latitude)).toFixed(1);
      const approxLon = (Math.round(location.longitude)).toFixed(1);

      return {
        latitudeMasked: `[PROTECTED - Approx ${approxLat}° N/S]`,
        longitudeMasked: `[PROTECTED - Approx ${approxLon}° E/W]`,
        region: location.region,
        country: location.country,
        habitatType: location.habitatType,
        isSensitive: true,
        maskingNotice: `Exact GPS coordinates masked to prevent poaching for ${species.threatLevel} species under BioTrust Security Protocol §4.2.`
      };
    }

    // For non-threatened species, public can view regular coordinates
    return location;
  }
}
