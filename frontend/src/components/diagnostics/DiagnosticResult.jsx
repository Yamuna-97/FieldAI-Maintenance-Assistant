import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Wrench,
  Layers,
  History,
  Package,
  BookOpen,
  ArrowRight,
  Clock
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { TechnicalConfidence } from './TechnicalConfidence';

export function DiagnosticResult({ result }) {
  const [activeTab, setActiveTab] = useState('steps'); // 'steps' | 'safety' | 'citations' | 'parts'

  if (!result) return null;

  const severityVariants = {
    CRITICAL: 'critical',
    WARNING: 'warning',
    MODERATE: 'cyan',
    LOW: 'nominal'
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Summary Box */}
      <div className="p-5 rounded-lg bg-carbon-900 border border-steel-700/80 shadow-lg relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-steel-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-steel-400">DIAGNOSTIC REPORT:</span>
            <span className="text-xs font-mono font-bold text-steel-100">{result.diagnostic_id}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={severityVariants[result.severity] || 'warning'} size="sm" dot>
              {result.severity} SEVERITY
            </Badge>
            <Badge variant="steel" size="sm">
              ASSET: {result.equipment_id}
            </Badge>
          </div>
        </div>

        <div className="mt-3">
          <h2 className="text-base font-bold text-steel-100 font-sans tracking-wide">
            {result.issue_summary}
          </h2>
          {result.error_code_analysis && (
            <p className="mt-2 text-xs font-mono text-cyan-glow/90 bg-carbon-950 p-2.5 rounded border border-steel-800">
              {result.error_code_analysis}
            </p>
          )}
        </div>
      </div>

      {/* Safety Alert Banner */}
      {result.safety_warnings && result.safety_warnings.length > 0 && (
        <div className="p-4 rounded-lg bg-hazard-dark/15 border border-hazard/40">
          <div className="flex items-center gap-2 text-xs font-bold text-hazard font-mono uppercase tracking-wider mb-2">
            <ShieldAlert className="w-4 h-4" />
            Mandatory Safety & LOTO Protocol
          </div>
          <ul className="space-y-1.5 text-xs text-hazard-light">
            {result.safety_warnings.map((warn, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-hazard font-bold">▶</span>
                <span>{warn}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-steel-800 gap-2">
        <button
          onClick={() => setActiveTab('steps')}
          className={`pb-2.5 px-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'steps'
              ? 'border-cyan-accent text-cyan-glow font-bold'
              : 'border-transparent text-steel-400 hover:text-steel-200'
          }`}
        >
          <Wrench className="w-3.5 h-3.5" />
          Inspection Sequence ({result.recommended_actions?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('citations')}
          className={`pb-2.5 px-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'citations'
              ? 'border-cyan-accent text-cyan-glow font-bold'
              : 'border-transparent text-steel-400 hover:text-steel-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          Manual Citations ({result.retrieved_knowledge?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('parts')}
          className={`pb-2.5 px-3 text-xs font-mono uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 ${
            activeTab === 'parts'
              ? 'border-cyan-accent text-cyan-glow font-bold'
              : 'border-transparent text-steel-400 hover:text-steel-200'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          Parts & History
        </button>
      </div>

      {/* Tab 1: Step-by-Step Inspection */}
      {activeTab === 'steps' && (
        <div className="space-y-3">
          {result.recommended_actions?.map((step) => (
            <div
              key={step.step_number}
              className="p-4 rounded-lg bg-carbon-900 border border-steel-800 hover:border-steel-700 transition-all"
            >
              <div className="flex items-center justify-between pb-2 border-b border-steel-850">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-carbon-800 border border-steel-700 text-cyan-glow font-mono font-bold text-xs flex items-center justify-center">
                    0{step.step_number}
                  </span>
                  <h4 className="text-sm font-semibold text-steel-100">{step.title}</h4>
                </div>
                <span className="text-[11px] font-mono text-steel-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  ~{step.estimated_time_mins} mins
                </span>
              </div>

              <p className="text-xs text-steel-200 mt-2.5 leading-relaxed">
                {step.action}
              </p>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                {step.expected_nominal && (
                  <div className="p-2 rounded bg-carbon-950 border border-steel-800 text-nominal">
                    <span className="text-steel-500 block text-[10px]">EXPECTED NOMINAL:</span>
                    {step.expected_nominal}
                  </div>
                )}
                {step.safety_precaution && (
                  <div className="p-2 rounded bg-carbon-950 border border-steel-800 text-hazard">
                    <span className="text-steel-500 block text-[10px]">SAFETY CAUTION:</span>
                    {step.safety_precaution}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Manual Citations */}
      {activeTab === 'citations' && (
        <TechnicalConfidence
          confidenceScore={result.confidence_score}
          citations={result.retrieved_knowledge || []}
        />
      )}

      {/* Tab 3: Parts & Maintenance History */}
      {activeTab === 'parts' && (
        <div className="space-y-4">
          {/* Suggested Parts */}
          <Card title="Recommended Replacement Parts" icon={Package}>
            <ul className="space-y-2">
              {result.suggested_parts?.map((part, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded bg-carbon-950 border border-steel-800 text-xs font-mono text-steel-200"
                >
                  <span>{part}</span>
                  <Badge variant="steel" size="sm">IN STOCK</Badge>
                </li>
              ))}
            </ul>
          </Card>

          {/* Maintenance Context */}
          {result.maintenance_history_relevance && (
            <Card title="Historical Asset Context" icon={History}>
              <p className="text-xs text-steel-300 leading-relaxed font-sans">
                {result.maintenance_history_relevance}
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
