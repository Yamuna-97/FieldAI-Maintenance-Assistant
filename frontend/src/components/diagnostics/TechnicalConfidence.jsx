import React from 'react';
import { BookOpen, FileText, CheckCircle, ExternalLink, ShieldCheck } from 'lucide-react';
import { Badge } from '../ui/Badge';

export function TechnicalConfidence({ confidenceScore = 0.94, citations = [] }) {
  const percentage = Math.round(confidenceScore * 100);

  return (
    <div className="space-y-4">
      {/* Confidence Score Gauge */}
      <div className="p-4 rounded-lg bg-carbon-850 border border-steel-700/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-nominal/50 flex items-center justify-center bg-nominal/10 text-nominal font-mono font-bold text-sm">
            {percentage}%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-steel-100 uppercase">
                Grounded AI Confidence
              </span>
              <Badge variant="nominal" size="sm">HIGH INTEGRITY</Badge>
            </div>
            <p className="text-[11px] font-mono text-steel-400 mt-0.5">
              Correlated against OEM Technical Manuals & Maintenance Logs
            </p>
          </div>
        </div>
        <ShieldCheck className="w-6 h-6 text-nominal opacity-80" />
      </div>

      {/* RAG Knowledge Citations */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-steel-300 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-cyan-glow" />
            Retrieved Manual Citations (NVIDIA RAG)
          </span>
          <span className="text-[10px] font-mono text-steel-500">
            {citations.length} Grounded Sources
          </span>
        </div>

        <div className="space-y-2.5">
          {citations.map((cite, idx) => (
            <div
              key={idx}
              className="p-3 rounded bg-carbon-950 border border-steel-800 hover:border-steel-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-steel-200">
                  <FileText className="w-3.5 h-3.5 text-cyan-glow flex-shrink-0" />
                  <span className="truncate">{cite.document_title}</span>
                </div>
                <Badge variant="cyan" size="sm" className="text-[10px]">
                  Pg. {cite.page_number}
                </Badge>
              </div>

              <div className="mt-1 text-[11px] font-mono text-cyan-glow/80">
                {cite.section}
              </div>

              <p className="mt-1.5 text-xs text-steel-300 italic bg-carbon-900/60 p-2 rounded border border-steel-850">
                "{cite.excerpt}"
              </p>

              <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-steel-500">
                <span>Relevance: {Math.round(cite.relevance_score * 100)}%</span>
                <span className="text-steel-400">Verified OEM Source</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
