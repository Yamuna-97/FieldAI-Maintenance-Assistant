import React, { useState, useEffect } from 'react';
import {
  Activity,
  Zap,
  Camera,
  BookOpen,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  Layers,
  Cpu
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ImageDropzone } from '../components/diagnostics/ImageDropzone';
import { QueryConsole } from '../components/diagnostics/QueryConsole';
import { DiagnosticResult } from '../components/diagnostics/DiagnosticResult';
import { submitDiagnosticAnalysis } from '../services/diagnosticService';
import { MOCK_DIAGNOSTIC_PRESETS } from '../data/mockData';

export function DiagnosticsPage({ initialEquipmentId }) {
  const [equipmentId, setEquipmentId] = useState(initialEquipmentId || 'MOT-4081');
  const [errorCode, setErrorCode] = useState('ERR-MOTOR-082');
  const [technicianNotes, setTechnicianNotes] = useState(
    'High radial vibration on DE bearing during ramp up to 1785 RPM. Subtle oil egress observed near drive coupling flange.'
  );
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState(null);

  useEffect(() => {
    if (initialEquipmentId) {
      setEquipmentId(initialEquipmentId);
    }
  }, [initialEquipmentId]);

  const handleApplyPreset = (preset) => {
    setEquipmentId(preset.equipmentId);
    setErrorCode(preset.errorCode || '');
    setTechnicianNotes(preset.notes);
  };

  const handleRunDiagnostic = async () => {
    setLoading(true);
    try {
      const payload = {
        equipment_id: equipmentId,
        error_code: errorCode || null,
        technician_notes: technicianNotes,
        image_data: selectedImage || null
      };

      const result = await submitDiagnosticAnalysis(payload);
      setDiagnosticResult(result);
    } catch (error) {
      console.error('Diagnostic error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setErrorCode('');
    setTechnicianNotes('');
    setSelectedImage(null);
    setDiagnosticResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header Banner */}
      <div className="p-4 rounded-lg bg-carbon-900 border border-steel-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-carbon-800 border border-cyan-accent/50 text-cyan-glow">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-steel-100 font-sans tracking-wide">
              Multimodal Diagnostic Workstation
            </h2>
            <p className="text-xs font-mono text-steel-400">
              Vision Anomaly Detection · NVIDIA Nemotron RAG · Grounded LOTO Synthesis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={handleReset}
          >
            Reset Console
          </Button>
        </div>
      </div>

      {/* Main Engineering Workstation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left / Input Control Center (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Visual Dropzone */}
          <Card
            title="Visual Evidence & Camera Inspection"
            subtitle="Optical / Thermal sensor input for Gemini Vision"
            icon={Camera}
          >
            <ImageDropzone
              selectedImage={selectedImage}
              onImageChange={setSelectedImage}
              visualObservations={diagnosticResult?.visual_observations || []}
            />
          </Card>

          {/* Query & Parameter Console */}
          <Card
            title="Diagnostic Query & Parameters"
            subtitle="Equipment telemetry and technician observations"
            icon={Cpu}
          >
            <QueryConsole
              equipmentId={equipmentId}
              setEquipmentId={setEquipmentId}
              errorCode={errorCode}
              setErrorCode={setErrorCode}
              technicianNotes={technicianNotes}
              setTechnicianNotes={setTechnicianNotes}
              onSubmit={handleRunDiagnostic}
              loading={loading}
              onApplyPreset={handleApplyPreset}
            />
          </Card>
        </div>

        {/* Right / AI Diagnostic Output Engine (7 cols) */}
        <div className="lg:col-span-7">
          {diagnosticResult ? (
            <DiagnosticResult result={diagnosticResult} />
          ) : (
            <div className="h-full min-h-[480px] rounded-lg bg-carbon-900/60 border border-steel-800 border-dashed p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-carbon-850 border border-steel-700 flex items-center justify-center text-steel-500">
                <Activity className="w-8 h-8 text-steel-600" />
              </div>
              <div className="max-w-md space-y-1">
                <h3 className="text-sm font-bold text-steel-200 uppercase tracking-wide font-mono">
                  Diagnostic Console Ready
                </h3>
                <p className="text-xs text-steel-400 font-sans leading-relaxed">
                  Select an industrial asset, enter observed symptoms or error code, optionally attach a photo, and click <strong>Execute Multimodal AI Diagnostic</strong>.
                </p>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="primary"
                  size="md"
                  icon={Zap}
                  loading={loading}
                  onClick={handleRunDiagnostic}
                >
                  Run Sample Diagnostic (Motor Vibration)
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
