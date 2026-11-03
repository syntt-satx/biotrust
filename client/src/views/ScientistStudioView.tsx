import React, { useState, useEffect } from 'react';
import { Plus, Send, FileEdit, Dna, BookOpen, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Species, BiodiversityRecord, DNASample, LocationData } from '../types/index.js';
import { api } from '../services/api.js';
import { TrustScoreBadge } from '../components/TrustScoreBadge.js';
import { VersionDiffViewer } from '../components/VersionDiffViewer.js';
import { WorkflowProgressTracker } from '../components/WorkflowProgressTracker.js';

interface ScientistStudioViewProps {
  onShowToast?: (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => void;
}

export const ScientistStudioView: React.FC<ScientistStudioViewProps> = ({ onShowToast }) => {
  const [myRecords, setMyRecords] = useState<BiodiversityRecord[]>([]);
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<BiodiversityRecord | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Record Form State
  const [formSpeciesId, setFormSpeciesId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLat, setFormLat] = useState<number>(21.9497);
  const [formLon, setFormLon] = useState<number>(88.8992);
  const [formRegion, setFormRegion] = useState('Sundarbans Delta Fringe');
  const [formCountry, setFormCountry] = useState('India');
  const [formHabitat, setFormHabitat] = useState('Mangrove Swamp');
  const [formIsSensitive, setFormIsSensitive] = useState(true);

  // DNA Sample modal / form state
  const [showDnaModal, setShowDnaModal] = useState(false);
  const [dnaSampleType, setDnaSampleType] = useState<DNASample['sampleType']>('eDNA');
  const [dnaDate, setDnaDate] = useState(new Date().toISOString().slice(0, 10));
  const [dnaDesc, setDnaDesc] = useState('');
  const [dnaAccession, setDnaAccession] = useState('');
  const [dnaLab, setDnaLab] = useState('');

  // Research Paper modal / form state
  const [showPaperModal, setShowPaperModal] = useState(false);
  const [paperTitle, setPaperTitle] = useState('');
  const [paperAuthors, setPaperAuthors] = useState('');
  const [paperJournal, setPaperJournal] = useState('');
  const [paperDoi, setPaperDoi] = useState('');
  const [paperDate, setPaperDate] = useState('2025-06-15');

  // Revision Draft Form State
  const [revisionSummary, setRevisionSummary] = useState('');
  const [revisionDesc, setRevisionDesc] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [records, species] = await Promise.all([
        api.getMyRecords(),
        api.getSpecies()
      ]);
      setMyRecords(records);
      setSpeciesList(species);
      if (records.length > 0 && !selectedRecord) {
        setSelectedRecord(records[0]);
      }
      if (species.length > 0 && !formSpeciesId) {
        setFormSpeciesId(species[0].speciesId);
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

  const handleCreateDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSpeciesId || !formDescription.trim()) {
      alert('Please fill in species and description.');
      return;
    }

    try {
      const loc: LocationData = {
        latitude: Number(formLat),
        longitude: Number(formLon),
        region: formRegion,
        country: formCountry,
        habitatType: formHabitat,
        isSensitive: formIsSensitive
      };

      const created = await api.createRecord({
        speciesId: formSpeciesId,
        description: formDescription,
        location: loc
      });

      if (onShowToast) {
        onShowToast('success', 'Observation Draft Created', `Draft Record #${created.recordId} initialized at version v1.`);
      } else {
        alert(`Created Record #${created.recordId} (Status: DRAFT v1)`);
      }
      setIsCreatingNew(false);
      await loadData();
      setSelectedRecord(created);
    } catch (err: any) {
      if (onShowToast) {
        onShowToast('error', 'Draft Creation Failed', err.message);
      } else {
        alert(err.message);
      }
    }
  };

  const handleSubmitToReview = async (recordId: string) => {
    if (!confirm('Submit this draft to the BioTrust Verification State Machine? Assigned peer reviewers will be notified.')) return;
    try {
      const updated = await api.submitRecord(recordId);
      if (onShowToast) {
        onShowToast('success', 'Submitted for Peer Review', `Record #${updated.recordId} moved to UNDER_REVIEW stage.`);
      } else {
        alert(`Record #${updated.recordId} submitted! Status is now UNDER_REVIEW.`);
      }
      await loadData();
      setSelectedRecord(updated);
    } catch (err: any) {
      if (onShowToast) {
        onShowToast('error', 'Submission Failed', err.message);
      } else {
        alert(err.message);
      }
    }
  };

