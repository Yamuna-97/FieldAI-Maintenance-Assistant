import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Cpu,
  BookOpen,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  FileSearch,
  Wrench,
  Layers,
  Camera,
  Database,
  Lock,
  Flame,
  Radio,
  Clock,
  Sparkles,
  Search,
  History,
  MessageSquare
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Interactive3DEquipment } from '../components/home/Interactive3DEquipment';
import { TechnicalVisualization } from '../components/common/TechnicalVisualization';

// 7 Core Engineering Feature Pillars
const SYSTEM_FEATURES = [
  {
    id: 'vision',
    icon: Camera,
    badge: 'MULTIMODAL CORE',
    badgeVariant: 'cyan',
    title: 'Optical & Thermal Anomaly Detection',
    description:
      'Upload high-resolution equipment photographs or FLIR thermal imaging captures. The neural vision engine localizes flange misalignments, bearing discoloration, seal seepage, and overheating hot-spots.',
    highlights: ['FLIR & optical image parsing', 'Bounding-box defect localization', 'Thermal gradient deviation (ΔT)']
  },
  {
    id: 'rag',
    icon: BookOpen,
    badge: '1024D DENSE VECTOR',
    badgeVariant: 'hazard',
    title: 'Grounded OEM Manual & Schematic Retrieval',
    description:
      'Zero-hallucination semantic search across thousands of pages of OEM maintenance handbooks and technical blueprints. Retrieves exact torque Nm, bolt tolerances, and calibration limits directly from verified documents.',
    highlights: ['Page-exact manual citations', 'ChromaDB persistent vector index', 'Zero synthetic hallucination']
  },
  {
    id: 'troubleshoot',
    icon: Wrench,
    badge: 'ACTION SYNTHESIS',
    badgeVariant: 'nominal',
    title: 'Step-by-Step Guided Action Protocols',
    description:
      'Synthesizes prioritized inspection sequences with estimated technician downtime hours, nominal baseline readings, required replacement part numbers, and specialized tool requirements.',
    highlights: ['Estimated completion timelines', 'Nominal test threshold benchmarks', 'Required tooling & parts list']
  },
  {
    id: 'loto',
    icon: ShieldCheck,
    badge: 'ISO / OSHA SAFETY',
    badgeVariant: 'critical',
    title: 'Automated LOTO Safety & Isolation Standards',
    description:
      'Generates mandatory Lockout/Tagout (LOTO) protocols, electrical isolation verifications, zero-energy state checks, and required PPE ratings before casing teardown is permitted.',
    highlights: ['Mandatory hazard lockout sequences', 'Zero-energy electrical verifications', 'Personal Protective Equipment (PPE) specs']
  },
  {
    id: 'telemetry',
    icon: Radio,
    badge: 'REAL-TIME IOT',
    badgeVariant: 'cyan',
    title: 'Predictive Equipment Health Telemetry',
    description:
      'Monitors real-time vibration RMS, casing temperatures, running hours, and current draw. Calculates ISO 10816 vibration severity and triggers preventive alerts before catastrophic failure.',
    highlights: ['ISO 10816 vibration severity curves', 'Dynamic health score calculation', 'Historical sensor trending']
  },
  {
    id: 'database',
    icon: Database,
    badge: 'MONGODB ATLAS',
    badgeVariant: 'steel',
    title: 'Cloud Maintenance Registry & Audit Logs',
    description:
      'Secure MongoDB Atlas cloud repository that permanently records technician interventions, resolved error codes, replaced component SKUs, and downtime metrics for enterprise compliance.',
    highlights: ['JWT-secured technician authentication', 'Full maintenance intervention history', 'Equipment asset lifecycle tracking']
  },
  {
    id: 'feedback',
    icon: MessageSquare,
    badge: 'CLOSED-LOOP ACCURACY',
    badgeVariant: 'nominal',
    title: 'Field Validation & Continuous Accuracy Loop',
    description:
      'Enables field engineers to validate or refine AI diagnostic findings on the plant floor. Verified physical outcomes are recorded to continuously improve troubleshooting precision.',
    highlights: ['Physical verification logging', 'Diagnostic accuracy tracking', 'Technician knowledge capture']
  }
];

