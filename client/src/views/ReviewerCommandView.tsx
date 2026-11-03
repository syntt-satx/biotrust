import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, FileQuestion, ShieldCheck, UserCheck, Dna, BookOpen } from 'lucide-react';
import { BiodiversityRecord, Species } from '../types/index.js';
import { api } from '../services/api.js';
import { TrustScoreBadge } from '../components/TrustScoreBadge.js';
import { VersionDiffViewer } from '../components/VersionDiffViewer.js';
import { WorkflowProgressTracker } from '../components/WorkflowProgressTracker.js';

interface ReviewerCommandViewProps {
  onShowToast?: (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => void;
}

export const ReviewerCommandView: React.FC<ReviewerCommandViewProps> = ({ onShowToast }) => {
  const [pendingRecords, setPendingRecords] = useState<BiodiversityRecord[]>([]);
  const [speciesMap, setSpeciesMap] = useState<Record<string, Species>>({});
  const [selectedRecord, setSelectedRecord] = useState<BiodiversityRecord | null>(null);
  const [loading, setLoading] = useState(false);

  // Review Form State
  const [reviewComments, setReviewComments] = useState('');
  const [confidenceScore, setConfidenceScore] = useState<number>(5);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allRecords, allSpecies] = await Promise.all([
        api.getPublicRecords(),
        api.getSpecies()
      ]);

      const map: Record<string, Species> = {};
      allSpecies.forEach(s => { map[s.speciesId] = s; });
      setSpeciesMap(map);

      const report = await api.getReport('REVIEWER');
      
      const pendingIds: string[] = report.consensusRequiredRecords?.map((r: any) => r.recordId) || ['rec_rev_003'];
      const recordsData = await Promise.all(
        pendingIds.map(id => api.getRecordById(id).catch(() => null))
      );

