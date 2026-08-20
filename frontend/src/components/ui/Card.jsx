import React from 'react';

export function Card({
  children,
  title,
  subtitle,
  icon: Icon,
  action,
  className = '',
  headerClassName = '',
  cornerBrackets = false,
  highlight = false,
  ...props
}) {
  return (
    <div
      className={`relative bg-carbon-900/90 border ${
        highlight ? 'border-cyan-accent/50 shadow-cyan-glow' : 'border-steel-700/70'
      } rounded-lg p-5 backdrop-blur-sm ${cornerBrackets ? 'corner-bracket' : ''} ${className}`}
      {...props}
    >
      {(title || Icon || action) && (
        <div className={`flex items-center justify-between pb-3.5 mb-4 border-b border-steel-800 ${headerClassName}`}>
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="p-1.5 rounded bg-carbon-800 border border-steel-700 text-cyan-glow">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              {title && <h3 className="font-medium text-steel-100 text-sm tracking-wide">{title}</h3>}
              {subtitle && <p className="text-xs text-steel-400 font-mono mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
