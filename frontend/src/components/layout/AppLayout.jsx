import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { checkBackendHealth } from '../../services/api';

const TAB_TITLES = {
  landing: 'Overview',
  overview: 'Operations Dashboard',
  equipment: 'Equipment Catalog',
  diagnostics: 'Diagnostic Assistant',
  manuals: 'Manuals & Knowledge Base',
  maintenance: 'Maintenance History',
  feedback: 'Field Feedback',
  settings: 'System Configuration'
};

export function AppLayout({ activeTab, onSelectTab, children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);

  useEffect(() => {
    let mounted = true;
    const verifyHealth = async () => {
      const res = await checkBackendHealth();
      if (mounted) {
        setBackendConnected(res && res.status === 'healthy');
      }
    };
    verifyHealth();
    const interval = setInterval(verifyHealth, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-carbon-950 text-steel-100 flex flex-col font-sans">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <TopHeader
          activeTabTitle={TAB_TITLES[activeTab] || 'FieldAI Assistant'}
          onOpenDiagnostics={() => onSelectTab('diagnostics')}
          backendConnected={backendConnected}
          onToggleSidebar={() => setIsCollapsed(!isCollapsed)}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
