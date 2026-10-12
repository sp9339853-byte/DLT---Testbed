import { useState, useEffect } from 'react';
import { Card } from '../components/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';
import { Plus, X, Check, GitCompare } from 'lucide-react';
import { api } from '../services/api';
import type { ExperimentItem } from '../types';

export default function Compare() {
  const [availableExperiments, setAvailableExperiments] = useState<ExperimentItem[]>([]);
  const [selectedExpIds, setSelectedExpIds] = useState<string[]>(['exp-1', 'exp-2', 'exp-3']);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    api.getExperiments().then((exps) => {
      setAvailableExperiments(exps);
    }).catch(() => {});
  }, []);

  const toggleExperiment = (id: string) => {
    setSelectedExpIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev; // Keep at least one
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Base metrics metadata per experiment
  const experimentMetrics: Record<string, { name: string; tps: number; latency: number; success: number; cpu: number; color: string; radar: { p: number; r: number; s: number; e: number } }> = {
    'exp-1': { name: 'PoS Heavy Load', tps: 2184, latency: 43.2, success: 98.7, cpu: 71, color: '#0055FF', radar: { p: 85, r: 98, s: 75, e: 85 } },
    'exp-2': { name: 'PBFT Standard', tps: 1840, latency: 56.1, success: 99.1, cpu: 65, color: '#F59E0B', radar: { p: 70, r: 99, s: 60, e: 90 } },
    'exp-3': { name: 'PoA Fast Track', tps: 3200, latency: 22.4, success: 95.2, cpu: 88, color: '#10B981', radar: { p: 95, r: 85, s: 90, e: 60 } },
    'exp-4': { name: 'Raft Low Latency Cluster', tps: 4100, latency: 14.8, success: 99.8, cpu: 52, color: '#8B5CF6', radar: { p: 98, r: 96, s: 80, e: 92 } },
  };

  // Dynamic bar chart data
  const barData: any = { name: 'TPS' };
  selectedExpIds.forEach((id) => {
    const meta = experimentMetrics[id];
    if (meta) {
      barData[meta.name] = meta.tps;
    }
  });

  // Dynamic radar chart data
  const radarData = [
    {
      subject: 'Performance',
      ...selectedExpIds.reduce((acc, id) => {
        const meta = experimentMetrics[id];
        return meta ? { ...acc, [meta.name]: meta.radar.p } : acc;
      }, {}),
      fullMark: 100,
    },
    {
      subject: 'Reliability',
      ...selectedExpIds.reduce((acc, id) => {
        const meta = experimentMetrics[id];
        return meta ? { ...acc, [meta.name]: meta.radar.r } : acc;
      }, {}),
      fullMark: 100,
    },
    {
      subject: 'Scalability',
      ...selectedExpIds.reduce((acc, id) => {
        const meta = experimentMetrics[id];
        return meta ? { ...acc, [meta.name]: meta.radar.s } : acc;
      }, {}),
      fullMark: 100,
    },
    {
      subject: 'Efficiency',
      ...selectedExpIds.reduce((acc, id) => {
        const meta = experimentMetrics[id];
        return meta ? { ...acc, [meta.name]: meta.radar.e } : acc;
      }, {}),
      fullMark: 100,
    },
  ];

  return (
    <div className="p-4 sm:p-8 max-w-scaffold mx-auto w-full">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Comparison Workspace</h1>
          <p className="text-text-secondary">Analyze trade-offs and performance deltas across DLT architectures.</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-primary-interaction text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add / Remove Experiments
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <h3 className="text-sm font-semibold mb-6">Throughput Comparison (Peak TPS)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[barData]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8A8A' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#8A8A8A' }} />
                <Tooltip cursor={{fill: 'rgba(128,128,128,0.05)'}} contentStyle={{ backgroundColor: '#111', color: '#fff', borderRadius: '8px', border: 'none' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                {selectedExpIds.map((id) => {
                  const meta = experimentMetrics[id];
                  return meta ? (
                    <Bar key={id} dataKey={meta.name} fill={meta.color} radius={[4, 4, 0, 0]} />
                  ) : null;
                })}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold mb-6">Architectural Trade-Off Radar</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(128,128,128,0.2)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 12, opacity: 0.7 }} />
                <Tooltip contentStyle={{ backgroundColor: '#111', color: '#fff', borderRadius: '8px', border: 'none' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                {selectedExpIds.map((id) => {
                  const meta = experimentMetrics[id];
                  return meta ? (
                    <Radar key={id} name={meta.name} dataKey={meta.name} stroke={meta.color} fill={meta.color} fillOpacity={0.15} />
                  ) : null;
                })}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="p-4 sm:p-6 border-b border-border flex justify-between items-center bg-surface-secondary">
          <h3 className="text-sm font-semibold">Detailed Architectural Metrics</h3>
          <span className="text-xs font-mono text-text-muted">{selectedExpIds.length} compared</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-secondary/50 text-text-secondary text-xs uppercase font-mono">
              <tr>
                <th className="px-6 py-4 font-medium border-b border-border">Metric</th>
                {selectedExpIds.map((id) => {
                  const meta = experimentMetrics[id];
                  return meta ? (
                    <th key={id} className="px-6 py-4 font-medium border-b border-border">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                        {meta.name}
                      </span>
                    </th>
                  ) : null;
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <td className="px-6 py-4 font-medium text-text-primary">Peak TPS</td>
                {selectedExpIds.map((id) => (
                  <td key={id} className="px-6 py-4 font-mono font-semibold">{experimentMetrics[id]?.tps?.toLocaleString() || '-'}</td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-text-primary">Avg Latency (ms)</td>
                {selectedExpIds.map((id) => (
                  <td key={id} className="px-6 py-4 font-mono">{experimentMetrics[id]?.latency || '-'} ms</td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-text-primary">Success Rate (%)</td>
                {selectedExpIds.map((id) => (
                  <td key={id} className="px-6 py-4 font-mono text-status-success">{experimentMetrics[id]?.success || '-'}%</td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 font-medium text-text-primary">Peak CPU Load (%)</td>
                {selectedExpIds.map((id) => (
                  <td key={id} className="px-6 py-4 font-mono">{experimentMetrics[id]?.cpu || '-'}%</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Select Experiments Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-surface-warm border border-border rounded-xl shadow-2xl p-6 relative animate-in fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-text-muted hover:text-text-primary rounded"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-semibold mb-1 flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-primary-interaction" /> Choose Experiments to Compare
            </h3>
            <p className="text-xs text-text-secondary mb-4">Select 1 to 4 experiments to display in side-by-side analysis.</p>

            <div className="space-y-2 mb-6">
              {availableExperiments.map((exp) => {
                const isSelected = selectedExpIds.includes(exp.id);
                return (
                  <div
                    key={exp.id}
                    onClick={() => toggleExperiment(exp.id)}
                    className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'border-primary-interaction bg-primary/10'
                        : 'border-border bg-surface-secondary/40 hover:bg-surface-secondary'
                    }`}
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-text-primary">{exp.name}</h4>
                      <p className="text-[11px] text-text-secondary">{exp.consensus} • {exp.nodes} nodes</p>
                    </div>
                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                      isSelected ? 'bg-primary-interaction border-primary-interaction text-white' : 'border-border'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setModalOpen(false)}
              className="w-full bg-primary-interaction text-white py-2 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Apply Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
