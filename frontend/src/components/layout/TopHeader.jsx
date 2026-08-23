import React, { useState, useEffect } from 'react';
import { Activity, Bell, Shield, Database, Sparkles, Menu, ChevronRight, User, LogOut, LogIn } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function TopHeader({
  activeTabTitle,
  onOpenDiagnostics,
  backendConnected,
  onToggleSidebar,
  currentUser,
  onLogout,
  onNavigate
}) {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTimeString(now.toTimeString().split(' ')[0] + ' UTC');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-carbon-900/80 backdrop-blur-md border-b border-steel-800 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left Title & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded text-steel-400 hover:text-steel-100 hover:bg-carbon-800 transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-xs font-mono text-steel-400">
          <span>FIELD-AI</span>
          <ChevronRight className="w-3.5 h-3.5 text-steel-600" />
          <span className="text-steel-100 font-semibold tracking-wide uppercase font-sans text-sm">
            {activeTabTitle}
          </span>
        </div>
      </div>

      {/* Right Controls & Telemetry */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Real-time Clock */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded bg-carbon-950 border border-steel-800 text-xs font-mono text-steel-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-accent animate-ping" />
          <span>{timeString}</span>
        </div>

        {/* Backend Connectivity Status */}
        <div className="hidden sm:flex items-center gap-2">
          {backendConnected ? (
            <Badge variant="online" size="sm" dot>
              API: 127.0.0.1:8000
            </Badge>
          ) : (
            <Badge variant="warning" size="sm" dot>
              API: DEMO MODE
            </Badge>
          )}
        </div>

        {/* Action Button */}
        {activeTabTitle !== 'Diagnostic Assistant' && activeTabTitle !== 'Sign In' && activeTabTitle !== 'Register' && (
          <Button
            variant="primary"
            size="sm"
            icon={Activity}
            onClick={onOpenDiagnostics}
            className="hidden md:inline-flex"
          >
            Launch Diagnostics
          </Button>
        )}

        {/* User Auth Profile / Actions */}
        {currentUser ? (
          <div className="flex items-center gap-2.5 pl-2 border-l border-steel-800">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-carbon-950 border border-steel-800 text-xs">
              <div className="w-5 h-5 rounded-full bg-cyan-glow/20 border border-cyan-accent/50 flex items-center justify-center text-cyan-glow">
                <User className="w-3 h-3" />
              </div>
              <div className="hidden sm:block text-left">
                <span className="font-semibold text-steel-200 block text-xs leading-none truncate max-w-[110px]">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-cyan-glow font-mono uppercase">
                  {currentUser.role || 'TECH'}
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-1.5 rounded text-steel-400 hover:text-critical hover:bg-carbon-800 transition-colors border border-transparent hover:border-critical/30"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 pl-2 border-l border-steel-800">
            <Button
              variant="secondary"
              size="sm"
              icon={LogIn}
              onClick={() => onNavigate('login')}
            >
              Sign In
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
