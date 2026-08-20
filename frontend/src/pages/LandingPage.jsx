import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Cpu,
  BookOpen,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle,
  FileSearch,
  Wrench,
  Layers
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { TechnicalVisualization } from '../components/common/TechnicalVisualization';

export function LandingPage({ onNavigate }) {
  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <div className="relative rounded-xl bg-carbon-900 border border-steel-800 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-dark/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="flex items-center gap-2">
            <Badge variant="cyan" size="md" dot>
              PROJECT 15 — MULTIMODAL FIELD AI
            </Badge>
            <Badge variant="steel" size="md">
              KEC GENAI INDUSTRY STANDARD
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-steel-100 font-sans leading-tight">
            Intelligent Maintenance Assistance for the <span className="text-cyan-glow">Field</span>.
          </h1>

          <p className="text-base sm:text-lg text-steel-300 leading-relaxed font-sans">
            A high-precision engineering platform combining <strong>Multimodal Gemini Vision</strong>, <strong>NVIDIA Nemotron RAG Embeddings</strong>, and grounded OEM manual retrieval to diagnose industrial equipment failures and generate actionable inspection sequences.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              icon={Activity}
              onClick={() => onNavigate('diagnostics')}
            >
              Open Diagnostic Assistant
            </Button>
            <Button
              variant="secondary"
              size="lg"
              icon={Cpu}
              onClick={() => onNavigate('equipment')}
            >
              Explore Equipment Catalog
            </Button>
          </div>

          {/* Quick Technical Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-steel-800/80 text-xs font-mono text-steel-400">
            <div>
              <span className="text-steel-100 font-bold block text-sm">Multimodal AI</span>
              Visual Fault & Anomaly Detection
            </div>
            <div>
              <span className="text-steel-100 font-bold block text-sm">1024D RAG</span>
              NVIDIA Nemotron-3 Embeddings
            </div>
            <div>
              <span className="text-steel-100 font-bold block text-sm">Grounded</span>
              Zero-Hallucination Manual Citations
            </div>
            <div>
              <span className="text-steel-100 font-bold block text-sm">LOTO Safety</span>
              Mandatory Hazard Checklists
            </div>
          </div>
        </div>
      </div>

      {/* Abstract Technical Architecture Visualization */}
      <TechnicalVisualization />

      {/* Feature Capabilities Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-steel-100 font-sans tracking-wide">
              Engineering-Grade Capabilities
            </h3>
            <p className="text-xs font-mono text-steel-400 mt-0.5">
              Built specifically for industrial field technicians and reliability engineers
            </p>
          </div>
          <Badge variant="steel" size="sm">CORE WORKFLOWS</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg bg-carbon-900 border border-steel-800 hover:border-cyan-accent/50 transition-all group">
            <div className="w-10 h-10 rounded bg-carbon-800 border border-steel-700 text-cyan-glow flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-steel-100 uppercase tracking-wide font-mono">
              Multimodal Visual Inspection
            </h4>
            <p className="text-xs text-steel-300 mt-2 leading-relaxed">
              Upload equipment photographs or thermal camera captures. The vision system localizes anomalies, flange misalignments, seal leaks, and wear patterns.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-carbon-900 border border-steel-800 hover:border-hazard/50 transition-all group">
            <div className="w-10 h-10 rounded bg-carbon-800 border border-steel-700 text-hazard flex items-center justify-center mb-4">
              <FileSearch className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-steel-100 uppercase tracking-wide font-mono">
              OEM Manual Retrieval (RAG)
            </h4>
            <p className="text-xs text-steel-300 mt-2 leading-relaxed">
              Uses NVIDIA Nemotron-3-Embed-1B vectors to perform semantic search across thousands of pages of equipment manuals, retrieving exact torque specs and tolerances.
            </p>
          </div>

          <div className="p-6 rounded-lg bg-carbon-900 border border-steel-800 hover:border-nominal/50 transition-all group">
            <div className="w-10 h-10 rounded bg-carbon-800 border border-steel-700 text-nominal flex items-center justify-center mb-4">
              <Wrench className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-steel-100 uppercase tracking-wide font-mono">
              Guided Step-by-Step Actions
            </h4>
            <p className="text-xs text-steel-300 mt-2 leading-relaxed">
              Synthesizes actionable inspection protocols with estimated completion times, nominal readings, required replacement part numbers, and mandatory LOTO precautions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
