import React, { useState, useEffect } from 'react';
import { Settings, Server, Shield, Database, Radio, RefreshCw, Key, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getSystemStatus, checkBackendHealth } from '../services/api';
import { MOCK_SYSTEM_STATUS } from '../data/mockData';

export function SettingsPage() {
  const [systemStatus, setSystemStatus] = useState(MOCK_SYSTEM_STATUS);
  const [backendHealth, setBackendHealth] = useState({ status: 'checking' });
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    const health = await checkBackendHealth();
    setBackendHealth(health);
    const status = await getSystemStatus();
    if (status && status.components) {
      setSystemStatus(status);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-steel-800">
        <div>
          <h2 className="text-xl font-bold text-steel-100 font-sans tracking-wide">
            System Architecture & AI Providers
          </h2>
          <p className="text-xs font-mono text-steel-400 mt-0.5">
            Operational status of Gemini, NVIDIA Nemotron, ChromaDB, and FastAPI backend
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={RefreshCw}
          loading={refreshing}
          onClick={handleRefresh}
        >
          Check Connectivity
        </Button>
      </div>

      {/* AI Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gemini Provider */}
        <Card
          title="Google Gemini AI Engine"
          subtitle="Primary Multimodal & LLM Reasoning Engine"
          icon={Server}
          highlight
        >
          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-steel-800">
              <span className="text-steel-400">STATUS:</span>
              <Badge variant="online" size="sm" dot>ONLINE</Badge>
            </div>
            <div className="flex justify-between py-1 border-b border-steel-800">
              <span className="text-steel-400">ACTIVE MODEL:</span>
              <span className="text-cyan-glow font-bold">gemini-1.5-pro-latest</span>
            </div>
            <div className="flex justify-between py-1 border-b border-steel-800">
              <span className="text-steel-400">CAPABILITIES:</span>
              <span className="text-steel-200">Vision, Reasoning, Tools, Grounding</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-steel-400">CREDENTIAL STATUS:</span>
              <span className="text-nominal">SECURE (ENV: GEMINI_API_KEY)</span>
            </div>
          </div>
        </Card>

        {/* NVIDIA Embeddings Provider */}
        <Card
          title="NVIDIA RAG Embeddings"
          subtitle="Strictly for Manuals Vector Embeddings"
          icon={Server}
          highlight
        >
          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-steel-800">
              <span className="text-steel-400">STATUS:</span>
              <Badge variant="cyan" size="sm" dot>ONLINE</Badge>
            </div>
            <div className="flex justify-between py-1 border-b border-steel-800">
              <span className="text-steel-400">EMBEDDING MODEL:</span>
              <span className="text-cyan-glow font-bold">nemotron-3-embed-1b</span>
            </div>
            <div className="flex justify-between py-1 border-b border-steel-800">
              <span className="text-steel-400">CONFIG IDENTIFIER:</span>
              <span className="text-steel-200">NVIDIABuild-Autogen-59</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-steel-400">ROLE:</span>
              <span className="text-hazard">1024D Manual Passage Vectorization</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Backend & Persistence Settings */}
      <Card title="Backend & Persistence Configuration" icon={Database}>
        <div className="space-y-4 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 rounded bg-carbon-950 border border-steel-800">
              <span className="text-steel-500 block mb-1">FASTAPI SERVICE URL</span>
              <span className="text-cyan-glow font-bold">http://127.0.0.1:8000</span>
              <div className="mt-2">
                <Badge variant={backendHealth.status === 'healthy' ? 'nominal' : 'warning'} size="sm" dot>
                  {backendHealth.status === 'healthy' ? 'CONNECTED & HEALTHY' : 'STANDBY / OFFLINE'}
                </Badge>
              </div>
            </div>

            <div className="p-3 rounded bg-carbon-950 border border-steel-800">
              <span className="text-steel-500 block mb-1">CONDA PYTHON ENVIRONMENT</span>
              <span className="text-steel-200 font-bold">version11 (Python 3.11.15)</span>
              <div className="mt-2">
                <Badge variant="nominal" size="sm" dot>VERIFIED ENVIRONMENT</Badge>
              </div>
            </div>
          </div>

          <div className="p-3 rounded bg-carbon-950 border border-steel-800 flex items-center justify-between">
            <div>
              <span className="text-steel-200 font-bold">Vector Database (ChromaDB)</span>
              <p className="text-[11px] text-steel-400 mt-0.5">Local persistent storage path: .chroma/</p>
            </div>
            <Badge variant="nominal" size="sm">READY</Badge>
          </div>

          <div className="p-3 rounded bg-carbon-950 border border-steel-800 flex items-center justify-between">
            <div>
              <span className="text-steel-200 font-bold">Telemetry Database (SQLite)</span>
              <p className="text-[11px] text-steel-400 mt-0.5">Local relational database: field_ai.db</p>
            </div>
            <Badge variant="nominal" size="sm">CONNECTED</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
