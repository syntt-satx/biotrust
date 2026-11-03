import React from 'react';
import { 
  Compass, 
  FlaskConical, 
  Scale, 
  TreePine, 
  Landmark, 
  Terminal, 
  Activity, 
  ArrowLeftRight, 
  Bell, 
  RefreshCw 
} from 'lucide-react';
import { User } from '../types/index.js';
import { NotificationCenter } from './NotificationCenter.js';

interface FloatingPillNavProps {
  currentUser: User;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuthGateway: () => void;
  onResetData: () => void;
  onSelectLink?: (linkType: string, linkId: string) => void;
}

export const FloatingPillNav: React.FC<FloatingPillNavProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  onOpenAuthGateway,
  onResetData,
  onSelectLink
}) => {
  const navItems = [
    { id: 'explorer', label: 'Explorer', icon: Compass },
    { id: 'scientist', label: 'Scientist', icon: FlaskConical },
    { id: 'reviewer', label: 'Reviewer', icon: Scale },
    { id: 'org', label: 'NGO Projects', icon: TreePine },
    { id: 'gov', label: 'Threat Authority', icon: Landmark },
    { id: 'admin', label: 'Admin Ledger', icon: Terminal },
    { id: 'audit', label: 'Audit Trail', icon: Activity }
  ];

  return (
    <div className="sticky top-3 z-40 w-full px-4 flex justify-center pointer-events-none mb-2">
      <nav className="pointer-events-auto bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18] rounded-full px-3 py-1.5 flex items-center gap-1.5 md:gap-3 max-w-6xl w-full justify-between transition-all">
        {/* Brand Stamp */}
        <div className="flex items-center gap-2 pl-2">
          <div className="w-6 h-6 bg-[#2C5E3B] border-1.5 border-[#1C1B18] flex items-center justify-center text-[#F9F6F0] font-black text-xs">
            BT
          </div>
          <span className="font-mono font-black text-xs tracking-wider text-[#1C1B18] hidden sm:inline">
            BIOTRUST <span className="text-[#E65F2B]">ARCHIVE</span>
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#2C5E3B] text-[#F9F6F0] border border-[#1C1B18] shadow-[1px_1px_0px_#1C1B18]'
                    : 'text-[#1C1B18] hover:bg-[#EFE9DF]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden md:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls & Persistent "Switch Role" Button */}
        <div className="flex items-center gap-2 pr-1">
          {/* Switch Role Button */}
          <button
            onClick={onOpenAuthGateway}
            className="flex items-center gap-1.5 px-3 py-1 bg-[#E65F2B] text-white font-bold text-xs rounded-full border border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] hover:bg-[#1C1B18] hover:text-[#E65F2B] transition-all cursor-pointer whitespace-nowrap"
            title="Open Persona Clearance Gateway"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Switch Role</span>
            <span className="text-[10px] bg-black/20 px-1 rounded font-mono hidden lg:inline">
              {currentUser.role}
            </span>
          </button>

          {/* Notifications Center */}
          <NotificationCenter onSelectLink={onSelectLink} />

          {/* Reset Seed Button */}
          <button
            onClick={onResetData}
            className="p-1.5 bg-[#EFE9DF] border border-[#1C1B18] rounded-full hover:bg-[#1C1B18] hover:text-[#F9F6F0] text-[#1C1B18] transition-colors cursor-pointer"
            title="Reset Database to Seed State"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>
    </div>
  );
};
