import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types/index.js';
import { api } from './services/api.js';
import { Sidebar } from './components/Sidebar.js';
import { FloatingPillNav } from './components/FloatingPillNav.js';
import { AuthGatewayModal } from './components/AuthGatewayModal.js';
import { ToastContainer, ToastMessage } from './components/Toast.js';
import { PublicExplorerView } from './views/PublicExplorerView.js';
import { ScientistStudioView } from './views/ScientistStudioView.js';
import { ReviewerCommandView } from './views/ReviewerCommandView.js';
import { OrganizationCommandView } from './views/OrganizationCommandView.js';
import { GovernmentCommandView } from './views/GovernmentCommandView.js';
import { AdminCommandView } from './views/AdminCommandView.js';
import { AuditTrailView } from './views/AuditTrailView.js';

export function App() {
  const [currentUser, setCurrentUser] = useState<User>(api.currentUser);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<string>('explorer');
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [isAuthGatewayOpen, setIsAuthGatewayOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const addToast = (type: 'success' | 'warning' | 'error' | 'info', title: string, message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    // Automatically dismiss after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const initData = async () => {
    try {
      setLoading(true);
      const users = await api.getUsers();
      setAllUsers(users);
      if (users.length > 0) {
        const defaultUser = users.find((u) => u.userId === 'usr_sci_01') || users[0];
        setCurrentUser(defaultUser);
        api.setUser(defaultUser);
      }
    } catch (err) {
      console.error('Failed to initialize app', err);
      addToast('error', 'Initialization Error', 'Unable to fetch users from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    api.setUser(user);
    setIsAuthGatewayOpen(false);

    addToast(
      'info',
      'Persona Activated',
      `Switched clearance to ${user.name} (${user.role}).`
    );

    switch (user.role) {
      case 'SCIENTIST':
        setActiveTab('scientist');
        break;
      case 'REVIEWER':
        setActiveTab('reviewer');
        break;
      case 'ORGANIZATION':
        setActiveTab('org');
        break;
      case 'GOVERNMENT':
        setActiveTab('gov');
        break;
      case 'ADMIN':
        setActiveTab('admin');
        break;
      case 'PUBLIC':
      default:
        setActiveTab('explorer');
        break;
    }
  };

  const handleResetData = async () => {
    if (!confirm('Reset entire BioTrust database to canonical initial seeds?')) return;
    try {
      await api.resetToSeeds();
      addToast('success', 'Database Reset', 'BioTrust database restored to initial canonical seeds.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      addToast('error', 'Reset Failed', err.message);
    }
  };

  const handleSelectLink = (linkType: string, _linkId: string) => {
    if (linkType === 'record') {
      if (currentUser.role === 'REVIEWER') setActiveTab('reviewer');
      else if (currentUser.role === 'SCIENTIST') setActiveTab('scientist');
      else setActiveTab('explorer');
    } else if (linkType === 'species') {
      if (currentUser.role === 'GOVERNMENT') setActiveTab('gov');
      else setActiveTab('explorer');
    } else if (linkType === 'project') {
      setActiveTab('org');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#EFE9DF] text-[#1C1B18] flex font-sans antialiased">
      {/* 1. Left Vertical Collapsible Sidebar with Fixed Toggle Button (⇄) */}
      <Sidebar
        currentUser={currentUser}
        allUsers={allUsers}
        onSwitchUser={handleSwitchUser}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onOpenAuthGateway={() => setIsAuthGatewayOpen(true)}
        onResetData={handleResetData}
      />

      {/* 2. Main Execution Canvas with Floating Pill Nav */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#EFE9DF] overflow-y-auto">
        {/* Floating Minimalist Pill-Shaped Navigation Bar Centered at Top */}
        <FloatingPillNav
          currentUser={currentUser}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenAuthGateway={() => setIsAuthGatewayOpen(true)}
          onResetData={handleResetData}
          onSelectLink={handleSelectLink}
        />

        {/* Content Canvas */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-4 space-y-6">
          {loading ? (
            <div className="p-12 bg-[#F9F6F0] border-2 border-[#1C1B18] shadow-[4px_4px_0px_#1C1B18] text-center text-[#8C8476] text-xs font-mono">
              Initializing BioTrust Eco-Brutalism Archive Subsystems...
            </div>
          ) : (
            <>
              {activeTab === 'explorer' && (
                <PublicExplorerView userRole={currentUser.role} onShowToast={addToast} />
              )}
              {activeTab === 'scientist' && (
                <ScientistStudioView onShowToast={addToast} />
              )}
              {activeTab === 'reviewer' && (
                <ReviewerCommandView onShowToast={addToast} />
              )}
              {activeTab === 'org' && (
                <OrganizationCommandView onShowToast={addToast} />
              )}
              {activeTab === 'gov' && (
                <GovernmentCommandView onShowToast={addToast} />
              )}
              {activeTab === 'admin' && (
                <AdminCommandView onShowToast={addToast} />
              )}
              {activeTab === 'audit' && (
                <AuditTrailView />
              )}
            </>
          )}
        </main>

        {/* Eco-Brutalism Editorial Archive Footer */}
        <footer className="w-full bg-[#F9F6F0] border-t-2 border-[#1C1B18] py-5 px-8 mt-12">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="font-black text-[#1C1B18] tracking-wider">
                BIOTRUST // THE ECO-BRUTALISM ARCHIVE
              </span>
              <span className="w-2 h-2 rounded-full bg-[#2C5E3B]" />
              <span className="text-[#2C5E3B] font-bold">DOCUMENT VERIFICATION ACTIVE</span>
            </div>

            {/* Eco-Brutalism Archive Palette Tokens Legend */}
            <div className="flex items-center gap-4 text-[11px] text-[#8C8476]">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#EFE9DF] border-2 border-[#1C1B18]"></span>
                <span className="text-[#1C1B18]">Kraft Paper</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#F9F6F0] border-2 border-[#1C1B18]"></span>
                <span className="text-[#1C1B18]">Raw White</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#2C5E3B] border-2 border-[#1C1B18]"></span>
                <span className="text-[#2C5E3B] font-bold">Forest Moss</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#E65F2B] border-2 border-[#1C1B18]"></span>
                <span className="text-[#E65F2B] font-bold">Industrial Orange</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-[#1C1B18]"></span>
                <span className="text-[#1C1B18] font-bold">Charcoal Ink</span>
              </span>
            </div>
          </div>
        </footer>
      </div>

      {/* Initial / On-Demand Persona Clearance Selection Gateway Modal */}
      <AuthGatewayModal
        isOpen={isAuthGatewayOpen}
        onClose={() => setIsAuthGatewayOpen(false)}
        currentUser={currentUser}
        allUsers={allUsers}
        onSelectUser={handleSwitchUser}
      />

      {/* Live Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
