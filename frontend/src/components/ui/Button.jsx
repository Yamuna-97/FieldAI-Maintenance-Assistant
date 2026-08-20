import React from 'react';
import { motion } from 'framer-motion';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs font-medium gap-1.5',
    md: 'px-4 py-2 text-sm font-medium gap-2',
    lg: 'px-5 py-2.5 text-base font-medium gap-2.5'
  };

  const variantClasses = {
    primary: 'bg-cyan-accent hover:bg-cyan-glow text-carbon-950 font-semibold shadow-cyan-glow hover:shadow-lg transition-all border border-cyan-glow/50',
    secondary: 'bg-carbon-800 hover:bg-carbon-750 text-steel-200 border border-steel-700 hover:border-steel-500 shadow-sm',
    hazard: 'bg-hazard hover:bg-hazard-light text-carbon-950 font-semibold shadow-hazard-glow border border-hazard-light/50',
    critical: 'bg-critical hover:bg-critical-light text-white font-semibold border border-critical/50 shadow-sm',
    outline: 'bg-transparent hover:bg-carbon-850 text-steel-300 hover:text-white border border-steel-700 hover:border-cyan-accent',
    ghost: 'bg-transparent hover:bg-carbon-850 text-steel-400 hover:text-steel-200 border-none'
  };

  return (
    <motion.button
      type={type}
      whileHover={disabled || loading ? {} : { scale: 1.015 }}
      whileTap={disabled || loading ? {} : { scale: 0.985 }}
      transition={{ duration: 0.15 }}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </>
      )}
    </motion.button>
  );
}
