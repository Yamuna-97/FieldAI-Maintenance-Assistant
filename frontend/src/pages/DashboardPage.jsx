import React, { useState, useEffect } from 'react';
import {
  Activity,
  Cpu,
  AlertTriangle,
  CheckCircle,
  Database,
  Radio,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Server,
  User,
  BadgeCheck,
  Briefcase
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { MetricPill } from '../components/ui/MetricPill';
import { MOCK_EQUIPMENT_LIST, MOCK_SYSTEM_STATUS, MOCK_MAINTENANCE_HISTORY } from '../data/mockData';
import { getSystemStatus } from '../services/api';

export function DashboardPage({ onNavigate, currentUser }) {
  const [systemStatus, setSystemStatus] = useState(MOCK_SYSTEM_STATUS);

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await getSystemStatus();
      if (res && res.components) {
        setSystemStatus(res);
      }
    };
    fetchStatus();
  }, []);

  const criticalIssuesCount = MOCK_EQUIPMENT_LIST.filter(e => e.status === 'CRITICAL_ALERT').length;
  const maintenanceReqCount = MOCK_EQUIPMENT_LIST.filter(e => e.status === 'MAINTENANCE_REQUIRED').length;

  const displayName = currentUser?.name || 'Technician';
  const displayRole = currentUser?.role || 'Field Engineer';
  const displayDept = currentUser?.department || 'Plant Maintenance Operations';
  const displayId = currentUser?.technician_id || 'TECH-ACTIVE';

  return (
    <div className="space-y-6">
      {/* Personalized Technician Welcome Header */}
      <div className="p-5 rounded-xl bg-gradient-to-r from-carbon-900 via-carbon-850 to-carbon-900 border border-steel-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-carbon-800 border border-cyan-accent/50 flex items-center justify-center text-cyan-glow shadow-cyan-glow">
            <User className="w-6 h-6 text-cyan-glow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-steel-100 font-sans">
                Welcome back, <span className="text-cyan-glow">{displayName}</span>
              </h2>
              <Badge variant="online" size="sm" dot>
                ON SHIFT
              </Badge>
            </div>
            <p className="text-xs font-mono text-steel-400 mt-0.5 flex flex-wrap items-center gap-2">
              <span>{displayRole}</span>
              <span>·</span>
              <span>{displayDept}</span>
              {displayId && (
                <>
                  <span>·</span>
                  <span className="text-cyan-glow font-bold">[{displayId}]</span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="primary"
            size="sm"
            icon={Activity}
            onClick={() => onNavigate('diagnostics')}
            className="shadow-cyan-glow"
          >
            Start Diagnostic Inspection
          </Button>
        </div>
      </div>

      {/* Top Operations KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricPill
          label="Monitored Assets"
          value="05"
          unit="Units Active"
          status="nominal"
          trend="100% telemetry coverage"
        />
        <MetricPill
          label="Active Fault Alarms"
          value={`0${criticalIssuesCount + maintenanceReqCount}`}
          unit="Action Required"
          status="warning"
          trend="1 Critical / 1 Warning"
        />
        <MetricPill
          label="Fleet Health Index"
          value="81.4"
          unit="/ 100 Score"
          status="nominal"
          trend="+2.1% past 30 days"
        />
        <MetricPill
          label="RAG Vector Docs"
          value="14"
          unit="Indexed Manuals"
          status="cyan"
          trend="328 vector chunks"
        />
      </div>

      {/* Main Operations Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Monitored Equipment & Issues */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title="Active Equipment Telemetry & Status"
            subtitle="Real-time operational status of industrial machinery"
            icon={Cpu}
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('equipment')}
              >
                View Catalog
              </Button>
            }
          >
            <div className="space-y-3">
              {MOCK_EQUIPMENT_LIST.map((item) => {
                const statusVariant =
                  item.status === 'NOMINAL'
                    ? 'nominal'
                    : item.status === 'CRITICAL_ALERT'
                    ? 'critical'
                    : 'warning';

                return (
                  <div
                    key={item.id}
                    className="p-3.5 rounded bg-carbon-950 border border-steel-800 hover:border-steel-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-steel-100">{item.id}</span>
                        <span className="text-xs text-steel-400 font-medium">· {item.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-steel-500">
                        <span>{item.location}</span>
                        <span>·</span>
                        <span>Model: {item.model}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-steel-200">
                          {item.healthScore}%
                        </span>
                        <span className="block text-[10px] font-mono text-steel-500">Health</span>
                      </div>
                      <Badge variant={statusVariant} size="sm" dot>
                        {item.status.replace('_', ' ')}
                      </Badge>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onNavigate('diagnostics')}
                      >
                        Inspect
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent Maintenance & Diagnostics Feed */}
          <Card
            title="Recent Diagnostic & Service Logs"
            subtitle="Latest autonomous analyses and technician actions"
            icon={Activity}
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('maintenance')}
              >
                Full History →
              </Button>
            }
          >
            <div className="space-y-3">
              {MOCK_MAINTENANCE_HISTORY.slice(0, 3).map((hist) => (
                <div
                  key={hist.id}
                  className="p-3 rounded bg-carbon-950 border border-steel-800 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-glow">{hist.assetId}</span>
                      <span className="font-semibold text-steel-200">{hist.issueType}</span>
                    </div>
                    <span className="font-mono text-steel-500 text-[11px]">{hist.date}</span>
                  </div>
                  <p className="text-steel-400 leading-relaxed font-sans">{hist.actionTaken}</p>
                  <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-steel-500">
                    <span>Tech: {hist.technician}</span>
                    <Badge variant="nominal" size="sm">RESOLVED</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: AI Operations Center & Health */}
        <div className="space-y-6">
          <Card
            title="Neural Engine System Status"
            subtitle="Real-time multi-tier AI service telemetry"
            icon={Server}
          >
            <div className="space-y-3.5">
              {/* Neural Vision */}
              <div className="p-3 rounded bg-carbon-950 border border-steel-800">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-nominal" />
                    <span className="text-xs font-mono font-bold text-steel-200">NEURAL VISION CORE</span>
                  </div>
                  <Badge variant="online" size="sm">ONLINE</Badge>
                </div>
                <p className="text-[11px] font-mono text-steel-400">
                  {systemStatus.components?.gemini?.details || "Multimodal Optical & Thermal Defect Analysis"}
                </p>
                <span className="block mt-1 text-[10px] font-mono text-cyan-glow">
                  Engine: Neural-Vision-v1.5
                </span>
              </div>

              {/* Semantic Vector Core */}
              <div className="p-3 rounded bg-carbon-950 border border-steel-800">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-accent" />
                    <span className="text-xs font-mono font-bold text-steel-200">SEMANTIC VECTOR CORE</span>
                  </div>
                  <Badge variant="cyan" size="sm">ONLINE</Badge>
                </div>
                <p className="text-[11px] font-mono text-steel-400">
                  {systemStatus.components?.nvidia_embeddings?.details || "1024D Semantic Vectorization for OEM Manuals"}
                </p>
                <span className="block mt-1 text-[10px] font-mono text-cyan-glow">
                  Embedding: 1024-Dimensional Dense Vector
                </span>
              </div>

              {/* Vector Knowledge Base */}
              <div className="p-3 rounded bg-carbon-950 border border-steel-800">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-nominal" />
                    <span className="text-xs font-mono font-bold text-steel-200">CHROMA VECTOR DB</span>
                  </div>
                  <Badge variant="nominal" size="sm">READY</Badge>
                </div>
                <p className="text-[11px] font-mono text-steel-400">
                  Persistent Manuals Vector Store (238 Active Chunks)
                </p>
              </div>

              {/* Database */}
              <div className="p-3 rounded bg-carbon-950 border border-steel-800">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-nominal" />
                    <span className="text-xs font-mono font-bold text-steel-200">MONGODB ATLAS DB</span>
                  </div>
                  <Badge variant="nominal" size="sm">CONNECTED</Badge>
                </div>
                <p className="text-[11px] font-mono text-steel-400">
                  User Registry, Maintenance Logs, Equipment Telemetry
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-steel-800">
              <Button
                variant="primary"
                size="md"
                icon={Activity}
                onClick={() => onNavigate('diagnostics')}
                className="w-full"
              >
                Launch Multimodal Assistant
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
