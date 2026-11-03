import React, { useState, useEffect } from 'react';
import { Plus, Send, CheckCircle2, Landmark, FileCheck } from 'lucide-react';
import { ThreatProposal, Species, ThreatLevel } from '../types/index.js';
import { api } from '../services/api.js';
import { ThreatRadarChart } from '../components/ThreatRadarChart.js';

interface GovernmentCommandViewProps {
  onShowToast?: (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => void;
}

export const GovernmentCommandView: React.FC<GovernmentCommandViewProps> = ({ onShowToast }) => {
  const [proposals, setProposals] = useState<ThreatProposal[]>([]);
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<ThreatProposal | null>(null);
  const [isProposing, setIsProposing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Proposal Form State
  const [speciesId, setSpeciesId] = useState('');
  const [proposedThreat, setProposedThreat] = useState<ThreatLevel>('Critically Endangered');
  const [justification, setJustification] = useState('');
  const [evidence, setEvidence] = useState('');

  // Ratification Notes
  const [ratificationNotes, setRatificationNotes] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [props, species] = await Promise.all([
        api.getThreatProposals(),
        api.getSpecies()
      ]);
      setProposals(props);
      setSpeciesList(species);
      if (props.length > 0 && !selectedProposal) {
        setSelectedProposal(props[0]);
      }
      if (species.length > 0 && !speciesId) {
        setSpeciesId(species[0].speciesId);
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

  const handleCreateProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!speciesId || !justification.trim() || !evidence.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      const created = await api.proposeThreatLevel({
        speciesId,
        proposedThreatLevel: proposedThreat,
        justification,
        scientificEvidence: evidence
      });
      if (onShowToast) {
        onShowToast('success', 'Proposal Docketed', `Reclassification #${created.proposalId} submitted for formal statutory review.`);
      } else {
        alert(`Proposal #${created.proposalId} submitted for formal executive review!`);
      }
      setIsProposing(false);
      setJustification('');
      setEvidence('');
      await loadData();
      setSelectedProposal(created);
    } catch (err: any) {
      if (onShowToast) {
        onShowToast('error', 'Proposal Error', err.message);
      } else {
        alert(err.message);
      }
    }
  };

  const handleApprove = async () => {
    if (!selectedProposal) return;
    try {
      const approved = await api.approveThreatLevel(
        selectedProposal.proposalId,
        ratificationNotes || 'Formally ratified under National Wildlife Protection Act §2026.'
      );
      if (onShowToast) {
        onShowToast('success', 'Threat Level Ratified', 'Proclamation gazetted! Automated alert cascade dispatched.');
      } else {
        alert(`Threat reclassification RATIFIED! Automated alert cascade dispatched to scientists, NGOs, and watchlist observers.`);
      }
      setRatificationNotes('');
      await loadData();
      setSelectedProposal(approved);
    } catch (err: any) {
      if (onShowToast) {
        onShowToast('error', 'Ratification Failed', err.message);
      } else {
        alert(err.message);
      }
    }
  };

  const handleReject = async () => {
    if (!selectedProposal) return;
    const rationale = prompt('Enter statutory rationale for rejecting this reclassification proposal:');
    if (!rationale) return;

    try {
      const rejected = await api.rejectThreatLevel(selectedProposal.proposalId, rationale);
      if (onShowToast) {
        onShowToast('warning', 'Proposal Rejected', `Proposal #${rejected.proposalId} rejected.`);
      } else {
        alert(`Proposal #${rejected.proposalId} rejected.`);
      }
      await loadData();
      setSelectedProposal(rejected);
    } catch (err: any) {
      if (onShowToast) {
        onShowToast('error', 'Rejection Error', err.message);
      } else {
        alert(err.message);
      }
    }
  };

  const handleToggleProtected = async (species: Species) => {
    try {
      const updated = await api.updateSpecies(species.speciesId, {
        isProtected: !species.isProtected
      });
      if (onShowToast) {
        onShowToast(
          'info',
          'Protection Status Updated',
          `${species.commonName} is now ${updated.isProtected ? 'CITES PROTECTED (50km GPS Mask Active)' : 'Standard Observation'}`
        );
      } else {
        alert(`Updated protected status for ${species.commonName}: ${updated.isProtected ? 'CITES PROTECTED' : 'Standard'}`);
      }
      await loadData();
    } catch (err: any) {
      if (onShowToast) {
        onShowToast('error', 'Update Error', err.message);
      } else {
        alert(err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="p-6 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#E65F2B] text-white border border-[#1C1B18]">
              Government Wildlife & Threat Reclassification Authority
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-[#1C1B18] mt-2 mb-1 tracking-tight">
              Statutory Threat & CITES Authority
            </h1>
            <p className="text-xs md:text-sm text-[#8C8476] leading-relaxed">
              Adjudicate official threat statuses (e.g., Vulnerable &rarr; Endangered), mark protected species under CITES, and trigger automated broadcast alert cascades to the scientific community.
            </p>
          </div>
          <button
            onClick={() => setIsProposing(!isProposing)}
            className="px-4 py-2.5 text-xs font-mono font-bold bg-[#E65F2B] text-white border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] hover:bg-[#1C1B18] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isProposing ? 'Cancel Proposal' : 'Propose Threat Reclassification'}</span>
          </button>
        </div>
      </div>

      {/* Proposal Drawer */}
      {isProposing && (
        <div className="p-6 bg-[#EFE9DF] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18] space-y-4">
          <div className="border-b-2 border-[#1C1B18] pb-2 font-mono">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#E65F2B]">
              Draft Statutory Threat Reclassification Proposal
            </h3>
          </div>

          <form onSubmit={handleCreateProposal} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold font-mono text-[#1C1B18] block mb-1">Target Taxon / Species:</label>
                <select
                  value={speciesId}
                  onChange={(e) => setSpeciesId(e.target.value)}
                  className="w-full p-2.5 bg-[#F9F6F0] border-2 border-[#1C1B18] font-bold text-[#1C1B18] font-mono focus:outline-none"
                >
                  {speciesList.map((s) => (
                    <option key={s.speciesId} value={s.speciesId}>
                      {s.commonName} ({s.scientificName}) — Current: [{s.threatLevel}]
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold font-mono text-[#1C1B18] block mb-1">Proposed Statutory Classification:</label>
                <select
                  value={proposedThreat}
                  onChange={(e) => setProposedThreat(e.target.value as ThreatLevel)}
                  className="w-full p-2.5 bg-[#F9F6F0] border-2 border-[#1C1B18] font-mono text-[#E65F2B] font-black focus:outline-none"
                >
                  <option value="Critically Endangered">Critically Endangered</option>
                  <option value="Endangered">Endangered</option>
                  <option value="Vulnerable">Vulnerable</option>
                  <option value="Near Threatened">Near Threatened</option>
                  <option value="Least Concern">Least Concern</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold font-mono text-[#1C1B18] block mb-1">Official Statutory Justification:</label>
              <textarea
                rows={2}
                value={justification}
                onChange={(e) => setJustification(e.target.value)}
                placeholder="Document population decline percentages, habitat loss metrics, poaching statistics..."
                className="w-full p-2.5 bg-[#F9F6F0] border-2 border-[#1C1B18] text-[#1C1B18] font-serif focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="font-bold font-mono text-[#1C1B18] block mb-1">Empirical Evidence & Literature Citations:</label>
              <textarea
                rows={2}
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="IUCN Red List update DOI, field census data, genetic survey citations..."
                className="w-full p-2.5 bg-[#F9F6F0] border-2 border-[#1C1B18] text-[#1C1B18] font-serif focus:outline-none"
                required
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsProposing(false)}
                className="px-4 py-2 border-2 border-[#1C1B18] bg-[#F9F6F0] text-[#1C1B18] font-mono font-bold hover:bg-[#EFE9DF] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#E65F2B] text-white font-mono font-bold border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] hover:bg-[#1C1B18] cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Docket</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Proposals & Protected Species Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Proposals List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between border-b-2 border-[#1C1B18] pb-2 font-mono">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#1C1B18]">
              Reclassification Dossiers ({proposals.length})
            </h3>
            <span className="text-[10px] text-[#2C5E3B] font-bold">NATIONAL DOCKET</span>
          </div>

          {loading ? (
            <p className="text-xs text-[#8C8476] py-6 text-center font-mono">Loading proposals...</p>
          ) : (
            proposals.map((prop) => {
              const isSelected = selectedProposal?.proposalId === prop.proposalId;

              return (
                <div
                  key={prop.proposalId}
                  onClick={() => setSelectedProposal(prop)}
                  className={`p-4 cursor-pointer transition-all border-2 border-[#1C1B18] ${
                    isSelected
                      ? 'bg-[#EFE9DF] shadow-[4px_4px_0px_#1C1B18] translate-x-1'
                      : 'bg-[#F9F6F0] hover:bg-[#EFE9DF]/60 shadow-[2px_2px_0px_#1C1B18]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-black text-sm text-[#1C1B18]">{prop.speciesName}</h4>
                    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold border border-[#1C1B18] ${
                      prop.status === 'APPROVED' ? 'bg-[#2C5E3B] text-white' : prop.status === 'REJECTED' ? 'bg-[#1C1B18] text-white' : 'bg-[#E65F2B] text-white'
                    }`}>
                      {prop.status}
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-mono flex items-center gap-2">
                    <span className="line-through text-[#8C8476]">{prop.currentThreatLevel}</span>
                    <span className="text-[#2C5E3B] font-black">&rarr;</span>
                    <span className="font-black text-[#E65F2B]">{prop.proposedThreatLevel}</span>
                  </div>

                  <p className="text-xs text-[#1C1B18] line-clamp-2 mt-2 leading-relaxed font-serif">
                    {prop.justification}
                  </p>

                  <div className="mt-3 pt-2 border-t border-[#D6CEBE] flex items-center justify-between text-[11px] font-mono text-[#8C8476]">
                    <span>By: <strong className="text-[#1C1B18]">{prop.proposerName}</strong></span>
                    <span>{new Date(prop.proposedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Selected Dossier Review & Actions */}
        <div className="lg:col-span-7 space-y-6">
          {selectedProposal ? (
            <div className="p-6 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18] space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#1C1B18] pb-4">
                <div>
                  <h3 className="text-xl font-black text-[#1C1B18]">
                    Dossier #{selectedProposal.proposalId}: {selectedProposal.speciesName}
                  </h3>
                  <p className="text-xs text-[#8C8476] mt-0.5 font-mono">
                    Proposed by {selectedProposal.proposerName} on {new Date(selectedProposal.proposedDate).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 text-xs font-mono font-bold border-2 border-[#1C1B18] ${
                    selectedProposal.status === 'APPROVED'
                      ? 'bg-[#2C5E3B] text-white'
                      : selectedProposal.status === 'REJECTED'
                      ? 'bg-[#1C1B18] text-white'
                      : 'bg-[#E65F2B] text-white shadow-[2px_2px_0px_#1C1B18]'
                  }`}>
                    {selectedProposal.status}
                  </span>
                </div>
              </div>

              {/* Status Comparison Pill */}
              <div className="p-4 bg-[#EFE9DF] border-2 border-[#1C1B18] flex items-center justify-between font-mono">
                <div>
                  <span className="text-[10px] font-bold text-[#8C8476] uppercase block">Current Classification:</span>
                  <span className="text-sm font-bold text-[#1C1B18]">{selectedProposal.currentThreatLevel}</span>
                </div>
                <div className="text-2xl text-[#2C5E3B] font-black">&rarr;</div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#8C8476] uppercase block">Proposed Status:</span>
                  <span className="text-sm font-black text-[#E65F2B]">{selectedProposal.proposedThreatLevel}</span>
                </div>
              </div>

              {/* Justification & Evidence */}
              <div className="space-y-3 text-xs md:text-sm text-[#1C1B18]">
                <div>
                  <strong className="block text-[#8C8476] font-mono text-xs uppercase mb-1 font-bold">Statutory Justification:</strong>
                  <p className="p-3 bg-[#EFE9DF] border-2 border-[#1C1B18] leading-relaxed text-[#1C1B18] font-serif">
                    {selectedProposal.justification}
                  </p>
                </div>

                <div>
                  <strong className="block text-[#8C8476] font-mono text-xs uppercase mb-1 font-bold">Empirical Literature Foundation:</strong>
                  <p className="p-3 bg-[#EFE9DF] border-2 border-[#1C1B18] leading-relaxed text-[#1C1B18] italic font-mono text-xs">
                    "{selectedProposal.scientificEvidence}"
                  </p>
                </div>
              </div>

              {/* Threat Radar Visualizer */}
              <ThreatRadarChart title={`Threat Landscape: ${selectedProposal.speciesName}`} />

              {/* Approval Actions */}
              {selectedProposal.status === 'PENDING' ? (
                <div className="p-4 bg-[#EFE9DF] border-2 border-[#1C1B18] space-y-3 shadow-[3px_3px_0px_#1C1B18]">
                  <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#1C1B18] flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#2C5E3B]" />
                    <span>Executive Ratification Authorization</span>
                  </h4>

                  <input
                    type="text"
                    value={ratificationNotes}
                    onChange={(e) => setRatificationNotes(e.target.value)}
                    placeholder="Enter proclamation or gazette reference (e.g. Federal Gazette Proclamation §2026-081)..."
                    className="w-full p-2 text-xs bg-[#F9F6F0] border-2 border-[#1C1B18] text-[#1C1B18] font-mono focus:outline-none"
                  />

                  <div className="flex justify-end gap-3 pt-1">
                    <button
                      onClick={handleReject}
                      className="px-4 py-2 text-xs font-mono font-bold border-2 border-[#1C1B18] bg-[#F9F6F0] text-[#1C1B18] hover:bg-[#EFE9DF] cursor-pointer"
                    >
                      Reject Reclassification
                    </button>
                    <button
                      onClick={handleApprove}
                      className="px-5 py-2 text-xs font-mono font-bold bg-[#2C5E3B] text-white border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] hover:bg-[#1C1B18] transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Ratify & Broadcast Alert Cascade</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[#EFE9DF] border-2 border-[#2C5E3B] text-xs space-y-1 font-mono">
                  <div className="flex items-center justify-between font-bold text-[#2C5E3B]">
                    <span>Official Gazette Proclamation Executed</span>
                    <span>{selectedProposal.approverName || 'Marcus Sterling'}</span>
                  </div>
                  <p className="text-[#1C1B18] italic font-serif">"{selectedProposal.approvalNotes || 'Formally ratified.'}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18] text-center text-[#8C8476] text-xs italic font-serif">
              Select a reclassification proposal from the docket to adjudicate.
            </div>
          )}

          {/* Protected Species Quick Management Table */}
          <div className="p-6 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18] space-y-4">
            <div className="border-b-2 border-[#1C1B18] pb-2">
              <h3 className="text-xs font-mono font-black uppercase tracking-wider text-[#1C1B18]">
                Statutory CITES Protection Management
              </h3>
              <p className="text-xs text-[#8C8476]">
                Toggling protected status mandates sensitive GPS coordinate obfuscation across all public telemetry views.
              </p>
            </div>

            <div className="space-y-2">
              {speciesList.map((spc) => (
                <div key={spc.speciesId} className="flex items-center justify-between p-2.5 bg-[#EFE9DF] border-2 border-[#1C1B18] text-xs">
                  <div>
                    <strong className="text-[#1C1B18]">{spc.commonName}</strong>
                    <span className="text-[#8C8476] italic font-serif ml-2">({spc.scientificName})</span>
                  </div>
                  <button
                    onClick={() => handleToggleProtected(spc)}
                    className={`px-3 py-1 font-mono font-bold border-2 border-[#1C1B18] text-xs cursor-pointer transition-colors shadow-[1px_1px_0px_#1C1B18] ${
                      spc.isProtected 
                        ? 'bg-[#E65F2B] text-white hover:bg-[#1C1B18]' 
                        : 'bg-[#F9F6F0] text-[#1C1B18] hover:bg-[#2C5E3B] hover:text-white'
                    }`}
                  >
                    {spc.isProtected ? 'CITES Protected' : 'Standard'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
