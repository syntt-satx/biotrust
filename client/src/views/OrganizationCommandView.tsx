import React, { useState, useEffect } from 'react';
import { Plus, Target, CheckSquare, Calendar, DollarSign } from 'lucide-react';
import { ConservationProject, Species } from '../types/index.js';
import { api } from '../services/api.js';

interface OrganizationCommandViewProps {
  onShowToast?: (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => void;
}

export const OrganizationCommandView: React.FC<OrganizationCommandViewProps> = ({ onShowToast }) => {
  const [projects, setProjects] = useState<ConservationProject[]>([]);
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [selectedProject, setSelectedProject] = useState<ConservationProject | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Project Form
  const [projectName, setProjectName] = useState('');
  const [speciesId, setSpeciesId] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [budget, setBudget] = useState('$1,500,000 USD');
  const [targetImpact, setTargetImpact] = useState('');

  // Impact Log
  const [impactLogText, setImpactLogText] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [allProjects, species] = await Promise.all([
        api.getProjects(),
        api.getSpecies()
      ]);
      setProjects(allProjects);
      setSpeciesList(species);
      if (allProjects.length > 0 && !selectedProject) {
        setSelectedProject(allProjects[0]);
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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim() || !speciesId || !targetImpact.trim()) {
      alert('Please fill out all required fields.');
      return;
    }

    try {
      const created = await api.createProject({
        projectName,
        speciesId,
        description,
        startDate,
        budget,
        targetImpact
      });
      if (onShowToast) {
        onShowToast('success', 'Project Launched', `Conservation project "${created.projectName}" has been registered.`);
      } else {
        alert(`Project "${created.projectName}" registered successfully!`);
      }
      setIsCreating(false);
      setProjectName('');
      setDescription('');
      setTargetImpact('');
      await loadData();
      setSelectedProject(created);
    } catch (err: any) {
      if (onShowToast) {
        onShowToast('error', 'Registration Failed', err.message);
      } else {
        alert(err.message);
      }
    }
  };

