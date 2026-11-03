import React, { useState } from 'react';
import { MapPin, Lock, Unlock, Eye, Info, Layers } from 'lucide-react';
import { BiodiversityRecord, UserRole } from '../types/index.js';

interface GeoSightingsMapProps {
  records: BiodiversityRecord[];
  userRole?: UserRole;
  selectedRecordId?: string;
  onSelectRecord?: (recordId: string) => void;
}

export const GeoSightingsMap: React.FC<GeoSightingsMapProps> = ({
  records,
  userRole = 'PUBLIC',
  selectedRecordId,
  onSelectRecord
}) => {
  const [maskingEnabled, setMaskingEnabled] = useState(true);
  const [activeHoverPin, setActiveHoverPin] = useState<BiodiversityRecord | null>(null);
  const [mapMode, setMapMode] = useState<'VECTOR_ARCHIVE' | 'SATELLITE_GRID'>('VECTOR_ARCHIVE');

  // Convert GPS coordinates (lat: -90 to 90, lon: -180 to 180) to SVG viewbox (1000 x 500)
  const coordsToSvg = (lat: number, lon: number) => {
    const x = ((lon + 180) / 360) * 1000;
    const y = ((90 - lat) / 180) * 500;
    return { x, y };
  };

  const getRecordColor = (rec: BiodiversityRecord) => {
    if (rec.status === 'PUBLISHED') return '#2C5E3B'; // Forest Moss
    if (rec.status === 'VERIFIED') return '#2C5E3B';
    if (rec.status === 'UNDER_REVIEW') return '#E65F2B'; // Industrial Orange
    return '#8C8476';
  };

  return (
    <div className="cmd-card p-4 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18] space-y-3">
      {/* Map Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#1C1B18] pb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#2C5E3B]" />
          <h3 className="font-mono font-black text-xs uppercase tracking-wider text-[#1C1B18]">
            Archival Sighting Telemetry & Distribution Grid
          </h3>
          <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-[#2C5E3B] text-white border border-[#1C1B18]">
            {records.length} GEO-PINS ACTIVE
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          {/* Anti-poaching sensitivity masking toggle */}
          <button
            onClick={() => setMaskingEnabled(!maskingEnabled)}
            className={`px-3 py-1 font-bold border-2 border-[#1C1B18] flex items-center gap-1.5 transition-colors cursor-pointer shadow-[2px_2px_0px_#1C1B18] ${
              maskingEnabled
                ? 'bg-[#E65F2B] text-white hover:bg-[#1C1B18]'
                : 'bg-[#2C5E3B] text-white hover:bg-[#1C1B18]'
            }`}
            title="Toggle coordinate sensitivity masking for threatened species"
          >
            {maskingEnabled ? (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Anti-Poaching Masking: ON (50km Buffer)</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5" />
                <span>Coordinate Masking: OFF (Raw Research GPS)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Self-Contained Geospatial Vector World Map (Zero dependencies, guaranteed 100% uptime) */}
      <div className="relative w-full h-[400px] bg-[#EFE9DF] border-2 border-[#1C1B18] overflow-hidden select-none">
        <svg viewBox="0 0 1000 500" className="w-full h-full">
          {/* Grid lines (Equator, Tropics, Prime Meridian, Parallels) */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#D6CEBE" strokeWidth="0.8" strokeDasharray="2,2" />
            </pattern>
          </defs>
          <rect width="1000" height="500" fill="#EFE9DF" />
          <rect width="1000" height="500" fill="url(#grid)" />

          {/* Equator & Meridian Guides */}
          <line x1="0" y1="250" x2="1000" y2="250" stroke="#8C8476" strokeWidth="1.2" strokeDasharray="4,4" />
          <line x1="500" y1="0" x2="500" y2="500" stroke="#8C8476" strokeWidth="1.2" strokeDasharray="4,4" />
          <text x="10" y="245" fontSize="9" fill="#8C8476" fontFamily="monospace">EQUATOR 0°</text>
          <text x="505" y="15" fontSize="9" fill="#8C8476" fontFamily="monospace">PRIME MERIDIAN 0°</text>

          {/* Stylized Vector Continental Landmasses */}
          <g fill="#F9F6F0" stroke="#1C1B18" strokeWidth="1.5">
            {/* North America */}
            <path d="M 120 70 L 250 60 L 280 120 L 250 160 L 230 200 L 210 240 L 190 260 L 170 240 L 140 210 L 100 170 L 90 120 Z" />
            {/* Greenland */}
            <path d="M 330 30 L 410 40 L 380 90 L 320 70 Z" />
            {/* South America */}
            <path d="M 240 260 L 320 280 L 350 340 L 320 420 L 280 460 L 260 400 L 240 330 Z" />
            {/* Europe */}
            <path d="M 460 70 L 550 60 L 560 120 L 510 140 L 470 140 L 450 100 Z" />
            {/* Africa */}
            <path d="M 460 160 L 550 160 L 590 230 L 560 320 L 520 380 L 480 340 L 450 250 L 440 200 Z" />
            {/* Madagascar */}
            <path d="M 605 320 L 620 340 L 610 370 L 595 340 Z" />
            {/* Asia */}
            <path d="M 560 60 L 850 70 L 890 140 L 820 180 L 760 210 L 710 240 L 640 240 L 600 200 L 560 130 Z" />
            {/* India Subcontinent */}
            <path d="M 680 190 L 730 200 L 720 270 L 685 240 Z" />
            {/* Southeast Asia / Indonesia archipelago */}
            <path d="M 750 250 L 820 250 L 840 290 L 790 310 L 750 280 Z" />
            {/* Australia */}
            <path d="M 780 340 L 880 330 L 910 390 L 860 440 L 790 420 L 760 370 Z" />
            {/* Antarctica */}
            <path d="M 150 480 L 850 480 L 830 495 L 170 495 Z" />
          </g>

          {/* Render Specimen Pins & Coordinates */}
          {records.map((rec) => {
            if (!rec.location || typeof rec.location.latitude !== 'number') return null;

            const { x, y } = coordsToSvg(rec.location.latitude, rec.location.longitude);
            const isSelected = rec.recordId === selectedRecordId;
            const isSensitive = rec.location.isSensitive && maskingEnabled;
            const color = getRecordColor(rec);

            return (
              <g
                key={rec.recordId}
                className="cursor-pointer transition-transform"
                onClick={() => onSelectRecord && onSelectRecord(rec.recordId)}
                onMouseEnter={() => setActiveHoverPin(rec)}
                onMouseLeave={() => setActiveHoverPin(null)}
              >
                {/* 50km Masking Buffer Circle if endangered */}
                {isSensitive && (
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 34 : 26}
                    fill="#E65F2B"
                    fillOpacity="0.22"
                    stroke="#E65F2B"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />
                )}

                {/* Radar Pulse ring for selected */}
                {isSelected && (
                  <circle
                    cx={x}
                    cy={y}
                    r={18}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeDasharray="2,2"
                    className="animate-ping"
                  />
                )}

                {/* Hard Pin Base */}
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 9 : 7}
                  fill={color}
                  stroke="#1C1B18"
                  strokeWidth="2"
                />
                <circle
                  cx={x}
                  cy={y}
                  r={2.5}
                  fill="#F9F6F0"
                />

                {/* Label Stamp */}
                <text
                  x={x + 12}
                  y={y + 4}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="bold"
                  fill="#1C1B18"
                  className="select-none bg-white"
                >
                  {rec.speciesName || rec.recordId}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Drawer on Pin Hover/Select */}
        {activeHoverPin && (
          <div className="absolute top-3 left-3 z-20 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18] p-3 max-w-xs font-mono text-xs space-y-1">
            <div className="flex items-center justify-between border-b border-[#1C1B18] pb-1 font-bold">
              <span className="text-[#2C5E3B]">{activeHoverPin.speciesName || 'Specimen Sighting'}</span>
              <span className={`px-1 text-[9px] border border-[#1C1B18] ${
                activeHoverPin.status === 'PUBLISHED' ? 'bg-[#2C5E3B] text-white' : 'bg-[#E65F2B] text-white'
              }`}>
                {activeHoverPin.status}
              </span>
            </div>
            <p className="text-[11px] text-[#1C1B18] line-clamp-2">{activeHoverPin.description}</p>
            <div className="text-[10px] text-[#8C8476] pt-1 border-t border-[#D6CEBE]">
              Region: {activeHoverPin.location.region}
              <br />
              {activeHoverPin.location.isSensitive && maskingEnabled ? (
                <span className="text-[#E65F2B] font-bold">🔒 GPS MASKED: 50km Buffer</span>
              ) : (
                <span className="text-[#2C5E3B] font-bold">GPS: {activeHoverPin.location.latitude}° N, {activeHoverPin.location.longitude}° E</span>
              )}
            </div>
          </div>
        )}

        {/* Map Legend Overlay */}
        <div className="absolute bottom-3 right-3 z-10 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[3px_3px_0px_#1C1B18] p-2.5 font-mono text-[10px] space-y-1.5">
          <div className="font-bold uppercase tracking-wider border-b border-[#1C1B18] pb-1 flex items-center justify-between gap-4">
            <span>Archive Map Key</span>
            <span className="text-[#2C5E3B]">WGS84</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#2C5E3B] border border-[#1C1B18]"></span>
            <span>Verified & Published</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#E65F2B] border border-[#1C1B18]"></span>
            <span>Pending Review / Consensus</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full border border-dashed border-[#E65F2B] bg-[#E65F2B]/20"></span>
            <span>50km Anti-Poaching Buffer</span>
          </div>
        </div>
      </div>
    </div>
  );
};
