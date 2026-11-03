import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Shield, Info } from 'lucide-react';

interface TrustScoreBadgeProps {
  score: number;
  badge: 'High' | 'Medium' | 'Low';
  breakdown?: Record<string, number>;
  showBreakdown?: boolean;
}

export const TrustScoreBadge: React.FC<TrustScoreBadgeProps> = ({ score, badge, breakdown, showBreakdown = true }) => {
  const [open, setOpen] = useState(false);

  let bgClass = 'bg-[#2C5E3B] text-[#F9F6F0] border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18]';
  let Icon = ShieldCheck;
  let label = 'HIGH TRUST';

  if (badge === 'Medium') {
    bgClass = 'bg-[#EFE9DF] text-[#1C1B18] border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18]';
    Icon = Shield;
    label = 'MODERATE';
  } else if (badge === 'Low') {
    bgClass = 'bg-[#E65F2B] text-white border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18]';
    Icon = ShieldAlert;
    label = 'UNVERIFIED';
  }

  return (
    <div className="relative inline-block font-mono">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold transition-all cursor-pointer hover:translate-x-0.5 hover:translate-y-0.5 ${bgClass}`}
        title="Click to view archival Trust Score audit breakdown"
      >
        <Icon className="w-3.5 h-3.5" />
        <span>{label} ({score}/100)</span>
        {showBreakdown && <Info className="w-3 h-3 opacity-80 ml-0.5" />}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 mt-2 z-50 w-72 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[5px_5px_0px_#1C1B18] p-3 text-left">
            <div className="flex items-center justify-between border-b-2 border-[#1C1B18] pb-1.5 mb-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#1C1B18]">
                Audit Trust Breakdown
              </span>
              <span className="text-xs font-mono font-black text-[#2C5E3B]">{score} / 100</span>
            </div>
            
            <div className="space-y-1.5 text-xs text-[#1C1B18]">
              <div className="flex justify-between items-center">
                <span className="text-[#8C8476]">🧬 GenBank Loci:</span>
                <span className="font-mono font-bold">{breakdown?.dnaEvidence ?? (score > 60 ? '25/25' : '15/25')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8C8476]">📄 Peer DOI Literature:</span>
                <span className="font-mono font-bold">{breakdown?.scientificLiterature ?? (score > 80 ? '25/25' : '15/25')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8C8476]">📍 Coordinate Precision:</span>
                <span className="font-mono font-bold">{breakdown?.locationPrecision ?? '15/15'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8C8476]">🔬 Author Standing:</span>
                <span className="font-mono font-bold">{breakdown?.submitterReputation ?? '15/15'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8C8476]">⚖️ Peer Consensus:</span>
                <span className="font-mono font-bold">{breakdown?.reviewerConsensus ?? (badge === 'High' ? '20/20' : '10/20')}</span>
              </div>
            </div>

            <p className="mt-2 text-[10px] text-[#8C8476] border-t border-[#D6CEBE] pt-1 leading-snug">
              Calibrated under BioTrust Security Protocol §3. Minimum 75 required for open repository publication.
            </p>
          </div>
        </>
      )}
    </div>
  );
};
