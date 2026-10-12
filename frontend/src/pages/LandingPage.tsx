
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, Zap, BarChart2, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-text-primary selection:bg-primary-interaction selection:text-white">
      {/* Navbar */}
      <nav className="h-[72px] sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-8">
        <div className="flex items-center gap-2 font-semibold tracking-tight text-lg">
          <div className="w-7 h-7 rounded-lg bg-primary-interaction/10 border border-primary-interaction/20 flex items-center justify-center text-primary-interaction">
            <Activity className="w-4 h-4" />
          </div>
          <span>DLT TESTBED</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-text-secondary">
          <a href="#product" className="hover:text-text-primary transition-colors">Product</a>
          <a href="#benchmark" className="hover:text-text-primary transition-colors">Benchmark</a>
          <a href="#analytics" className="hover:text-text-primary transition-colors">Analytics</a>
          <a href="#developers" className="hover:text-text-primary transition-colors">Developers</a>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link 
                to="/app" 
                className="text-sm font-medium px-4 py-2 hover:bg-surface-secondary rounded-md transition-colors flex items-center gap-2"
              >
                <span>Console ({user?.name || 'Architect'})</span>
              </Link>
              <button
                onClick={() => logout()}
                className="p-2 text-text-muted hover:text-status-error hover:bg-status-error/10 rounded-md transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium px-4 py-2 hover:bg-surface-secondary rounded-md transition-colors">
                Sign In
              </Link>
              <Link to="/login" className="bg-primary-interaction text-white text-sm font-medium px-5 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-sm">
                Launch Testbed
              </Link>
            </>
          )}
        </div>
      </nav>

      <main>
        {/* Hero */}
        <section className="pt-32 pb-24 px-8 max-w-scaffold mx-auto flex flex-col items-center text-center">
          <motion.h1
            className="max-w-4xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Benchmark the Future<br />of Distributed Ledgers.
          </motion.h1>

          <motion.p
            className="text-lg text-text-secondary max-w-2xl mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          >
            Measure throughput, latency, scalability, reliability and estimated energy efficiency under controlled workloads.
          </motion.p>

          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <Link to="/app" className="bg-technical-dark text-white px-8 py-4 rounded-md font-medium hover:bg-black transition-colors flex items-center gap-2">
              Launch Testbed <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/app" className="px-8 py-4 rounded-md font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors">
              Explore Demo
            </Link>
          </motion.div>
        </section>

        {/* Hero Visual - Abstract Network */}
        <section id="product" className="pb-32 px-8 max-w-scaffold mx-auto">
          <motion.div
            className="relative w-full h-[400px] technical-card overflow-hidden flex items-center justify-center bg-surface-warm"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className="absolute inset-0 glass-fog opacity-50"></div>
            {/* Minimalist Network Visualization Placeholder */}
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="flex items-center justify-center gap-12 mb-8">
                <div className="w-3 h-3 rounded-full bg-primary-interaction animate-pulse"></div>
                <div className="w-32 h-[1px] bg-border relative">
                  <motion.div
                    className="absolute top-[-1px] left-0 w-8 h-[3px] bg-primary-interaction"
                    animate={{ left: ['0%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  />
                </div>
                <div className="w-3 h-3 rounded-full bg-status-success"></div>
                <div className="w-32 h-[1px] bg-border relative">
                  <motion.div
                    className="absolute top-[-1px] left-0 w-8 h-[3px] bg-status-success"
                    animate={{ left: ['0%', '100%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  />
                </div>
                <div className="w-3 h-3 rounded-full bg-text-primary"></div>
              </div>

              <div className="flex gap-12 font-mono text-xs text-text-muted">
                <div className="flex flex-col items-center">
                  <span className="mb-1">NODES</span>
                  <span className="text-text-primary text-sm font-medium">10</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="mb-1">TPS</span>
                  <span className="text-text-primary text-sm font-medium">2,184</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="mb-1">LATENCY</span>
                  <span className="text-text-primary text-sm font-medium">43ms</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="mb-1">STATUS</span>
                  <span className="text-status-success text-sm font-medium">ONLINE</span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Why DLT Testbed (Asymmetrical blocks) */}
        <section id="analytics" className="py-24 px-8 max-w-scaffold mx-auto border-t border-border">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3 text-xs font-mono text-text-muted pt-2">
              01 / OVERVIEW
            </div>
            <div className="col-span-12 md:col-span-9">
              <h2 className="mb-12">Engineering evidence for DLT decisions.</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="technical-card p-8 lg:col-span-2 bg-surface-secondary">
                  <Activity className="w-6 h-6 mb-6 text-primary-interaction" />
                  <h3 className="mb-2">BENCHMARK</h3>
                  <p className="text-text-secondary">Measure performance accurately across multiple simulated conditions and configurations.</p>
                </div>
                <div className="technical-card p-8">
                  <Zap className="w-6 h-6 mb-6 text-status-warning" />
                  <h3 className="mb-2">STRESS-TEST</h3>
                  <p className="text-text-secondary">Find the breaking point limits.</p>
                </div>
                <div className="technical-card p-8 lg:col-span-3">
                  <BarChart2 className="w-6 h-6 mb-6 text-text-primary" />
                  <h3 className="mb-2">OPTIMIZE</h3>
                  <p className="text-text-secondary">Turn raw results into actionable engineering decisions using the AI Advisor.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Measurement System */}
        <section id="benchmark" className="py-24 px-8 max-w-scaffold mx-auto border-t border-border">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3 text-xs font-mono text-text-muted pt-2">
              02 / BENCHMARK
            </div>
            <div className="col-span-12 md:col-span-9">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
                <h2 className="max-w-md">Benchmark distributed systems under pressure.</h2>

                <div className="flex-1 w-full grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-xs font-mono text-text-muted mb-2">TPS</div>
                    <div className="text-5xl font-semibold tracking-tighter">2,184</div>
                  </div>
                  <div>
                    <div className="text-xs font-mono text-text-muted mb-2">LATENCY</div>
                    <div className="text-5xl font-semibold tracking-tighter">43.2 <span className="text-2xl text-text-muted">ms</span></div>
                  </div>
                  <div className="col-span-2 border-t border-border pt-8 mt-4">
                    <div className="text-xs font-mono text-text-muted mb-2">RELIABILITY</div>
                    <div className="text-4xl font-semibold tracking-tighter">98.7%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section id="developers" className="py-48 px-8 max-w-scaffold mx-auto flex flex-col items-center text-center border-t border-border">
          <h2 className="text-[64px] font-semibold mb-6">Measure before you deploy.</h2>
          <p className="text-xl text-text-secondary max-w-2xl mb-12">
            Turn distributed ledger assumptions into measurable engineering evidence.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/app" className="bg-technical-dark text-white px-8 py-4 rounded-md font-medium hover:bg-black transition-colors">
              Launch Testbed
            </Link>
            <Link to="/app" className="px-8 py-4 rounded-md font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary transition-colors">
              Explore Demo
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
