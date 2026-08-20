import React from 'react';
import { Activity, Terminal, AlertCircle, Bookmark } from 'lucide-react';
import { Input, Textarea, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { MOCK_EQUIPMENT_LIST, MOCK_DIAGNOSTIC_PRESETS } from '../../data/mockData';

export function QueryConsole({
  equipmentId,
  setEquipmentId,
  errorCode,
  setErrorCode,
  technicianNotes,
  setTechnicianNotes,
  onSubmit,
  loading,
  onApplyPreset
}) {
  const equipmentOptions = MOCK_EQUIPMENT_LIST.map((e) => ({
    value: e.id,
    label: `${e.id} — ${e.name} (${e.model})`
  }));

  return (
    <div className="space-y-4">
      {/* Preset Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-3 border-b border-steel-800">
        <span className="text-xs font-mono text-steel-400 flex items-center gap-1">
          <Bookmark className="w-3 h-3 text-cyan-glow" /> Quick Test Presets:
        </span>
        {MOCK_DIAGNOSTIC_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onApplyPreset(preset)}
            className="text-[11px] font-mono px-2 py-1 rounded bg-carbon-800 hover:bg-carbon-750 border border-steel-700 hover:border-cyan-accent/50 text-steel-300 transition-colors"
          >
            {preset.title.split(' ')[0]} {preset.errorCode || 'Audit'}
          </button>
        ))}
      </div>

      {/* Equipment Selector */}
      <Select
        label="Select Equipment Asset"
        value={equipmentId}
        onChange={(e) => setEquipmentId(e.target.value)}
        options={equipmentOptions}
      />

      {/* Error Code Input */}
      <div>
        <Input
          label="Fault / Alarm Error Code (Optional)"
          placeholder="e.g. ERR-MOTOR-082, ERR-CMP-104"
          value={errorCode}
          onChange={(e) => setErrorCode(e.target.value)}
          icon={AlertCircle}
        />
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] font-mono text-steel-500">Common Codes:</span>
          {['ERR-MOTOR-082', 'ERR-CMP-104', 'WRN-CNV-014'].map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setErrorCode(code)}
              className="text-[10px] font-mono text-cyan-glow hover:underline"
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* Technician Notes */}
      <Textarea
        label="Technician Notes / Observed Symptoms"
        rows={4}
        placeholder="Describe physical vibrations, abnormal acoustics, temperature elevations, or specific questions for the AI assistant..."
        value={technicianNotes}
        onChange={(e) => setTechnicianNotes(e.target.value)}
      />

      {/* Submit Button */}
      <Button
        variant="primary"
        size="lg"
        icon={Activity}
        loading={loading}
        onClick={onSubmit}
        className="w-full"
      >
        Execute Multimodal AI Diagnostic
      </Button>
    </div>
  );
}
