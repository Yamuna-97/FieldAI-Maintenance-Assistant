import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Cpu,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Database
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { authService } from '../services/authService';

export function LoginPage({ onLoginSuccess, onNavigateToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await authService.login(email, password);
      if (res && res.user) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 rounded-2xl bg-carbon-900 border border-steel-800 shadow-2xl overflow-hidden">
        
        {/* Left Visual Branding Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-carbon-950 via-carbon-900 to-carbon-950 p-8 border-b md:border-b-0 md:border-r border-steel-800 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle glow circle */}
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-cyan-glow/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-cyan-dark/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-carbon-800 border border-cyan-accent/60 flex items-center justify-center text-cyan-glow shadow-cyan-glow">
                <Zap className="w-5 h-5 text-cyan-glow fill-cyan-glow/20" />
              </div>
              <div>
                <span className="font-bold text-base text-steel-100 tracking-wider font-mono">
                  FIELD<span className="text-cyan-glow">AI</span>
                </span>
                <span className="block text-[11px] text-steel-400 font-mono">ENGINEERING SUITE</span>
              </div>
            </div>

            <div className="space-y-2">
              <Badge variant="cyan" size="sm" dot>
                SECURE AUTHENTICATION
              </Badge>
              <h2 className="text-xl font-bold text-steel-100 font-sans leading-snug">
                Intelligent Field Diagnostic Terminal
              </h2>
              <p className="text-xs text-steel-400 font-sans leading-relaxed">
                Log in to access multimodal vision telemetry, grounded OEM manual retrieval, and AI-driven maintenance protocols.
              </p>
            </div>

            {/* Architecture telemetry pill */}
            <div className="p-3 rounded-lg bg-carbon-950/80 border border-steel-800/80 space-y-2 text-[11px] font-mono">
              <div className="flex items-center justify-between text-steel-400">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-cyan-glow" />
                  AUTH STORE
                </span>
                <span className="text-emerald-400 font-semibold">MongoDB Atlas</span>
              </div>
              <div className="flex items-center justify-between text-steel-400">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-cyan-glow" />
                  TOKEN TYPE
                </span>
                <span className="text-steel-300">JWT / HS256</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-6 border-t border-steel-800/80 text-[11px] font-mono text-steel-500 flex items-center justify-between">
            <span>PROJECT 15 — FIELD AI</span>
            <span>v0.1.0</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-carbon-900/60 backdrop-blur-sm">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h3 className="text-xl font-bold text-steel-100 font-sans">
                Sign In to Terminal
              </h3>
              <p className="text-xs font-mono text-steel-400 mt-1">
                Enter your technician credentials to authenticate
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-lg bg-critical/10 border border-critical/40 text-critical text-xs flex items-start gap-2.5 font-sans"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="flex-1 leading-relaxed">{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-steel-300 uppercase tracking-wider">
                  Technician Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-steel-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="technician@fieldai.io"
                    className="w-full bg-carbon-950 border border-steel-700 focus:border-cyan-accent rounded-lg pl-10 pr-3.5 py-2.5 text-sm text-steel-100 placeholder-steel-600 font-sans focus:outline-none focus:ring-1 focus:ring-cyan-accent/50 transition-colors"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono text-steel-300 uppercase tracking-wider">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-steel-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-carbon-950 border border-steel-700 focus:border-cyan-accent rounded-lg pl-10 pr-10 py-2.5 text-sm text-steel-100 placeholder-steel-600 font-sans focus:outline-none focus:ring-1 focus:ring-cyan-accent/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-steel-500 hover:text-steel-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={loading}
                  icon={ArrowRight}
                  iconPosition="right"
                  className="w-full justify-center text-sm py-3"
                >
                  Authenticate & Enter Terminal
                </Button>
              </div>
            </form>

            <div className="pt-4 border-t border-steel-800/80 text-center">
              <p className="text-xs text-steel-400 font-sans">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={onNavigateToSignup}
                  className="text-cyan-glow hover:text-cyan-accent font-semibold transition-colors underline-offset-2 hover:underline"
                >
                  Register New Technician
                </button>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
