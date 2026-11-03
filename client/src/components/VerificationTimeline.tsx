import React from 'react';
import { CheckCircle2, Clock, FileText, AlertTriangle, ShieldCheck, UserCheck } from 'lucide-react';
import { AuditLogEntry } from '../types/index.js';

interface VerificationTimelineProps {
  logs: AuditLogEntry[];
  recordId?: string;
}

export const VerificationTimeline: React.FC<VerificationTimelineProps> = ({ logs, recordId }) => {
  const filtered = recordId ? logs.filter(l => l.recordId === recordId) : logs;

  if (!filtered || filtered.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-[#8C8476] italic bg-[#EFE9DF] border-2 border-[#1C1B18]">
        No chain-of-custody audit logs recorded yet.
      </div>
    );
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'RECORD_PUBLISHED':
        return { icon: ShieldCheck, color: 'bg-[#2C5E3B] text-white', text: 'PUBLISHED REPOSITORY' };
      case 'RECORD_VERIFIED':
        return { icon: CheckCircle2, color: 'bg-[#2C5E3B] text-white', text: 'CONSENSUS VERIFIED' };
      case 'RECORD_REVIEWED':
        return { icon: UserCheck, color: 'bg-[#EFE9DF] text-[#1C1B18]', text: 'PEER ENDORSEMENT' };
      case 'RECORD_SUBMITTED':
        return { icon: Clock, color: 'bg-[#EFE9DF] text-[#1C1B18]', text: 'SUBMITTED TO PIPELINE' };
      case 'RECORD_DISPUTED':
        return { icon: AlertTriangle, color: 'bg-[#E65F2B] text-white', text: 'DISPUTED BY PEER' };
      case 'INFO_REQUESTED':
        return { icon: FileText, color: 'bg-[#E65F2B] text-white', text: 'REVISION REQUESTED' };
      case 'THREAT_APPROVED':
        return { icon: ShieldCheck, color: 'bg-[#2C5E3B] text-white', text: 'STATUTORY PROCLAMATION' };
      default:
        return { icon: FileText, color: 'bg-[#F9F6F0] text-[#1C1B18]', text: action.replace(/_/g, ' ') };
    }
  };

  return (
    <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1C1B18]">
      {filtered.map((log) => {
        const badge = getActionBadge(log.action);
        const Icon = badge.icon;
        const dateStr = new Date(log.timestamp).toLocaleString();

        return (
          <div key={log.auditId} className="relative group">
            {/* Timeline node */}
            <div className="absolute -left-6 top-1 w-5 h-5 bg-[#F9F6F0] border-2 border-[#1C1B18] flex items-center justify-center text-[#1C1B18] shadow-[1px_1px_0px_#1C1B18]">
              <Icon className="w-3 h-3" />
            </div>

            {/* Event Card */}
            <div className="cmd-card-sm p-3 bg-[#F9F6F0] border-2 border-[#1C1B18]">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#D6CEBE] pb-1.5 mb-1.5 font-mono">
                <span className={`px-2 py-0.5 text-[9px] font-bold border border-[#1C1B18] ${badge.color}`}>
                  {badge.text}
                </span>
                <span className="text-[10px] text-[#8C8476]">{dateStr}</span>
              </div>

              <div className="text-xs text-[#1C1B18] space-y-1">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-[#8C8476]">Actor:</span>
                  <span className="font-bold text-[#1C1B18]">{log.userName}</span>
                  <span className="text-[9px] font-mono px-1 bg-[#EFE9DF] border border-[#1C1B18] text-[#1C1B18] uppercase">
                    {log.userRole}
                  </span>
                </div>

                {log.newValue && (
                  <div className="text-[11px] font-mono">
                    <span className="text-[#8C8476]">State Transition: </span>
                    {log.oldValue && <span className="line-through text-[#8C8476] mr-1">{log.oldValue}</span>}
                    <span className="font-bold text-[#2C5E3B]">{log.newValue}</span>
                  </div>
                )}

                {log.justification && (
                  <p className="text-[11px] bg-[#EFE9DF] p-2 border border-[#1C1B18] text-[#1C1B18] italic">
                    "{log.justification}"
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
