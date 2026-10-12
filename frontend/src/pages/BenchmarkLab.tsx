import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

const steps = ['Network', 'Workload', 'Resources', 'Metrics', 'Review'];

export default function BenchmarkLab() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  // Benchmark configuration state
  const [network, setNetwork] = useState('PoS Simulation');
  const [nodeCount, setNodeCount] = useState(10);
  const [blockInterval, setBlockInterval] = useState(2000);

  const [workload, setWorkload] = useState<'STANDARD' | 'HEAVY'>('HEAVY');
  const [txSize, setTxSize] = useState(2);

  const [cpuCores, setCpuCores] = useState(4);
  const [ram, setRam] = useState(8);
  const [bandwidth, setBandwidth] = useState('1 Gbps (Standard)');
  const [autoConfiguredNotice, setAutoConfiguredNotice] = useState(false);

  const [metrics, setMetrics] = useState<string[]>([
    'TPS',
    'Latency (Avg)',
    'P95 Latency',
    'P99 Latency',
    'Success/Failure Rate',
    'CPU Utilization',
    'Memory Utilization',
    'Estimated Energy',
  ]);

  // Load infrastructure defaults on mount
  useEffect(() => {
    api.getInfrastructure().then((cfg) => {
      if (cfg) {
        setNodeCount(cfg.default_node_count || 10);
        setBlockInterval(cfg.default_block_interval_ms || 2000);
        setBandwidth(cfg.network_bandwidth || '1 Gbps (Standard)');
      }
    }).catch(() => {});
  }, []);

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      // Save active configuration for live benchmark
      localStorage.setItem('dlt_current_benchmark', JSON.stringify({
        network,
        nodeCount,
        blockInterval,
        workload,
        txSize,
        cpuCores,
        ram,
        bandwidth,
        metrics,
        timestamp: new Date().toISOString()
      }));
      navigate('/app/benchmark/live');
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((s) => Math.max(0, s - 1));
  };

  const handleAutoConfigure = () => {
    setCpuCores(8);
    setRam(16);
    setBandwidth('10 Gbps (Enterprise)');
    setAutoConfiguredNotice(true);
    setTimeout(() => setAutoConfiguredNotice(false), 4000);
  };

  const toggleMetric = (metricName: string) => {
    setMetrics((prev) =>
      prev.includes(metricName) ? prev.filter((m) => m !== metricName) : [...prev, metricName]
    );
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-10">
        <h1 className="text-3xl font-semibold mb-2">Configure Benchmark</h1>
        <p className="text-text-secondary">Define network topology, workload, and metrics for the simulation.</p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-10 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-border z-0"></div>
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] bg-primary-interaction z-0 transition-all duration-300"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {steps.map((step, idx) => (
          <div key={step} className="relative z-10 flex flex-col items-center gap-2">
            <button
              onClick={() => idx <= currentStep && setCurrentStep(idx)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors border cursor-pointer
                ${idx < currentStep ? 'bg-primary-interaction border-primary-interaction text-white' : 
                  idx === currentStep ? 'bg-background border-primary-interaction text-primary-interaction font-bold' : 
                  'bg-surface-warm border-border text-text-muted hover:border-text-secondary'}`}
            >
              {idx < currentStep ? <Check className="w-4 h-4" /> : idx + 1}
            </button>
            <span className={`text-xs font-medium hidden sm:inline ${idx <= currentStep ? 'text-text-primary' : 'text-text-muted'}`}>
              {step}
            </span>
          </div>
        ))}
      </div>

      {/* Wizard Content */}
      <Card className="min-h-[420px] flex flex-col">
        <div className="flex-1">
          {/* STEP 0: Network Profile */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-semibold">Network Profile</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'PoS Simulation', desc: 'Moderate/high throughput, moderate latency' },
                  { name: 'PBFT Network', desc: 'Moderate throughput, high communication overhead' },
                  { name: 'PoA', desc: 'Fast confirmation, low overhead' },
                  { name: 'Raft', desc: 'Fast private-network performance' }
                ].map((item) => (
                  <div 
                    key={item.name}
                    onClick={() => setNetwork(item.name)}
                    className={`p-4 rounded-lg cursor-pointer transition-all border ${
                      network === item.name 
                        ? 'border-primary-interaction bg-primary/10 shadow-xs' 
                        : 'border-border hover:border-text-muted bg-surface-secondary/40'
                    }`}
                  >
                    <h3 className={`font-medium mb-1 text-sm ${network === item.name ? 'text-primary-interaction font-semibold' : 'text-text-primary'}`}>
                      {item.name}
                    </h3>
                    <p className="text-xs text-text-secondary">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-text-secondary">Node Count</label>
                  <input 
                    type="number" 
                    min={1}
                    max={100}
                    value={nodeCount} 
                    onChange={(e) => setNodeCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full border border-border rounded-lg px-3.5 py-2 bg-background text-sm focus:outline-none focus:border-primary-interaction" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-text-secondary">Block Interval (ms)</label>
                  <input 
                    type="number" 
                    min={100}
                    max={60000}
                    step={100}
                    value={blockInterval} 
                    onChange={(e) => setBlockInterval(Math.max(100, parseInt(e.target.value) || 500))}
                    className="w-full border border-border rounded-lg px-3.5 py-2 bg-background text-sm focus:outline-none focus:border-primary-interaction" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 1: Workload Profile */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-semibold">Workload Profile</h2>
              
              <div className="grid grid-cols-1 gap-4">
                <div 
                  onClick={() => setWorkload('STANDARD')}
                  className={`p-4 rounded-lg cursor-pointer flex justify-between items-center transition-all border ${
                    workload === 'STANDARD'
                      ? 'border-primary-interaction bg-primary/10'
                      : 'border-border hover:border-text-muted bg-surface-secondary/40'
                  }`}
                >
                  <div>
                    <h3 className={`font-medium mb-1 text-sm ${workload === 'STANDARD' ? 'text-primary-interaction font-semibold' : 'text-text-primary'}`}>
                      STANDARD
                    </h3>
                    <p className="text-xs text-text-secondary">For typical baseline benchmarking</p>
                  </div>
                  <div className="text-right text-xs font-mono text-text-muted">
                    10,000 tx <br /> 100 clients
                  </div>
                </div>

                <div 
                  onClick={() => setWorkload('HEAVY')}
                  className={`p-4 rounded-lg cursor-pointer flex justify-between items-center transition-all border ${
                    workload === 'HEAVY'
                      ? 'border-primary-interaction bg-primary/10'
                      : 'border-border hover:border-text-muted bg-surface-secondary/40'
                  }`}
                >
                  <div>
                    <h3 className={`font-medium mb-1 text-sm ${workload === 'HEAVY' ? 'text-primary-interaction font-semibold' : 'text-text-primary'}`}>
                      HEAVY
                    </h3>
                    <p className="text-xs text-text-secondary">High-throughput stress analysis</p>
                  </div>
                  <div className="text-right text-xs font-mono text-primary-interaction font-medium">
                    50,000 tx <br /> 500 clients
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <label className="block text-xs font-medium mb-1.5 text-text-secondary">Transaction Payload Size (KB)</label>
                <input 
                  type="number" 
                  min={1}
                  max={64}
                  value={txSize} 
                  onChange={(e) => setTxSize(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full border border-border rounded-lg px-3.5 py-2 bg-background text-sm focus:outline-none focus:border-primary-interaction" 
                />
              </div>
            </div>
          )}

          {/* STEP 2: Resource Limits */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Resource Limits</h2>
                <button 
                  onClick={handleAutoConfigure} 
                  className="text-xs text-primary-interaction font-medium hover:underline flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary/10 border border-primary-interaction/20"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Auto Configure Optimal
                </button>
              </div>

              {autoConfiguredNotice && (
                <div className="p-3 rounded-lg bg-status-success/10 border border-status-success/30 text-status-success text-xs flex items-center gap-2 animate-in fade-in">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Applied optimal topology: 8 CPU Cores, 16 GB RAM, 10 Gbps Bandwidth.</span>
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-text-secondary">CPU Cores per Node</label>
                  <input 
                    type="number" 
                    min={1}
                    max={64}
                    value={cpuCores} 
                    onChange={(e) => setCpuCores(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full border border-border rounded-lg px-3.5 py-2 bg-background text-sm focus:outline-none focus:border-primary-interaction" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-text-secondary">RAM per Node (GB)</label>
                  <input 
                    type="number" 
                    min={2}
                    max={256}
                    value={ram} 
                    onChange={(e) => setRam(Math.max(2, parseInt(e.target.value) || 2))}
                    className="w-full border border-border rounded-lg px-3.5 py-2 bg-background text-sm focus:outline-none focus:border-primary-interaction" 
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1.5 text-text-secondary">Network Bandwidth</label>
                  <select 
                    value={bandwidth}
                    onChange={(e) => setBandwidth(e.target.value)}
                    className="w-full border border-border rounded-lg px-3.5 py-2 bg-background text-sm focus:outline-none focus:border-primary-interaction"
                  >
                    <option value="1 Gbps (Standard)">1 Gbps (Standard)</option>
                    <option value="10 Gbps (Enterprise)">10 Gbps (Enterprise)</option>
                    <option value="100 Mbps (Constrained)">100 Mbps (Constrained)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Metrics Collection */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-semibold">Metrics Collection</h2>
              <p className="text-xs text-text-secondary">Select telemetry channels to track in real time during the benchmark.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  'TPS',
                  'Latency (Avg)',
                  'P95 Latency',
                  'P99 Latency',
                  'Success/Failure Rate',
                  'CPU Utilization',
                  'Memory Utilization',
                  'Estimated Energy'
                ].map((metric) => {
                  const isChecked = metrics.includes(metric);
                  return (
                    <label 
                      key={metric} 
                      onClick={() => toggleMetric(metric)}
                      className={`flex items-center gap-3 p-3.5 border rounded-lg cursor-pointer transition-colors ${
                        isChecked 
                          ? 'border-primary-interaction bg-primary/5 text-text-primary' 
                          : 'border-border bg-surface-secondary/40 text-text-secondary'
                      }`}
                    >
                      <input 
                        type="checkbox" 
                        checked={isChecked}
                        onChange={() => {}} // Controlled by label
                        className="w-4 h-4 text-primary-interaction rounded border-border focus:ring-primary-interaction cursor-pointer" 
                      />
                      <span className="text-xs font-medium">{metric}</span>
                    </label>
                  );
                })}
              </div>

              {metrics.length === 0 && (
                <div className="p-3 rounded-lg bg-status-warning/10 border border-status-warning/30 text-status-warning text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Please select at least one metric to track.</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Review Configuration */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h2 className="text-xl font-semibold">Review Configuration</h2>
              
              <div className="bg-surface-secondary/60 border border-border rounded-xl p-6 grid grid-cols-2 sm:grid-cols-3 gap-y-6 gap-x-6">
                <div>
                  <div className="text-[11px] font-mono text-text-muted mb-1 uppercase">Network Profile</div>
                  <div className="font-semibold text-text-primary text-sm">{network}</div>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-text-muted mb-1 uppercase">Node Topology</div>
                  <div className="font-semibold text-text-primary text-sm">{nodeCount} Validators</div>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-text-muted mb-1 uppercase">Block Interval</div>
                  <div className="font-semibold text-text-primary text-sm">{blockInterval} ms</div>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-text-muted mb-1 uppercase">Workload Profile</div>
                  <div className="font-semibold text-text-primary text-sm">
                    {workload === 'HEAVY' ? '50,000 tx (500 clients)' : '10,000 tx (100 clients)'}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-text-muted mb-1 uppercase">Payload Size</div>
                  <div className="font-semibold text-text-primary text-sm">{txSize} KB</div>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-text-muted mb-1 uppercase">Node Resources</div>
                  <div className="font-semibold text-text-primary text-sm">{cpuCores} Cores • {ram} GB</div>
                </div>
                <div>
                  <div className="text-[11px] font-mono text-text-muted mb-1 uppercase">Bandwidth</div>
                  <div className="font-semibold text-text-primary text-sm">{bandwidth}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-[11px] font-mono text-text-muted mb-1 uppercase">Telemetry Metrics</div>
                  <div className="font-medium text-text-primary text-xs flex flex-wrap gap-1 mt-1">
                    {metrics.map((m) => (
                      <span key={m} className="px-2 py-0.5 rounded bg-surface-warm border border-border text-[10px]">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <button 
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-5 py-2.5 rounded-lg font-medium text-text-secondary hover:text-text-primary hover:bg-surface-secondary disabled:opacity-40 transition-colors text-sm"
          >
            Back
          </button>
          <button 
            onClick={handleNext}
            className="px-6 py-2.5 rounded-lg font-medium bg-primary-interaction text-white hover:bg-blue-700 transition-colors text-sm shadow-sm"
          >
            {currentStep === steps.length - 1 ? 'Run Benchmark Simulation →' : 'Next Step →'}
          </button>
        </div>
      </Card>
    </div>
  );
}
