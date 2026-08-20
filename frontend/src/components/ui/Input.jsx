import React from 'react';

export function Input({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-mono text-steel-300 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-steel-500">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-carbon-950 border ${
            error ? 'border-critical focus:border-critical' : 'border-steel-700 focus:border-cyan-accent'
          } rounded px-3.5 py-2 text-sm text-steel-100 placeholder-steel-500 font-sans focus:outline-none focus:ring-1 focus:ring-cyan-accent/50 transition-colors ${
            Icon ? 'pl-9' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-critical font-mono">{error}</p>}
      {helperText && !error && <p className="text-xs text-steel-500 font-mono">{helperText}</p>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  helperText,
  className = '',
  rows = 3,
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-mono text-steel-300 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        className={`w-full bg-carbon-950 border ${
          error ? 'border-critical focus:border-critical' : 'border-steel-700 focus:border-cyan-accent'
        } rounded px-3.5 py-2 text-sm text-steel-100 placeholder-steel-500 font-sans focus:outline-none focus:ring-1 focus:ring-cyan-accent/50 transition-colors ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-critical font-mono">{error}</p>}
      {helperText && !error && <p className="text-xs text-steel-500 font-mono">{helperText}</p>}
    </div>
  );
}

export function Select({
  label,
  options = [],
  error,
  helperText,
  className = '',
  id,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-mono text-steel-300 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`w-full bg-carbon-950 border ${
          error ? 'border-critical focus:border-critical' : 'border-steel-700 focus:border-cyan-accent'
        } rounded px-3.5 py-2 text-sm text-steel-100 font-sans focus:outline-none focus:ring-1 focus:ring-cyan-accent/50 transition-colors cursor-pointer ${className}`}
        {...props}
      >
        {options.map((opt) => {
          const val = typeof opt === 'string' ? opt : opt.value;
          const lbl = typeof opt === 'string' ? opt : opt.label;
          return (
            <option key={val} value={val} className="bg-carbon-900 text-steel-100">
              {lbl}
            </option>
          );
        })}
      </select>
      {error && <p className="text-xs text-critical font-mono">{error}</p>}
      {helperText && !error && <p className="text-xs text-steel-500 font-mono">{helperText}</p>}
    </div>
  );
}
