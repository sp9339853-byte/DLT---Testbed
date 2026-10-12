import { useState } from 'react';
import { Card } from '../components/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertCircle, Zap, RotateCcw, CheckCircle2 } from 'lucide-react';

export default function StressLab() {
  const [running, setRunning] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [selectedPreset, setSelectedPreset] = useState('50K Transactions');
  const [presetNotice, setPresetNotice] = useState<string | null>(null);

  const presets = [
    { name: '10K Transactions', maxTps: 1500, degradeAt: 35 },
    { name: '50K Transactions', maxTps: 3000, degradeAt: 30 },
    { name: '100K Transactions', maxTps: 4500, degradeAt: 25 },
    { name: '500K Transactions', maxTps: 6000, degradeAt: 20 },
    { name: '1M Transactions', maxTps: 8000, degradeAt: 15 },
  ];

  const handleSelectPreset = (presetName: string) => {
    setSelectedPreset(presetName);
    setData([]);
    setRunning(false);
    setPresetNotice(`Loaded configuration for ${presetName}`);
    setTimeout(() => setPresetNotice(null), 3000);
  };

  const handleStart = () => {
    setData([]);
    setRunning(true);
    let tick = 0;
    const currentPreset = presets.find((p) => p.name === selectedPreset) || presets[1];
    
    const interval = setInterval(() => {
      tick++;
      if (tick > 50) {
        clearInterval(interval);
        setRunning(false);
        return;
      }
      
      const isDegrading = tick > currentPreset.degradeAt;
      const tps = isDegrading 
        ? Math.max(100, currentPreset.maxTps - (tick - currentPreset.degradeAt) * (currentPreset.maxTps / 25)) 
        : tick * (currentPreset.maxTps / currentPreset.degradeAt);
      const failureRate = isDegrading ? (tick - currentPreset.degradeAt) * 2.5 : 0;
      const latency = isDegrading ? 50 + (tick - currentPreset.degradeAt) * 22 : 25 + tick;
      
      setData((prev) => [...prev, { time: tick, tps: Math.round(tps), failureRate: Math.min(100, Math.round(failureRate)), latency: Math.round(latency) }]);
    }, 200);
  };

  const handleReset = () => {
    setRunning(false);
    setData([]);
  };

  return (
    <div className="p-4 sm:p-8 max-w-scaffold mx-auto w-full">
      {presetNotice && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-surface-warm border border-primary-interaction/30 shadow-xl text-primary-interaction text-sm flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-medium">{presetNotice}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Stress Lab</h1>
          <p className="text-text-secondary">Push configurations to failure to find the architectural breaking point.</p>
        </div>
        <div className="flex gap-3">
          {data.length > 0 && !running && (
            <button 
              onClick={handleReset}
              className="px-4 py-2.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-secondary text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          )}
          <button 
            onClick={handleStart}
            disabled={running}
            className="bg-status-error text-white px-5 py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm shadow-sm"
          >
            <Zap className="w-4 h-4" /> {running ? 'Stress Test Active...' : 'Start Stress Test'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-1 lg:col-span-2 p-0 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-sm font-semibold">Load & Performance Saturation Curve</h3>
            <div className="flex gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-primary-interaction rounded-full"></div> TPS</span>
              <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 bg-status-error rounded-full"></div> FAILURE %</span>
            </div>
          </div>
          <div className="h-72 w-full p-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorFailure" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="time" hide />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8A8A' }} />
                <Tooltip contentStyle={{ backgroundColor: '#111', color: '#fff', borderRadius: '8px', border: 'none' }} />
                <Area type="monotone" dataKey="tps" stroke="#0055FF" strokeWidth={2} fill="transparent" isAnimationActive={false} />
                <Area type="monotone" dataKey="failureRate" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorFailure)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {data.length === 0 && (
            <div className="p-6 text-center text-xs text-text-muted border-t border-border bg-surface-secondary/20">
              Click &quot;Start Stress Test&quot; above to begin transactional load injection.
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="flex-1 bg-surface-secondary/70 border-border">
            <h3 className="text-sm font-semibold mb-3 text-text-primary">Stress Test Presets</h3>
            <p className="text-xs text-text-muted mb-4">Select load intensity to simulate traffic burst:</p>
            <div className="flex flex-col gap-2">
              {presets.map((preset) => (
                <button 
                  key={preset.name} 
                  onClick={() => handleSelectPreset(preset.name)} 
                  className={`w-full text-left p-3 rounded-lg text-xs font-medium transition-all border flex items-center justify-between ${
                    selectedPreset === preset.name
                      ? 'bg-primary/10 border-primary-interaction text-primary-interaction font-semibold'
                      : 'bg-background border-border text-text-primary hover:border-text-muted'
                  }`}
                >
                  <span>{preset.name}</span>
                  <span className="font-mono text-[10px] text-text-muted">Max ~{preset.maxTps.toLocaleString()} TPS</span>
                </button>
              ))}
            </div>
          </Card>
          
          {data.length > 25 && (
            <div className="p-4 rounded-xl border border-status-error/40 bg-status-error/10 text-status-error flex gap-3 animate-in fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <strong className="font-semibold block mb-0.5">Saturation Detected</strong>
                Cluster consensus degradation triggered. Transactions dropped beyond peak saturation.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