  const handleUpdateDraftRevision = async (recordId: string) => {
    if (!revisionDesc.trim() || !revisionSummary.trim()) {
      alert('Please provide updated description and a summary of changes.');
      return;
    }

    try {
      const updated = await api.updateDraft(recordId, {
        description: revisionDesc,
        changesSummary: revisionSummary
      });

      if (onShowToast) {
        onShowToast('success', 'Revision Snapshot Saved', `Dossier updated to iteration v${updated.version}.`);
      } else {
        alert(`Draft updated! Version bumped to v${updated.version}.`);
      }
      setRevisionSummary('');
      await loadData();
      setSelectedRecord(updated);
    } catch (err: any) {
      if (onShowToast) {
        onShowToast('error', 'Update Failed', err.message);
      } else {
        alert(err.message);
      }
    }
  };

  const handleAddDnaSample = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    try {
      await api.uploadDNASample(selectedRecord.recordId, {
        sampleType: dnaSampleType,
        collectionDate: dnaDate,
        description: dnaDesc,
        sequenceAccession: dnaAccession,
        labName: dnaLab
      });
      if (onShowToast) {
        onShowToast('success', 'DNA Sample Linked', 'Genomic sample attached successfully! Trust Score recalculated (+25).');
      } else {
        alert('DNA Sample attached successfully! Trust score updated.');
      }
      setShowDnaModal(false);
      setDnaDesc('');
      setDnaAccession('');
      await loadData();
      const updated = await api.getRecordById(selectedRecord.recordId);
      setSelectedRecord(updated);
    } catch (err: any) {
      if (onShowToast) {
        onShowToast('error', 'DNA Upload Error', err.message);
      } else {
        alert(err.message);
      }
    }
  };

  const handleAddPaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord) return;
    try {
      await api.addResearchPaper(selectedRecord.recordId, {
        title: paperTitle,
        authors: paperAuthors.split(',').map(a => a.trim()),
        publicationDate: paperDate,
        journal: paperJournal,
        doi: paperDoi
      });
      if (onShowToast) {
        onShowToast('success', 'Research Paper Linked', 'Scientific citation attached! Trust Score recalculated (+25).');
      } else {
        alert('Research Paper attached successfully! Trust score updated.');
      }
      setShowPaperModal(false);
      setPaperTitle('');
      setPaperAuthors('');
      setPaperJournal('');
      setPaperDoi('');
      await loadData();
      const updated = await api.getRecordById(selectedRecord.recordId);
      setSelectedRecord(updated);
    } catch (err: any) {
      if (onShowToast) {
        onShowToast('error', 'Paper Link Error', err.message);
      } else {
        alert(err.message);
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-[#EFE9DF] text-[#1C1B18] border-2 border-[#1C1B18]';
      case 'UNDER_REVIEW': return 'bg-[#E65F2B] text-white border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18]';
      case 'VERIFIED': return 'bg-[#2C5E3B] text-white border-2 border-[#1C1B18]';
      case 'DISPUTED': return 'bg-[#1C1B18] text-white border-2 border-[#1C1B18]';
      case 'PUBLISHED': return 'bg-[#2C5E3B] text-white border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] font-bold';
      default: return 'bg-[#F9F6F0] text-[#1C1B18] border-2 border-[#1C1B18]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="p-6 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#2C5E3B] text-white border border-[#1C1B18]">
              Archive Module 3 // Scientific Ingestion & Versioning Engine
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-[#1C1B18] mt-2 mb-1 tracking-tight">
              Scientist Research Studio
            </h1>
            <p className="text-xs md:text-sm text-[#8C8476] leading-relaxed">
              Author verified biodiversity records, link genetic evidence (GenBank accessions), attach peer-reviewed DOI literature, and manage revision drafts (v1, v2, v3).
            </p>
          </div>
          <button
            onClick={() => {
              setIsCreatingNew(!isCreatingNew);
              setSelectedRecord(null);
            }}
            className="px-4 py-2.5 text-xs font-mono font-bold bg-[#2C5E3B] text-white border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] hover:bg-[#1C1B18] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isCreatingNew ? 'Cancel Pipeline' : 'Initiate New Observation'}</span>
          </button>
        </div>
      </div>

      {/* New Observation Form Modal/Panel */}
      {isCreatingNew && (
        <div className="p-6 bg-[#EFE9DF] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18] space-y-4">
          <div className="border-b-2 border-[#1C1B18] pb-2">
            <h3 className="text-sm font-mono font-black uppercase tracking-wider text-[#2C5E3B]">
              Draft New Field Biodiversity Record (Iteration v1)
            </h3>
            <p className="text-xs text-[#8C8476]">
              Observations initiate in DRAFT status. Attach sequencing loci and peer-reviewed citations before submitting to peer review.
            </p>
          </div>

          <form onSubmit={handleCreateDraft} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold font-mono text-[#1C1B18] block mb-1">Target Taxon / Species:</label>
                <select
                  value={formSpeciesId}
                  onChange={(e) => setFormSpeciesId(e.target.value)}
                  className="w-full p-2.5 bg-[#F9F6F0] border-2 border-[#1C1B18] font-bold text-[#1C1B18] font-mono focus:outline-none"
                >
                  {speciesList.map((s) => (
                    <option key={s.speciesId} value={s.speciesId}>
                      {s.commonName} ({s.scientificName}) — [{s.threatLevel}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold font-mono text-[#1C1B18] block mb-1">Ecological Biotope / Habitat:</label>
                <input
                  type="text"
                  value={formHabitat}
                  onChange={(e) => setFormHabitat(e.target.value)}
                  placeholder="e.g. Primary Lowland Rainforest"
                  className="w-full p-2.5 bg-[#F9F6F0] border-2 border-[#1C1B18] text-[#1C1B18] focus:outline-none font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-bold font-mono text-[#1C1B18] block mb-1">Observation Telemetry & Evidentiary Log:</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                rows={3}
                placeholder="Detail phenotypic markings, specimen counts, camera trap telemetry, or collection coordinates..."
                className="w-full p-2.5 bg-[#F9F6F0] border-2 border-[#1C1B18] text-[#1C1B18] font-serif focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#F9F6F0] p-3 border-2 border-[#1C1B18]">
              <div>
                <label className="font-bold font-mono text-[#8C8476] block mb-1">Latitude:</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formLat}
                  onChange={(e) => setFormLat(Number(e.target.value))}
                  className="w-full p-1.5 bg-[#EFE9DF] border border-[#1C1B18] font-mono text-[#1C1B18]"
                  required
                />
              </div>
              <div>
                <label className="font-bold font-mono text-[#8C8476] block mb-1">Longitude:</label>
                <input
                  type="number"
                  step="0.0001"
                  value={formLon}
                  onChange={(e) => setFormLon(Number(e.target.value))}
                  className="w-full p-1.5 bg-[#EFE9DF] border border-[#1C1B18] font-mono text-[#1C1B18]"
                  required
                />
              </div>
              <div>
                <label className="font-bold font-mono text-[#8C8476] block mb-1">Region / Sector:</label>
                <input
                  type="text"
                  value={formRegion}
                  onChange={(e) => setFormRegion(e.target.value)}
                  className="w-full p-1.5 bg-[#EFE9DF] border border-[#1C1B18] font-mono text-[#1C1B18]"
                  required
                />
              </div>
              <div>
                <label className="font-bold font-mono text-[#8C8476] block mb-1">Nation / Jurisdiction:</label>
                <input
                  type="text"
                  value={formCountry}
                  onChange={(e) => setFormCountry(e.target.value)}
                  className="w-full p-1.5 bg-[#EFE9DF] border border-[#1C1B18] font-mono text-[#1C1B18]"
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2 p-2 bg-[#F9F6F0] border-2 border-[#1C1B18]">
              <input
                type="checkbox"
                id="sensCheck"
                checked={formIsSensitive}
                onChange={(e) => setFormIsSensitive(e.target.checked)}
                className="w-4 h-4 accent-[#2C5E3B]"
              />
              <label htmlFor="sensCheck" className="text-xs text-[#1C1B18]">
                <strong className="text-[#2C5E3B]">Anti-Poaching Protection:</strong> Mask precise GPS telemetry from public view if this taxon is endangered.
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="px-4 py-2 border-2 border-[#1C1B18] bg-[#F9F6F0] text-[#1C1B18] font-mono font-bold hover:bg-[#EFE9DF] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#2C5E3B] text-white font-mono font-bold border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] hover:bg-[#1C1B18] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Draft Telemetry</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Studio Grid: Submissions Queue & Record Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: My Submissions List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between border-b-2 border-[#1C1B18] pb-2 font-mono">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#1C1B18]">
              Submission Portfolio ({myRecords.length})
            </h3>
            <span className="text-[10px] text-[#2C5E3B] font-bold">DR. ELENA ROSTOVA</span>
          </div>

          {loading ? (
            <p className="text-xs text-[#8C8476] py-6 text-center font-mono">Loading submissions...</p>
          ) : myRecords.length === 0 ? (
            <p className="text-xs text-[#8C8476] py-6 text-center italic font-serif">No submissions logged yet.</p>
          ) : (
            myRecords.map((rec) => {
              const isSelected = selectedRecord?.recordId === rec.recordId;
              const hasReviewerNotes = rec.reviewerNotes && rec.reviewerNotes.length > 0;

              return (
                <div
                  key={rec.recordId}
                  onClick={() => {
                    setSelectedRecord(rec);
                    setIsCreatingNew(false);
                    setRevisionDesc(rec.description);
                  }}
                  className={`p-4 cursor-pointer transition-all border-2 border-[#1C1B18] ${
                    isSelected
                      ? 'bg-[#EFE9DF] shadow-[4px_4px_0px_#1C1B18] translate-x-1'
                      : 'bg-[#F9F6F0] hover:bg-[#EFE9DF]/60 shadow-[2px_2px_0px_#1C1B18]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 font-mono">
                    <span className="text-xs font-black text-[#1C1B18]">
                      #{rec.recordId} (v{rec.version})
                    </span>
                    <span className={`px-2 py-0.5 text-[9px] font-bold ${getStatusBadge(rec.status)}`}>
                      {rec.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#1C1B18] line-clamp-2 mt-2 leading-relaxed font-serif">
                    {rec.description}
                  </p>

                  {rec.duplicateWarning && (
                    <div className="mt-2 p-1.5 bg-[#E65F2B]/15 border-2 border-[#E65F2B] text-[10px] text-[#1C1B18] flex items-center gap-1 font-mono font-bold">
                      <AlertCircle className="w-3 h-3 text-[#E65F2B] flex-shrink-0" />
                      <span className="truncate">{rec.duplicateWarning}</span>
                    </div>
                  )}

                  {hasReviewerNotes && rec.status === 'DRAFT' && (
                    <div className="mt-2 p-1.5 bg-[#E65F2B] text-white border border-[#1C1B18] text-[10px] font-mono font-bold flex items-center gap-1 shadow-[1px_1px_0px_#1C1B18]">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />
                      <span>Reviewer Feedback awaiting revision</span>
                    </div>
                  )}

                  <div className="mt-3 pt-2 border-t border-[#D6CEBE] flex items-center justify-between text-[11px] font-mono">
                    <TrustScoreBadge score={rec.trustScore} badge={rec.trustBadge} showBreakdown={false} />
                    <span className="text-[#8C8476] font-bold">
                      {new Date(rec.submissionDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Record Workspace */}
        <div className="lg:col-span-7 space-y-6">
          {selectedRecord ? (
            <div className="p-6 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18] space-y-6">
              {/* 4-Step Verification Workflow Tracker */}
              <WorkflowProgressTracker
                status={selectedRecord.status}
                version={selectedRecord.version}
                consensusCount={selectedRecord.verifications?.filter(v => v.decision === 'Verified').length || 0}
                requiredConsensus={selectedRecord.requiredConsensus || 2}
              />

              {/* Record Header & Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#1C1B18] pb-4">
                <div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-sm font-black text-[#1C1B18]">
                      Dossier #{selectedRecord.recordId}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-bold bg-[#2C5E3B] text-white border border-[#1C1B18]">
                      v{selectedRecord.version}
                    </span>
                  </div>
                  <p className="text-xs text-[#8C8476] mt-0.5 font-mono">
                    Author: {selectedRecord.submitterName} // {new Date(selectedRecord.submissionDate).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-xs font-mono font-bold ${getStatusBadge(selectedRecord.status)}`}>
                    {selectedRecord.status}
                  </span>
                  <TrustScoreBadge score={selectedRecord.trustScore} badge={selectedRecord.trustBadge} />
                </div>
              </div>

              {/* Prominent Draft Submission Callout */}
              {selectedRecord.status === 'DRAFT' && (
                <div className="p-3 bg-[#EFE9DF] border-2 border-[#2C5E3B] flex flex-wrap items-center justify-between gap-3 shadow-[2px_2px_0px_#1C1B18]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E65F2B] animate-pulse" />
                    <span className="text-xs text-[#1C1B18] font-bold">
                      PRIVATE DRAFT: Not visible to peer reviewers yet. Ready to submit?
                    </span>
                  </div>
                  <button
                    onClick={() => handleSubmitToReview(selectedRecord.recordId)}
                    className="px-3.5 py-1.5 text-xs font-mono font-bold bg-[#2C5E3B] text-white border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] hover:bg-[#1C1B18] transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit to Peer Review Queue</span>
                  </button>
                </div>
              )}

              {selectedRecord.duplicateWarning && (
                <div className="p-3 bg-[#EFE9DF] border-2 border-[#E65F2B] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-black text-[#E65F2B]">
                    <ShieldAlert className="w-4 h-4" />
                    <span>BioTrust Spatial Conflict Advisory</span>
                  </div>
                  <p className="text-xs text-[#1C1B18] font-serif">
                    {selectedRecord.duplicateWarning}
                  </p>
                </div>
              )}

              {selectedRecord.reviewerNotes && selectedRecord.reviewerNotes.length > 0 && (
                <div className="p-3 bg-[#EFE9DF] border-2 border-[#1C1B18] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-black text-[#E65F2B]">
                    <AlertCircle className="w-4 h-4" />
                    <span>Peer Review Feedback & Required Revisions</span>
                  </div>
                  {selectedRecord.reviewerNotes.map((note, idx) => (
                    <p key={idx} className="text-xs bg-[#F9F6F0] p-2 border border-[#1C1B18] text-[#1C1B18] italic font-serif">
                      "{note}"
                    </p>
                  ))}
                </div>
              )}

              {/* Observation Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#8C8476]">
                  Observation Description
                </h4>
                <p className="text-xs md:text-sm text-[#1C1B18] leading-relaxed bg-[#EFE9DF] p-3 border-2 border-[#1C1B18] font-serif">
                  {selectedRecord.description}
                </p>
              </div>

              {/* Geographic Coordinates & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#EFE9DF] border-2 border-[#1C1B18]">
                  <strong className="block text-[#8C8476] font-mono text-[10px] uppercase mb-1 font-bold">Coordinates:</strong>
                  <span className="font-mono font-bold text-[#2C5E3B]">
                    Lat: {selectedRecord.location.latitude}° N, Lon: {selectedRecord.location.longitude}° E
                  </span>
                </div>
                <div className="p-3 bg-[#EFE9DF] border-2 border-[#1C1B18]">
                  <strong className="block text-[#8C8476] font-mono text-[10px] uppercase mb-1 font-bold">Region & Habitat:</strong>
                  <span className="text-[#1C1B18] font-medium">{selectedRecord.location.region} ({selectedRecord.location.habitatType})</span>
                </div>
              </div>

              {/* Attached DNA Samples Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b-2 border-[#1C1B18] pb-1">
                  <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#1C1B18] flex items-center gap-1.5">
                    <Dna className="w-4 h-4 text-[#2C5E3B]" />
                    <span>Genomic Sample Metadata ({selectedRecord.dnaSamples?.length || 0})</span>
                  </h4>
                  {selectedRecord.status === 'DRAFT' && (
                    <button
                      onClick={() => setShowDnaModal(true)}
                      className="px-2.5 py-1 text-[11px] font-mono font-bold bg-[#EFE9DF] text-[#1C1B18] border-2 border-[#1C1B18] hover:bg-[#1C1B18] hover:text-white flex items-center gap-1 cursor-pointer transition-colors shadow-[1px_1px_0px_#1C1B18]"
                    >
                      <Plus className="w-3 h-3 text-[#2C5E3B]" />
                      <span>Attach DNA Sample</span>
                    </button>
                  )}
                </div>

                {(!selectedRecord.dnaSamples || selectedRecord.dnaSamples.length === 0) ? (
                  <p className="text-xs text-[#8C8476] italic p-3 bg-[#EFE9DF] border-2 border-[#1C1B18] text-center font-serif">
                    No DNA sample attached. Attaching sequencing loci adds +25 points to the Trust Score.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedRecord.dnaSamples.map((sample) => (
                      <div key={sample.sampleId} className="p-3 bg-[#EFE9DF] border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] text-xs space-y-1">
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-black text-[#1C1B18]">
                            {sample.sampleType} Assay // {new Date(sample.collectionDate).toLocaleDateString()}
                          </span>
                          {sample.sequenceAccession && (
                            <span className="px-1.5 py-0.2 bg-[#2C5E3B] text-white border border-[#1C1B18] font-mono text-[10px] font-bold">
                              GenBank: {sample.sequenceAccession}
                            </span>
                          )}
                        </div>
                        <p className="text-[#1C1B18] font-serif">{sample.description}</p>
                        {sample.labName && <p className="text-[11px] font-mono text-[#8C8476]">Lab: {sample.labName}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Attached Scientific Papers Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b-2 border-[#1C1B18] pb-1">
                  <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#1C1B18] flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-[#E65F2B]" />
                    <span>Scientific Citations & DOIs ({selectedRecord.researchPapers?.length || 0})</span>
                  </h4>
                  {selectedRecord.status === 'DRAFT' && (
                    <button
                      onClick={() => setShowPaperModal(true)}
                      className="px-2.5 py-1 text-[11px] font-mono font-bold bg-[#EFE9DF] text-[#1C1B18] border-2 border-[#1C1B18] hover:bg-[#1C1B18] hover:text-white flex items-center gap-1 cursor-pointer transition-colors shadow-[1px_1px_0px_#1C1B18]"
                    >
                      <Plus className="w-3 h-3 text-[#E65F2B]" />
                      <span>Link Paper</span>
                    </button>
                  )}
                </div>

                {(!selectedRecord.researchPapers || selectedRecord.researchPapers.length === 0) ? (
                  <p className="text-xs text-[#8C8476] italic p-3 bg-[#EFE9DF] border-2 border-[#1C1B18] text-center font-serif">
                    No research literature attached. Linking papers with verified DOIs adds +25 points to the Trust Score.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {selectedRecord.researchPapers.map((paper) => (
                      <div key={paper.paperId} className="p-3 bg-[#EFE9DF] border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] text-xs space-y-1">
                        <span className="font-black text-[#1C1B18] block">{paper.title}</span>
                        <div className="flex items-center justify-between text-[#8C8476] text-[11px] font-mono">
                          <span>{paper.authors?.join(', ')} ({paper.journal})</span>
                          {paper.doi && (
                            <span className="text-[#2C5E3B] font-bold">DOI: {paper.doi}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Version Diff Viewer */}
              <VersionDiffViewer record={selectedRecord} />

              {/* State Machine Transition Actions */}
              <div className="pt-4 border-t-2 border-[#1C1B18] flex flex-wrap items-center justify-between gap-3">
                {selectedRecord.status === 'DRAFT' ? (
                  <div className="w-full space-y-3">
                    <div className="p-4 bg-[#EFE9DF] border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] space-y-2 text-xs">
                      <span className="font-mono font-black text-[#2C5E3B] block uppercase tracking-wider">
                        Revision Pipeline (Increment to v{selectedRecord.version + 1}):
                      </span>
                      <input
                        type="text"
                        placeholder="Summary of changes (e.g. Added DNA extraction locus and refined coordinates)..."
                        value={revisionSummary}
                        onChange={(e) => setRevisionSummary(e.target.value)}
                        className="w-full p-2 bg-[#F9F6F0] border-2 border-[#1C1B18] text-[#1C1B18] font-mono focus:outline-none"
                      />
                      <textarea
                        rows={2}
                        placeholder="Updated description text..."
                        value={revisionDesc}
                        onChange={(e) => setRevisionDesc(e.target.value)}
                        className="w-full p-2 bg-[#F9F6F0] border-2 border-[#1C1B18] text-[#1C1B18] font-serif focus:outline-none"
                      />
                      <button
                        onClick={() => handleUpdateDraftRevision(selectedRecord.recordId)}
                        className="px-3 py-1.5 text-xs font-mono font-bold bg-[#F9F6F0] text-[#1C1B18] border-2 border-[#1C1B18] hover:bg-[#1C1B18] hover:text-white flex items-center gap-1 cursor-pointer transition-colors shadow-[1px_1px_0px_#1C1B18]"
                      >
                        <FileEdit className="w-3.5 h-3.5 text-[#2C5E3B]" />
                        <span>Save Version Snapshot v{selectedRecord.version + 1}</span>
                      </button>
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSubmitToReview(selectedRecord.recordId)}
                        className="px-6 py-2.5 text-xs font-mono font-bold bg-[#2C5E3B] text-white border-2 border-[#1C1B18] shadow-[3px_3px_0px_#1C1B18] hover:bg-[#1C1B18] transition-colors flex items-center gap-2 cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                        <span>Submit to Peer Verification Pipeline</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full flex items-center justify-between text-xs font-mono bg-[#EFE9DF] p-3 border-2 border-[#1C1B18]">
                    <span className="font-bold text-[#1C1B18]">
                      Status: <span className="text-[#2C5E3B] font-black">{selectedRecord.status}</span>
                    </span>
                    <span className="text-[#8C8476]">
                      {selectedRecord.status === 'UNDER_REVIEW'
                        ? 'Peer consensus adjudication in progress'
                        : selectedRecord.status === 'VERIFIED'
                        ? 'Consensus reached. Ready for public release.'
                        : 'Published globally in repository.'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18] text-center text-[#8C8476] text-xs italic font-serif">
              Select a record from your portfolio or click "Initiate New Observation" to begin.
            </div>
          )}
        </div>
      </div>

      {/* DNA Attachment Modal */}
      {showDnaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="p-6 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[6px_6px_0px_#1C1B18] w-full max-w-md space-y-4">
            <div className="border-b-2 border-[#1C1B18] pb-2">
              <h3 className="text-sm font-mono font-black uppercase tracking-wider text-[#2C5E3B] flex items-center gap-1.5">
                <Dna className="w-4 h-4" />
                <span>Upload DNA Sample Metadata</span>
              </h3>
            </div>

            <form onSubmit={handleAddDnaSample} className="space-y-3 text-xs">
              <div>
                <label className="font-bold font-mono text-[#1C1B18] block mb-1">Sample Type:</label>
                <select
                  value={dnaSampleType}
                  onChange={(e) => setDnaSampleType(e.target.value as any)}
                  className="w-full p-2 bg-[#EFE9DF] border-2 border-[#1C1B18] font-bold text-[#1C1B18] font-mono focus:outline-none"
                >
                  <option value="eDNA">eDNA (Environmental DNA)</option>
                  <option value="Tissue">Tissue Biopsy</option>
                  <option value="Blood">Blood</option>
                  <option value="Hair/Fur">Hair / Fur Snare</option>
                  <option value="Fecal">Fecal / Dung Swab</option>
                  <option value="Swab">Saliva / Mucosal Swab</option>
                </select>
              </div>

              <div>
                <label className="font-bold font-mono text-[#1C1B18] block mb-1">Collection Date:</label>
                <input
                  type="date"
                  value={dnaDate}
                  onChange={(e) => setDnaDate(e.target.value)}
                  className="w-full p-2 bg-[#EFE9DF] border-2 border-[#1C1B18] font-mono text-[#1C1B18] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold font-mono text-[#1C1B18] block mb-1">Methodology & Extraction Details:</label>
                <textarea
                  rows={2}
                  value={dnaDesc}
                  onChange={(e) => setDnaDesc(e.target.value)}
                  placeholder="Sediment core collected 10m from river edge, ethanol buffered..."
                  className="w-full p-2 bg-[#EFE9DF] border-2 border-[#1C1B18] font-serif text-[#1C1B18] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold font-mono text-[#1C1B18] block mb-1">NCBI GenBank Accession Number (Optional):</label>
                <input
                  type="text"
                  value={dnaAccession}
                  onChange={(e) => setDnaAccession(e.target.value)}
                  placeholder="e.g. NC_010642.1 (Cytochrome b)"
                  className="w-full p-2 bg-[#EFE9DF] border-2 border-[#1C1B18] font-mono text-[#2C5E3B] font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold font-mono text-[#1C1B18] block mb-1">Analyzing Laboratory:</label>
                <input
                  type="text"
                  value={dnaLab}
                  onChange={(e) => setDnaLab(e.target.value)}
                  placeholder="e.g. Wildlife Genetics Research Center"
                  className="w-full p-2 bg-[#EFE9DF] border-2 border-[#1C1B18] font-mono text-[#1C1B18] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t-2 border-[#1C1B18]">
                <button
                  type="button"
                  onClick={() => setShowDnaModal(false)}
                  className="px-3 py-1.5 border-2 border-[#1C1B18] bg-[#EFE9DF] text-[#1C1B18] font-mono font-bold hover:bg-[#1C1B18] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2C5E3B] text-white font-mono font-bold border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] hover:bg-[#1C1B18] cursor-pointer"
                >
                  Attach Evidence
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Research Paper Attachment Modal */}
      {showPaperModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="p-6 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[6px_6px_0px_#1C1B18] w-full max-w-md space-y-4">
            <div className="border-b-2 border-[#1C1B18] pb-2">
              <h3 className="text-sm font-mono font-black uppercase tracking-wider text-[#E65F2B] flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Link Scientific Research Paper</span>
              </h3>
            </div>

            <form onSubmit={handleAddPaper} className="space-y-3 text-xs">
              <div>
                <label className="font-bold font-mono text-[#1C1B18] block mb-1">Article Title:</label>
                <input
                  type="text"
                  value={paperTitle}
                  onChange={(e) => setPaperTitle(e.target.value)}
                  placeholder="Title of peer-reviewed paper"
                  className="w-full p-2 bg-[#EFE9DF] border-2 border-[#1C1B18] font-serif text-[#1C1B18] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold font-mono text-[#1C1B18] block mb-1">Authors (Comma separated):</label>
                <input
                  type="text"
                  value={paperAuthors}
                  onChange={(e) => setPaperAuthors(e.target.value)}
                  placeholder="Rostova, E., Moyo, T."
                  className="w-full p-2 bg-[#EFE9DF] border-2 border-[#1C1B18] font-mono text-[#1C1B18] focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold font-mono text-[#1C1B18] block mb-1">Journal:</label>
                  <input
                    type="text"
                    value={paperJournal}
                    onChange={(e) => setPaperJournal(e.target.value)}
                    placeholder="e.g. Nature Conservation"
                    className="w-full p-2 bg-[#EFE9DF] border-2 border-[#1C1B18] font-serif text-[#1C1B18] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold font-mono text-[#1C1B18] block mb-1">Publication Date:</label>
                  <input
                    type="date"
                    value={paperDate}
                    onChange={(e) => setPaperDate(e.target.value)}
                    className="w-full p-2 bg-[#EFE9DF] border-2 border-[#1C1B18] font-mono text-[#1C1B18] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold font-mono text-[#1C1B18] block mb-1">Digital Object Identifier (DOI):</label>
                <input
                  type="text"
                  value={paperDoi}
                  onChange={(e) => setPaperDoi(e.target.value)}
                  placeholder="e.g. 10.1111/cobi.14182"
                  className="w-full p-2 bg-[#EFE9DF] border-2 border-[#1C1B18] font-mono text-[#2C5E3B] font-bold focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t-2 border-[#1C1B18]">
                <button
                  type="button"
                  onClick={() => setShowPaperModal(false)}
                  className="px-3 py-1.5 border-2 border-[#1C1B18] bg-[#EFE9DF] text-[#1C1B18] font-mono font-bold hover:bg-[#1C1B18] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#2C5E3B] text-white font-mono font-bold border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] hover:bg-[#1C1B18] cursor-pointer"
                >
                  Link to Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
