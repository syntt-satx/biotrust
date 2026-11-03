import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, Globe, AlertTriangle } from 'lucide-react';
import { RecordStatus } from '../types/index.js';

interface WorkflowProgressTrackerProps {
  status: RecordStatus;
  version: number;
  consensusCount?: number;
  requiredConsensus?: number;
}

export const WorkflowProgressTracker: React.FC<WorkflowProgressTrackerProps> = ({
  status,
  version,
  consensusCount = 0,
  requiredConsensus = 2
}) => {
  const steps = [
    {
      step: 1,
      title: '1. Draft Submission',
      subtitle: `v${version} Observation & DNA Ingested`,
      desc: 'Author logs coordinates, specimen data, and attaches research papers.'
    },
    {
      step: 2,
      title: '2. Under Peer Review',
      subtitle: 'Evidentiary & Spatial Audit',
      desc: 'Certified reviewers examine morphological and GenBank sequence data.'
    },
    {
      step: 3,
      title: '3. Consensus Verification',
      subtitle: `${consensusCount}/${requiredConsensus} Peer Approvals`,
      desc: 'Independent peer agreement reached under BioTrust verification rules.'
    },
    {
      step: 4,
      title: '4. Published to Public',
      subtitle: 'Global Repository Release',
      desc: 'Record receives Trust Score badge and enters open public explorer.'
    }
  ];

  const getActiveStep = () => {
    switch (status) {
      case 'DRAFT': return 1;
      case 'UNDER_REVIEW': return 2;
      case 'VERIFIED': return 3;
      case 'PUBLISHED': return 4;
      case 'DISPUTED': return 2; // flagged during review
      default: return 1;
    }
  };

  const currentStep = getActiveStep();
  const isDisputed = status === 'DISPUTED';

  return (
    <div className="cmd-card p-4 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[3px_3px_0px_#1C1B18] space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#1C1B18] pb-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2C5E3B]" />
          <h4 className="font-mono font-black text-xs uppercase tracking-wider text-[#1C1B18]">
            4-Step Biodiversity Verification Protocol
          </h4>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="text-[#8C8476]">Active Status:</span>
          <span className={`px-2 py-0.5 font-bold border border-[#1C1B18] ${
            status === 'PUBLISHED' ? 'bg-[#2C5E3B] text-white' :
            status === 'VERIFIED' ? 'bg-[#2C5E3B] text-white' :
            status === 'DISPUTED' ? 'bg-[#E65F2B] text-white' :
            status === 'UNDER_REVIEW' ? 'bg-[#E65F2B] text-white' : 'bg-[#EFE9DF] text-[#1C1B18]'
          }`}>
            {status}
          </span>
        </div>
      </div>

      {/* Disputed Alert Banner if applicable */}
      {isDisputed && (
        <div className="p-2.5 bg-[#E65F2B]/15 border-2 border-[#E65F2B] text-xs text-[#1C1B18] flex items-center gap-2 font-bold">
          <AlertTriangle className="w-4 h-4 text-[#E65F2B] flex-shrink-0" />
          <span>Record Disputed by Reviewer. Evidentiary contradictions detected. Quarantined from publication.</span>
        </div>
      )}

      {/* 4-Step Visual Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
        {steps.map((s) => {
          const isComplete = currentStep > s.step || (currentStep === 4 && s.step === 4);
          const isCurrent = currentStep === s.step && !isDisputed;

          return (
            <div
              key={s.step}
              className={`p-3 border-2 transition-all ${
                isCurrent
                  ? 'bg-[#EFE9DF] border-[#1C1B18] shadow-[3px_3px_0px_#2C5E3B]'
                  : isComplete
                  ? 'bg-[#2C5E3B]/10 border-[#2C5E3B]'
                  : 'bg-[#F9F6F0] border-[#D6CEBE] opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 font-mono text-xs">
                <span className="font-extrabold text-[#1C1B18]">{s.title}</span>
                {isComplete ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2C5E3B]" />
                ) : isCurrent ? (
                  <Clock className="w-3.5 h-3.5 text-[#E65F2B] animate-pulse" />
                ) : (
                  <span className="text-[10px] text-[#8C8476]">Pending</span>
                )}
              </div>
              <div className="text-[11px] font-bold text-[#2C5E3B] font-mono">{s.subtitle}</div>
              <p className="text-[10px] text-[#8C8476] mt-1 leading-snug">{s.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
