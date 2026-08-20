import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Cpu,
  Activity,
  BookOpen,
  History,
  MessageSquare,
  Settings,
  ChevronRight,
  ShieldCheck,
  Zap,
  Radio
} from 'lucide-react';
import { Badge } from '../ui/Badge';

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
  { id: 'equipment', label: 'Equipment Catalog', icon: Cpu, badge: '5' },
  { id: 'diagnostics', label: 'Diagnostic Assistant', icon: Activity, badge: 'AI Core', highlight: true },
  { id: 'manuals', label: 'Knowledge Base', icon: BookOpen, badge: 'RAG' },
  { id: 'maintenance', label: 'Maintenance History', icon: History, badge: null },
  { id: 'feedback', label: 'Feedback & Accuracy', icon: MessageSquare, badge: null },
  { id: 'settings', label: 'System & Providers', icon: Settings, badge: null },
];

export function Sidebar({ activeTab, onSelectTab, isCollapsed, onToggleCollapse, systemStatus }) {
  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 bg-carbon-900 border-r border-steel-800 transition-all duration-300 flex flex-col justify-between ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-steel-800 bg-carbon-950/40">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-carbon-800 border border-cyan-accent/50 flex items-center justify-center text-cyan-glow shadow-cyan-glow">
                <Zap className="w-4 h-4 text-cyan-glow fill-cyan-glow/30" />
              </div>
              <div>
                <span className="font-bold text-sm text-steel-100 tracking-wider font-mono">
                  FIELD<span className="text-cyan-glow">AI</span>
                </span>
                <span className="block text-[10px] text-steel-400 font-mono">ASSISTANT v0.1</span>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-8 h-8 mx-auto rounded bg-carbon-800 border border-cyan-accent/50 flex items-center justify-center text-cyan-glow shadow-cyan-glow">
              <Zap className="w-4 h-4 text-cyan-glow" />
            </div>
          )}
        </div>

        {/* Navigation List */}
        <nav className="p-2 space-y-1 mt-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-carbon-800 text-cyan-glow border border-cyan-accent/40 shadow-sm'
                    : 'text-steel-400 hover:text-steel-100 hover:bg-carbon-850'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 transition-transform ${
                    isActive ? 'text-cyan-glow scale-110' : 'text-steel-500 group-hover:text-steel-300'
                  }`}
                />
                {!isCollapsed && (
                  <>
                    <span className="truncate font-sans flex-1 text-left">{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant={item.highlight ? 'cyan' : 'steel'}
                        size="sm"
                        className="text-[10px] px-1.5 py-0"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute left-0 top-1 bottom-1 w-1 bg-cyan-glow rounded-r"
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status Panel */}
      <div className="p-3 border-t border-steel-800 bg-carbon-950/60">
        {!isCollapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-steel-400">
                <Radio className="w-3.5 h-3.5 text-nominal animate-pulse-subtle" />
                <span>ENG CORE STATUS</span>
              </div>
              <Badge variant="nominal" size="sm" dot>LIVE</Badge>
            </div>
            
            <div className="space-y-1 pt-1 text-[10px] font-mono text-steel-400">
              <div className="flex justify-between items-center py-0.5 px-1.5 rounded bg-carbon-900">
                <span>GEMINI VISION</span>
                <span className="text-emerald-400">READY</span>
              </div>
              <div className="flex justify-between items-center py-0.5 px-1.5 rounded bg-carbon-900">
                <span>NVIDIA RAG</span>
                <span className="text-cyan-glow">1024D</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-nominal animate-pulse-subtle" title="AI Core: Live" />
          </div>
        )}
      </div>
    </aside>
  );
}