  const handleAddImpact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !impactLogText.trim()) return;

    try {
      const updated = await api.addImpactLog(selectedProject.projectId, impactLogText);
      if (onShowToast) {
        onShowToast('success', 'Impact Logged', 'Telemetry recorded in immutable project history.');
      } else {
        alert('Impact telemetry logged in immutable project history.');
      }
      setImpactLogText('');
      await loadData();
      setSelectedProject(updated);
    } catch (err: any) {
      if (onShowToast) {
        onShowToast('error', 'Log Failed', err.message);
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
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#2C5E3B] text-white border border-[#1C1B18]">
              Archive Module 6 // Conservation Field Operations & NGO Deployment
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-[#1C1B18] mt-2 mb-1 tracking-tight">
              Conservation Impact & NGO Command
            </h1>
            <p className="text-xs md:text-sm text-[#8C8476] leading-relaxed">
              Mobilize verified biodiversity sightings for on-the-ground interventions: manage habitat corridors, deploy anti-poaching patrols, and record empirical impact logs.
            </p>
          </div>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="px-4 py-2.5 text-xs font-mono font-bold bg-[#2C5E3B] text-white border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] hover:bg-[#1C1B18] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isCreating ? 'Cancel' : 'Launch Field Initiative'}</span>
          </button>
        </div>
      </div>

      {/* Create Project Modal/Drawer */}
      {isCreating && (
        <div className="p-6 bg-[#EFE9DF] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18] space-y-4">
          <div className="border-b-2 border-[#1C1B18] pb-2 font-mono">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#2C5E3B]">
              Register New Conservation Action Program
            </h3>
          </div>

          <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold font-mono text-[#1C1B18] block mb-1">Project Name:</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Western Ghats Corridor Shield"
                  className="w-full p-2.5 bg-[#F9F6F0] border-2 border-[#1C1B18] text-[#1C1B18] font-bold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-bold font-mono text-[#1C1B18] block mb-1">Target Taxon / Species:</label>
                <select
                  value={speciesId}
                  onChange={(e) => setSpeciesId(e.target.value)}
                  className="w-full p-2.5 bg-[#F9F6F0] border-2 border-[#1C1B18] font-bold font-mono text-[#1C1B18] focus:outline-none"
                >
                  {speciesList.map((s) => (
                    <option key={s.speciesId} value={s.speciesId}>
                      {s.commonName} ({s.scientificName})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold font-mono text-[#1C1B18] block mb-1">Scope & Intervention Strategy:</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail physical interventions, ranger deployment, community engagement..."
                className="w-full p-2.5 bg-[#F9F6F0] border-2 border-[#1C1B18] text-[#1C1B18] font-serif focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="font-bold font-mono text-[#1C1B18] block mb-1">Commencement Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 bg-[#F9F6F0] border-2 border-[#1C1B18] font-mono text-[#1C1B18]"
                  required
                />
              </div>

              <div>
                <label className="font-bold font-mono text-[#1C1B18] block mb-1">Allocated Budget:</label>
                <input
                  type="text"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full p-2 bg-[#F9F6F0] border-2 border-[#1C1B18] font-mono font-bold text-[#2C5E3B]"
                  required
                />
              </div>

              <div>
                <label className="font-bold font-mono text-[#1C1B18] block mb-1">Target Impact KPI:</label>
                <input
                  type="text"
                  value={targetImpact}
                  onChange={(e) => setTargetImpact(e.target.value)}
                  placeholder="e.g. Zero poaching incidents through 2027"
                  className="w-full p-2 bg-[#F9F6F0] border-2 border-[#1C1B18] text-[#1C1B18]"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 border-2 border-[#1C1B18] bg-[#F9F6F0] text-[#1C1B18] font-mono font-bold hover:bg-[#EFE9DF] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#2C5E3B] text-white font-mono font-bold border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] hover:bg-[#1C1B18] cursor-pointer"
              >
                Initialize Initiative
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Projects List & Project Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Projects List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between border-b-2 border-[#1C1B18] pb-2 font-mono">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#1C1B18]">
              Active Field Operations ({projects.length})
            </h3>
            <span className="text-[10px] text-[#2C5E3B] font-bold">WILDEARTH ALLIANCE</span>
          </div>

          {loading ? (
            <p className="text-xs text-[#8C8476] py-6 text-center font-mono">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="text-xs text-[#8C8476] py-6 text-center italic font-serif">No conservation projects registered yet.</p>
          ) : (
            projects.map((prj) => {
              const isSelected = selectedProject?.projectId === prj.projectId;

              return (
                <div
                  key={prj.projectId}
                  onClick={() => setSelectedProject(prj)}
                  className={`p-4 cursor-pointer transition-all border-2 border-[#1C1B18] ${
                    isSelected
                      ? 'bg-[#EFE9DF] shadow-[4px_4px_0px_#1C1B18] translate-x-1'
                      : 'bg-[#F9F6F0] hover:bg-[#EFE9DF]/60 shadow-[2px_2px_0px_#1C1B18]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-black text-sm text-[#1C1B18]">{prj.projectName}</h4>
                    <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-[#2C5E3B] text-white border border-[#1C1B18]">
                      {prj.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#8C8476] mt-0.5 font-mono">
                    Target Taxon: <strong className="text-[#2C5E3B]">{prj.speciesCommonName}</strong>
                  </p>

                  <p className="text-xs text-[#1C1B18] line-clamp-2 mt-2 leading-relaxed font-serif">
                    {prj.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-[#D6CEBE] flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#8C8476]">Budget: <span className="text-[#1C1B18] font-bold">{prj.budget}</span></span>
                    <span className="text-[#2C5E3B] font-bold">
                      {prj.milestones?.filter(m => m.completed).length || 0} / {prj.milestones?.length || 0} Milestones
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Project Details & Field Operations */}
        <div className="lg:col-span-7 space-y-6">
          {selectedProject ? (
            <div className="p-6 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18] space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#1C1B18] pb-4">
                <div>
                  <h3 className="text-xl font-black text-[#1C1B18]">{selectedProject.projectName}</h3>
                  <p className="text-xs text-[#8C8476] mt-0.5 font-mono">
                    Deploying Organization: <strong className="text-[#2C5E3B]">{selectedProject.organizationName}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#2C5E3B] text-white border border-[#1C1B18]">
                    {selectedProject.status}
                  </span>
                </div>
              </div>

              {/* Metrics Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-[#EFE9DF] border-2 border-[#1C1B18] text-xs font-mono">
                  <span className="text-[#8C8476] block flex items-center gap-1 font-bold text-[10px] uppercase">
                    <DollarSign className="w-3.5 h-3.5 text-[#2C5E3B]" />
                    Budget Allocation
                  </span>
                  <span className="font-black text-sm text-[#2C5E3B]">{selectedProject.budget}</span>
                </div>
                <div className="p-3 bg-[#EFE9DF] border-2 border-[#1C1B18] text-xs font-mono">
                  <span className="text-[#8C8476] block flex items-center gap-1 font-bold text-[10px] uppercase">
                    <Calendar className="w-3.5 h-3.5 text-[#1C1B18]" />
                    Commenced
                  </span>
                  <span className="text-sm font-bold text-[#1C1B18]">
                    {new Date(selectedProject.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="p-3 bg-[#EFE9DF] border-2 border-[#1C1B18] text-xs font-mono">
                  <span className="text-[#8C8476] block flex items-center gap-1 font-bold text-[10px] uppercase">
                    <Target className="w-3.5 h-3.5 text-[#E65F2B]" />
                    Target Taxon
                  </span>
                  <span className="font-black text-sm text-[#E65F2B]">{selectedProject.speciesCommonName}</span>
                </div>
              </div>

              {/* Scope & Impact Target */}
              <div className="space-y-2 text-xs md:text-sm text-[#1C1B18]">
                <strong className="block text-[#8C8476] font-mono text-xs uppercase font-bold">Strategic Directive:</strong>
                <p className="p-3 bg-[#EFE9DF] border-2 border-[#1C1B18] leading-relaxed text-[#1C1B18] font-serif">
                  {selectedProject.description}
                </p>
                <div className="p-3 bg-[#EFE9DF] border-2 border-[#1C1B18] text-xs font-mono">
                  <span className="text-[#2C5E3B] font-bold">KPI Target:</span> {selectedProject.targetImpact}
                </div>
              </div>

              {/* Milestones Checklist */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#1C1B18] border-b-2 border-[#1C1B18] pb-1">
                  Deliverables & Milestones
                </h4>
                <div className="space-y-2">
                  {selectedProject.milestones?.map((m) => (
                    <div
                      key={m.id}
                      className={`p-2.5 text-xs border-2 border-[#1C1B18] flex items-center justify-between ${
                        m.completed ? 'bg-[#EFE9DF]' : 'bg-[#F9F6F0]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckSquare className={`w-4 h-4 ${m.completed ? 'text-[#2C5E3B]' : 'text-[#8C8476]'}`} />
                        <span className={`font-bold ${m.completed ? 'line-through text-[#8C8476]' : 'text-[#1C1B18]'}`}>
                          {m.title}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-[#8C8476] font-bold">
                        Target: {m.targetDate}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Field Impact Logs */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#1C1B18] border-b-2 border-[#1C1B18] pb-1">
                  Immutable Impact Logs ({selectedProject.impactLogs?.length || 0})
                </h4>
                
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedProject.impactLogs?.map((log, idx) => (
                    <div key={idx} className="p-2.5 bg-[#EFE9DF] border-2 border-[#1C1B18] shadow-[1px_1px_0px_#1C1B18] text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#8C8476]">
                        <span className="font-bold text-[#2C5E3B]">{log.recordedBy}</span>
                        <span className="font-bold">{log.date}</span>
                      </div>
                      <p className="text-[#1C1B18] italic font-serif">"{log.log}"</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddImpact} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={impactLogText}
                    onChange={(e) => setImpactLogText(e.target.value)}
                    placeholder="Log a field milestone (e.g. Confirmed 3 new GPS radio-collared tigers)..."
                    className="flex-1 p-2 text-xs bg-[#EFE9DF] border-2 border-[#1C1B18] text-[#1C1B18] font-mono focus:outline-none"
                    required
                  />
                  <button type="submit" className="px-4 py-2 text-xs font-mono font-bold bg-[#2C5E3B] text-white border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] hover:bg-[#1C1B18] cursor-pointer">
                    Record Metric
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-12 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18] text-center text-[#8C8476] text-xs italic font-serif">
              Select a conservation project to view progress and log field milestones.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
