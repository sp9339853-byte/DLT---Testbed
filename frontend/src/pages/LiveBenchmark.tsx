import { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '../components/Card';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from 'recharts';
import { Square, FastForward } from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../context/ThemeContext';

interface LogEntry {
  id: number;
  time: string;
  msg: string;
  type: 'info' | 'success' | 'error';
}

export default function LiveBenchmark() {
  const navigate = useNavigate();
  const { autoGenerateReports } = useTheme();
  const [progress, setProgress] = useState(0);
  const [metrics, setMetrics] = useState({
    tps: 0, latency: 0, success: 0, failed: 0, cpu: 0, memory: 0, energy: 0
  });
  const [chartData, setChartData] = useState<{time: number, tps: number, latency: number}[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const hasGeneratedReportRef = useRef(false);

  const handleBenchmarkFinished = useCallback(async () => {
    if (!hasGeneratedReportRef.current) {
      hasGeneratedReportRef.current = true;
      if (autoGenerateReports) {
        try {
          const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          await api.createReport({
            name: `PoS Heavy Load Benchmark Run (${timestamp})`,
            type: 'PDF',
            summary: 'Auto-generated benchmark report: 2,184 Peak TPS, 43.2ms Average Latency, 98.7% Reliability.'
          });
        } catch (err) {
          console.error('Failed to auto-generate report:', err);
        }
      }
    }
    navigate('/app/benchmark/results');
  }, [autoGenerateReports, navigate]);

  useEffect(() => {
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      if (tick > 100) {
        clearInterval(interval);
        handleBenchmarkFinished();
        return;
      }

      setProgress(tick);
      
      const newTps = Math.floor(1800 + Math.random() * 800 + (tick < 20 ? tick * 100 : 0) - (tick > 80 ? (tick-80)*50 : 0));
      const newLatency = Math.floor(20 + Math.random() * 15 + (tick > 70 ? (tick-70) * 2 : 0));
      
      setMetrics(prev => ({
        tps: newTps,
        latency: newLatency,
        success: prev.success + Math.floor(newTps / 10),
        failed: prev.failed + (Math.random() > 0.9 ? Math.floor(Math.random() * 5) : 0),
        cpu: Math.min(100, 30 + Math.floor(tick * 0.6) + Math.floor(Math.random() * 10)),
        memory: Math.min(100, 40 + Math.floor(tick * 0.3)),
        energy: parseFloat((0.01 + tick * 0.0005).toFixed(4))
      }));

      setChartData(prev => {
        const newData = [...prev, { time: tick, tps: newTps, latency: newLatency }];
        if (newData.length > 20) newData.shift();
        return newData;
      });

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
      
      setLogs(prev => {
        const id = Math.floor(100000 + Math.random() * 900000);
        const r = Math.random();
        const type: 'info' | 'success' | 'error' = r > 0.95 ? 'error' : r > 0.3 ? 'success' : 'info';
        const msg = type === 'error' ? `TX-${id} failed` : type === 'success' ? `TX-${id} confirmed` : `TX-${id} processing`;
        
        const newLogs = [{ id: tick, time: timeStr, msg, type }, ...prev];
        if (newLogs.length > 50) newLogs.pop();
        return newLogs;
      });

    }, 300);

    return () => clearInterval(interval);
  }, [handleBenchmarkFinished]);

  return (
    <div className="p-4 sm:p-8 max-w-scaffold mx-auto w-full flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full bg-status-warning animate-pulse"></div>
            <h1 className="text-3xl font-semibold">Benchmark Running</h1>
          </div>
          <p className="text-text-secondary">Current phase: Transaction Processing & Real-Time Ingestion</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-4xl font-semibold tracking-tight">{progress}%</div>
            <div className="text-xs text-text-muted font-mono mt-1">COMPLETION</div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBenchmarkFinished}
              className="px-3 py-2 bg-surface-secondary hover:bg-border border border-border rounded-lg text-xs font-medium text-text-primary flex items-center gap-1.5 transition-colors"
              title="Fast Forward to Completion"
            >
              <FastForward className="w-3.5 h-3.5" /> Skip to End
            </button>
            <button
              onClick={() => navigate('/app/benchmark')}
              className="px-3 py-2 bg-status-error/10 hover:bg-status-error/20 text-status-error border border-status-error/20 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Abort Simulation"
            >
              <Square className="w-3.5 h-3.5" /> Abort
            </button>
          </div>
        </div>
      </div>

      <div className="w-full h-1.5 bg-border rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-primary-interaction transition-all duration-300 ease-linear"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        <div className="col-span-1 lg:col-span-3 flex flex-col gap-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="flex flex-col items-center justify-center text-center py-6">
              <span className="text-xs text-text-muted font-mono mb-2">TPS</span>
              <span className="text-3xl font-semibold">{metrics.tps.toLocaleString()}</span>
            </Card>
            <Card className="flex flex-col items-center justify-center text-center py-6">
              <span className="text-xs text-text-muted font-mono mb-2">LATENCY</span>
              <span className="text-3xl font-semibold">{metrics.latency} <span className="text-sm">ms</span></span>
            </Card>
            <Card className="flex flex-col items-center justify-center text-center py-6">
              <span className="text-xs text-text-muted font-mono mb-2">CPU / MEM</span>
              <span className="text-3xl font-semibold">{metrics.cpu}% / {metrics.memory}%</span>
            </Card>
            <Card className="flex flex-col items-center justify-center text-center py-6">
              <span className="text-xs text-text-muted font-mono mb-2">ENERGY (Est)</span>
              <span className="text-3xl font-semibold text-status-success">{metrics.energy.toFixed(3)}</span>
            </Card>
          </div>

          <Card className="flex-1 min-h-[300px]">
             <h3 className="text-sm font-semibold mb-4">Performance vs Latency</h3>
             <div className="h-[calc(100%-2rem)] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                   <defs>
                     <linearGradient id="colorTps" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#0055FF" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#0055FF" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorLat" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                   <XAxis dataKey="time" hide />
                   <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8A8A' }} />
                   <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8A8A' }} />
                   <Tooltip contentStyle={{ backgroundColor: '#111', color: '#fff', borderRadius: '8px', border: 'none' }} />
                   <Area yAxisId="left" type="monotone" dataKey="tps" stroke="#0055FF" strokeWidth={2} fillOpacity={1} fill="url(#colorTps)" isAnimationActive={false} />
                   <Area yAxisId="right" type="monotone" dataKey="latency" stroke="#F59E0B" strokeWidth={2} fillOpacity={1} fill="url(#colorLat)" isAnimationActive={false} />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </Card>
        </div>

        <Card className="col-span-1 flex flex-col p-0 overflow-hidden bg-[#0A0A0A] border-[#222]">
          <div className="p-4 border-b border-[#222] flex justify-between items-center bg-[#111]">
            <h3 className="text-sm font-medium text-white">Transaction Stream</h3>
            <div className="flex gap-2">
               <div className="text-xs text-status-success font-mono">OK: {metrics.success}</div>
               <div className="text-xs text-status-error font-mono">ERR: {metrics.failed}</div>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 font-mono text-xs flex flex-col gap-1">
             {logs.map(log => (
               <div key={log.id} className={`flex gap-3 ${
                 log.type === 'error' ? 'text-status-error' : 
                 log.type === 'success' ? 'text-status-success' : 
                 'text-text-muted'
               }`}>
                 <span className="opacity-50">[{log.time}]</span>
                 <span>{log.msg}</span>
               </div>
             ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
