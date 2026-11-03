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
  RefreshCw
} from 'lucide-react';
import { User, UserRole } from '../types/index.js';

interface SidebarProps {
  currentUser: User;
  allUsers: User[];
  onSwitchUser: (user: User) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenAuthGateway: () => void;
  onResetData: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  allUsers,
  onSwitchUser,
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  onOpenAuthGateway,
  onResetData
}) => {
  const navItems = [
    { id: 'explorer', label: 'Public Explorer', icon: Compass, code: 'MOD-09' },
    { id: 'scientist', label: 'Scientist Studio', icon: FlaskConical, code: 'MOD-03' },
    { id: 'reviewer', label: 'Reviewer Queue', icon: Scale, code: 'MOD-04' },
    { id: 'org', label: 'NGO Operations', icon: TreePine, code: 'MOD-06' },
    { id: 'gov', label: 'Threat Authority', icon: Landmark, code: 'CITES' },
    { id: 'admin', label: 'Admin Ledger', icon: Terminal, code: 'MOD-01' },
    { id: 'audit', label: 'Audit Trail', icon: Activity, code: 'CHAIN' }
  ];

  const rolePills: Record<UserRole, { badge: string; color: string }> = {
    ADMIN: { badge: 'ROOT ADMIN', color: 'bg-[#1C1B18] text-[#F9F6F0]' },
    GOVERNMENT: { badge: 'CITES OFFICER', color: 'bg-[#E65F2B] text-white' },
    REVIEWER: { badge: 'VERIFIER', color: 'bg-[#2C5E3B] text-white' },
    SCIENTIST: { badge: 'RESEARCHER', color: 'bg-[#2C5E3B] text-white' },
    ORGANIZATION: { badge: 'NGO LEAD', color: 'bg-[#8C8476] text-white' },
    PUBLIC: { badge: 'OBSERVER', color: 'bg-[#EFE9DF] text-[#1C1B18]' }
  };

  const pill = rolePills[currentUser.role];

  return (
    <aside
      className={`bg-[#F9F6F0] border-r-2 border-[#1C1B18] sticky top-0 h-screen flex flex-col overflow-hidden transition-all duration-200 z-30 select-none flex-shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
      style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}
    >
      {/* 1. Top Fixed Header with PERMANENTLY FIXED VISIBLE TOGGLE BUTTON (⇄) */}
      <div className="h-16 flex-shrink-0 flex items-center justify-between px-3 border-b-2 border-[#1C1B18] bg-[#EFE9DF]">
        {!collapsed ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 bg-[#2C5E3B] border-2 border-[#1C1B18] flex items-center justify-center text-[#F9F6F0] font-black text-sm shadow-[2px_2px_0px_#1C1B18] flex-shrink-0">
              BT
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-black text-xs tracking-wider text-[#1C1B18]">
                BIOTRUST
              </span>
              <span className="text-[9px] font-mono font-bold text-[#8C8476] uppercase tracking-tight">
                ECO-ARCHIVE V2.4
              </span>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 bg-[#2C5E3B] border-2 border-[#1C1B18] flex items-center justify-center text-[#F9F6F0] font-black text-sm shadow-[2px_2px_0px_#1C1B18]">
              BT
            </div>
          </div>
        )}

        {/* PERMANENTLY FIXED VISIBLE TOGGLE BUTTON ON TOP-RIGHT OF SIDEBAR */}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 border-2 border-[#1C1B18] bg-[#F9F6F0] hover:bg-[#1C1B18] hover:text-white transition-colors cursor-pointer shadow-[2px_2px_0px_#1C1B18] flex items-center justify-center"
          title={collapsed ? 'Expand Sidebar (⇄)' : 'Collapse Sidebar (⇄)'}
        >
          <span className="font-mono font-extrabold text-xs">⇄</span>
        </button>
      </div>

      {/* 2. Scrollable Middle Navigation / Filter Area */}
      <div 
        className="flex-1 overflow-y-auto min-h-0 py-2"
        style={{ flex: 1, overflowY: 'auto' }}
      >
        <nav className="p-3 space-y-1.5">
          {!collapsed && (
            <div className="px-2 py-1 text-[10px] font-mono font-bold uppercase tracking-widest text-[#8C8476] border-b border-[#D6CEBE] mb-2 flex justify-between">
              <span>Archive Modules</span>
              <span>INDEX</span>
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-bold transition-all cursor-pointer border-2 ${
                  isActive
                    ? 'bg-[#2C5E3B] text-[#F9F6F0] border-[#1C1B18] shadow-[3px_3px_0px_#1C1B18] translate-x-1'
                    : 'bg-[#F9F6F0] text-[#1C1B18] border-transparent hover:border-[#1C1B18] hover:bg-[#EFE9DF]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#F9F6F0]' : 'text-[#2C5E3B]'}`} />

                {!collapsed && (
                  <span className="flex-1 text-left tracking-tight">
                    {item.label}
                  </span>
                )}

                {!collapsed && (
                  <span className={`text-[9px] font-mono px-1 py-0.2 border ${
                    isActive ? 'bg-[#1C1B18] text-[#F9F6F0] border-white/20' : 'bg-[#EFE9DF] text-[#8C8476] border-[#D6CEBE]'
                  }`}>
                    {item.code}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. Pinned, Sticky Footer Container (Always Visible in Viewport Without Scrolling) */}
      <div 
        className="flex-shrink-0 border-t-2 border-[#1C1B18] bg-[#F9F6F0] p-4 space-y-2 z-10 shadow-[0_-2px_4px_rgba(28,27,24,0.05)]"
        style={{ flexShrink: 0, padding: '1rem', borderTop: '2px solid #1C1B18', backgroundColor: '#F9F6F0' }}
      >
        {!collapsed ? (
          <>
            <div className="p-3 bg-[#EFE9DF] border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className={`px-1.5 py-0.5 border border-[#1C1B18] font-bold ${pill.color}`}>
                  {pill.badge}
                </span>
                <span className="text-[#2C5E3B] font-bold">REP: {currentUser.reputationScore}</span>
              </div>

              <div>
                <strong className="text-xs text-[#1C1B18] block truncate font-black">{currentUser.name}</strong>
                <span className="text-[10px] text-[#8C8476] block truncate font-medium">
                  {currentUser.organizationName || 'Citizen Science'}
                </span>
              </div>

              {/* Persona Switcher Trigger Button */}
              <button
                onClick={onOpenAuthGateway}
                className="w-full mt-1 py-1.5 bg-[#E65F2B] text-white font-mono font-bold text-xs border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] hover:bg-[#1C1B18] hover:text-[#E65F2B] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                <span>Switch Role (⇄)</span>
              </button>
            </div>

            <div className="flex items-center justify-between px-1 text-[10px] font-mono text-[#8C8476]">
              <span>ECO-BRUTALISM</span>
              <button
                onClick={onResetData}
                className="hover:text-[#1C1B18] flex items-center gap-1 cursor-pointer font-bold"
                title="Reset Database to Seed State"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Data</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <span className={`w-3 h-3 rounded-full border border-[#1C1B18] ${pill.color}`} title={pill.badge} />
            <button
              onClick={onOpenAuthGateway}
              className="w-10 h-10 bg-[#E65F2B] text-white border-2 border-[#1C1B18] shadow-[2px_2px_0px_#1C1B18] flex items-center justify-center cursor-pointer hover:bg-[#1C1B18] transition-colors"
              title={`Switch Persona (Current: ${currentUser.name} [${pill.badge}])`}
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
