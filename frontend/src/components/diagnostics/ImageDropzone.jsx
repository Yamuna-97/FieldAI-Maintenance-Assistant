import React, { useState, useRef } from 'react';
import { Camera, Upload, Eye, CheckCircle2, AlertTriangle, RefreshCw, Layers } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export function ImageDropzone({ selectedImage, onImageChange, visualObservations = [] }) {
  const [showOverlays, setShowOverlays] = useState(true);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onImageChange(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const loadSampleImage = () => {
    // High-resolution industrial motor SVG data URL
    const sampleMotorSvg = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400" fill="%230F1522"><rect width="600" height="400" fill="%230B0F17"/><rect x="40" y="40" width="520" height="320" rx="8" fill="%23141D2E" stroke="%23334155" stroke-width="2"/><rect x="80" y="100" width="260" height="200" rx="6" fill="%231E293B" stroke="%230EA5E9" stroke-width="1.5"/><text x="100" y="140" fill="%2338BDF8" font-family="monospace" font-size="16" font-weight="bold">STATOR HOUSING [SIMOTICS 1LE1]</text><line x1="80" y1="170" x2="340" y2="170" stroke="%23334155" stroke-dasharray="4 4"/><line x1="80" y1="210" x2="340" y2="210" stroke="%23334155" stroke-dasharray="4 4"/><line x1="80" y1="250" x2="340" y2="250" stroke="%23334155" stroke-dasharray="4 4"/><rect x="340" y="150" width="120" height="100" rx="4" fill="%23212E46" stroke="%23F59E0B" stroke-width="2"/><text x="350" y="180" fill="%23F59E0B" font-family="monospace" font-size="12" font-weight="bold">DRIVE FLANGE</text><circle cx="400" cy="200" r="14" fill="%23EF4444" opacity="0.8"/><text x="350" y="235" fill="%23EF4444" font-family="monospace" font-size="11">OIL SEEPAGE</text><rect x="460" y="180" width="80" height="40" fill="%234A5E82"/><text x="470" y="205" fill="%23FFFFFF" font-family="monospace" font-size="12">SHAFT</text><text x="60" y="340" fill="%2394A3B8" font-family="monospace" font-size="12">THERMAL CAM OVERLAY: DEVIATION +18.4°C @ COUPLING</text></svg>`;
    onImageChange(sampleMotorSvg);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-steel-300 uppercase tracking-wider flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-cyan-glow" />
          Equipment Visual Inspection
        </span>
        {selectedImage && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOverlays(!showOverlays)}
              className={`px-2 py-0.5 rounded text-[11px] font-mono border transition-colors flex items-center gap-1 ${
                showOverlays
                  ? 'bg-cyan-dark/20 border-cyan-accent text-cyan-glow'
                  : 'bg-carbon-800 border-steel-700 text-steel-400'
              }`}
            >
              <Layers className="w-3 h-3" />
              Overlays {showOverlays ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={() => onImageChange(null)}
              className="text-xs font-mono text-steel-400 hover:text-critical transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {!selectedImage ? (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-steel-700 hover:border-cyan-accent/80 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-carbon-900/50 hover:bg-carbon-900 transition-all group min-h-[220px]"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
          />
          <div className="w-12 h-12 rounded-full bg-carbon-800 border border-steel-700 group-hover:border-cyan-accent/50 flex items-center justify-center text-steel-400 group-hover:text-cyan-glow transition-all mb-3">
            <Upload className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-steel-200">
            Upload Equipment Photo or Drop File
          </p>
          <p className="text-xs font-mono text-steel-500 mt-1">
            Supports JPG, PNG, WEBP (Thermal / Optical Inspections)
          </p>

          <div className="mt-4 pt-3 border-t border-steel-800 w-full flex items-center justify-center gap-2">
            <span className="text-[11px] font-mono text-steel-500">Quick Test:</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                loadSampleImage();
              }}
              className="text-xs font-mono text-cyan-glow hover:underline bg-cyan-dark/20 px-2 py-0.5 rounded border border-cyan-accent/30"
            >
              Load Sample Drive Flange Photo
            </button>
          </div>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden border border-steel-700 bg-carbon-950">
          <img
            src={selectedImage}
            alt="Equipment Inspection View"
            className="w-full max-h-[300px] object-contain mx-auto"
          />

          {/* Simulated Vision Anomaly Bounding Box Overlays */}
          {showOverlays && (
            <div className="absolute inset-0 pointer-events-none p-4">
              {/* Highlight Zone 1: Coupling */}
              <div className="absolute top-[35%] right-[25%] w-[30%] h-[30%] border-2 border-dashed border-hazard bg-hazard/10 rounded">
                <div className="absolute -top-5 left-0 bg-hazard text-carbon-950 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                  ANOMALY 96% — FLANGE MISALIGNMENT
                </div>
              </div>

              {/* Status Tag */}
              <div className="absolute bottom-2 left-2 bg-carbon-900/90 border border-steel-700 px-2 py-1 rounded text-[10px] font-mono text-steel-300">
                MULTIMODAL VISION: 1 ANOMALY DETECTED
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
