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
  Server
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { MetricPill } from '../components/ui/MetricPill';
import { MOCK_EQUIPMENT_LIST, MOCK_SYSTEM_STATUS, MOCK_MAINTENANCE_HISTORY } from '../data/mockData';
import { getSystemStatus } from '../services/api';

export function DashboardPage({ onNavigate }) {
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

  return (
    <div className="space-y-6">
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
            title="AI Engine System Status"
            subtitle="Multi-provider AI service telemetry"
            icon={Server}
          >
            <div className="space-y-3.5">
              {/* Gemini */}
              <div className="p-3 rounded bg-carbon-950 border border-steel-800">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-nominal" />
                    <span className="text-xs font-mono font-bold text-steel-200">GEMINI AI</span>
                  </div>
                  <Badge variant="online" size="sm">ONLINE</Badge>
                </div>
                <p className="text-[11px] font-mono text-steel-400">
                  {systemStatus.components?.gemini?.details || "Multimodal Vision & Reasoning"}
                </p>
                <span className="block mt-1 text-[10px] font-mono text-cyan-glow">
                  Model: {systemStatus.components?.gemini?.model_or_info || "gemini-1.5-pro-latest"}
                </span>
              </div>

              {/* NVIDIA Embeddings */}
              <div className="p-3 rounded bg-carbon-950 border border-steel-800">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-accent" />
                    <span className="text-xs font-mono font-bold text-steel-200">NVIDIA EMBEDDINGS</span>
                  </div>
                  <Badge variant="cyan" size="sm">ONLINE</Badge>
                </div>
                <p className="text-[11px] font-mono text-steel-400">
                  {systemStatus.components?.nvidia_embeddings?.details || "Text Embeddings for Manuals RAG Only"}
                </p>
                <span className="block mt-1 text-[10px] font-mono text-cyan-glow">
                  Model: nemotron-3-embed-1b (NVIDIABuild-Autogen-59)
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
                  Persistent Manuals Vector Store (14 Docs / 328 Chunks)
                </p>
              </div>

              {/* Database */}
              <div className="p-3 rounded bg-carbon-950 border border-steel-800">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-nominal" />
                    <span className="text-xs font-mono font-bold text-steel-200">TELEMETRY DB</span>
                  </div>
                  <Badge variant="nominal" size="sm">CONNECTED</Badge>
                </div>
                <p className="text-[11px] font-mono text-steel-400">
                  SQLite Local Storage (field_ai.db)
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
