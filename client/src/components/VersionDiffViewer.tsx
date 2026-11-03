import React, { useState } from 'react';
import { History, GitCommit, ArrowRight } from 'lucide-react';
import { BiodiversityRecord, RecordVersionSnapshot } from '../types/index.js';

interface VersionDiffViewerProps {
  record: BiodiversityRecord;
}

export const VersionDiffViewer: React.FC<VersionDiffViewerProps> = ({ record }) => {
  const versions: RecordVersionSnapshot[] = [
    ...(record.versionHistory || []),
    {
      version: record.version,
      timestamp: record.submissionDate,
      updatedBy: record.submittedBy,
      description: record.description,
      location: record.location,
      dnaSamplesCount: record.dnaSamples ? record.dnaSamples.length : 0,
      researchPapersCount: record.researchPapers ? record.researchPapers.length : 0,
      changesSummary: 'Current Active Iteration'
    }
  ];

  const [selectedV1, setSelectedV1] = useState<number>(versions.length > 1 ? versions[0].version : 1);
  const [selectedV2, setSelectedV2] = useState<number>(record.version);

  const snap1 = versions.find(v => v.version === selectedV1) || versions[0];
  const snap2 = versions.find(v => v.version === selectedV2) || versions[versions.length - 1];

  return (
    <div className="p-4 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[3px_3px_0px_#1C1B18] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#1C1B18] pb-3">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#2C5E3B]" />
          <h4 className="font-mono font-black text-[#1C1B18] uppercase tracking-wider text-xs">
            Telemetry Diff & Iteration Ledger
          </h4>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#2C5E3B] text-[#F9F6F0] border border-[#1C1B18]">
          Active Iteration: v{record.version}
        </span>
      </div>

      {/* Version selector bar */}
      <div className="flex flex-wrap items-center gap-3 p-2.5 bg-[#EFE9DF] border-2 border-[#1C1B18] text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#8C8476]">Base:</span>
          <select 
            value={selectedV1} 
            onChange={(e) => setSelectedV1(Number(e.target.value))}
            className="px-2 py-1 bg-[#F9F6F0] text-[#1C1B18] border border-[#1C1B18] font-bold"
          >
            {versions.map(v => (
              <option key={`v1_${v.version}`} value={v.version}>v{v.version} ({new Date(v.timestamp).toLocaleDateString()})</option>
            ))}
          </select>
        </div>

        <ArrowRight className="w-3.5 h-3.5 text-[#1C1B18]" />

        <div className="flex items-center gap-2">
          <span className="font-bold text-[#8C8476]">Compare:</span>
          <select 
            value={selectedV2} 
            onChange={(e) => setSelectedV2(Number(e.target.value))}
            className="px-2 py-1 bg-[#F9F6F0] text-[#2C5E3B] border border-[#1C1B18] font-bold"
          >
            {versions.map(v => (
              <option key={`v2_${v.version}`} value={v.version}>v{v.version} {v.version === record.version ? '(Current Active)' : ''}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-side comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Base Version */}
        <div className="p-3 bg-[#EFE9DF] border-2 border-[#1C1B18] text-xs space-y-2">
          <div className="flex items-center justify-between border-b border-[#1C1B18] pb-1 font-mono">
            <span className="font-bold text-[#8C8476] flex items-center gap-1 text-[11px]">
              <GitCommit className="w-3.5 h-3.5" />
              Iteration v{snap1.version}
            </span>
            <span className="text-[10px] text-[#8C8476]">{new Date(snap1.timestamp).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-[#8C8476] text-[10px] font-mono uppercase block font-bold">Revision Summary:</span>
            <p className="italic text-[#1C1B18] text-[11px] font-serif">{snap1.changesSummary}</p>
          </div>
          <div>
            <span className="text-[#8C8476] text-[10px] font-mono uppercase block font-bold">Observation Description:</span>
            <p className="mt-1 p-2 bg-[#F9F6F0] border border-[#1C1B18] leading-relaxed text-[#1C1B18] text-[11px]">
              {snap1.description}
            </p>
          </div>
          <div className="space-y-1 pt-1 border-t border-[#1C1B18] text-[11px] font-mono text-[#8C8476]">
            <p>Region: <span className="text-[#1C1B18]">{snap1.location?.region || 'N/A'}</span></p>
            <p>DNA Evidence: <span className="text-[#1C1B18]">{snap1.dnaSamplesCount} samples</span></p>
            <p>Literature: <span className="text-[#1C1B18]">{snap1.researchPapersCount} papers</span></p>
          </div>
        </div>

        {/* Right: Target Version */}
        <div className="p-3 bg-[#F9F6F0] border-2 border-[#2C5E3B] text-xs space-y-2 shadow-[2px_2px_0px_#1C1B18]">
          <div className="flex items-center justify-between border-b border-[#1C1B18] pb-1 font-mono">
            <span className="font-black text-[#2C5E3B] flex items-center gap-1 text-[11px]">
              <GitCommit className="w-3.5 h-3.5 text-[#2C5E3B]" />
              Iteration v{snap2.version} {snap2.version === record.version && '(Active)'}
            </span>
            <span className="text-[10px] text-[#8C8476]">{new Date(snap2.timestamp).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-[#8C8476] text-[10px] font-mono uppercase block font-bold">Revision Summary:</span>
            <p className="italic text-[#2C5E3B] text-[11px] font-bold font-serif">{snap2.changesSummary}</p>
          </div>
          <div>
            <span className="text-[#8C8476] text-[10px] font-mono uppercase block font-bold">Observation Description:</span>
            <p className="mt-1 p-2 bg-[#EFE9DF] border border-[#1C1B18] leading-relaxed text-[#1C1B18] text-[11px]">
              {snap2.description}
            </p>
          </div>
          <div className="space-y-1 pt-1 border-t border-[#1C1B18] text-[11px] font-mono text-[#8C8476]">
            <p>Region: <span className="text-[#1C1B18] font-bold">{snap2.location?.region || 'N/A'}</span></p>
            <p>
              DNA Evidence: <span className="text-[#2C5E3B] font-bold">{snap2.dnaSamplesCount} samples</span>
              {snap2.dnaSamplesCount > snap1.dnaSamplesCount && (
                <span className="ml-1 text-[9px] font-bold text-white bg-[#2C5E3B] px-1.5 py-0.2 border border-[#1C1B18]">+Added</span>
              )}
            </p>
            <p>
              Literature: <span className="text-[#2C5E3B] font-bold">{snap2.researchPapersCount} papers</span>
              {snap2.researchPapersCount > snap1.researchPapersCount && (
                <span className="ml-1 text-[9px] font-bold text-white bg-[#E65F2B] px-1.5 py-0.2 border border-[#1C1B18]">+Added</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
