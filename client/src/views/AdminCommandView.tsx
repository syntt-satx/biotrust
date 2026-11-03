import React, { useState, useEffect } from 'react';
import { Users, Activity, Power, Download, RefreshCw, Search } from 'lucide-react';
import { User, UserRole, AuditLogEntry } from '../types/index.js';
import { api } from '../services/api.js';
import { VerificationTimeline } from '../components/VerificationTimeline.js';

interface AdminCommandViewProps {
  onShowToast?: (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => void;
}

export const AdminCommandView: React.FC<AdminCommandViewProps> = ({ onShowToast }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [searchAudit, setSearchAudit] = useState('');
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allUsers, logs, systemStats] = await Promise.all([
        api.getUsers(),
        api.getAuditTrail(),
        api.getSystemStats()
      ]);
      setUsers(allUsers);
      setAuditLogs(logs);
      setStats(systemStats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (targetUserId: string, newRole: UserRole) => {
    try {
      const updated = await api.assignRole(targetUserId, newRole);
      if (onShowToast) {
        onShowToast('success', 'Clearance Modified', `${updated.name} has been assigned operational clearance: ${updated.role}`);
      } else {
        alert(`Role reassigned for ${updated.name}: now ${updated.role}`);
      }
      await loadData();
    } catch (err: any) {
      if (onShowToast) {
        onShowToast('error', 'Role Assignment Error', err.message);
      } else {
        alert(err.message);
      }
    }
  };

  const handleToggleStatus = async (targetUserId: string) => {
    try {
      const updated = await api.toggleStatus(targetUserId);
      if (onShowToast) {
        onShowToast('info', 'Status Updated', `Account status for ${updated.name} toggled to ${updated.status}`);
      } else {
        alert(`Account status updated for ${updated.name}: now ${updated.status}`);
      }
      await loadData();
    } catch (err: any) {
      if (onShowToast) {
        onShowToast('error', 'Status Update Error', err.message);
      } else {
        alert(err.message);
      }
    }
  };

  const filteredLogs = auditLogs.filter(l => 
    !searchAudit || 
    l.action.toLowerCase().includes(searchAudit.toLowerCase()) ||
    l.userName.toLowerCase().includes(searchAudit.toLowerCase()) ||
    (l.recordId && l.recordId.toLowerCase().includes(searchAudit.toLowerCase())) ||
    (l.justification && l.justification.toLowerCase().includes(searchAudit.toLowerCase()))
  );

  const handleExportAuditJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `biotrust_audit_trail_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    if (onShowToast) {
      onShowToast('success', 'Ledger Exported', 'Downloaded complete cryptographic audit trail JSON.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Editorial Header */}
      <div className="p-6 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider bg-[#1C1B18] text-[#F9F6F0] border border-[#1C1B18]">
              Archive Module 1 & 8 // Systems Security & Institutional Administration
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-[#1C1B18] mt-2 mb-1 tracking-tight">
              Platform Governance & Chain of Custody
            </h1>
            <p className="text-xs md:text-sm text-[#8C8476] leading-relaxed">
              Manage user credentials, security role provisioning, account status flags, and inspect the immutable system-wide verification audit trail.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportAuditJson}
              className="px-3.5 py-2 text-xs font-mono font-bold border-2 border-[#1C1B18] bg-[#EFE9DF] text-[#1C1B18] hover:bg-[#1C1B18] hover:text-white flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_#1C1B18] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#2C5E3B]" />
              <span>Export Ledger (JSON)</span>
            </button>
            <button
              onClick={loadData}
              className="p-2 border-2 border-[#1C1B18] bg-[#EFE9DF] text-[#1C1B18] hover:bg-[#1C1B18] hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_#1C1B18]"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* System Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[3px_3px_0px_#1C1B18]">
            <span className="text-[10px] font-mono font-bold text-[#8C8476] uppercase block">Total Species Monitored</span>
            <span className="text-2xl font-mono font-black text-[#1C1B18]">{stats.stats?.totalSpecies || 6}</span>
            <span className="text-[10px] font-mono text-[#2C5E3B] font-bold block mt-1">
              {stats.stats?.protectedSpeciesCount} CITES Protected
            </span>
          </div>

          <div className="p-4 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[3px_3px_0px_#1C1B18]">
            <span className="text-[10px] font-mono font-bold text-[#8C8476] uppercase block">Platform Trust Mean</span>
            <span className="text-2xl font-mono font-black text-[#2C5E3B]">{stats.stats?.averageTrustScore || 85} / 100</span>
            <span className="text-[10px] font-mono text-[#8C8476] block mt-1">Across all records</span>
          </div>

          <div className="p-4 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[3px_3px_0px_#1C1B18]">
            <span className="text-[10px] font-mono font-bold text-[#8C8476] uppercase block">Pipeline Status</span>
            <div className="text-xs font-mono mt-1 space-y-0.5">
              <div className="text-[#8C8476]">Published: <strong className="text-[#2C5E3B]">{stats.stats?.publishedRecords}</strong></div>
              <div className="text-[#8C8476]">Under Review: <strong className="text-[#E65F2B]">{stats.stats?.underReviewRecords}</strong></div>
            </div>
          </div>

          <div className="p-4 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[3px_3px_0px_#1C1B18]">
            <span className="text-[10px] font-mono font-bold text-[#8C8476] uppercase block">Chain of Custody Events</span>
            <span className="text-2xl font-mono font-black text-[#1C1B18]">{auditLogs.length}</span>
            <span className="text-[9px] font-mono text-[#2C5E3B] font-bold block mt-1 bg-[#EFE9DF] border border-[#1C1B18] px-1 py-0.5 text-center">
              IMMUTABLE AUDIT TRAIL
            </span>
          </div>
        </div>
      )}

      {/* User & Role Management Table */}
      <div className="p-6 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18] space-y-4">
        <div className="border-b-2 border-[#1C1B18] pb-2 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono font-black uppercase tracking-wider text-[#1C1B18] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#2C5E3B]" />
              <span>Identity & Clearance Directory</span>
            </h3>
            <p className="text-xs text-[#8C8476]">
              Configure role capabilities (Scientist, Reviewer, NGO, Government, Admin, Public) and toggle account activation.
            </p>
          </div>
          <span className="font-mono text-xs text-[#1C1B18] font-bold bg-[#EFE9DF] px-2 py-0.5 border-2 border-[#1C1B18]">
            {users.length} Active Identity Cards
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-2 border-[#1C1B18]">
            <thead className="bg-[#EFE9DF] border-b-2 border-[#1C1B18] font-mono font-black uppercase tracking-wider text-[#1C1B18]">
              <tr>
                <th className="p-3">User & Organization</th>
                <th className="p-3">System Email</th>
                <th className="p-3">Role Clearance</th>
                <th className="p-3">Reputation</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#1C1B18]">
              {users.map((u) => (
                <tr key={u.userId} className="hover:bg-[#EFE9DF]/50 transition-colors">
                  <td className="p-3">
                    <strong className="text-[#1C1B18] block">{u.name}</strong>
                    <span className="text-[11px] text-[#8C8476]">{u.organizationName || 'Independent Observer'}</span>
                  </td>
                  <td className="p-3 font-mono text-[11px] text-[#8C8476]">{u.email}</td>
                  <td className="p-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.userId, e.target.value as UserRole)}
                      className="px-2 py-1 font-mono font-bold text-xs bg-[#EFE9DF] text-[#1C1B18] border-2 border-[#1C1B18]"
                    >
                      <option value="SCIENTIST">SCIENTIST</option>
                      <option value="REVIEWER">REVIEWER</option>
                      <option value="ORGANIZATION">ORGANIZATION</option>
                      <option value="GOVERNMENT">GOVERNMENT</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="PUBLIC">PUBLIC</option>
                    </select>
                  </td>
                  <td className="p-3 font-mono font-black text-[#2C5E3B]">{u.reputationScore} / 100</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold border border-[#1C1B18] ${
                      u.status === 'ACTIVE' 
                        ? 'bg-[#2C5E3B] text-white' 
                        : 'bg-[#E65F2B] text-white'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleToggleStatus(u.userId)}
                      className="px-2.5 py-1 text-[11px] font-mono font-bold border-2 border-[#1C1B18] bg-[#EFE9DF] hover:bg-[#1C1B18] hover:text-white flex items-center gap-1 ml-auto cursor-pointer shadow-[1px_1px_0px_#1C1B18] transition-colors"
                      title="Toggle active / deactivated status"
                    >
                      <Power className="w-3 h-3 text-[#E65F2B]" />
                      <span>{u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Immutable Audit Trail */}
      <div className="p-6 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#1C1B18] pb-3">
          <div>
            <h3 className="text-xs font-mono font-black uppercase tracking-wider text-[#1C1B18] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#2C5E3B]" />
              <span>Immutable Chain of Custody Audit Ledger</span>
            </h3>
            <p className="text-xs text-[#8C8476]">
              Cryptographic chronological log of field submissions, peer consensus decisions, and statutory proclamations.
            </p>
          </div>

          <div className="relative min-w-[240px]">
            <Search className="w-3.5 h-3.5 text-[#8C8476] absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search audit trail..."
              value={searchAudit}
              onChange={(e) => setSearchAudit(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#EFE9DF] border-2 border-[#1C1B18] text-[#1C1B18] font-mono focus:outline-none"
            />
          </div>
        </div>

        <VerificationTimeline logs={filteredLogs} />
      </div>
    </div>
  );
};
