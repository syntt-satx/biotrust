import React from 'react';
import { ShieldCheck, ChevronRight, Bell, Terminal, RefreshCw, Cpu, Activity } from 'lucide-react';
import { User, UserRole } from '../types/index.js';
import { NotificationCenter } from './NotificationCenter.js';

interface HeaderBarProps {
  currentUser: User;
  activeTab: string;
  onResetData: () => void;
  onSelectLink?: (linkType: string, linkId: string) => void;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  currentUser,
  activeTab,
  onResetData,
  onSelectLink
}) => {
  const tabTitles: Record<string, string> = {
    explorer: 'Public Explorer & Sighting Telemetry',
    scientist: 'Scientist Research Studio & Versioning',
    reviewer: 'Peer Review & Multi-Reviewer Consensus',
    org: 'NGO Conservation Project Operations',
    gov: 'Statutory Threat & CITES Authority',
    admin: 'Platform Governance & Identity Management',
    audit: 'Immutable Chain of Custody Audit Ledger'
  };

  const rolePills: Record<UserRole, { label: string; color: string }> = {
    ADMIN: { label: 'ROOT ADMIN', color: 'bg-[#2EE8A6]/15 text-[#2EE8A6] border-[#2EE8A6]/40' },
    GOVERNMENT: { label: 'CITES OFFICER', color: 'bg-[#FFB454]/15 text-[#FFB454] border-[#FFB454]/40' },
    REVIEWER: { label: 'VERIFIER', color: 'bg-[#4AF6C3]/15 text-[#4AF6C3] border-[#4AF6C3]/40' },
    SCIENTIST: { label: 'RESEARCHER', color: 'bg-[#2EE8A6]/15 text-[#2EE8A6] border-[#2EE8A6]/40' },
    ORGANIZATION: { label: 'NGO FIELD LEAD', color: 'bg-[#7B9B90]/15 text-[#7B9B90] border-[#7B9B90]/40' },
    PUBLIC: { label: 'PUBLIC OBSERVER', color: 'bg-[#7B9B90]/15 text-[#7B9B90] border-[#7B9B90]/40' }
  };

  const pill = rolePills[currentUser.role];

  return (
    <header className="h-16 bg-[#0D1F1A] border-b border-[#1F4035] flex items-center justify-between px-6 sticky top-0 z-20">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <span className="text-[#7B9B90] flex items-center gap-1.5 hover:text-[#F2FBF7] transition-colors">
          <Cpu className="w-3.5 h-3.5 text-[#2EE8A6]" />
          BIOTRUST
        </span>
        <ChevronRight className="w-3.5 h-3.5 text-[#1F4035]" />
        <span className="text-[#4AF6C3] font-semibold tracking-wide uppercase">
          {tabTitles[activeTab] || 'Operational Center'}
        </span>
      </div>

      {/* Right: Telemetry, Notification Badge, User Clearance */}
      <div className="flex items-center gap-4">
        {/* Compliance Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-[#142B24] border border-[#1F4035] text-[11px] font-mono shadow-[0_0_10px_rgba(46,232,166,0.06)]">
          <span className="w-2 h-2 rounded-full bg-[#2EE8A6] shadow-[0_0_8px_#2EE8A6] animate-pulse" />
          <span className="text-[#F2FBF7] font-bold">ECOLOGICAL TELEMETRY:</span>
          <span className="text-[#2EE8A6]">ONLINE</span>
        </div>

        {/* Live Notification Center */}
        <NotificationCenter onSelectLink={onSelectLink} />

        {/* User Identity & Clearance Pill */}
        <div className="flex items-center gap-2 pl-3 border-l border-[#1F4035]">
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-[#F2FBF7] leading-tight">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-[#7B9B90] font-mono leading-tight">
              {currentUser.email}
            </div>
          </div>

          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${pill.color}`}>
            {pill.label}
          </span>
        </div>
      </div>
    </header>
  );
};
