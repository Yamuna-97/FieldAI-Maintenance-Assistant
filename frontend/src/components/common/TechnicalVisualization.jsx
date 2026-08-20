import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Cpu, BookOpen, CheckCircle, ShieldAlert, Zap, ArrowRight } from 'lucide-react';

export function TechnicalVisualization({ className = '' }) {
  const nodes = [
    { id: 'tech', label: 'Field Technician', sub: 'Image + Error Code', icon: Camera, color: 'text-steel-300', border: 'border-steel-600' },
    { id: 'vision', label: 'Multimodal Vision', sub: 'Gemini Vision AI', icon: Zap, color: 'text-cyan-glow', border: 'border-cyan-accent' },
    { id: 'rag', label: 'Manuals RAG', sub: 'NVIDIA nemotron 1024D', icon: BookOpen, color: 'text-hazard', border: 'border-hazard' },
    { id: 'agent', label: 'Action Synthesis', sub: 'Grounded Steps & LOTO', icon: ShieldAlert, color: 'text-nominal', border: 'border-nominal' },
  ];

  return (
    <div className={`p-6 rounded-lg bg-carbon-900/80 border border-steel-800 relative overflow-hidden ${className}`}>
      {/* Background Subtle Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4 border-b border-steel-800 pb-2">
          <span className="text-xs font-mono text-steel-400 tracking-wider uppercase">
            AI Diagnostic Pipeline Architecture
          </span>
          <span className="text-[10px] font-mono text-cyan-glow px-2 py-0.5 rounded bg-cyan-dark/20 border border-cyan-accent/30">
            MULTIMODAL FLOW
          </span>
        </div>

        {/* Nodes Flow */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {nodes.map((node, index) => {
            const Icon = node.icon;
            return (
              <React.Fragment key={node.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15, duration: 0.3 }}
                  className={`p-4 rounded bg-carbon-850 border ${node.border} relative group shadow-sm hover:shadow-md transition-all`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded bg-carbon-950 border border-steel-700 ${node.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-steel-100 uppercase tracking-wide">{node.label}</h4>
                      <p className="text-[11px] font-mono text-steel-400 mt-0.5">{node.sub}</p>
                    </div>
                  </div>

                  {/* Corner Accent */}
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-steel-700 group-hover:bg-cyan-accent transition-colors" />
                </motion.div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Status Line */}
        <div className="mt-4 pt-3 border-t border-steel-800/80 flex flex-wrap items-center justify-between text-[11px] font-mono text-steel-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-accent" />
              NVIDIA Text Embeddings (RAG)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-nominal" />
              Gemini Vision & Reasoning
            </span>
          </div>
          <span className="text-steel-500">Zero Hallucination Grounded Protocols</span>
        </div>
      </div>
    </div>
  );
}
