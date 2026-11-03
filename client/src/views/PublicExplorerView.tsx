import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Dna, BookOpen, Bell } from 'lucide-react';
import { Species, BiodiversityRecord, UserRole } from '../types/index.js';
import { api } from '../services/api.js';
import { TrustScoreBadge } from '../components/TrustScoreBadge.js';
import { SensitiveLocationMask } from '../components/SensitiveLocationMask.js';
import { GeoSightingsMap } from '../components/GeoSightingsMap.js';
import { VerificationTimeline } from '../components/VerificationTimeline.js';
import { ThreatRadarChart } from '../components/ThreatRadarChart.js';

interface PublicExplorerViewProps {
  userRole: UserRole;
  onOpenRecord?: (recordId: string) => void;
  onShowToast?: (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => void;
}

export const PublicExplorerView: React.FC<PublicExplorerViewProps> = ({ userRole, onShowToast }) => {
  const [speciesList, setSpeciesList] = useState<Species[]>([]);
  const [publishedRecords, setPublishedRecords] = useState<BiodiversityRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [threatFilter, setThreatFilter] = useState('ALL');
  const [selectedSpecies, setSelectedSpecies] = useState<Species | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<BiodiversityRecord | null>(null);
  const [subscribedSpecies, setSubscribedSpecies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [spcData, recData, logs] = await Promise.all([
        api.getPublicSpecies(searchQuery, threatFilter),
        api.getPublicRecords(),
        api.getAuditTrail()
      ]);
      setSpeciesList(spcData);
      setPublishedRecords(recData);
      setAuditLogs(logs);
      if (spcData.length > 0 && !selectedSpecies) {
        setSelectedSpecies(spcData[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [threatFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleSubscribe = async (speciesId: string) => {
    try {
      await api.subscribeWatchlist(speciesId);
      setSubscribedSpecies(prev => [...prev, speciesId]);
      if (onShowToast) {
        onShowToast('success', 'Watchlist Subscribed', 'Automated ecological alerts will stream to your notifications feed.');
      } else {
        alert('Subscribed to BioTrust automated alert observer! Notifications will stream to your notifications feed.');
      }
    } catch (err: any) {
      if (onShowToast) {
        onShowToast('error', 'Subscription Failed', err.message);
      } else {
        alert(err.message);
      }
    }
  };

  const getThreatBadge = (threat: string) => {
    switch (threat) {
      case 'Critically Endangered':
        return 'bg-[#E65F2B] text-white border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18]';
      case 'Endangered':
        return 'bg-[#E65F2B]/90 text-white border-2 border-[#1C1B18]';
      case 'Vulnerable':
        return 'bg-[#EFE9DF] text-[#1C1B18] border-2 border-[#1C1B18]';
      case 'Least Concern':
        return 'bg-[#2C5E3B] text-white border-2 border-[#1C1B18]';
      default:
        return 'bg-[#F9F6F0] text-[#1C1B18] border-2 border-[#1C1B18]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header Banner */}
      <div className="p-6 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#2C5E3B] text-white border border-[#1C1B18]">
              Archive Module 9 // Public Explorer & Empirical Telemetry
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-[#1C1B18] mt-2 mb-1 tracking-tight">
              Verified Global Biodiversity Repository
            </h1>
            <p className="text-xs md:text-sm text-[#8C8476] leading-relaxed">
              Explore scientific species observations vetted through multi-peer consensus. 
              Protected and endangered species feature automated 50km GPS coordinate obfuscation to shield sensitive habitats from poaching.
            </p>
          </div>
          <div className="p-3 bg-[#EFE9DF] border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] text-xs font-mono space-y-1">
            <div className="text-[#1C1B18]">Published Sightings: <strong className="text-[#2C5E3B]">{publishedRecords.length}</strong></div>
            <div className="text-[#1C1B18]">Taxa Monitored: <strong className="text-[#2C5E3B]">{speciesList.length}</strong></div>
            <div className="text-[#E65F2B] font-bold">🔒 GPS Masking: ACTIVE</div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <form onSubmit={handleSearchSubmit} className="mt-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-[#8C8476] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by common name, scientific name, habitat, or family..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#EFE9DF] border-2 border-[#1C1B18] text-[#1C1B18] font-mono placeholder-[#8C8476] focus:outline-none focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#2C5E3B]" />
            <select
              value={threatFilter}
              onChange={(e) => setThreatFilter(e.target.value)}
              className="px-3 py-2 text-xs font-bold font-mono bg-[#EFE9DF] border-2 border-[#1C1B18] text-[#1C1B18] focus:outline-none"
            >
              <option value="ALL">All Threat Levels</option>
              <option value="Critically Endangered">Critically Endangered</option>
              <option value="Endangered">Endangered</option>
              <option value="Vulnerable">Vulnerable</option>
              <option value="Least Concern">Least Concern</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="px-5 py-2 text-xs font-mono font-bold bg-[#2C5E3B] text-white border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] hover:bg-[#1C1B18] transition-colors cursor-pointer"
          >
            Query Repository
          </button>
        </form>
      </div>

      {/* Interactive Global Sighting Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#1C1B18] flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#2C5E3B]" />
            Live Verified Sightings & Distribution Vector Map
          </h3>
          <span className="text-xs text-[#8C8476] font-mono">
            Self-Contained Geospatial Matrix Active
          </span>
        </div>
        <GeoSightingsMap
          records={publishedRecords}
          userRole={userRole}
          selectedRecordId={selectedRecord?.recordId}
          onSelectRecord={(recId) => {
            const found = publishedRecords.find(r => r.recordId === recId);
            if (found) setSelectedRecord(found);
          }}
        />
      </div>

      {/* Split-Screen Workspace: Left Taxon Catalog, Right Deep-Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Taxon Dropdown / Species Cards List */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between border-b-2 border-[#1C1B18] pb-2 font-mono">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#1C1B18]">
              Taxonomic Registry ({speciesList.length} Species)
            </h3>
            <span className="text-[10px] text-[#2C5E3B] font-bold">ECO-INDEX</span>
          </div>

          {loading ? (
            <p className="text-xs text-[#8C8476] py-6 text-center font-mono">Loading verified species registry...</p>
          ) : speciesList.length === 0 ? (
            <p className="text-xs text-[#8C8476] py-6 text-center italic font-serif">No species match your query.</p>
          ) : (
            speciesList.map((spc) => {
              const isSelected = selectedSpecies?.speciesId === spc.speciesId;
              const isSubbed = subscribedSpecies.includes(spc.speciesId);

              return (
                <div
                  key={spc.speciesId}
                  onClick={() => setSelectedSpecies(spc)}
                  className={`p-4 cursor-pointer transition-all border-2 border-[#1C1B18] ${
                    isSelected
                      ? 'bg-[#EFE9DF] shadow-[4px_4px_0px_#1C1B18] translate-x-1'
                      : 'bg-[#F9F6F0] hover:bg-[#EFE9DF]/60 shadow-[2px_2px_0px_#1C1B18]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-black text-sm text-[#1C1B18]">{spc.commonName}</h4>
                      <p className="text-xs italic text-[#8C8476] font-serif">{spc.scientificName}</p>
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold ${getThreatBadge(spc.threatLevel)}`}>
                      {spc.threatLevel}
                    </span>
                  </div>

                  <p className="text-xs text-[#1C1B18] line-clamp-2 mt-2 leading-relaxed font-serif">
                    {spc.description}
                  </p>

                  <div className="mt-3 pt-2 border-t border-[#D6CEBE] flex items-center justify-between text-[11px] font-mono">
                    <span className="text-[#8C8476]">
                      <strong className="text-[#2C5E3B]">{spc.verifiedSightingsCount || 0}</strong> Verified Records
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubscribe(spc.speciesId);
                      }}
                      className={`px-2 py-0.5 text-[10px] font-bold border border-[#1C1B18] flex items-center gap-1 cursor-pointer transition-colors ${
                        isSubbed 
                          ? 'bg-[#2C5E3B] text-white shadow-[1px_1px_0px_#1C1B18]' 
                          : 'bg-[#EFE9DF] text-[#1C1B18] hover:bg-[#1C1B18] hover:text-white'
                      }`}
                    >
                      <Bell className="w-2.5 h-2.5" />
                      {isSubbed ? 'Subscribed' : 'Watch Alerts'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Species Deep-Dive & Selected Record */}
        <div className="lg:col-span-7 space-y-6">
          {selectedSpecies ? (
            <div className="p-6 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18] space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b-2 border-[#1C1B18] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-[#1C1B18] tracking-tight">{selectedSpecies.commonName}</h2>
                    {selectedSpecies.isProtected && (
                      <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-[#E65F2B] text-white border border-[#1C1B18] shadow-[1px_1px_0px_#1C1B18]">
                        CITES PROTECTED
                      </span>
                    )}
                  </div>
                  <p className="text-sm italic text-[#8C8476] font-serif">{selectedSpecies.scientificName}</p>
                  <p className="text-xs text-[#8C8476] mt-1 font-mono">
                    Taxon: {selectedSpecies.kingdom} &gt; {selectedSpecies.class} &gt; {selectedSpecies.family} &gt; {selectedSpecies.genus}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 text-xs font-mono font-bold ${getThreatBadge(selectedSpecies.threatLevel)}`}>
                    {selectedSpecies.threatLevel}
                  </span>
                  <div className="text-[10px] font-mono text-[#8C8476] mt-1">
                    Updated: {new Date(selectedSpecies.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Description & Habitat */}
              <div className="text-xs md:text-sm text-[#1C1B18] leading-relaxed space-y-2">
                <p className="font-serif text-sm leading-relaxed">{selectedSpecies.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-[#EFE9DF] border-2 border-[#1C1B18]">
                    <strong className="text-[#2C5E3B] block mb-0.5 font-mono text-xs uppercase font-black">Primary Biotope:</strong>
                    <span className="text-[#1C1B18] font-medium">{selectedSpecies.habitat}</span>
                  </div>
                  <div className="p-3 bg-[#EFE9DF] border-2 border-[#1C1B18]">
                    <strong className="text-[#E65F2B] block mb-0.5 font-mono text-xs uppercase font-black">Geographic Range:</strong>
                    <span className="text-[#1C1B18] font-medium">{selectedSpecies.distribution}</span>
                  </div>
                </div>
              </div>

              {/* Threat Vector Radar Chart */}
              <ThreatRadarChart title={`Threat Vectors: ${selectedSpecies.commonName}`} />

              {/* Verified Sightings for this species */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#1C1B18] flex items-center justify-between border-b-2 border-[#1C1B18] pb-1">
                  <span>Verified Public Records ({selectedSpecies.verifiedSightings?.length || 0})</span>
                  <span className="text-[10px] text-[#2C5E3B]">Consensus Verified</span>
                </h4>

                {(!selectedSpecies.verifiedSightings || selectedSpecies.verifiedSightings.length === 0) ? (
                  <div className="p-4 bg-[#EFE9DF] border-2 border-[#1C1B18] text-xs text-[#8C8476] text-center italic font-serif">
                    No verified published records available for public viewing yet. Submissions are undergoing peer review.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedSpecies.verifiedSightings.map((sighting: any) => (
                      <div key={sighting.recordId} className="p-4 bg-[#EFE9DF] border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] space-y-3 border-l-6 border-l-[#2C5E3B]">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-[#1C1B18]">#{sighting.recordId}</span>
                            <TrustScoreBadge score={sighting.trustScore} badge={sighting.trustBadge} />
                          </div>
                          <span className="text-[11px] text-[#8C8476] font-mono font-bold">
                            {new Date(sighting.submissionDate).toLocaleDateString()}
                          </span>
                        </div>

                        <p className="text-xs text-[#1C1B18] leading-relaxed font-serif">
                          {sighting.description}
                        </p>

                        <SensitiveLocationMask
                          location={sighting.location}
                          userRole={userRole}
                          speciesThreatLevel={selectedSpecies.threatLevel}
                        />

                        <div className="flex items-center gap-4 text-xs text-[#8C8476] pt-1 font-mono">
                          <span className="flex items-center gap-1 font-bold text-[#2C5E3B]">
                            <Dna className="w-3.5 h-3.5" />
                            {sighting.dnaSamplesCount} DNA Loci
                          </span>
                          <span className="flex items-center gap-1 font-bold text-[#E65F2B]">
                            <BookOpen className="w-3.5 h-3.5" />
                            {sighting.researchPapersCount} Research Papers
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Conservation Projects for this species */}
              {selectedSpecies.activeProjects && selectedSpecies.activeProjects.length > 0 && (
                <div className="space-y-2 pt-2 border-t-2 border-[#1C1B18]">
                  <h4 className="text-xs font-mono font-black uppercase tracking-wider text-[#1C1B18]">
                    Linked NGO Conservation Initiatives
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedSpecies.activeProjects.map((p: any) => (
                      <div key={p.projectId} className="p-3 bg-[#EFE9DF] border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] text-xs">
                        <span className="font-black text-[#1C1B18] block">{p.projectName}</span>
                        <span className="text-[#8C8476] font-medium">{p.organizationName}</span>
                        <div className="mt-2">
                          <span className="px-2 py-0.5 bg-[#2C5E3B] text-white font-bold text-[9px] font-mono border border-[#1C1B18]">
                            {p.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18] text-center text-[#8C8476] text-xs italic font-serif">
              Select a species from the catalog to inspect its verified profile.
            </div>
          )}

          {/* Verification Timeline for Selected Record */}
          {selectedRecord && (
            <div className="p-6 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#1C1B18] pb-2 font-mono">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#1C1B18]">
                  Chain-of-Custody Audit Trail for #{selectedRecord.recordId}
                </h3>
                <TrustScoreBadge score={selectedRecord.trustScore} badge={selectedRecord.trustBadge} />
              </div>
              <VerificationTimeline logs={auditLogs} recordId={selectedRecord.recordId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
