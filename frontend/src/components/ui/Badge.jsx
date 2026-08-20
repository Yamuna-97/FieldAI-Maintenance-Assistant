import React from 'react';

export function Badge({ children, variant = 'steel', size = 'md', className = '', dot = false }) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-mono',
    md: 'px-2.5 py-1 text-xs font-mono',
    lg: 'px-3 py-1.5 text-sm font-mono'
  };

  const variantClasses = {
    nominal: 'bg-nominal-dark/20 text-nominal border border-nominal/40 shadow-sm',
    warning: 'bg-hazard-dark/20 text-hazard border border-hazard/40 shadow-sm',
    critical: 'bg-critical-dark/20 text-critical border border-critical/40 shadow-sm',
    cyan: 'bg-cyan-dark/20 text-cyan-glow border border-cyan-accent/40 shadow-sm',
    steel: 'bg-steel-800/60 text-steel-300 border border-steel-700 shadow-sm',
    online: 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
  };

  const dotClasses = {
    nominal: 'bg-nominal',
    warning: 'bg-hazard',
    critical: 'bg-critical animate-pulse',
    cyan: 'bg-cyan-accent',
    steel: 'bg-steel-400',
    online: 'bg-emerald-400 animate-pulse-subtle'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded uppercase tracking-wider font-semibold ${sizeClasses[size]} ${variantClasses[variant] || variantClasses.steel} ${className}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotClasses[variant] || 'bg-current'}`} />}
      {children}
    </span>
  );
}
