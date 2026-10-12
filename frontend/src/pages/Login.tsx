import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Sun,
  Moon,
  ArrowLeft,
  Building,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  const from = location.state?.from?.pathname || '/app';

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Lead Architect');
  const [organization, setOrganization] = useState('Consensus Labs');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signin') {
        await login(email, password);
        navigate(from, { replace: true });
      } else {
        if (!name.trim()) {
          setError('Display name is required.');
          setLoading(false);
          return;
        }
        await register({ name, email, password, role, organization });
        setSuccessMsg('Account registered successfully! Redirecting...');
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 600);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Demo one-click login helper
  const handleDemoLogin = async (demoEmail: string, demoPass: string) => {
    setError(null);
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    try {
      await login(demoEmail, demoPass);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col justify-between selection:bg-primary-interaction selection:text-white transition-colors duration-200">
      {/* Top Navbar */}
      <header className="h-16 px-6 sm:px-10 border-b border-border flex items-center justify-between backdrop-blur-md bg-background/80 sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors px-2 py-1 rounded-md hover:bg-surface-secondary"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary-interaction/10 border border-primary-interaction/20 flex items-center justify-center text-primary-interaction">
              <Activity className="w-4 h-4" />
            </div>
            <span className="font-semibold text-sm tracking-tight">DLT TESTBED</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleDarkMode}
            className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-secondary transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          {/* Card Wrapper */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="bg-surface-warm/80 dark:bg-surface-secondary/70 border border-border rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20 backdrop-blur-xl p-6 sm:p-8"
          >
            {/* Header Title */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-interaction/10 border border-primary-interaction/20 text-primary-interaction mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">
                {mode === 'signin' ? 'Sign in to DLT Testbed' : 'Create an Account'}
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1">
                {mode === 'signin'
                  ? 'Access high-throughput consensus benchmarks and analytics'
                  : 'Get started configuring distributed ledger topologies'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex p-1 bg-surface-secondary/80 dark:bg-background/80 rounded-xl border border-border mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  mode === 'signin'
                    ? 'bg-background text-text-primary shadow-sm font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                  mode === 'register'
                    ? 'bg-background text-text-primary shadow-sm font-semibold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error & Success Feedback */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 rounded-xl bg-status-error/10 border border-status-error/20 text-status-error text-xs flex items-center gap-2.5 overflow-hidden"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-3 rounded-xl bg-status-success/10 border border-status-success/20 text-status-success text-xs flex items-center gap-2.5 overflow-hidden"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Satoshi Nakamoto"
                        className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:border-primary-interaction transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">
                        Role
                      </label>
                      <div className="relative">
                        <Cpu className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="w-full pl-8 pr-2 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:border-primary-interaction transition-colors"
                        >
                          <option value="Lead Architect">Lead Architect</option>
                          <option value="Systems Engineer">Systems Engineer</option>
                          <option value="Consensus Researcher">Researcher</option>
                          <option value="Security Auditor">Auditor</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-secondary mb-1.5">
                        Organization
                      </label>
                      <div className="relative">
                        <Building className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={organization}
                          onChange={(e) => setOrganization(e.target.value)}
                          placeholder="DLT Labs"
                          className="w-full pl-8 pr-2.5 py-2 text-xs rounded-xl border border-border bg-background focus:outline-none focus:border-primary-interaction transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.com"
                    autoComplete="email"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:border-primary-interaction transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-text-secondary">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() =>
                        setError(
                          'Password reset: Demo passwords are "password123", "admin123", or "research123".'
                        )
                      }
                      className="text-[11px] text-primary-interaction hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-border bg-background focus:outline-none focus:border-primary-interaction transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-text-secondary select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-border text-primary-interaction focus:ring-0"
                  />
                  <span>Remember session</span>
                </label>
                <span className="text-[11px] text-text-muted">TLS 1.3 / AES-256</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-primary-interaction text-white font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'signin' ? 'Sign In to Testbed' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Credentials Access */}
            <div className="mt-6 pt-5 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> 1-Click Demo Profiles:
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider text-text-muted">
                  Pre-configured
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('demo@dlttestbed.com', 'password123')}
                  className="px-2.5 py-2 text-left rounded-lg border border-border bg-background hover:border-primary-interaction hover:bg-surface-secondary transition-all text-xs group"
                >
                  <div className="font-semibold text-text-primary group-hover:text-primary-interaction truncate">
                    Architect
                  </div>
                  <div className="text-[10px] text-text-muted truncate">demo@dlttestbed</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin@dlttestbed.com', 'admin123')}
                  className="px-2.5 py-2 text-left rounded-lg border border-border bg-background hover:border-primary-interaction hover:bg-surface-secondary transition-all text-xs group"
                >
                  <div className="font-semibold text-text-primary group-hover:text-primary-interaction truncate">
                    SysAdmin
                  </div>
                  <div className="text-[10px] text-text-muted truncate">admin@dlttestbed</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('researcher@dlttestbed.com', 'research123')}
                  className="px-2.5 py-2 text-left rounded-lg border border-border bg-background hover:border-primary-interaction hover:bg-surface-secondary transition-all text-xs group"
                >
                  <div className="font-semibold text-text-primary group-hover:text-primary-interaction truncate">
                    Researcher
                  </div>
                  <div className="text-[10px] text-text-muted truncate">researcher@...</div>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-12 border-t border-border px-6 flex items-center justify-between text-[11px] text-text-muted">
        <div>DLT TESTBED &copy; 2026 Distributed Systems Benchmark Platform</div>
        <div className="flex items-center gap-4">
          <span>v2.4.0-stable</span>
          <span>Security Certified</span>
        </div>
      </footer>
    </div>
  );
}
