import React, { useState, useEffect } from 'react';
import { Activity, Bell, Shield, Database, Sparkles, Menu, ChevronRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export function TopHeader({
  activeTabTitle,
  onOpenDiagnostics,
  backendConnected,
  onToggleSidebar
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
      <div className="flex items-center gap-4">
        {/* Real-time Clock */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded bg-carbon-950 border border-steel-800 text-xs font-mono text-steel-400">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-accent animate-ping" />
          <span>{timeString}</span>
        </div>

        {/* Backend Connectivity Status */}
        <div className="flex items-center gap-2">
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
        {activeTabTitle !== 'Diagnostic Assistant' && (
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
      </div>
    </header>
  );
}
