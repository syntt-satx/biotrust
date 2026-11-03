import React from 'react';
import { Shield, Sparkles, RefreshCw, UserCheck, Eye, Terminal } from 'lucide-react';
import { User, UserRole } from '../types/index.js';
import { NotificationCenter } from './NotificationCenter.js';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (user: User) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onResetData: () => void;
  onSelectLink?: (linkType: string, linkId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  activeTab,
  onSelectTab,
  onResetData,
  onSelectLink
}) => {
  const roleBadges: Record<UserRole, { color: string; label: string }> = {
    SCIENTIST: { color: 'bg-[#C9DFA3] text-[#382832]', label: '🧑🔬 Scientist' },
    REVIEWER: { color: 'bg-[#FFC39B] text-[#382832]', label: '🧑⚖️ Reviewer' },
    ORGANIZATION: { color: 'bg-[#C9DFA3] text-[#382832]', label: '🏢 NGO / Org' },
    GOVERNMENT: { color: 'bg-[#F05C5C] text-white', label: '🏛️ Government' },
    ADMIN: { color: 'bg-[#382832] text-white', label: '👨💻 Admin' },
    PUBLIC: { color: 'bg-white text-[#382832]', label: '🌍 Public Citizen' }
  };

  const navItems = [
    { id: 'explorer', label: 'Public Explorer', icon: Eye },
    { id: 'scientist', label: 'Scientist Studio', role: 'SCIENTIST' },
    { id: 'reviewer', label: 'Reviewer Queue', role: 'REVIEWER' },
    { id: 'org', label: 'NGO Projects', role: 'ORGANIZATION' },
    { id: 'gov', label: 'Threat Authority', role: 'GOVERNMENT' },
    { id: 'admin', label: 'Admin Command', role: 'ADMIN' },
    { id: 'audit', label: 'Audit Trail' }
  ];

  return (
    <header className="w-full bg-[#FAF9F2] border-b-2 border-[#382832] sticky top-0 z-30">
      {/* Top Banner with Brand & Role Switcher */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#F05C5C] border-2 border-[#382832] shadow-[2px_2px_0px_#382832] flex items-center justify-center text-white font-black text-lg">
            BT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-[#382832]">BIOTRUST</span>
              <span className="px-1.5 py-0.2 bg-[#C9DFA3] border border-[#382832] text-[10px] font-bold text-[#382832]">
                VERIFIED V2.0
              </span>
            </div>
            <p className="text-[10px] text-[#777077] tracking-tight">
              Verified Biodiversity Security Command Center
            </p>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Active Role Indicator & Switcher */}
          <div className="flex items-center gap-1.5 bg-white border-1.5 border-[#382832] shadow-[2px_2px_0px_#382832] px-2.5 py-1">
            <span className="text-[11px] font-bold text-[#777077] uppercase tracking-wider">Active Role:</span>
            <select
              value={currentUser.userId}
              onChange={(e) => {
                const target = allUsers.find(u => u.userId === e.target.value);
                if (target) onSwitchUser(target);
              }}
              className="bg-transparent text-xs font-bold text-[#382832] outline-none cursor-pointer"
            >
              {allUsers.map((u) => (
                <option key={u.userId} value={u.userId}>
                  {roleBadges[u.role].label} — {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Notifications */}
          <NotificationCenter onSelectLink={onSelectLink} />

          {/* Reset Demo Database Button */}
          <button
            onClick={onResetData}
            className="p-2 bg-white border-1.5 border-[#382832] shadow-[2px_2px_0px_#382832] hover:bg-[#FAF9F2] text-[#382832] cursor-pointer"
            title="Reset Database to Seed State"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="max-w-7xl mx-auto px-4 flex items-center gap-1 border-t border-[#E4DFD8] overflow-x-auto py-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`px-3 py-1.5 text-xs font-bold border-1.5 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#F05C5C] text-white border-[#382832] shadow-[2px_2px_0px_#382832] -translate-y-0.5'
                  : 'bg-white text-[#382832] border-transparent hover:border-[#382832] hover:bg-[#FAF9F2]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
