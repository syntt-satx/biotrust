import React, { useState, useEffect } from 'react';
import { Activity, Search } from 'lucide-react';
import { AuditLogEntry } from '../types/index.js';
import { api } from '../services/api.js';
import { VerificationTimeline } from '../components/VerificationTimeline.js';

export const AuditTrailView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditTrail();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter(l => 
    !searchQuery ||
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.recordId && l.recordId.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (l.justification && l.justification.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="p-6 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#2C5E3B] text-white border border-[#1C1B18]">
              Immutable Chain of Custody
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-[#1C1B18] mt-2 mb-1 tracking-tight">
              Cryptographic Audit Trail Ledger
            </h1>
            <p className="text-xs md:text-sm text-[#8C8476] leading-relaxed">
              Every submission, peer review endorsement, dispute, and government threat reclassification is recorded permanently in the BioTrust audit trail.
            </p>
          </div>
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-[#8C8476] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Filter by actor, record ID, or action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#EFE9DF] border-2 border-[#1C1B18] text-[#1C1B18] font-mono focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="p-6 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18]">
        {loading ? (
          <p className="text-xs text-[#8C8476] text-center py-8 font-mono">Loading audit trail ledger...</p>
        ) : (
          <VerificationTimeline logs={filtered} />
        )}
      </div>
    </div>
  );
};
