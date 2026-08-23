import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { checkBackendHealth } from '../../services/api';
import { Zap, LogIn, UserPlus, Radio, Activity, ShieldCheck, Database, Menu, Lock } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

const TAB_TITLES = {
  landing: 'Home',
  overview: 'Operations Dashboard',
  equipment: 'Equipment Catalog',
  diagnostics: 'Diagnostic Assistant',
  manuals: 'Manuals & Knowledge Base',
  maintenance: 'Maintenance History',
  feedback: 'Field Feedback',
  settings: 'System Configuration',
  login: 'Sign In',
  signup: 'Register Technician'
};

export function AppLayout({ activeTab, onSelectTab, currentUser, onLogout, children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);

  const isPublicPage = activeTab === 'landing' || activeTab === 'login' || activeTab === 'signup';

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
      {/* ── 1. Public Mode (Home / Login / Signup) ── */}
      {isPublicPage ? (
        <div className="flex-1 flex flex-col">
          {/* Public Top Navigation Bar */}
          <header className="h-16 bg-carbon-900/90 backdrop-blur-md border-b border-steel-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
            {/* Logo */}
            <button
              onClick={() => onSelectTab('landing')}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-carbon-800 border border-cyan-accent/50 flex items-center justify-center text-cyan-glow shadow-cyan-glow group-hover:scale-105 transition-transform">
                <Zap className="w-4 h-4 text-cyan-glow fill-cyan-glow/30" />
              </div>
              <div>
                <span className="font-bold text-sm text-steel-100 tracking-wider font-mono">
                  FIELD<span className="text-cyan-glow">AI</span>
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] text-steel-400 font-mono border-l border-steel-700 pl-2">
                  MAINTENANCE SUITE
                </span>
              </div>
            </button>

            {/* Center / Navigation Links for Home Page */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-steel-400">
              <button
                onClick={() => onSelectTab('landing')}
                className={`hover:text-steel-100 transition-colors ${activeTab === 'landing' ? 'text-cyan-glow font-bold' : ''}`}
              >
                HOME & 3D TWIN
              </button>
              <button
                onClick={() => onSelectTab('login')}
                className={`hover:text-steel-100 transition-colors ${activeTab === 'login' ? 'text-cyan-glow font-bold' : ''}`}
              >
                TERMINAL LOGIN
              </button>
              <button
                onClick={() => onSelectTab('signup')}
                className={`hover:text-steel-100 transition-colors ${activeTab === 'signup' ? 'text-cyan-glow font-bold' : ''}`}
              >
                ONBOARDING
              </button>
            </nav>

            {/* Right Auth Controls */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-1.5 mr-2">
                <Badge variant={backendConnected ? 'online' : 'warning'} size="sm" dot>
                  {backendConnected ? 'ONLINE' : 'DEMO'}
                </Badge>
              </div>

              {currentUser ? (
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Activity}
                    onClick={() => onSelectTab('overview')}
                  >
                    Open Dashboard ({currentUser.name.split(' ')[0]})
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={LogIn}
                    onClick={() => onSelectTab('login')}
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={UserPlus}
                    onClick={() => onSelectTab('signup')}
                    className="shadow-cyan-glow"
                  >
                    Register
                  </Button>
                </div>
              )}
            </div>
          </header>

          {/* Public Page Body */}
          <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      ) : (
        /* ── 2. Authenticated Dashboard Mode (With Sidebar) ── */
        <div className="flex-1 flex flex-row">
          {/* Sidebar */}
          <Sidebar
            activeTab={activeTab}
            onSelectTab={onSelectTab}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          />

          {/* Main Content Area with Header */}
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
              currentUser={currentUser}
              onLogout={onLogout}
              onNavigate={onSelectTab}
            />

            <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
