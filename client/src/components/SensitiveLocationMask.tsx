import React from 'react';
import { ShieldCheck, Lock, MapPin } from 'lucide-react';
import { LocationData, MaskedLocationData, UserRole } from '../types/index.js';

interface SensitiveLocationMaskProps {
  location: LocationData | MaskedLocationData | any;
  userRole: UserRole;
  speciesThreatLevel?: string;
}

export const SensitiveLocationMask: React.FC<SensitiveLocationMaskProps> = ({ location, userRole, speciesThreatLevel }) => {
  if (!location) return null;

  const isMasked = 'latitudeMasked' in location || (location.isSensitive && userRole === 'PUBLIC');

  return (
    <div className="cmd-card-sm p-3 bg-[#EFE9DF] border-2 border-[#1C1B18] text-xs">
      <div className="flex items-center justify-between mb-1.5 font-mono">
        <span className="font-bold flex items-center gap-1.5 text-[#1C1B18]">
          <MapPin className="w-3.5 h-3.5 text-[#2C5E3B]" />
          TELEMETRY & HABITAT AUDIT
        </span>
        {isMasked ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold bg-[#E65F2B] text-white border border-[#1C1B18]">
            <Lock className="w-2.5 h-2.5" /> 50KM BUFFER ACTIVE
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-bold bg-[#2C5E3B] text-white border border-[#1C1B18]">
            <ShieldCheck className="w-2.5 h-2.5" /> RAW RESEARCH GPS
          </span>
        )}
      </div>

      <div className="space-y-1 text-[#1C1B18]">
        <p><strong className="text-[#8C8476]">Region:</strong> {location.region}, {location.country}</p>
        <p><strong className="text-[#8C8476]">Habitat Classification:</strong> {location.habitatType}</p>
        
        {isMasked ? (
          <div className="mt-2 p-2 bg-[#F9F6F0] border-2 border-[#E65F2B] space-y-1">
            <div className="font-mono text-[#E65F2B] font-bold text-xs">
              {location.latitudeMasked || `[PROTECTED - Approx ${(Math.round(location.latitude)).toFixed(1)}° N/S]`} , {location.longitudeMasked || `[PROTECTED - Approx ${(Math.round(location.longitude)).toFixed(1)}° E/W]`}
            </div>
            <p className="text-[10px] text-[#8C8476] italic leading-tight">
              ⚠️ Anti-Poaching Telemetry Protection: Exact GPS coordinates obfuscated to a 50km radius for {speciesThreatLevel || 'threatened'} species under BioTrust Security Protocol §4.2.
            </p>
          </div>
        ) : (
          <div className="mt-1 font-mono text-[#2C5E3B] font-bold bg-[#F9F6F0] p-1.5 border border-[#1C1B18]">
            GPS: {location.latitude?.toFixed(4)}° N, {location.longitude?.toFixed(4)}° E (Unrestricted research coordinate access)
          </div>
        )}
      </div>
    </div>
  );
};
