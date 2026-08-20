import React from 'react';

export function MetricPill({
  label,
  value,
  unit = '',
  status = 'nominal',
  trend,
  className = ''
}) {
  const statusColors = {
    nominal: 'text-nominal border-nominal/30 bg-nominal-dark/10',
    warning: 'text-hazard border-hazard/30 bg-hazard-dark/10',
    critical: 'text-critical border-critical/30 bg-critical-dark/10',
    cyan: 'text-cyan-glow border-cyan-accent/30 bg-cyan-dark/10',
    steel: 'text-steel-300 border-steel-700 bg-carbon-800/40'
  };

  return (
    <div className={`flex flex-col p-2.5 rounded border bg-carbon-900/60 ${statusColors[status] || statusColors.steel} ${className}`}>
      <span className="text-[11px] font-mono text-steel-400 uppercase tracking-wider">{label}</span>
      <div className="flex items-baseline gap-1 mt-0.5">
        <span className="text-lg font-mono font-bold text-steel-100">{value}</span>
        {unit && <span className="text-xs font-mono text-steel-400">{unit}</span>}
      </div>
      {trend && <span className="text-[10px] font-mono text-steel-400 mt-1">{trend}</span>}
    </div>
  );
}
