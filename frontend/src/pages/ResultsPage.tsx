import { useState } from 'react';
import { Card } from '../components/Card';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';
import { Download, Bot, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../services/api';

const radarData = [
  { subject: 'Performance', A: 90, fullMark: 100 },
  { subject: 'Reliability', A: 98, fullMark: 100 },
  { subject: 'Scalability', A: 75, fullMark: 100 },
  { subject: 'Efficiency', A: 85, fullMark: 100 },
];

const scalabilityData = [
  { clients: 100, tps: 800 },
  { clients: 250, tps: 1800 },
  { clients: 500, tps: 2200 },
  { clients: 750, tps: 2350 },
  { clients: 1000, tps: 2100 },
];

export default function ResultsPage() {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const rep = await api.createReport({
        name: 'PoS Heavy Load Benchmark Verification',
        type: 'PDF',
        summary: 'Official performance benchmark audit: 2,184 TPS peak, 43.2ms average latency, 98.7% success rate.',
      });
      await api.downloadReport(rep.id, rep.name);
      setToastMsg('Report exported successfully and saved to Reports Archive.');
      setTimeout(() => setToastMsg(null), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-scaffold mx-auto w-full">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-surface-warm border border-status-success/30 shadow-xl text-status-success text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-medium">{toastMsg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Benchmark Complete</h1>
          <p className="text-text-secondary">PoS Heavy Load • 50,000 tx • 500 clients</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-surface-secondary text-text-primary transition-colors disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin text-primary-interaction" /> : <Download className="w-4 h-4" />}
            Export Report
          </button>
          <button 
            onClick={() => navigate('/app/ai')}
            className="flex items-center gap-2 bg-primary-interaction text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Bot className="w-4 h-4" /> AI Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Composite Score */}
        <Card className="col-span-1 lg:col-span-4 flex flex-col items-center justify-center text-center p-8 bg-surface-secondary/70 border-border">
          <div className="text-xs font-mono text-text-muted mb-6 tracking-widest uppercase">DLT Testbed Composite Score</div>
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 absolute inset-0">
              <circle cx="96" cy="96" r="88" stroke="rgba(128,128,128,0.15)" strokeWidth="12" fill="none" />
              <circle cx="96" cy="96" r="88" stroke="currentColor" className="text-primary-interaction" strokeWidth="12" fill="none" strokeDasharray="553" strokeDashoffset="72" strokeLinecap="round" />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-6xl font-semibold tracking-tighter text-text-primary">87</span>
              <span className="text-sm font-medium text-text-secondary">/ 100</span>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-6 max-w-xs">
            Composite index of throughput, tail latency stability, reliability, and energy efficiency.
          </p>
        </Card>

        {/* Score Radar */}
        <Card className="col-span-1 lg:col-span-4 flex flex-col p-6">
          <h3 className="text-sm font-semibold mb-4 text-center">Score Breakdown</h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(128,128,128,0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }} />
                <Radar name="Score" dataKey="A" stroke="#0055FF" fill="#0055FF" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="col-span-1 lg:col-span-4 grid grid-cols-2 gap-4">
          <Card className="flex flex-col p-5 justify-center">
            <span className="text-xs text-text-muted font-mono mb-1">PEAK TPS</span>
            <span className="text-2xl font-semibold text-text-primary">2,184</span>
          </Card>
          <Card className="flex flex-col p-5 justify-center">
            <span className="text-xs text-text-muted font-mono mb-1">P95 LATENCY</span>
            <span className="text-2xl font-semibold text-status-warning">64 ms</span>
          </Card>
          <Card className="flex flex-col p-5 justify-center">
            <span className="text-xs text-text-muted font-mono mb-1">SUCCESS RATE</span>
            <span className="text-2xl font-semibold text-status-success">98.7%</span>
          </Card>
          <Card className="flex flex-col p-5 justify-center bg-primary-interaction/5 border-primary-interaction/20">
            <span className="text-xs text-primary-interaction font-mono mb-1">ESTIMATED ENERGY</span>
            <span className="text-2xl font-semibold text-primary-interaction">0.038 Wh</span>
            <span className="text-[10px] text-text-secondary mt-1">per 1K tx</span>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Distribution */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold">Latency Analysis</h3>
            <span className="text-xs font-mono bg-surface-secondary px-2.5 py-1 rounded text-text-primary border border-border">Avg: 43ms</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Median (P50)</span>
              <span className="font-medium text-text-primary">38 ms</span>
            </div>
            <div className="w-full h-2 bg-surface-secondary rounded-full overflow-hidden">
              <div className="h-full bg-primary-interaction" style={{width: '38%'}}></div>
            </div>
            
            <div className="flex justify-between text-sm mt-4">
              <span className="text-text-secondary">P95</span>
              <span className="font-medium text-status-warning">64 ms</span>
            </div>
            <div className="w-full h-2 bg-surface-secondary rounded-full overflow-hidden">
              <div className="h-full bg-status-warning" style={{width: '64%'}}></div>
            </div>
            
            <div className="flex justify-between text-sm mt-4">
              <span className="text-text-secondary">P99 Tail Latency</span>
              <span className="font-medium text-status-error">142 ms</span>
            </div>
            <div className="w-full h-2 bg-surface-secondary rounded-full overflow-hidden">
              <div className="h-full bg-status-error" style={{width: '90%'}}></div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-surface-warm border border-border rounded-lg text-sm text-text-secondary flex gap-3">
            <Bot className="w-5 h-5 text-primary-interaction shrink-0" />
            <p>Tail latency increased significantly beyond 500 concurrent clients. Recommended to optimize batch size and CPU scheduling.</p>
          </div>
        </Card>

        {/* Scalability Analysis */}
        <Card>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-semibold">Scalability Analysis</h3>
            <span className="text-xs font-mono text-status-warning bg-status-warning/10 px-2 py-1 rounded border border-status-warning/30">Saturation: ~750 clients</span>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scalabilityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="clients" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8A8A' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8A8A' }} />
                <Tooltip cursor={{fill: 'rgba(128,128,128,0.05)'}} contentStyle={{ backgroundColor: '#111', color: '#fff', borderRadius: '8px', border: 'none' }} />
                <Bar dataKey="tps" fill="#0055FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-text-muted mt-2 text-center">TPS vs Concurrent Clients</p>
        </Card>
      </div>
    </div>
  );
}