      const valid = recordsData.filter(r => r !== null) as BiodiversityRecord[];
      setPendingRecords(valid);
      if (valid.length > 0 && !selectedRecord) {
        setSelectedRecord(valid[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVerify = async () => {
    if (!selectedRecord) return;
    if (!reviewComments.trim()) {
      alert('Please provide evidentiary verification comments.');
      return;
    }

    try {
      const updated = await api.reviewRecord(selectedRecord.recordId, 'Verified', reviewComments, confidenceScore);
      const newVCount = updated.verifications.filter(v => v.decision === 'Verified').length;
      if (onShowToast) {
        onShowToast(
          'success',
          'Peer Approval Recorded',
          `Verification recorded for #${updated.recordId}. Consensus tally: ${newVCount}/${updated.requiredConsensus}`
        );
      } else {
        alert(`Decision recorded! Record #${updated.recordId} is now '${updated.status}'. Consensus: ${newVCount}/${updated.requiredConsensus}`);
      }
      setReviewComments('');
      await loadData();
      setSelectedRecord(updated);
    } catch (err: any) {
      if (onShowToast) {
        onShowToast('error', 'Verification Failed', err.message);
      } else {
        alert(err.message);
      }
    }
  };

  const handleRequestInfo = async () => {
    if (!selectedRecord) return;
    if (!reviewComments.trim()) {
      alert('Please provide notes explaining what additional information is required.');
      return;
    }

    try {
      await api.reviewRecord(selectedRecord.recordId, 'RequestInfo', reviewComments, confidenceScore);
      if (onShowToast) {
        onShowToast(
          'warning',
          'Revision Requested',
          `Record reverted to DRAFT with questions dispatched to the researcher.`
        );
      } else {
        alert(`Revision requested! Record reverted to DRAFT status with your feedback sent to the submitter.`);
      }
      setReviewComments('');
      await loadData();
      setSelectedRecord(null);
    } catch (err: any) {
      if (onShowToast) {
        onShowToast('error', 'Request Failed', err.message);
      } else {
        alert(err.message);
      }
    }
  };

  const handleDispute = async () => {
    if (!selectedRecord) return;
    if (!reviewComments.trim()) {
      alert('Please provide the scientific rationale for disputing this record.');
      return;
    }

    try {
      const updated = await api.reviewRecord(selectedRecord.recordId, 'Disputed', reviewComments, confidenceScore);
      if (onShowToast) {
        onShowToast(
          'error',
          'Record Disputed & Quarantined',
          `Record #${updated.recordId} quarantined. Status set to DISPUTED.`
        );
      } else {
        alert(`Record disputed! Status is now DISPUTED (hidden from public).`);
      }
      setReviewComments('');
      await loadData();
      setSelectedRecord(updated);
    } catch (err: any) {
      if (onShowToast) {
        onShowToast('error', 'Dispute Failed', err.message);
      } else {
        alert(err.message);
      }
    }
  };

  const handlePublishRecord = async () => {
    if (!selectedRecord) return;
    try {
      const published = await api.publishRecord(selectedRecord.recordId);
      if (onShowToast) {
        onShowToast(
          'success',
          'Published to Public Explorer',
          `Record #${published.recordId} is now live with Trust Score ${published.trustScore}!`
        );
      } else {
        alert(`Record #${published.recordId} has been PUBLISHED to the Global Repository!`);
      }
      await loadData();
      setSelectedRecord(published);
    } catch (err: any) {
      if (onShowToast) {
        onShowToast('error', 'Publish Failed', err.message);
      } else {
        alert(err.message);
      }
    }
  };

  const species = selectedRecord ? speciesMap[selectedRecord.speciesId] : null;
  const verifiedCount = selectedRecord ? selectedRecord.verifications.filter(v => v.decision === 'Verified').length : 0;
  const requiredCount = selectedRecord ? selectedRecord.requiredConsensus : 2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#E65F2B] text-white border border-[#1C1B18]">
              Archive Module 4 // Verification State Machine & Consensus Matrix
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-[#1C1B18] mt-2 mb-1 tracking-tight">
              Peer Review & Multi-Reviewer Consensus
            </h1>
            <p className="text-xs md:text-sm text-[#8C8476] leading-relaxed">
              Certified Reviewer Queue: Evaluate DNA assays, examine scientific literature, check conflicting records, and cast consensus votes.
            </p>
          </div>
          <div className="p-3 bg-[#EFE9DF] border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] text-xs font-mono space-y-1">
            <div className="text-[#1C1B18]">Active Reviewer: <strong className="text-[#2C5E3B]">Prof. Thandiwe Moyo</strong></div>
            <div className="text-[#1C1B18]">Taxonomic Match: <strong className="text-[#2C5E3B]">Mammalia / Ecology</strong></div>
            <div className="text-[#E65F2B] font-bold">Consensus Rule: 2 Peer Approvals Required</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Queue & Review Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pending Records Queue */}
        <div className="lg:col-span-5 space-y-3">
          <div className="border-b-2 border-[#1C1B18] pb-2 font-mono">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#1C1B18]">
                Adjudication Queue ({pendingRecords.length})
              </h3>
              <span className="text-[10px] text-[#2C5E3B] font-bold">CONSENSUS PENDING</span>
            </div>
            <p className="text-[10px] text-[#8C8476] mt-1 normal-case font-serif leading-snug">
              Displays submissions awaiting peer review (<strong className="text-[#E65F2B] font-mono">UNDER_REVIEW</strong>). Work-in-progress drafts in Scientist Studio remain private to the researcher until submitted.
            </p>
          </div>

          {loading ? (
            <p className="text-xs text-[#8C8476] py-6 text-center font-mono">Loading pending queue...</p>
          ) : pendingRecords.length === 0 ? (
            <p className="text-xs text-[#8C8476] py-6 text-center italic font-serif">No records waiting for peer review right now.</p>
          ) : (
            pendingRecords.map((rec) => {
              const spc = speciesMap[rec.speciesId];
              const isSelected = selectedRecord?.recordId === rec.recordId;
              const vCount = rec.verifications.filter(v => v.decision === 'Verified').length;

              return (
                <div
                  key={rec.recordId}
                  onClick={() => setSelectedRecord(rec)}
                  className={`p-4 cursor-pointer transition-all border-2 border-[#1C1B18] ${
                    isSelected
                      ? 'bg-[#EFE9DF] shadow-[4px_4px_0px_#1C1B18] translate-x-1'
                      : 'bg-[#F9F6F0] hover:bg-[#EFE9DF]/60 shadow-[2px_2px_0px_#1C1B18]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 font-mono">
                    <span className="text-xs font-black text-[#1C1B18]">
                      #{rec.recordId}
                    </span>
                    <span className="px-2 py-0.5 text-[9px] font-bold bg-[#E65F2B] text-white border border-[#1C1B18] shadow-[1px_1px_0px_#1C1B18]">
                      {rec.status}
                    </span>
                  </div>

                  <h4 className="font-black text-sm text-[#1C1B18] mt-1">
                    {spc ? spc.commonName : 'Species Observation'}
                  </h4>

                  <p className="text-xs text-[#1C1B18] line-clamp-2 mt-1 leading-relaxed font-serif">
                    {rec.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-[#D6CEBE] flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold text-[#2C5E3B]">
                      Consensus: {vCount}/{rec.requiredConsensus} Verified
                    </span>
                    <TrustScoreBadge score={rec.trustScore} badge={rec.trustBadge} showBreakdown={false} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed Review Workspace */}
        <div className="lg:col-span-7 space-y-6">
          {selectedRecord ? (
            <div className="p-6 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18] space-y-6">
              {/* 4-Step Verification Workflow Progress Tracker */}
              <WorkflowProgressTracker
                status={selectedRecord.status}
                version={selectedRecord.version}
                consensusCount={verifiedCount}
                requiredConsensus={requiredCount}
              />

              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#1C1B18] pb-4">
                <div>
                  <div className="flex items-center gap-2 font-mono">
                    <h3 className="text-lg font-black text-[#1C1B18]">
                      {species ? species.commonName : 'Observation'} (#{selectedRecord.recordId})
                    </h3>
                    <span className="px-2 py-0.5 text-xs font-bold bg-[#2C5E3B] text-white border border-[#1C1B18]">
                      v{selectedRecord.version}
                    </span>
                  </div>
                  <p className="text-xs text-[#8C8476] mt-0.5 font-mono">
                    Author: {selectedRecord.submitterName} ({new Date(selectedRecord.submissionDate).toLocaleDateString()})
                  </p>
                </div>

                <TrustScoreBadge score={selectedRecord.trustScore} badge={selectedRecord.trustBadge} />
              </div>

              {/* Consensus Tracker Progress Box */}
              <div className="p-4 bg-[#EFE9DF] border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-black text-[#1C1B18] uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#2C5E3B]" />
                    <span>Consensus Tally: {verifiedCount} of {requiredCount} Required Peer Approvals</span>
                  </span>
                  <span className="font-mono font-black text-[#2C5E3B]">
                    {Math.round((verifiedCount / requiredCount) * 100)}% Complete
                  </span>
                </div>

                <div className="w-full h-3 bg-[#F9F6F0] border-2 border-[#1C1B18] overflow-hidden">
                  <div
                    className="h-full bg-[#2C5E3B] transition-all duration-300"
                    style={{ width: `${Math.min(100, (verifiedCount / requiredCount) * 100)}%` }}
                  />
                </div>

                {selectedRecord.verifications && selectedRecord.verifications.length > 0 && (
                  <div className="pt-2 border-t-2 border-[#1C1B18] space-y-1.5">
                    <span className="text-[10px] font-mono text-[#8C8476] uppercase block font-bold">Recorded Peer Reviews:</span>
                    {selectedRecord.verifications.map((v, i) => (
                      <div key={i} className="text-xs p-2.5 bg-[#F9F6F0] border border-[#1C1B18] shadow-[1px_1px_0px_#1C1B18]">
                        <div className="flex items-center justify-between font-bold text-[#1C1B18]">
                          <span className="font-mono font-black">{v.reviewerName}</span>
                          <span className={`px-2 py-0.5 text-[9px] font-mono font-bold border border-[#1C1B18] ${
                            v.decision === 'Verified' ? 'bg-[#2C5E3B] text-white' : 'bg-[#E65F2B] text-white'
                          }`}>{v.decision}</span>
                        </div>
                        <p className="text-[#1C1B18] italic mt-1 text-[11px] font-serif">"{v.comments}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Observation & Location Data */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8C8476]">
                  Field Evidence & Observations
                </h4>
                <p className="text-xs md:text-sm text-[#1C1B18] leading-relaxed bg-[#EFE9DF] p-3 border-2 border-[#1C1B18] font-serif">
                  {selectedRecord.description}
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs pt-1 font-mono">
                  <div className="p-2.5 bg-[#EFE9DF] border-2 border-[#1C1B18]">
                    <span className="text-[#8C8476] block text-[10px] font-bold">GPS COORDINATES:</span>
                    <span className="text-[#2C5E3B] font-bold">{selectedRecord.location.latitude}° N, {selectedRecord.location.longitude}° E</span>
                  </div>
                  <div className="p-2.5 bg-[#EFE9DF] border-2 border-[#1C1B18]">
                    <span className="text-[#8C8476] block text-[10px] font-bold">HABITAT / REGION:</span>
                    <span className="text-[#1C1B18] font-bold">{selectedRecord.location.habitatType} ({selectedRecord.location.region})</span>
                  </div>
                </div>
              </div>

              {/* DNA Evidence & Scientific Papers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-[#EFE9DF] border-2 border-[#1C1B18] text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-black font-mono text-[#1C1B18] border-b border-[#1C1B18] pb-1">
                    <Dna className="w-4 h-4 text-[#2C5E3B]" />
                    <span>DNA Assays ({selectedRecord.dnaSamples?.length || 0})</span>
                  </div>
                  {selectedRecord.dnaSamples?.length ? (
                    selectedRecord.dnaSamples.map(d => (
                      <div key={d.sampleId} className="p-2 bg-[#F9F6F0] border border-[#1C1B18] text-[11px] space-y-0.5">
                        <strong className="block text-[#1C1B18]">{d.sampleType} Sample</strong>
                        <p className="text-[#8C8476] font-serif">{d.description}</p>
                        <span className="font-mono text-[#2C5E3B] font-bold block text-[10px]">Accession: {d.sequenceAccession || 'Pending'}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-[#8C8476] italic font-serif">No DNA sample attached to this record.</p>
                  )}
                </div>

                <div className="p-3 bg-[#EFE9DF] border-2 border-[#1C1B18] text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-black font-mono text-[#1C1B18] border-b border-[#1C1B18] pb-1">
                    <BookOpen className="w-4 h-4 text-[#E65F2B]" />
                    <span>Attached Literature ({selectedRecord.researchPapers?.length || 0})</span>
                  </div>
                  {selectedRecord.researchPapers?.length ? (
                    selectedRecord.researchPapers.map(p => (
                      <div key={p.paperId} className="p-2 bg-[#F9F6F0] border border-[#1C1B18] text-[11px] space-y-0.5">
                        <strong className="block text-[#1C1B18]">{p.title}</strong>
                        <p className="text-[#8C8476] font-serif">{p.journal} ({p.authors?.join(', ')})</p>
                        <span className="font-mono text-[#2C5E3B] font-bold block text-[10px]">DOI: {p.doi || 'N/A'}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-[11px] text-[#8C8476] italic font-serif">No research papers attached to this record.</p>
                  )}
                </div>
              </div>

              {/* Version Diff Viewer */}
              <VersionDiffViewer record={selectedRecord} />

              {/* Reviewer Action Command Box with CRYSTAL-CLEAR BUTTONS */}
              {selectedRecord.status === 'UNDER_REVIEW' && (
                <div className="p-4 bg-[#EFE9DF] border-2 border-[#1C1B18] shadow-[3px_3px_0px_#1C1B18] space-y-3">
                  <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#1C1B18] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#2C5E3B]" />
                    <span>Peer Review Adjudication Console</span>
                  </h4>

                  <textarea
                    rows={3}
                    placeholder="Enter scientific verification remarks, morphological corroboration, or required revisions..."
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    className="w-full p-2.5 text-xs bg-[#F9F6F0] border-2 border-[#1C1B18] text-[#1C1B18] font-serif focus:outline-none"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-[#8C8476] font-bold">Confidence Index:</span>
                      <select
                        value={confidenceScore}
                        onChange={(e) => setConfidenceScore(Number(e.target.value))}
                        className="px-2 py-1 bg-[#F9F6F0] border-2 border-[#1C1B18] text-[#1C1B18] font-bold"
                      >
                        <option value={5}>5 - Maximum Rigor</option>
                        <option value={4}>4 - High Confidence</option>
                        <option value={3}>3 - Moderate</option>
                        <option value={2}>2 - Marginal</option>
                      </select>
                    </div>

                    {/* Crystal-Clear Action Buttons with Instant Toast Feedback */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Request More Information */}
                      <button
                        onClick={handleRequestInfo}
                        className="px-3.5 py-2 text-xs font-mono font-bold bg-[#F9F6F0] text-[#1C1B18] border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] hover:bg-[#EFE9DF] transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Reverts record to DRAFT so scientist can address questions"
                      >
                        <FileQuestion className="w-3.5 h-3.5 text-[#8C8476]" />
                        <span>Request More Information</span>
                      </button>

                      {/* Dispute */}
                      <button
                        onClick={handleDispute}
                        className="px-3.5 py-2 text-xs font-mono font-bold bg-[#E65F2B] text-white border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] hover:bg-[#1C1B18] hover:text-[#E65F2B] transition-colors cursor-pointer flex items-center gap-1.5"
                        title="Disputes and quarantines record from publication"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Dispute</span>
                      </button>

                      {/* Approve & Verify */}
                      <button
                        onClick={handleVerify}
                        className="px-4 py-2 text-xs font-mono font-bold bg-[#2C5E3B] text-white border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] hover:bg-[#1C1B18] transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve & Verify</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Ready to Publish Button if Consensus is satisfied */}
              {selectedRecord.status === 'VERIFIED' && (
                <div className="p-4 bg-[#EFE9DF] border-2 border-[#2C5E3B] shadow-[3px_3px_0px_#1C1B18] flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-black text-sm font-mono text-[#2C5E3B]">
                      Consensus Achieved ({verifiedCount}/{requiredCount} Verified)
                    </h4>
                    <p className="text-xs text-[#8C8476] font-serif">
                      Golden Rule satisfied. Record is verified and eligible for global repository dissemination.
                    </p>
                  </div>
                  <button
                    onClick={handlePublishRecord}
                    className="px-5 py-2.5 text-xs font-bold font-mono bg-[#2C5E3B] text-white border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] hover:bg-[#1C1B18] cursor-pointer"
                  >
                    Publish to Global Repository
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18] text-center text-[#8C8476] text-xs italic font-serif">
              Select a record from the Adjudication queue to evaluate evidentiary telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
