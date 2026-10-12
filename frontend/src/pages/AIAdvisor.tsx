import { useState } from 'react';
import { Card } from '../components/Card';
import { Bot, Sparkles, ArrowRight, Cpu, Send, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

interface AnalysisResult {
  actionTitle: string;
  bottleneck: string;
  suggestions: string[];
  recommended: string[];
}

export default function AIAdvisor() {
  const [analyzing, setAnalyzing] = useState(false);
  const [queryInput, setQueryInput] = useState('');
  const [activeQuery, setActiveQuery] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const analysesMap: Record<string, AnalysisResult> = {
    'Optimize Throughput': {
      actionTitle: 'Throughput Optimization Strategy',
      bottleneck: 'Gossip protocol overhead and batch serialization latency limits block throughput at 2,184 TPS.',
      suggestions: [
        'Scale block gas/byte limit by 2.5x to accommodate larger transaction packing.',
        'Adopt parallel signature verification across worker threads.',
        'Optimize RPC endpoint ingress buffers to eliminate TCP socket queue drops.',
      ],
      recommended: ['+ Batch Size: 500 tx', '+ Worker Threads: 16', '+ RPC Buffer: 64 MB'],
    },
    'Find Bottleneck': {
      actionTitle: 'Bottleneck Root-Cause Analysis',
      bottleneck: 'CPU utilization reached 91% on validator nodes during peak 500-client concurrency.',
      suggestions: [
        'Increase CPU core allocation per validator node (Current: 4 cores).',
        'Reduce cryptographic payload deserialization footprint.',
        'Tune worker thread concurrency limits to avoid excessive context switching.',
      ],
      recommended: ['+ CPU Allocation: 8 Cores', '- Payload Size: 1.5 KB', '- Concurrency Cap: 400'],
    },
    'Reduce Latency': {
      actionTitle: 'Latency Minimization Blueprint',
      bottleneck: 'P99 tail latency spikes to 142ms due to inter-node WAN communication hops.',
      suggestions: [
        'Decrease default block interval from 2000ms to 800ms.',
        'Enable direct peer-to-peer fast-path consensus rounds for immediate confirmations.',
        'Upgrade network link bandwidth to 10 Gbps (Enterprise) profile.',
      ],
      recommended: ['- Block Interval: 800 ms', '+ Network: 10 Gbps', '+ Fast Path: Enabled'],
    },
    'Improve Scalability': {
      actionTitle: 'Scalability & Node Partitioning Plan',
      bottleneck: 'PBFT message complexity O(n²) causes saturation when node count exceeds 20 validators.',
      suggestions: [
        'Migrate consensus layer to BLS threshold aggregate signatures to achieve linear O(n) scaling.',
        'Partition validator topology into sub-clusters with hierarchical finality.',
        'Implement state pruning to prevent RocksDB disk read amplification.',
      ],
      recommended: ['+ Consensus: BLS Aggregation', '+ Sharding: 4 Partitions', '+ Pruning: Aggressive'],
    },
  };

  const handleAction = async (action: string) => {
    setActiveQuery(action);
    setAnalyzing(true);
    try {
      await api.analyzeAI();
      const res = analysesMap[action] || {
        actionTitle: action,
        bottleneck: 'Resource contention observed during peak concurrent load.',
        suggestions: [
          'Tune node concurrency parameters.',
          'Optimize block interval and transaction payload size.',
          'Increase compute and memory quotas per container.',
        ],
        recommended: ['+ CPU: 8 Cores', '+ RAM: 16 GB', '- Block Interval: 1000ms'],
      };
      setAnalysis(res);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCustomQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    const prompt = queryInput.trim();
    setQueryInput('');
    handleAction(prompt);
  };

  return (
    <div className="p-4 sm:p-8 max-w-scaffold mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold mb-2">AI Benchmark Advisor</h1>
        <p className="text-text-secondary">Correlate performance telemetry and turn benchmark data into actionable engineering decisions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <Card className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold mb-1">Algorithmic Quick Audits</h3>
            {['Optimize Throughput', 'Find Bottleneck', 'Reduce Latency', 'Improve Scalability'].map((action) => (
              <button
                key={action}
                onClick={() => handleAction(action)}
                disabled={analyzing}
                className={`text-left px-4 py-3 border rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                  activeQuery === action
                    ? 'border-primary-interaction bg-primary/10 text-primary-interaction font-semibold'
                    : 'border-border bg-surface-secondary/40 hover:border-primary-interaction hover:bg-surface-secondary text-text-primary'
                }`}
              >
                <span>{action}</span>
                <ArrowRight className="w-4 h-4 text-text-muted shrink-0" />
              </button>
            ))}
          </Card>
          
          <div className="bg-primary-interaction/5 border border-primary-interaction/20 p-5 rounded-xl">
            <h3 className="text-primary-interaction text-sm font-semibold mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0" /> Benchmark Telemetry Context
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Synthesizing latest verified run: <strong className="text-text-primary">PoS Heavy Load</strong> (50,000 transactions, 10 validator nodes, 2,184 Peak TPS, 91% CPU Saturation).
            </p>
          </div>
        </div>

        {/* Results & Interactive Chat Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!analysis && !analyzing && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-border rounded-2xl bg-surface-secondary/20">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary-interaction mb-4">
                <Bot className="w-8 h-8" />
              </div>
              <h3 className="font-semibold text-text-primary mb-1 text-base">Ready for Architectural Analysis</h3>
              <p className="text-xs text-text-secondary max-w-sm mb-6 leading-relaxed">
                Choose one of the quick audit recommendations on the left or submit a custom question below to inspect your cluster.
              </p>
            </div>
          )}
          
          {analyzing && (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border border-border bg-surface-secondary/50 rounded-2xl">
              <Cpu className="w-10 h-10 text-primary-interaction mb-4 animate-spin" />
              <h3 className="font-semibold text-text-primary mb-1 text-base">Analyzing Telemetry Data...</h3>
              <p className="text-xs text-text-secondary">Correlating CPU usage, batch intervals, and P99 tail latency curves...</p>
            </div>
          )}

          {analysis && !analyzing && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* User Bubble */}
              <div className="self-end bg-primary-interaction text-white px-5 py-3 rounded-2xl rounded-tr-xs max-w-md shadow-xs text-xs font-medium">
                <p>{activeQuery}</p>
              </div>
              
              {/* AI Bubble */}
              <div className="self-start bg-surface-warm border border-border p-6 sm:p-8 rounded-2xl rounded-tl-xs max-w-2xl shadow-xs">
                <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary-interaction shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base text-text-primary">{analysis.actionTitle}</h3>
                    <span className="text-[10px] font-mono text-status-success flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Analysis Complete
                    </span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[11px] font-mono text-status-warning mb-2 uppercase tracking-wider font-semibold">
                      Diagnostic Findings
                    </h4>
                    <p className="text-xs text-text-secondary leading-relaxed bg-surface-secondary/50 p-3.5 rounded-lg border border-border">
                      {analysis.bottleneck}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-[11px] font-mono text-primary-interaction mb-2.5 uppercase tracking-wider font-semibold">
                      Engineering Recommendations
                    </h4>
                    <ol className="text-xs space-y-2.5 pl-4 list-decimal text-text-secondary marker:text-primary-interaction font-medium">
                      {analysis.suggestions.map((s, i) => (
                        <li key={i}><span className="text-text-primary">{s}</span></li>
                      ))}
                    </ol>
                  </div>
                  
                  <div className="bg-surface-secondary/70 border border-border p-4 rounded-xl">
                    <h4 className="text-[11px] font-mono text-text-muted mb-2 uppercase tracking-wider font-semibold">
                      Optimal Tuned Parameters
                    </h4>
                    <div className="text-xs font-mono text-primary-interaction space-y-1">
                      {analysis.recommended.map((rec, i) => (
                        <div key={i} className="font-semibold">{rec}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Custom Query Input Bar */}
          <form onSubmit={handleCustomQuery} className="flex gap-2">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              placeholder="Ask AI Advisor about your DLT workload (e.g. How to prevent tail latency spikes?)..."
              className="flex-1 border border-border rounded-xl px-4 py-3 bg-background text-xs text-text-primary focus:outline-none focus:border-primary-interaction transition-colors"
            />
            <button
              type="submit"
              disabled={analyzing || !queryInput.trim()}
              className="bg-primary-interaction text-white px-5 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