// Supported Machinery Fleet Categories
const SUPPORTED_MACHINERY = [
  { name: 'Industrial Induction Motors', code: 'MOT', spec: 'Siemens, ABB, WEG AC Drives' },
  { name: 'Centrifugal Slurry & ANSI Pumps', code: 'PMP', spec: 'Flowserve, Goulds, Sulzer' },
  { name: 'Rotary Screw Air Compressors', code: 'CMP', spec: 'Atlas Copco, Ingersoll Rand' },
  { name: 'Bulk Material Conveyor Systems', code: 'CNV', spec: 'Flexco HeavyDuty Belting' },
  { name: 'Packaged Industrial HVAC Units', code: 'HVC', spec: 'Trane IntelliPak, Carrier' },
  { name: 'Industrial Gas Turbine Systems', code: 'GAS', spec: 'Turbomachinery & Generators' }
];

export function LandingPage({ onNavigate }) {
  return (
    <div className="space-y-16 py-4">
      {/* ── 1. Hero Section ────────────────────────────────────────── */}
      <div className="relative rounded-2xl bg-carbon-900 border border-steel-800 p-8 sm:p-12 overflow-hidden shadow-2xl">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-dark/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-glow/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="cyan" size="md" dot>
              PROJECT 15 — FIELD AI PLATFORM
            </Badge>
            <Badge variant="steel" size="md">
              INDUSTRIAL MAINTENANCE SUITE
            </Badge>
            <Badge variant="nominal" size="md" dot>
              MONGODB ATLAS CONNECTED
            </Badge>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-steel-100 font-sans leading-tight">
            Intelligent Maintenance & Diagnostics for the{' '}
            <span className="text-cyan-glow">Field</span>.
          </h1>

          <p className="text-base sm:text-lg text-steel-300 leading-relaxed font-sans max-w-3xl">
            A high-precision engineering platform combining <strong>Multimodal Optical & Thermal Defect Analysis</strong>, <strong>1024D Semantic Vector Retrieval</strong> of OEM manuals, and <strong>Automated LOTO Safety Protocols</strong> to resolve complex industrial equipment failures in record time.
          </p>

          {/* Call-to-action Action Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Button
              variant="primary"
              size="lg"
              icon={Activity}
              onClick={() => onNavigate('diagnostics')}
              className="shadow-cyan-glow"
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
            <Button
              variant="outline"
              size="lg"
              icon={BookOpen}
              onClick={() => onNavigate('manuals')}
            >
              OEM Manuals (RAG)
            </Button>
            <Button
              variant="ghost"
              size="lg"
              icon={Lock}
              onClick={() => onNavigate('login')}
            >
              Technician Sign In
            </Button>
          </div>

          {/* Quick Engineering Trust Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-steel-800/80 text-xs font-mono text-steel-400">
            <div>
              <span className="text-steel-100 font-bold block text-sm">Multimodal Vision</span>
              Optical & Thermal Faults
            </div>
            <div>
              <span className="text-steel-100 font-bold block text-sm">1024D Vector RAG</span>
              Dense Semantic Retrieval
            </div>
            <div>
              <span className="text-steel-100 font-bold block text-sm">Zero Hallucination</span>
              Exact OEM Page Citations
            </div>
            <div>
              <span className="text-steel-100 font-bold block text-sm">LOTO Safety</span>
              Mandatory Hazard Protocols
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. Interactive 3D Equipment Digital Twin Simulation ─── */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="cyan" size="sm" dot>LIVE 3D DIGITAL TWIN</Badge>
              <h2 className="text-xl font-bold text-steel-100 font-sans tracking-wide">
                Interactive Machinery Telemetry & Inspection
              </h2>
            </div>
            <p className="text-xs font-mono text-steel-400 mt-1">
              Rotate in full 3D space · Switch between Holographic, Thermal, Vibration, and Laser scan modes
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() => onNavigate('diagnostics')}
          >
            Diagnose Physical Machine
          </Button>
        </div>

        <Interactive3DEquipment />
      </section>

      {/* ── 3. Comprehensive 7-Pillar Engineering Feature Showcase ─── */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-steel-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-steel-100 font-sans tracking-wide">
              Engineering-Grade Feature Matrix
            </h2>
            <p className="text-xs font-mono text-steel-400 mt-1">
              Everything required for high-reliability plant maintenance and zero-downtime operations
            </p>
          </div>
          <Badge variant="steel" size="sm">7 CORE CAPABILITIES</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SYSTEM_FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="p-6 rounded-xl bg-carbon-900 border border-steel-800 hover:border-cyan-accent/50 transition-all group flex flex-col justify-between space-y-4 shadow-lg hover:shadow-cyan-glow/5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-carbon-800 border border-steel-700 text-cyan-glow flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-cyan-glow" />
                    </div>
                    <Badge variant={feat.badgeVariant} size="sm">
                      {feat.badge}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-steel-100 font-sans group-hover:text-cyan-glow transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-steel-300 font-sans leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                {/* Sub-feature checklist */}
                <div className="pt-3 border-t border-steel-800/80 space-y-1.5 text-[11px] font-mono text-steel-400">
                  {feat.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-glow flex-shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 4. End-to-End Diagnostic Pipeline Architecture ──────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-steel-800 pb-3">
          <div>
            <h3 className="text-lg font-bold text-steel-100 font-sans">
              Diagnostic Pipeline Architecture
            </h3>
            <p className="text-xs font-mono text-steel-400 mt-0.5">
              How field sensory inputs are transformed into grounded, actionable maintenance steps
            </p>
          </div>
          <Badge variant="cyan" size="sm">ZERO HALLUCINATION</Badge>
        </div>

        <TechnicalVisualization />
      </section>

      {/* ── 5. Supported Industrial Machinery Fleet ───────────────── */}
      <section className="p-8 rounded-2xl bg-carbon-900 border border-steel-800 space-y-6">
        <div className="flex items-center justify-between border-b border-steel-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-steel-100 font-sans">
              Supported Industrial Equipment Catalog
            </h3>
            <p className="text-xs font-mono text-steel-400 mt-0.5">
              Vectorized OEM manuals, baseline sensor telemetry, and fault signatures included
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={Cpu}
            onClick={() => onNavigate('equipment')}
          >
            View Fleet (5 Assets)
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUPPORTED_MACHINERY.map((mach) => (
            <div
              key={mach.code}
              className="p-4 rounded-lg bg-carbon-950 border border-steel-800 flex items-center justify-between"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 rounded bg-carbon-800 border border-cyan-accent/40 text-[10px] font-mono text-cyan-glow font-bold">
                    {mach.code}
                  </span>
                  <h4 className="text-xs font-bold text-steel-100 font-sans">{mach.name}</h4>
                </div>
                <p className="text-[11px] font-mono text-steel-400">{mach.spec}</p>
              </div>
              <Badge variant="nominal" size="sm">INDEXED</Badge>
            </div>
          ))}
        </div>
      </section>

      {/* ── 6. Bottom Call to Action Banner ───────────────────────── */}
      <div className="p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-carbon-900 via-carbon-950 to-carbon-900 border border-cyan-accent/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-2xl relative z-10">
          <Badge variant="cyan" size="sm" dot>READY FOR PRODUCTION OPERATIONS</Badge>
          <h3 className="text-2xl font-bold text-steel-100 font-sans">
            Ready to perform multimodal field diagnostics?
          </h3>
          <p className="text-xs sm:text-sm text-steel-300 font-sans leading-relaxed">
            Upload machine optical or thermal evidence, query OEM schematics with dense 1024D vectors, and generate verified step-by-step LOTO protocols.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <Button
            variant="primary"
            size="lg"
            icon={Activity}
            onClick={() => onNavigate('diagnostics')}
            className="shadow-cyan-glow"
          >
            Launch Diagnostics
          </Button>
          <Button
            variant="secondary"
            size="lg"
            icon={Lock}
            onClick={() => onNavigate('login')}
          >
            Sign In / Register
          </Button>
        </div>
      </div>
    </div>
  );
}
