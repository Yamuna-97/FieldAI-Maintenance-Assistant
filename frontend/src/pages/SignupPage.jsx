import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Zap,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Database,
  KeyRound
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { authService } from '../services/authService';

const DEPARTMENTS = [
  'Mechanical & Rotating Equipment',
  'Electrical & Drives Systems',
  'Thermal & HVAC Infrastructure',
  'Plant Reliability & Instrumentation',
  'General Industrial Maintenance'
];

const ROLES = [
  'Field Technician',
  'Lead Reliability Engineer',
  'Condition Monitoring Specialist',
  'Plant Maintenance Supervisor'
];

export function SignupPage({ onSignupSuccess, onNavigateToLogin }) {
  const [name, setName] = useState('');
  const [technicianId, setTechnicianId] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [role, setRole] = useState(ROLES[0]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Please provide a valid work email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await authService.register({
        name: name.trim(),
        email: email.trim(),
        department,
        role,
        technician_id: technicianId.trim(),
        password
      });

      if (res && res.user) {
        onSignupSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 rounded-2xl bg-carbon-900 border border-steel-800 shadow-2xl overflow-hidden">
        
        {/* Left Visual Branding Panel */}
        <div className="md:col-span-5 bg-gradient-to-br from-carbon-950 via-carbon-900 to-carbon-950 p-8 border-b md:border-b-0 md:border-r border-steel-800 flex flex-col justify-between relative overflow-hidden">
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
                TECHNICIAN ONBOARDING
              </Badge>
              <h2 className="text-xl font-bold text-steel-100 font-sans leading-snug">
                Create Your Engineer Access Profile
              </h2>
              <p className="text-xs text-steel-400 font-sans leading-relaxed">
                Register on FieldAI Assistant to save diagnostic records, review historical machine telemetry, and access grounded OEM manuals.
              </p>
            </div>

            {/* Checklist items */}
            <div className="space-y-2.5 text-xs font-mono text-steel-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-glow flex-shrink-0" />
                <span>MongoDB Atlas persistent user registry</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-glow flex-shrink-0" />
                <span>Encrypted bcrypt salted password storage</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-glow flex-shrink-0" />
                <span>Bearer JWT session security token</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-glow flex-shrink-0" />
                <span>Personalized technician dashboard telemetry</span>
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
          <div className="max-w-md w-full mx-auto space-y-5">
            <div>
              <h3 className="text-xl font-bold text-steel-100 font-sans">
                Register New Technician
              </h3>
              <p className="text-xs font-mono text-steel-400 mt-1">
                Fill in your profile details to create your secure account
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

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Row 1: Full Name & Employee Badge ID */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-7 space-y-1.5">
                  <label className="block text-xs font-mono text-steel-300 uppercase tracking-wider">
                    Full Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-steel-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Rivera"
                      className="w-full bg-carbon-950 border border-steel-700 focus:border-cyan-accent rounded-lg pl-9 pr-3 py-2 text-sm text-steel-100 placeholder-steel-600 font-sans focus:outline-none focus:ring-1 focus:ring-cyan-accent/50 transition-colors"
                    />
                  </div>
                </div>

                <div className="sm:col-span-5 space-y-1.5">
                  <label className="block text-xs font-mono text-steel-300 uppercase tracking-wider">
                    Badge ID
                  </label>
                  <input
                    type="text"
                    value={technicianId}
                    onChange={(e) => setTechnicianId(e.target.value)}
                    placeholder="e.g. TECH-4081"
                    className="w-full bg-carbon-950 border border-steel-700 focus:border-cyan-accent rounded-lg px-3 py-2 text-sm text-steel-100 placeholder-steel-600 font-mono focus:outline-none focus:ring-1 focus:ring-cyan-accent/50 transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Department & Role Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-steel-300 uppercase tracking-wider">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-carbon-950 border border-steel-700 focus:border-cyan-accent rounded-lg px-3 py-2 text-xs text-steel-100 font-sans focus:outline-none focus:ring-1 focus:ring-cyan-accent/50 transition-colors cursor-pointer"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept} className="bg-carbon-900 text-steel-100">
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-steel-300 uppercase tracking-wider">
                    Role / Level
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-carbon-950 border border-steel-700 focus:border-cyan-accent rounded-lg px-3 py-2 text-xs text-steel-100 font-sans focus:outline-none focus:ring-1 focus:ring-cyan-accent/50 transition-colors cursor-pointer"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r} className="bg-carbon-900 text-steel-100">
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono text-steel-300 uppercase tracking-wider">
                  Work Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-steel-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.rivera@plant.fieldai.io"
                    className="w-full bg-carbon-950 border border-steel-700 focus:border-cyan-accent rounded-lg pl-9 pr-3 py-2 text-sm text-steel-100 placeholder-steel-600 font-sans focus:outline-none focus:ring-1 focus:ring-cyan-accent/50 transition-colors"
                  />
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-steel-300 uppercase tracking-wider">
                    Password (min 8) *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-carbon-950 border border-steel-700 focus:border-cyan-accent rounded-lg px-3 pr-8 py-2 text-sm text-steel-100 placeholder-steel-600 font-sans focus:outline-none focus:ring-1 focus:ring-cyan-accent/50 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-steel-500 hover:text-steel-300"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-mono text-steel-300 uppercase tracking-wider">
                    Confirm Password *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-carbon-950 border border-steel-700 focus:border-cyan-accent rounded-lg px-3 py-2 text-sm text-steel-100 placeholder-steel-600 font-sans focus:outline-none focus:ring-1 focus:ring-cyan-accent/50 transition-colors"
                  />
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
                  className="w-full justify-center text-sm py-2.5 shadow-cyan-glow"
                >
                  Create Technician Profile & Open Dashboard
                </Button>
              </div>
            </form>

            <div className="pt-3 border-t border-steel-800/80 text-center">
              <p className="text-xs text-steel-400 font-sans">
                Already have credentials?{' '}
                <button
                  type="button"
                  onClick={onNavigateToLogin}
                  className="text-cyan-glow hover:text-cyan-accent font-semibold transition-colors underline-offset-2 hover:underline"
                >
                  Sign In to Terminal
                </button>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
